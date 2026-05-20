// directory.js
// Flattens all rooms' standing + guest-bench members into one searchable/filterable table.

const mount = document.getElementById('directory-mount');
const cacheStatus = document.getElementById('cache-status');
const refreshLink = document.getElementById('refresh-link');
const searchInput = document.getElementById('search');
const roomFilterEl = document.getElementById('room-filter');
const roleFilterEl = document.getElementById('role-filter');
const rowCount = document.getElementById('row-count');

let allRows = [];
let activeRoomFilter = 'all';
let activeRoleFilter = 'all';
let searchTerm = '';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function load(forceFresh = false) {
  const url = forceFresh ? '/api/cabinets?fresh=1' : '/api/cabinets';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allRows = flatten(data);
    buildRoomFilter(data);
    render();
    renderCacheStatus(data);
  } catch (err) {
    mount.innerHTML = `<div class="error-banner">Could not load: ${esc(err.message)}</div>`;
  }
}

function flatten({ indexed }) {
  const rows = [];
  for (const room of indexed) {
    const m = room.manifest || {};
    const memberDir = m.member_dir;
    const repo = m.home_repo;
    for (const mem of (m.members || [])) {
      rows.push({ name: mem.name, slot: mem.slot, role: 'standing', room_key: room.key, room_name: m.display_name || room.display_name, file: mem.file, file_url: buildFileUrl(repo, memberDir, mem.file) });
    }
    for (const mem of (m.guest_bench || [])) {
      rows.push({ name: mem.name, slot: mem.slot, role: 'guest_bench', room_key: room.key, room_name: m.display_name || room.display_name, file: mem.file, file_url: buildFileUrl(repo, memberDir, mem.file) });
    }
  }
  rows.sort((a, b) => a.name.localeCompare(b.name) || a.room_name.localeCompare(b.room_name));
  return rows;
}

function buildFileUrl(repo, memberDir, file) {
  if (!repo || !file) return null;
  if (/^https?:\/\//.test(file)) return file;
  if (file === '(external)' || file === '—' || !file.trim()) return null;
  const cleanFile = file.replace(/^members\//, '');
  const dir = memberDir ? memberDir.replace(/\/$/, '') : 'members';
  return `${repo}/blob/main/${dir}/${cleanFile}`;
}

function buildRoomFilter({ indexed }) {
  const buttons = roomFilterEl.querySelectorAll('button:not([data-filter="all"])');
  buttons.forEach(b => b.remove());
  for (const room of indexed) {
    const btn = document.createElement('button');
    btn.dataset.filter = room.key;
    btn.textContent = (room.manifest?.display_name || room.display_name).replace(/Cabin'ét/g, '').trim() || room.key;
    roomFilterEl.appendChild(btn);
  }
  roomFilterEl.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      roomFilterEl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeRoomFilter = b.dataset.filter;
      render();
    });
  });
}

roleFilterEl.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', () => {
    roleFilterEl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeRoleFilter = b.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', (e) => { searchTerm = e.target.value.toLowerCase().trim(); render(); });

function render() {
  const filtered = allRows.filter(r => {
    if (activeRoomFilter !== 'all' && r.room_key !== activeRoomFilter) return false;
    if (activeRoleFilter !== 'all' && r.role !== activeRoleFilter) return false;
    if (searchTerm && !(`${r.name} ${r.slot}`).toLowerCase().includes(searchTerm)) return false;
    return true;
  });
  rowCount.textContent = filtered.length;
  if (!filtered.length) { mount.innerHTML = '<p style="color:var(--ink-faint);font-style:italic;padding:2rem 0;">no entries match the filter.</p>'; return; }

  const rows = filtered.map(r => {
    const roomLabel = r.room_name.replace(/Cabin'ét|Cabin-et|cabinet/gi, '').trim() || r.room_key;
    const roleLabel = r.role === 'standing' ? 'standing' : 'guest';
    const fileLink = r.file_url
      ? `<a href="${esc(r.file_url)}" target="_blank" rel="noopener">${esc(r.file || '—')}</a>`
      : `<span style="color:var(--ink-faint);">${esc(r.file || '—')}</span>`;
    return `<tr><td class="cell-name">${esc(r.name)}</td><td class="cell-slot">${esc(r.slot || '')}</td><td><span class="crossref-chip" data-room="${esc(r.room_key)}">${esc(roomLabel)}</span></td><td class="cell-role">${esc(roleLabel)}</td><td class="cell-file">${fileLink}</td></tr>`;
  }).join('');

  mount.innerHTML = `<table class="directory-table"><thead><tr><th>Member</th><th>Slot</th><th>Room</th><th>Role</th><th>File</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderCacheStatus({ cache }) {
  if (!cache?.length) { cacheStatus.textContent = 'cache: empty'; return; }
  cacheStatus.textContent = `cache: ${Math.min(...cache.map(c => c.ageSeconds))}s old`;
}

refreshLink.addEventListener('click', (e) => { e.preventDefault(); mount.innerHTML = '<div class="loading">Refreshing</div>'; load(true); });

load();

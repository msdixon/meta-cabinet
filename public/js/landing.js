// landing.js
// Fetches /api/cabinets and renders rooms + now-panel + crossrefs.

const grid = document.getElementById('room-grid');
const nowPanel = document.getElementById('now-panel');
const crossrefList = document.getElementById('crossref-list');
const cacheStatus = document.getElementById('cache-status');
const refreshLink = document.getElementById('refresh-link');

async function load(forceFresh = false) {
  const url = forceFresh ? '/api/cabinets?fresh=1' : '/api/cabinets';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderRooms(data);
    renderNow(data);
    renderCrossrefs(data);
    renderCacheStatus(data);
    renderErrors(data);
  } catch (err) {
    grid.innerHTML = `<div class="error-banner">Could not load manifests: ${esc(err.message)}</div>`;
    nowPanel.innerHTML = '';
    crossrefList.innerHTML = '';
  }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRooms({ indexed, neighboring }) {
  const indexedCards = indexed.map(room => {
    const m = room.manifest || {};
    const memberCount = (m.members || []).length;
    const guestCount = (m.guest_bench || []).length;
    const repoHref = (m.home_repo || `https://github.com/${room.github.owner}/${room.github.repo}`);
    return `
      <article class="room-card" data-room="${esc(room.key)}">
        <div>
          <span class="overline"><span class="room-card-chip"></span>${esc(room.desk)}</span>
          <h3 class="room-card-title">${esc(m.display_name || room.display_name)}</h3>
          <div class="room-card-desk">formed ${esc(m.formed || '—')}</div>
          <p class="room-card-purpose">${esc(m.purpose || '')}</p>
        </div>
        <div class="room-card-stats">
          <span><strong>${memberCount}</strong>standing</span>
          <span><strong>${guestCount}</strong>guest bench</span>
        </div>
        <a class="room-card-link" href="${esc(repoHref)}" target="_blank" rel="noopener">open in repo →</a>
      </article>`;
  }).join('');

  const neighborCards = (neighboring || []).map(room => {
    const repoHref = `https://github.com/${room.github.owner}/${room.github.repo}`;
    return `
      <article class="room-card is-neighboring" data-room="${esc(room.key)}">
        <div>
          <span class="overline"><span class="room-card-chip"></span>${esc(room.desk)}</span>
          <h3 class="room-card-title">${esc(room.display_name)}</h3>
          <div class="room-card-desk">neighboring · not indexed</div>
          <p class="room-card-purpose">${esc(room.note || '')}</p>
        </div>
        <a class="room-card-link" href="${esc(repoHref)}" target="_blank" rel="noopener">across the wire →</a>
      </article>`;
  }).join('');

  grid.innerHTML = indexedCards + neighborCards;
}

function renderNow({ indexed }) {
  const cards = indexed.map(room => {
    const r = room.manifest?.in_the_room || {};
    const seated = (r.seated || []).map(n => `<li>${esc(n)}</li>`).join('');
    const guests = (r.guests || []).map(g => {
      const note = g.note ? ` <span style="color:var(--ink-faint);font-family:var(--serif);font-style:italic;">— ${esc(g.note)}</span>` : '';
      return `<li>${esc(g.name)}${note}</li>`;
    }).join('');
    return `
      <article class="now-card" data-room="${esc(room.key)}">
        <div class="now-card-room">${esc(room.display_name)}</div>
        <div class="now-card-context">${esc(r.context || 'no active context declared')}</div>
        <div class="now-card-asof">as of ${esc(r.as_of || '—')}</div>
        <div class="now-card-label">Seated</div>
        <ul class="now-card-seated">${seated || '<li style="color:var(--ink-faint);">(none declared)</li>'}</ul>
        ${guests ? `<div class="now-card-label">Guest stars</div><ul class="now-card-guests">${guests}</ul>` : ''}
      </article>`;
  }).join('');
  nowPanel.innerHTML = cards;
}

function renderCrossrefs({ crossrefs, indexed }) {
  if (!crossrefs?.length) {
    crossrefList.innerHTML = '<p style="color:var(--ink-faint);font-style:italic;">No recurrences yet.</p>';
    return;
  }
  const keyToName = {};
  for (const r of indexed) keyToName[r.key] = r.display_name;

  const rows = crossrefs.map(cr => {
    const chips = cr.appearances.map(a => {
      const href = a.home_repo && a.file
        ? `${a.home_repo}/blob/main/${a.member_dir ? a.member_dir + '/' : ''}${a.file.replace(/^members\//, '')}`
        : null;
      const label = (keyToName[a.cabinet] || a.cabinet || '').replace(/Cabin'ét|Cabin-et|cabinet/gi, '').trim() || a.cabinet;
      return href
        ? `<a class="crossref-chip" data-room="${esc(a.cabinet)}" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`
        : `<span class="crossref-chip" data-room="${esc(a.cabinet)}">${esc(label)}</span>`;
    }).join('');
    return `<div class="crossref-row"><span class="crossref-name">${esc(cr.canonical)}</span><span class="crossref-rooms">${chips}</span></div>`;
  }).join('');
  crossrefList.innerHTML = rows;
}

function renderCacheStatus({ cache }) {
  if (!cache?.length) { cacheStatus.textContent = 'cache: empty'; return; }
  const minAge = Math.min(...cache.map(c => c.ageSeconds));
  cacheStatus.textContent = `cache: ${minAge}s old`;
}

function renderErrors({ errors }) {
  if (!errors?.length) return;
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.innerHTML = `Failed to fetch: ${errors.map(e => esc(e.key)).join(', ')}. Showing what loaded.`;
  document.querySelector('main').prepend(banner);
}

refreshLink.addEventListener('click', (e) => {
  e.preventDefault();
  grid.innerHTML = '<div class="loading">Refreshing</div>';
  nowPanel.innerHTML = '<div class="loading">Refreshing</div>';
  crossrefList.innerHTML = '<div class="loading">Refreshing</div>';
  load(true);
});

load();

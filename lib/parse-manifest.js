// lib/parse-manifest.js
// Parses a MANIFEST.md (per data/MANIFEST-SHAPE.md) into a structured object.
// Tolerant of whitespace, optional sections, missing trailing newlines.

export function parseManifest(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    throw new Error('parseManifest: expected a markdown string');
  }

  const frontmatter = extractFrontmatter(markdown);
  const body = stripFrontmatter(markdown);
  const sections = splitSections(body);

  return {
    cabinet: frontmatter.cabinet || null,
    display_name: frontmatter.display_name || null,
    desk: frontmatter.desk || null,
    formed: frontmatter.formed || null,
    purpose: frontmatter.purpose || null,
    home_repo: frontmatter.home_repo || null,
    member_dir: frontmatter.member_dir || null,
    members: parseMembersTable(sections['Members']),
    in_the_room: parseInTheRoom(sections['In the room right now']),
    guest_bench: parseMembersTable(sections['Guest bench'], { allowCasesColumn: true }),
    disambiguation: sections['Namespace disambiguation'] || null,
    extra_sections: collectExtraSections(sections, [
      'Members', 'In the room right now', 'Guest bench', 'Namespace disambiguation'
    ])
  };
}

function extractFrontmatter(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return {};
  const lines = m[1].split('\n');
  const out = {};
  for (const line of lines) {
    const km = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!km) continue;
    let value = km[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[km[1].trim()] = value;
  }
  return out;
}

function stripFrontmatter(md) {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
}

function splitSections(body) {
  const sections = {};
  const lines = body.split('\n');
  let currentHeading = null;
  let buffer = [];

  const flush = () => {
    if (currentHeading) {
      sections[currentHeading] = buffer.join('\n').trim();
    }
  };

  for (const line of lines) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      flush();
      currentHeading = h[1].trim();
      buffer = [];
    } else if (currentHeading) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function collectExtraSections(sections, known) {
  const knownSet = new Set(known);
  const extras = {};
  for (const [k, v] of Object.entries(sections)) {
    if (!knownSet.has(k)) extras[k] = v;
  }
  return extras;
}

function parseMembersTable(sectionText, opts = {}) {
  if (!sectionText) return [];

  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);
  const headerIdx = lines.findIndex(l => /^\|\s*#?\s*\|?/.test(l) && /Member/i.test(l));
  if (headerIdx === -1) return [];

  const header = splitRow(lines[headerIdx]).map(c => c.toLowerCase());
  const dataLines = lines.slice(headerIdx + 2).filter(l => l.startsWith('|'));

  const out = [];
  for (const line of dataLines) {
    const cells = splitRow(line);
    if (cells.length === 0) continue;

    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] ?? ''; });

    const num = parseInt(row['#'], 10);
    const name = row['member'] || '';
    const slot = row['slot'] || '';
    const file = row['file'] || '';
    if (!name) continue;

    const entry = { num: Number.isFinite(num) ? num : null, name, slot, file };
    if (opts.allowCasesColumn && row['cases/sessions']) {
      entry.appearances = row['cases/sessions'];
    }
    out.push(entry);
  }
  return out;
}

function splitRow(line) {
  const trimmed = line.replace(/^\|/, '').replace(/\|\s*$/, '');
  return trimmed.split('|').map(c => c.trim());
}

function parseInTheRoom(sectionText) {
  if (!sectionText) {
    return { context: null, as_of: null, seated: [], guests: [] };
  }

  const contextMatch = sectionText.match(/\*\*Active context:\*\*\s*(.+)/i);
  const asOfMatch = sectionText.match(/\*\*As of:\*\*\s*(.+)/i);
  const seated = parseBulletListUnderHeading(sectionText, /Seated:/i);
  const guestLines = parseBulletListUnderHeading(sectionText, /Guest stars:/i);

  const guests = guestLines.map(line => {
    const m = line.match(/^(.+?)\s*[—-]\s*(.+)$/);
    if (m) return { name: m[1].trim(), note: m[2].trim() };
    return { name: line.trim(), note: null };
  });

  return {
    context: contextMatch ? contextMatch[1].trim() : null,
    as_of: asOfMatch ? asOfMatch[1].trim() : null,
    seated,
    guests
  };
}

function parseBulletListUnderHeading(text, headingRegex) {
  const lines = text.split('\n');
  let collecting = false;
  const out = [];
  for (const line of lines) {
    if (headingRegex.test(line)) { collecting = true; continue; }
    if (!collecting) continue;
    if (/^\s*\*\*[^*]+:\*\*/.test(line) && !headingRegex.test(line)) { collecting = false; continue; }
    const bm = line.match(/^\s*[-*]\s+(.+)$/);
    if (bm) {
      out.push(bm[1].trim());
    } else if (line.trim() === '') {
      continue;
    } else if (out.length > 0) {
      collecting = false;
    }
  }
  return out;
}

export function computeCrossrefs(parsedManifests) {
  const byName = new Map();
  for (const m of parsedManifests) {
    if (!m) continue;
    const allMembers = [
      ...(m.members || []).map(x => ({ ...x, role: 'standing' })),
      ...(m.guest_bench || []).map(x => ({ ...x, role: 'guest_bench' }))
    ];
    for (const member of allMembers) {
      const key = normalizeName(member.name);
      if (!key) continue;
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push({
        cabinet: m.cabinet,
        display_name: m.display_name,
        name: member.name,
        slot: member.slot,
        role: member.role,
        file: member.file,
        member_dir: m.member_dir,
        home_repo: m.home_repo
      });
    }
  }

  const crossrefs = [];
  for (const [key, appearances] of byName.entries()) {
    if (appearances.length >= 2) crossrefs.push({ canonical: key, appearances });
  }
  crossrefs.sort((a, b) => a.canonical.localeCompare(b.canonical));
  return crossrefs;
}

function normalizeName(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .replace(/^(dci|dr\.?|mr\.?|mrs\.?|ms\.?|fr\.?)\s+/i, '')
    .replace(/^(jorge luis|jorge)\s+/i, '')
    .replace(/^(brian|aleister|arthur edward|helena petrovna|w\.?b\.?)\s+/i, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .pop();
}

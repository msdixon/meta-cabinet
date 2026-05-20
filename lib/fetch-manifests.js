// lib/fetch-manifests.js
// Per-repo token override: GITHUB_TOKEN_<KEY> where key is uppercased with
// hyphens as underscores. e.g. GITHUB_TOKEN_CABIN_ET, GITHUB_TOKEN_JOURNAL_CABIN_ET
// Falls back to GITHUB_TOKEN if no per-repo token found.

const CACHE = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function buildRawUrl(github) {
  const { owner, repo, branch = 'main', manifest_path } = github;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${manifest_path}`;
}

function getToken(cabinetKey) {
  const envKey = 'GITHUB_TOKEN_' + cabinetKey.toUpperCase().replace(/-/g, '_');
  return process.env[envKey] || process.env.GITHUB_TOKEN || null;
}

export async function fetchManifest(github, { ttlMs = DEFAULT_TTL_MS, forceFresh = false, cabinetKey = null } = {}) {
  const url = buildRawUrl(github);
  const now = Date.now();

  if (!forceFresh) {
    const cached = CACHE.get(url);
    if (cached && (now - cached.fetchedAt) < ttlMs) {
      return { body: cached.body, url, fromCache: true, fetchedAt: cached.fetchedAt };
    }
  }

  const token = getToken(cabinetKey || '');
  const headers = { 'Accept': 'text/plain' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const cached = CACHE.get(url);
    if (cached) {
      return { body: cached.body, url, fromCache: true, stale: true, fetchedAt: cached.fetchedAt, error: `HTTP ${res.status}` };
    }
    throw new Error(`Fetch failed for ${url}: HTTP ${res.status}`);
  }

  const body = await res.text();
  CACHE.set(url, { fetchedAt: now, body });
  return { body, url, fromCache: false, fetchedAt: now };
}

export function clearCache() { CACHE.clear(); }

export function cacheStatus() {
  const out = [];
  for (const [url, entry] of CACHE.entries()) {
    out.push({ url, fetchedAt: new Date(entry.fetchedAt).toISOString(), ageSeconds: Math.round((Date.now() - entry.fetchedAt) / 1000) });
  }
  return out;
}

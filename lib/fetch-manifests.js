// lib/fetch-manifests.js
// Pulls MANIFEST.md from each configured cabinet's GitHub repo.
// In-memory cache, default TTL 5 minutes. Public repos work unauthenticated;
// private repos require GITHUB_TOKEN in env.

const CACHE = new Map(); // url → { fetchedAt, body }
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function buildRawUrl(github) {
  const { owner, repo, branch = 'main', manifest_path } = github;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${manifest_path}`;
}

export async function fetchManifest(github, { ttlMs = DEFAULT_TTL_MS, forceFresh = false } = {}) {
  const url = buildRawUrl(github);
  const now = Date.now();

  if (!forceFresh) {
    const cached = CACHE.get(url);
    if (cached && (now - cached.fetchedAt) < ttlMs) {
      return { body: cached.body, url, fromCache: true, fetchedAt: cached.fetchedAt };
    }
  }

  const headers = { 'Accept': 'text/plain' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const cached = CACHE.get(url);
    if (cached) {
      return {
        body: cached.body,
        url,
        fromCache: true,
        stale: true,
        fetchedAt: cached.fetchedAt,
        error: `HTTP ${res.status}`
      };
    }
    throw new Error(`Fetch failed for ${url}: HTTP ${res.status}`);
  }

  const body = await res.text();
  CACHE.set(url, { fetchedAt: now, body });
  return { body, url, fromCache: false, fetchedAt: now };
}

export function clearCache() {
  CACHE.clear();
}

export function cacheStatus() {
  const out = [];
  for (const [url, entry] of CACHE.entries()) {
    out.push({
      url,
      fetchedAt: new Date(entry.fetchedAt).toISOString(),
      ageSeconds: Math.round((Date.now() - entry.fetchedAt) / 1000)
    });
  }
  return out;
}

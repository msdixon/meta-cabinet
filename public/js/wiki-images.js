// wiki-images.js
// Fetches portrait thumbnails from Wikipedia's REST API.
// CORS-open page summary endpoint. Falls back to null — callers show the monogram.

const cache = new Map();

export async function fetchWikiThumb(wikipediaTitle, size = 240) {
  if (!wikipediaTitle) return null;
  const cacheKey = `${wikipediaTitle}:${size}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) { cache.set(cacheKey, null); return null; }
    const data = await res.json();
    const src = data?.thumbnail?.source || data?.originalimage?.source || null;
    cache.set(cacheKey, src);
    return src;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

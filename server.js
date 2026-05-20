// server.js — meta-cabinet
// Express server. Serves landing + directory page; exposes /api/cabinets
// which fetches and parses MANIFESTs from each indexed cabinet.

import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fetchManifest, cacheStatus, clearCache } from './lib/fetch-manifests.js';
import { parseManifest, computeCrossrefs } from './lib/parse-manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3133;

const CABINETS = JSON.parse(
  readFileSync(join(__dirname, 'data/cabinets.json'), 'utf8')
);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ── API ─────────────────────────────────────────────────────────────────────

// GET /api/cabinets — fetches all indexed manifests + computes crossrefs
app.get('/api/cabinets', async (req, res) => {
  const forceFresh = req.query.fresh === '1';
  const results = [];
  const errors = [];

  for (const cab of CABINETS.indexed) {
    try {
      const { body, fromCache, stale, fetchedAt, error } = await fetchManifest(cab.github, { forceFresh, cabinetKey: cab.key });
      const parsed = parseManifest(body);
      results.push({
        key: cab.key,
        display_name: cab.display_name,
        desk: cab.desk,
        github: cab.github,
        manifest: parsed,
        meta: {
          fetched_at: new Date(fetchedAt).toISOString(),
          from_cache: !!fromCache,
          stale: !!stale,
          error: error || null
        }
      });
    } catch (err) {
      errors.push({ key: cab.key, error: err.message });
    }
  }

  const parsed = results.map(r => r.manifest);
  const crossrefs = computeCrossrefs(parsed);

  res.json({
    indexed: results,
    neighboring: CABINETS.neighboring,
    crossrefs,
    errors,
    cache: cacheStatus()
  });
});

// POST /api/cache/clear — manual refresh
app.post('/api/cache/clear', (req, res) => {
  clearCache();
  res.json({ cleared: true });
});

// ── PAGES ───────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'public/index.html'));
});

app.get('/directory', (_req, res) => {
  res.sendFile(join(__dirname, 'public/directory.html'));
});

app.get('/members', (_req, res) => {
  res.sendFile(join(__dirname, 'public/members.html'));
});

app.listen(PORT, () => {
  console.log(`The meta-cabinet is open at http://localhost:${PORT}`);
});

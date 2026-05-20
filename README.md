# meta-cabinet

> *A card catalog for the practice of bringing it to the room.*

Index across the three rooms Rachel runs: **Eastern Cabin'ét**, **Journal Cabin'ét**, **Secret-Cabin-et**. Pacific's cabinet is a neighboring room — acknowledged across the wire, owned at the other desk.

This repo doesn't *contain* any cabinet. It indexes them. Each indexed cabinet publishes a `MANIFEST.md` in its home repo. The meta-cabinet fetches those manifests live from GitHub, parses them, and renders a landing page, members page, and directory.

---

## Pages

- **`/`** — landing: room cards, "in the room right now" per room, cross-references
- **`/members`** — bio cards with portrait photos, origin, bio blurb, room assignments
- **`/directory`** — filterable flat table sourced from the MANIFEST files

---

## Setup

```bash
git clone https://github.com/msdixon/meta-cabinet
cd meta-cabinet
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3133`. Requires Node 18+.

---

## How it works

Each indexed cabinet's `MANIFEST.md` is fetched from GitHub raw on page load, cached server-side for 5 minutes. The parser reads the structured tables and frontmatter; the frontend renders from `/api/cabinets`.

The members page (`/members`) is client-side only — member data lives in `public/js/members-data.js` and portrait photos load from Wikipedia's REST API.

---

## The three rooms

| Cabinet | Home repo | Manifest |
|---|---|---|
| Eastern Cabin'ét | `msdixon/wagscrum` | `cabin-et/MANIFEST.md` |
| Journal Cabin'ét | `msdixon/dossier-placard` | `MANIFEST.md` |
| Secret-Cabin-et | `msdixon/secret-cabinet` | `MANIFEST.md` |

The Journal and Secret manifests are new — see `prs/` for the drafts to land in each repo.

---

## Updating "in the room right now"

Edit the `## In the room right now` block in the relevant room's `MANIFEST.md`. The change appears on the landing page within 5 minutes (cache TTL) or immediately via the refresh link in the footer.

---

## Adding photos

Member portraits load from Wikipedia's REST API for historical/real figures. Fictional characters show a styled monogram. To add a local image for any member:

1. Drop a file at `public/images/<key>.jpg` (e.g. `public/images/lestat.jpg`)
2. Add `image_url: '/images/lestat.jpg'` to that member's entry in `public/js/members-data.js`

The hydration logic checks `image_url` first, then Wikipedia, then falls back to monogram.

---

## Provenance

The "meta-cabinet" term predates this repo — it first appeared in the `dossier-placard` description, gesturing at the practice that ran across the rooms without being named. This repo makes it visible.

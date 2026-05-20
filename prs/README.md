# prs/

Drafts for the three sibling-repo PRs that need to land before the meta-cabinet can index all three rooms.

Each subfolder contains:
- `MANIFEST.md` — the file to add (or replace) in the sibling repo
- `PR-DESCRIPTION.md` — the PR body to paste

## Suggested order

1. **`cabin-et/`** — smallest delta. Adds frontmatter and "In the room right now" to an existing well-formed manifest. PR opens against `msdixon/wagscrum`.

2. **`dossier-placard/`** — new file. PR opens against `msdixon/dossier-placard`. Once landed, the meta-cabinet starts rendering the Journal Cabin'ét.

3. **`secret-cabinet/`** — new file. PR opens against `msdixon/secret-cabinet`. Once landed, all three rooms render and the Crowley crossref (Journal ↔ Secret) becomes visible.

## Note on the active-context blocks

Each manifest's "In the room right now" block is pre-populated with a plausible current state. **Edit before merging** if the actual current state differs:

- **cabin-et**: Case #001 — Slippery Slopes, Foucault as guest.
- **dossier-placard**: Daily glosses · May 2026, trio + Borges + Lebowitz. Adjust to reflect real current seating.
- **secret-cabinet**: Novel research · PreSeedings entries, all eight seated. Matches the lodge's "always present" default.

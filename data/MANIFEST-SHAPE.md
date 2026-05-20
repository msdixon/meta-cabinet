# The canonical MANIFEST shape

Every cabinet indexed by the meta-cabinet exposes a `MANIFEST.md` at its repo root (or at `<cabinet>/MANIFEST.md` if the cabinet is a subdirectory). The file is human-readable markdown AND machine-parsable.

The structured tables and the frontmatter block are required. Everything else is informational.

---

## Required: frontmatter

```yaml
---
cabinet: cabin-et
display_name: Eastern Cabin'ét
desk: Eastern (Rachel)
formed: 2026-05-06
purpose: Collision room for the wagscrum case board
home_repo: https://github.com/msdixon/wagscrum
member_dir: cabin-et/members
---
```

---

## Required: `## Members` table

```markdown
## Members

| # | Member | Slot | File |
|---|--------|------|------|
| 1 | Stringer Bell | Operations / scale / shipping reality | members/stringer-bell.md |
```

Columns are fixed: `#`, `Member`, `Slot`, `File`. The parser keys on the column headers.

---

## Required: `## In the room right now` block

```markdown
## In the room right now

**Active context:** Case #001 — Slippery Slopes
**As of:** 2026-05-13

Seated:
- Stringer Bell
- Borges

Guest stars:
- Michel Foucault — tone-vocabulary, orthodoxy/power layer
```

---

## Optional: `## Guest bench`

```markdown
## Guest bench

| Member | Slot | File | Cases/Sessions |
|--------|------|------|----------------|
| Michel Foucault | Continental philosophy / power | members/foucault.md | #001 |
```

---

## Optional: `## Namespace disambiguation`

Free-form markdown. Rendered verbatim on the meta-cabinet for any member appearing in multiple rooms.

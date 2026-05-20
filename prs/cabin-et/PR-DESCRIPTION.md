# Update cabin-et/MANIFEST.md to canonical meta-cabinet shape

The Eastern Cabin'ét already has the most complete manifest of the three rooms — this PR is the smallest of the three. It adds frontmatter and the canonical "In the room right now" block, keeping every existing section intact.

## What changes

- **Adds YAML frontmatter** at the top: `cabinet`, `display_name`, `desk`, `formed`, `purpose`, `home_repo`, `member_dir`. This makes the manifest machine-parseable.
- **Adds `## In the room right now` section** declaring Case #001 as the active context, with all six standing members seated and Foucault as active guest star. When the active case changes, this block changes.
- **Renames "Guest voices" to `## Guest bench`** and reformats as a structured table so the parser can pick it up. Foucault row preserved.
- **Adds cross-room notes** to namespace disambiguation: Borges, Lestat, and Vera flagged as same-source-different-tuning vs the Journal Cabin'ét.

## Doesn't change

- Members table — same six, same slots, same files.
- "Slot coverage check" — preserved.
- "Overlap watch" (Stringer/Vera) — preserved.
- "Adding & retiring members" — preserved.

## Why

Standardizes the manifest across all three of Rachel's rooms (Journal and Secret PRs are in parallel). Enables the meta-cabinet to read this manifest live and render Eastern's current board arrangement on the landing page.

## The board-update mechanic

Once this lands, changing what's "in the room right now" is a one-block edit to this file. The meta-cabinet picks up the change within 5 minutes (cache TTL) or immediately on manual refresh. Respects the "no surprises / PRs only" protocol from the 2026-05-11 entry.

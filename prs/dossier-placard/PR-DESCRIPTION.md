# Add MANIFEST.md for meta-cabinet index

The new `meta-cabinet/` repo indexes the three rooms (Eastern, Journal, Secret) via a canonical `MANIFEST.md` in each. This PR adds the Journal Cabin'ét's manifest.

## What changes

- New file: `MANIFEST.md` at the repo root.
- Lists the eleven standing members (trio + rotation pool) with slots and file paths.
- Includes an "In the room right now" block — pre-populated with trio + Borges + Lebowitz. **Edit to reflect actual current seating before merge.**
- Namespace disambiguation notes Borges, Vera, and Lestat as same-source-different-tuning vs. Eastern Cabin'ét, and that Journal's Crowley ≠ Secret-Cabin-et's Crowley.

## Doesn't change

No code changes. `server.js`, `MEMBER_FILES`, prompts, frontend — untouched. The manifest is hand-edited markdown only.

## Testing

The meta-cabinet's parser was run against this file locally; standing roster, in-the-room block, and namespace disambiguation all parsed clean.

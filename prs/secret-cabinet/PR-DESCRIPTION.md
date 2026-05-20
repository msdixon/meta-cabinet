# Add MANIFEST.md for meta-cabinet index

The new `meta-cabinet/` repo indexes the three rooms (Eastern, Journal, Secret) via a canonical `MANIFEST.md` in each. This PR adds the Secret-Cabin-et's manifest.

## What changes

- New file: `MANIFEST.md` at the repo root.
- Lists the eight standing lodge members with their registers and file paths.
- Lists the three toggleable guests (Llull, Ibn Khaldun, John Dee) on the guest bench.
- "In the room right now" defaults to all eight seated, no guests toggled in — matches the lodge's "always present" default.
- Namespace disambiguation makes the Crowley distinction (lodge vs journal) explicit.

## Doesn't change

No code changes. `server.js`, `ROSTER`, prompts, frontend — untouched.

## Testing

Parser was run against this file locally; all sections parsed clean.

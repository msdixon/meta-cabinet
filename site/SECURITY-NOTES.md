# Security notes — site/

## react-router (moderate, unresolved) — 2026-09-01

`npm audit` reports 5 moderate findings (`react-router`, `react-router-dom`,
`tinacms`, `@tinacms/app`, `@tinacms/cli`) that cannot be closed from this
repo right now:

- [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) — open redirect via backslash in `<Link>`/`useNavigate`
- [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg) — arbitrary constructor injection via `deserializeErrors()` in SSR hydration

Both are fixed upstream only in **react-router 7.18.0+**; the fix was never
backported to the 6.x line. `tinacms@3.12.1` (the latest published release
as of this writing — confirmed via `npm view tinacms version`) still pins
`react-router-dom: ^6.30.3`, and `6.30.6` is itself the newest release
react-router has ever published on its 6.x line (`npm view react-router
dist-tags` → `version-6: 6.30.6`). So there is no in-range upgrade available
until TinaCMS migrates its admin UI to react-router 7 — that's a real
framework migration for them (v6 → v7 API changes), not a patch release.

**Do not force this with an `overrides` entry** (the way `cookie` is
overridden below) without testing the live Tina admin flow first — the
`/admin` UI is bundled into the deployed static site (see PR #1's notes),
is compiled against react-router 6 APIs, and this environment has no
`TINA_CLIENT_ID`/`TINA_TOKEN` to actually exercise it. An override could
silently break CMS editing with nothing here to catch it.

**Re-check periodically**: run `npm audit` in `site/` after any `tinacms`/
`@tinacms/cli` bump, or check whether TinaCMS's `package.json` has moved off
`react-router-dom: ^6.x`. Once it has, a plain `npm audit fix` should close
these without an override.

Full audit context: [PR #4](https://github.com/msdixon/meta-cabinet/pull/4)
(closed 14 of the original 19 findings) and PR #1 (2026-08-04), which first
flagged this residual set as "no forward fix published upstream yet — not
fixable from this repo."

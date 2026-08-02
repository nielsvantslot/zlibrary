# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A small team of friends playing Project Zomboid together on a shared/multiplayer server. They check the tool primarily on a second monitor or by alt-tabbing during an active play session — quick glances while looting, not leisurely browsing between sessions.

## Product Purpose

"The Zomboid Athenaeum" is a shared tracker for the team's collection of in-game books, magazines, and VHS tapes. It exists so the team can coordinate looting: see at a glance which skill books/recipe magazines/VHS tapes are still missing, which have been found but not brought home yet, and which are already secured at the team's base library. Success is the team never re-looting a location for an item they already have, and always knowing what's still worth grabbing.

## Positioning

Unlike a generic checklist or spreadsheet, it's seeded with the real, complete Project Zomboid Build 42 catalog (120 skill books across 24 skills, 87 recipe magazines, 55 skill-granting VHS tapes) with accurate titles and unlock effects, and is framed as an actual library/card-catalog rather than a task tracker — status is "shelved," not "done."

## Operating Context

- Self-hosted by one team member (Docker or plain Node), reached by teammates over LAN/VPN at `http://<host-ip>:port`. No login — anyone with the link can view and edit.
- Checked mid-session on a second monitor or via alt-tab while actively playing, so glanceability and fast interaction matter more than immersive browsing.
- Also occasionally reviewed between sessions to plan the next loot run.

## Capabilities and Constraints

- Fixed catalog of 262 real items seeded from game data: skill books (24 skills × 5 volumes each, with level/tier and XP-multiplier effect), recipe magazines (title, gating skill if any, list of unlocked recipes), and VHS tapes (title, skill(s) taught, flat XP amount(s) — no volumes/tiers, since tapes aren't sequenced the way book volumes are).
- Each item has one of three states — Missing / Found (picked up, not home yet) / Shelved (secured at base) — plus a free-text note (e.g. who has it or where it is).
- Search across title/skill/effect, and filter by category/skill/state.
- No accounts; edits are last-write-wins, shared instantly across the team.
- Live sync on persistent deployments (Docker/`npm start`): every open browser tab holds a Server-Sent Events connection (`GET /api/events`); any status/note change broadcasts to all connected tabs, so teammates see each other's edits without refreshing. On serverless (Vercel) this isn't possible, so the client polls `/api/books` and `/api/stats` instead (`GET /api/config` tells the client which mode is active).
- Plain HTML/CSS/JS frontend (no framework, no build step) served by a Node/Express backend. Two interchangeable storage backends behind `server/db.js`: SQLite (`better-sqlite3`, a local file) for Docker/`npm start`, and Postgres (Neon serverless driver) for Vercel — picked automatically based on whether `DATABASE_URL`/`POSTGRES_URL` is set. These are two separate databases; progress doesn't sync between a Docker deployment and a Vercel deployment.
- Runs in Docker via `docker compose up -d --build`; `public/` and `server/` are bind-mounted from the host so frontend edits apply immediately and backend edits need only `docker compose restart` (no rebuild) unless `package.json` dependencies changed.
- Also deployable to Vercel as a serverless function (`api/index.js` wraps the Express app; `vercel.json` routes everything to it). Requires a Postgres database attached via Vercel's Storage tab (Neon integration) to provide `DATABASE_URL`.

## Brand Commitments

Name: "The Zomboid Athenaeum" — confirmed. Leans into the library/archive framing rather than a generic dashboard name.

## Evidence on Hand

Real Project Zomboid Build 42 book/magazine/VHS catalog (title, skill, level, effect) sourced from pzwiki.net, stored at `server/data/books-seed.json`. No other brand assets, testimonials, or marketing copy exist — this is an internal tool for a private friend group, not a public product.

## Product Principles

1. Glanceable over immersive — the primary use is a quick status check mid-session, so scanability beats atmosphere.
2. Real data, real stakes — the catalog is the actual in-game item list; never fabricate or simplify titles/effects.
3. Zero-friction editing — no login, no confirmation dialogs; toggling a status is a single click since it happens under time pressure mid-game.
4. Library framing, not task-tracker framing — "shelved," shelves grouped by skill, card-catalog language throughout, even though the underlying model is a simple status tracker.

## Accessibility & Inclusion

No specific requirements established.

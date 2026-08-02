# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A small team of friends playing Project Zomboid together on a shared/multiplayer server. They check the tool primarily on a second monitor or by alt-tabbing during an active play session — quick glances while looting, not leisurely browsing between sessions.

## Product Purpose

"The Zomboid Athenaeum" is a shared tracker for the team's collection of in-game books and magazines. It exists so the team can coordinate looting: see at a glance which skill books/recipe magazines are still missing, which have been found but not brought home yet, and which are already secured at the team's base library. Success is the team never re-looting a location for a book they already have, and always knowing what's still worth grabbing.

## Positioning

Unlike a generic checklist or spreadsheet, it's seeded with the real, complete Project Zomboid Build 42 catalog (120 skill books across 24 skills, 87 recipe magazines) with accurate titles and unlock effects, and is framed as an actual library/card-catalog rather than a task tracker — status is "shelved," not "done."

## Operating Context

- Self-hosted by one team member (Docker or plain Node), reached by teammates over LAN/VPN at `http://<host-ip>:port`. No login — anyone with the link can view and edit.
- Checked mid-session on a second monitor or via alt-tab while actively playing, so glanceability and fast interaction matter more than immersive browsing.
- Also occasionally reviewed between sessions to plan the next loot run.

## Capabilities and Constraints

- Fixed catalog of 207 real items seeded from game data: skill books (24 skills × 5 volumes each, with level/tier and XP-multiplier effect) and recipe magazines (title, gating skill if any, list of unlocked recipes).
- Each item has one of three states — Missing / Found (picked up, not home yet) / Shelved (secured at base) — plus a free-text note (e.g. who has it or where it is).
- Search across title/skill/effect, and filter by category/skill/state.
- No accounts; edits are last-write-wins, shared instantly across the team.
- Live sync: every open browser tab holds a Server-Sent Events connection (`GET /api/events`); any status/note change broadcasts to all connected tabs, so teammates see each other's edits without refreshing.
- Plain HTML/CSS/JS frontend (no framework, no build step) served by a Node/Express backend with SQLite storage; must keep working with this stack.
- Runs in Docker via `docker compose up -d --build`; `public/` and `server/` are bind-mounted from the host so frontend edits apply immediately and backend edits need only `docker compose restart` (no rebuild) unless `package.json` dependencies changed.

## Brand Commitments

Name: "The Zomboid Athenaeum" — confirmed. Leans into the library/archive framing rather than a generic dashboard name.

## Evidence on Hand

Real Project Zomboid Build 42 book/magazine catalog (title, skill, level, effect) sourced from pzwiki.net, stored at `server/data/books-seed.json`. No other brand assets, testimonials, or marketing copy exist — this is an internal tool for a private friend group, not a public product.

## Product Principles

1. Glanceable over immersive — the primary use is a quick status check mid-session, so scanability beats atmosphere.
2. Real data, real stakes — the catalog is the actual in-game item list; never fabricate or simplify titles/effects.
3. Zero-friction editing — no login, no confirmation dialogs; toggling a status is a single click since it happens under time pressure mid-game.
4. Library framing, not task-tracker framing — "shelved," shelves grouped by skill, card-catalog language throughout, even though the underlying model is a simple status tracker.

## Accessibility & Inclusion

No specific requirements established.

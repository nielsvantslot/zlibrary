# The Zomboid Athenaeum

A shared library tracker for your Project Zomboid team: track which of the game's
120 skill books and 87 recipe magazines you've found, and which are safely shelved
at home base.

## Running it

### With Docker (recommended)

```
docker compose up -d --build
```

Serves on `http://localhost:3100` (mapped from the container's port 3000 — change
the left-hand side of the `ports:` mapping in `docker-compose.yml` if 3100 is taken
on your machine too). The book catalog seeds automatically on first run. Data lives
in `./data/books.sqlite` on the host via a bind mount, so it survives
`docker compose down`/`up`/rebuilds — back up that folder if you want to keep your
team's progress.

Useful commands: `docker compose logs -f` (tail logs), `docker compose restart`,
`docker compose down` (stop and remove the container; data is untouched since it
lives on the host).

`public/` and `server/` are bind-mounted from the host into the container, so:
- Editing anything in `public/` (HTML/CSS/JS) takes effect immediately — just reload the page.
- Editing anything in `server/` needs `docker compose restart` (no rebuild) to take effect.
- Only changing `package.json` dependencies needs a real `docker compose up -d --build`.

### Without Docker

```
npm install
npm start
```

The app seeds its book catalog automatically on first run and serves on port 3000
(`http://localhost:3000`). Data is stored in `data/books.sqlite` — back that file up
if you want to keep your team's progress.

To use a different port: `PORT=8080 npm start`.

## Letting your team connect

The server listens on all network interfaces, so anyone on the same network (or
same Tailscale/VPN) as the host machine can reach it at:

```
http://<host-machine-LAN-IP>:3100   (or :3000 if running without Docker)
```

Find the host machine's LAN IP with `ipconfig` (Windows) or `ifconfig`/`ip a`
(Linux/macOS). There's no login — anyone with the URL can view and update the
library, so only share it with your team.

If you want it reachable outside your LAN (e.g. hosting on a small VPS or via a
tunnel like Tailscale/ngrok), that's on you to set up — this app itself has no
deployment requirements beyond Node.js.

## How it works

- Every book/magazine has one of three states: **Missing**, **Found** (someone
  picked it up but it's not home yet), or **Shelved** (secured at base).
- Each entry also has a free-text note field, handy for "Steve has it at the
  Rosewood safehouse."
- Skill books are grouped into shelves by skill (Carpentry, Cooking, Electrical,
  etc.); recipe magazines get their own section since they aren't tied to a skill
  progression the same way.
- Search and filter by category or status from the header controls.
- Changes sync live: every open tab holds a connection to the server, so when one
  teammate updates a book's status, everyone else's page updates automatically —
  no refresh needed.

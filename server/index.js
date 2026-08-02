const path = require('path');
const express = require('express');
const db = require('./db');

const isServerless = !!process.env.VERCEL;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const VALID_STATES = ['missing', 'found', 'shelved'];

const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) client.write(payload);
}

// Live-sync (SSE) and the dev auto-reload watcher both need a persistent process,
// which a serverless function is not. On Vercel, clients fall back to polling
// instead (see /api/config below).
if (!isServerless) {
  const chokidar = require('chokidar');
  const PUBLIC_DIR = path.join(__dirname, '..', 'public');
  let reloadDebounce = null;
  chokidar.watch(PUBLIC_DIR, { usePolling: true, interval: 300, ignoreInitial: true }).on('all', () => {
    clearTimeout(reloadDebounce);
    reloadDebounce = setTimeout(() => broadcast('reload', {}), 250);
  });

  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    sseClients.add(res);

    const keepAlive = setInterval(() => res.write(': ping\n\n'), 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });
}

app.get('/api/config', (req, res) => {
  res.json({ live: !isServerless });
});

app.get('/api/books', async (req, res) => {
  const rows = await db.getBooks(req.query);
  res.json(rows);
});

app.patch('/api/books/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { state } = req.body;

  if (state !== undefined && !VALID_STATES.includes(state)) {
    return res.status(400).json({ error: `state must be one of ${VALID_STATES.join(', ')}` });
  }

  const updated = await db.updateStatus(id, req.body);
  if (!updated) return res.status(404).json({ error: 'book not found' });

  res.json(updated);
  broadcast('book-updated', updated);
});

app.get('/api/stats', async (req, res) => {
  res.json(await db.getStats());
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PZ Book Library running at http://localhost:${PORT}`);
  });
}

module.exports = app;

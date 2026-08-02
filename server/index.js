const path = require('path');
const chokidar = require('chokidar');
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const VALID_STATES = ['missing', 'found', 'shelved'];

const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) client.write(payload);
}

// Dev convenience: reload connected browsers whenever a frontend file changes on disk.
// Polling (not inotify) because Docker Desktop's Windows bind mounts don't reliably
// propagate native filesystem change events into the container.
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

app.get('/api/books', (req, res) => {
  const { category, skill, state, q } = req.query;

  let sql = `
    SELECT b.id, b.title, b.category, b.skill, b.level, b.level_label AS levelLabel,
           b.effect, b.item_id AS itemId,
           s.state, s.note, s.updated_at AS updatedAt
    FROM books b JOIN status s ON s.book_id = b.id
    WHERE 1 = 1
  `;
  const params = [];

  if (category) {
    sql += ' AND b.category = ?';
    params.push(category);
  }
  if (skill) {
    sql += ' AND b.skill = ?';
    params.push(skill);
  }
  if (state) {
    sql += ' AND s.state = ?';
    params.push(state);
  }
  if (q) {
    sql += ' AND (b.title LIKE ? OR b.skill LIKE ? OR b.effect LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY b.category, b.skill, b.level, b.title';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

app.patch('/api/books/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { state, note } = req.body;

  if (state !== undefined && !VALID_STATES.includes(state)) {
    return res.status(400).json({ error: `state must be one of ${VALID_STATES.join(', ')}` });
  }

  const existing = db.prepare('SELECT * FROM status WHERE book_id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'book not found' });

  const nextState = state !== undefined ? state : existing.state;
  const nextNote = note !== undefined ? note : existing.note;

  db.prepare('UPDATE status SET state = ?, note = ?, updated_at = ? WHERE book_id = ?')
    .run(nextState, nextNote, new Date().toISOString(), id);

  const updated = db.prepare(`
    SELECT b.id, b.title, s.state, s.note, s.updated_at AS updatedAt
    FROM books b JOIN status s ON s.book_id = b.id WHERE b.id = ?
  `).get(id);
  res.json(updated);
  broadcast('book-updated', updated);
});

app.get('/api/stats', (req, res) => {
  const byCategory = db.prepare(`
    SELECT category, state, COUNT(*) AS count
    FROM books b JOIN status s ON s.book_id = b.id
    GROUP BY category, state
  `).all();

  const totals = db.prepare(`
    SELECT category, COUNT(*) AS count FROM books GROUP BY category
  `).all();

  res.json({ byCategory, totals });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PZ Book Library running at http://localhost:${PORT}`);
});

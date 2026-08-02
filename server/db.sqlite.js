const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'books.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    skill TEXT,
    level INTEGER,
    level_label TEXT,
    effect TEXT,
    item_id TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS status (
    book_id INTEGER PRIMARY KEY REFERENCES books(id),
    state TEXT NOT NULL DEFAULT 'missing',
    note TEXT,
    updated_at TEXT
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM books').get();
  if (count > 0) return;

  const seed = require('./data/books-seed.json');

  const insertBook = db.prepare(`
    INSERT INTO books (title, category, skill, level, level_label, effect, item_id)
    VALUES (@title, @category, @skill, @level, @levelLabel, @effect, @itemId)
  `);
  const insertStatus = db.prepare(`
    INSERT INTO status (book_id, state) VALUES (?, 'missing')
  `);

  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      const info = insertBook.run({
        title: row.title,
        category: row.category,
        skill: row.skill || null,
        level: row.level || null,
        levelLabel: row.levelLabel || null,
        effect: row.effect || null,
        itemId: row.itemId || null,
      });
      insertStatus.run(info.lastInsertRowid);
    }
  });

  insertAll(seed);
  console.log(`Seeded ${seed.length} books.`);
}

seedIfEmpty();

async function getBooks({ category, skill, state, q } = {}) {
  let sqlText = `
    SELECT b.id, b.title, b.category, b.skill, b.level, b.level_label AS levelLabel,
           b.effect, b.item_id AS itemId,
           s.state, s.note, s.updated_at AS updatedAt
    FROM books b JOIN status s ON s.book_id = b.id
    WHERE 1 = 1
  `;
  const params = [];

  if (category) {
    sqlText += ' AND b.category = ?';
    params.push(category);
  }
  if (skill) {
    sqlText += ' AND b.skill = ?';
    params.push(skill);
  }
  if (state) {
    sqlText += ' AND s.state = ?';
    params.push(state);
  }
  if (q) {
    sqlText += ' AND (b.title LIKE ? OR b.skill LIKE ? OR b.effect LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sqlText += ' ORDER BY b.category, b.skill, b.level, b.title';

  return db.prepare(sqlText).all(...params);
}

async function updateStatus(id, { state, note }) {
  const existing = db.prepare('SELECT * FROM status WHERE book_id = ?').get(id);
  if (!existing) return null;

  const nextState = state !== undefined ? state : existing.state;
  const nextNote = note !== undefined ? note : existing.note;

  db.prepare('UPDATE status SET state = ?, note = ?, updated_at = ? WHERE book_id = ?')
    .run(nextState, nextNote, new Date().toISOString(), id);

  return db.prepare(`
    SELECT b.id, b.title, s.state, s.note, s.updated_at AS updatedAt
    FROM books b JOIN status s ON s.book_id = b.id WHERE b.id = ?
  `).get(id);
}

async function getStats() {
  const byCategory = db.prepare(`
    SELECT category, state, COUNT(*) AS count
    FROM books b JOIN status s ON s.book_id = b.id
    GROUP BY category, state
  `).all();

  const totals = db.prepare(`
    SELECT category, COUNT(*) AS count FROM books GROUP BY category
  `).all();

  return { byCategory, totals };
}

module.exports = { getBooks, updateStatus, getStats };

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

module.exports = db;

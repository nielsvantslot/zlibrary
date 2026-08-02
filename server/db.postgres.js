const { neon } = require('@neondatabase/serverless');

// fullResults: true makes sql.query() return { rows } (like node-postgres/pg),
// instead of the driver's default of returning the row array directly.
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL, { fullResults: true });

let initPromise = null;

function ensureInit() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

async function init() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      skill TEXT,
      level INTEGER,
      level_label TEXT,
      effect TEXT,
      item_id TEXT UNIQUE
    );
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS status (
      book_id INTEGER PRIMARY KEY REFERENCES books(id),
      state TEXT NOT NULL DEFAULT 'missing',
      note TEXT,
      updated_at TEXT
    );
  `);

  const { rows } = await sql.query('SELECT COUNT(*)::int AS count FROM books');
  if (rows[0].count > 0) return;

  const seed = require('./data/books-seed.json');
  for (const row of seed) {
    const { rows: inserted } = await sql.query(
      `INSERT INTO books (title, category, skill, level, level_label, effect, item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [row.title, row.category, row.skill || null, row.level || null, row.levelLabel || null, row.effect || null, row.itemId || null]
    );
    await sql.query(`INSERT INTO status (book_id, state) VALUES ($1, 'missing')`, [inserted[0].id]);
  }
  console.log(`Seeded ${seed.length} books.`);
}

async function getBooks({ category, skill, state, q } = {}) {
  await ensureInit();

  let text = `
    SELECT b.id, b.title, b.category, b.skill, b.level, b.level_label AS "levelLabel",
           b.effect, b.item_id AS "itemId",
           s.state, s.note, s.updated_at AS "updatedAt"
    FROM books b JOIN status s ON s.book_id = b.id
    WHERE 1 = 1
  `;
  const params = [];

  if (category) { params.push(category); text += ` AND b.category = $${params.length}`; }
  if (skill) { params.push(skill); text += ` AND b.skill = $${params.length}`; }
  if (state) { params.push(state); text += ` AND s.state = $${params.length}`; }
  if (q) {
    params.push(`%${q}%`);
    const p = params.length;
    text += ` AND (b.title ILIKE $${p} OR b.skill ILIKE $${p} OR b.effect ILIKE $${p})`;
  }

  text += ' ORDER BY b.category, b.skill, b.level, b.title';

  const { rows } = await sql.query(text, params);
  return rows;
}

async function updateStatus(id, { state, note }) {
  await ensureInit();

  const { rows: existingRows } = await sql.query('SELECT * FROM status WHERE book_id = $1', [id]);
  const existing = existingRows[0];
  if (!existing) return null;

  const nextState = state !== undefined ? state : existing.state;
  const nextNote = note !== undefined ? note : existing.note;

  await sql.query(
    'UPDATE status SET state = $1, note = $2, updated_at = $3 WHERE book_id = $4',
    [nextState, nextNote, new Date().toISOString(), id]
  );

  const { rows } = await sql.query(`
    SELECT b.id, b.title, s.state, s.note, s.updated_at AS "updatedAt"
    FROM books b JOIN status s ON s.book_id = b.id WHERE b.id = $1
  `, [id]);
  return rows[0];
}

async function getStats() {
  await ensureInit();

  const byCategory = (await sql.query(`
    SELECT category, state, COUNT(*)::int AS count
    FROM books b JOIN status s ON s.book_id = b.id
    GROUP BY category, state
  `)).rows;

  const totals = (await sql.query(`
    SELECT category, COUNT(*)::int AS count FROM books GROUP BY category
  `)).rows;

  return { byCategory, totals };
}

module.exports = { getBooks, updateStatus, getStats };

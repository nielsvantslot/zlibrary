// Deployed on Vercel with a Neon Postgres integration attached, DATABASE_URL (or
// the older POSTGRES_URL) is auto-injected — that's what tells us to use Postgres
// instead of the local SQLite file used by Docker/npm start.
module.exports = (process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ? require('./db.postgres')
  : require('./db.sqlite');

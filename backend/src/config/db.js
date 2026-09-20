const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'edugestion',
  password: process.env.PGPASSWORD || 'edugestion_pass',
  database: process.env.PGDATABASE || 'edugestion',
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

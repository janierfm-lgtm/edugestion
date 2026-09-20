require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function migrate() {
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await db.query(sql);
  // eslint-disable-next-line no-console
  console.log('Migración aplicada correctamente.');
  await db.pool.end();
}

migrate().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error al migrar:', err);
  process.exit(1);
});

const { Pool } = require('pg');

// La mayoría de proveedores de PostgreSQL en la nube (Neon, Supabase, Render, etc.)
// entregan una única cadena de conexión (DATABASE_URL) y requieren SSL. Si esa
// variable está presente se usa tal cual; si no, se arma la conexión con las
// variables sueltas PGHOST/PGPORT/etc. (como en desarrollo local o Docker Compose).
const sslEnabled = process.env.PGSSL === 'true';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'edugestion',
      password: process.env.PGPASSWORD || 'edugestion_pass',
      database: process.env.PGDATABASE || 'edugestion',
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const createApp = require('./app');
const { connectMongo } = require('./config/mongo');
const db = require('./config/db');

const PORT = process.env.PORT || 4000;

async function waitForPostgres(retries = 20, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await db.query('SELECT 1');
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`Esperando a PostgreSQL... intento ${attempt}/${retries}`);
      await new Promise((resolve) => { setTimeout(resolve, delayMs); });
    }
  }
  throw new Error('No se pudo conectar a PostgreSQL después de varios intentos');
}

async function runMigrations() {
  const sqlPath = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await db.query(sql);
  // eslint-disable-next-line no-console
  console.log('Esquema de PostgreSQL verificado/aplicado.');
}

async function seedIfRequested() {
  if (process.env.AUTO_SEED === 'true') {
    const seed = require('./scripts/seed');
    await seed();
  }
}

async function start() {
  await waitForPostgres();
  if (process.env.AUTO_MIGRATE !== 'false') {
    await runMigrations();
  }
  // AUTO_SEED es opcional (por defecto no se ejecuta) y está pensado para
  // despliegues públicos de demostración, donde no hay forma sencilla de
  // entrar a una terminal para correr "npm run seed" manualmente. Es seguro
  // dejarlo activado permanentemente: seed.js no duplica datos si ya existen.
  await seedIfRequested();
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`EduGestión backend escuchando en el puerto ${PORT}`);
  });
  // La bitácora en MongoDB es complementaria: no debe bloquear ni tumbar el arranque de la API.
  connectMongo();
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error fatal al iniciar el backend:', err);
  process.exit(1);
});

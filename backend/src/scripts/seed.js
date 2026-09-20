require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const teacherHash = await bcrypt.hash('Docente123!', 10);
  const studentHash = await bcrypt.hash('Estudiante123!', 10);

  const admin = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Administrador EduGestión', 'admin@edugestion.pe', $1, 'admin')
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [passwordHash],
  );

  const teacher = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Percy Falén Morales', 'docente@edugestion.pe', $1, 'docente')
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [teacherHash],
  );

  const student = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Estudiante Demo', 'estudiante@edugestion.pe', $1, 'estudiante')
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [studentHash],
  );

  const teacherRow = await db.query("SELECT id FROM users WHERE email = 'docente@edugestion.pe'");
  const teacherId = teacherRow.rows[0].id;

  const course = await db.query(
    `INSERT INTO courses (code, name, description, teacher_id)
     VALUES ('EPT-101', 'Herramientas y Servicios para Desarrolladores en la Web', 'Curso introductorio de herramientas modernas de desarrollo web', $1)
     ON CONFLICT (code) DO NOTHING RETURNING id`,
    [teacherId],
  );

  const studentRow = await db.query("SELECT id FROM users WHERE email = 'estudiante@edugestion.pe'");
  const courseRow = await db.query("SELECT id FROM courses WHERE code = 'EPT-101'");

  if (studentRow.rows[0] && courseRow.rows[0]) {
    await db.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentRow.rows[0].id, courseRow.rows[0].id],
    );
  }

  // eslint-disable-next-line no-console
  console.log('Datos semilla verificados/insertados. Credenciales de prueba:');
  // eslint-disable-next-line no-console
  console.log('  admin@edugestion.pe / Admin123!');
  // eslint-disable-next-line no-console
  console.log('  docente@edugestion.pe / Docente123!');
  // eslint-disable-next-line no-console
  console.log('  estudiante@edugestion.pe / Estudiante123!');
}

module.exports = seed;

// Todas las inserciones de arriba usan "ON CONFLICT DO NOTHING", por lo que
// ejecutar seed() varias veces (por ejemplo, en cada arranque del backend en
// un despliegue público) es seguro: la segunda vez en adelante no hace nada.
// Cuando este archivo se ejecuta directamente (npm run seed) sí cerramos el
// pool de conexiones al terminar; cuando se importa desde index.js, no.
if (require.main === module) {
  seed()
    .then(() => db.pool.end())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error al insertar datos semilla:', err);
      process.exit(1);
    });
}

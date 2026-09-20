const request = require('supertest');
const createApp = require('../src/app');
const db = require('../src/config/db');

const app = createApp();

async function registerAndLogin(role) {
  const email = `test.${role}.${Date.now()}.${Math.random().toString(36).slice(2)}@edugestion.pe`;
  const reg = await request(app).post('/api/auth/register').send({
    name: `Usuario ${role}`,
    email,
    password: 'Password123',
    role,
  });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123' });
  return { token: res.body.token, id: reg.body.id };
}

describe('Matrículas, notas y asistencia', () => {
  let teacher;
  let student;
  let courseId;
  let enrollmentId;

  beforeAll(async () => {
    teacher = await registerAndLogin('docente');
    student = await registerAndLogin('estudiante');

    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ code: `G-${Date.now()}`, name: 'Curso para notas' });
    courseId = courseRes.body.id;

    const enrollRes = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ student_id: student.id, course_id: courseId });
    enrollmentId = enrollRes.body.id;
  });

  afterAll(async () => {
    await db.pool.end();
  });

  test('matricula creada correctamente', () => {
    expect(enrollmentId).toBeDefined();
  });

  test('el docente registra una nota válida', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ enrollment_id: enrollmentId, evaluation_name: 'Examen 1', score: 15.5 });
    expect(res.status).toBe(201);
    expect(Number(res.body.score)).toBe(15.5);
  });

  test('rechaza una nota fuera de rango (0-20)', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ enrollment_id: enrollmentId, evaluation_name: 'Examen inválido', score: 25 });
    expect(res.status).toBe(400);
  });

  test('el docente registra asistencia', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ enrollment_id: enrollmentId, attendance_date: '2026-03-10', status: 'presente' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('presente');
  });

  test('un estudiante no puede registrar notas', async () => {
    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ enrollment_id: enrollmentId, evaluation_name: 'Nota trucha', score: 20 });
    expect(res.status).toBe(403);
  });
});

const request = require('supertest');
const createApp = require('../src/app');
const db = require('../src/config/db');

const app = createApp();

async function registerAndLogin(role) {
  const email = `test.${role}.${Date.now()}.${Math.random().toString(36).slice(2)}@edugestion.pe`;
  await request(app).post('/api/auth/register').send({
    name: `Usuario ${role}`,
    email,
    password: 'Password123',
    role,
  });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123' });
  return res.body.token;
}

describe('Cursos', () => {
  let teacherToken;
  let studentToken;

  beforeAll(async () => {
    teacherToken = await registerAndLogin('docente');
    studentToken = await registerAndLogin('estudiante');
  });

  afterAll(async () => {
    await db.pool.end();
  });

  test('un docente puede crear un curso', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ code: `T-${Date.now()}`, name: 'Curso de prueba', description: 'desc' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Curso de prueba');
  });

  test('un estudiante puede listar cursos pero no crearlos', async () => {
    const listRes = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const createRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ code: `S-${Date.now()}`, name: 'No debería crearse' });
    expect(createRes.status).toBe(403);
  });

  test('rechaza un código de curso duplicado', async () => {
    const code = `DUP-${Date.now()}`;
    const first = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ code, name: 'Curso original' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ code, name: 'Curso duplicado' });
    expect(second.status).toBe(409);
  });
});

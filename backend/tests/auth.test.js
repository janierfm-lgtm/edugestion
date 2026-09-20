const request = require('supertest');
const createApp = require('../src/app');
const db = require('../src/config/db');

const app = createApp();

describe('Autenticación', () => {
  const email = `test.auth.${Date.now()}@edugestion.pe`;

  afterAll(async () => {
    await db.pool.end();
  });

  test('registra un nuevo usuario', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Usuario de Prueba',
      email,
      password: 'Password123',
      role: 'estudiante',
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
  });

  test('rechaza registro duplicado', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Usuario de Prueba',
      email,
      password: 'Password123',
      role: 'estudiante',
    });
    expect(res.status).toBe(409);
  });

  test('rechaza registro con datos inválidos', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'no-es-un-correo',
      password: '123',
    });
    expect(res.status).toBe(400);
  });

  test('inicia sesión y obtiene un token válido', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(email);
  });

  test('rechaza credenciales inválidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'incorrecta',
    });
    expect(res.status).toBe(401);
  });

  test('rechaza acceso sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

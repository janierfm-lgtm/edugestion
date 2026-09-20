const request = require('supertest');
const createApp = require('../src/app');
const db = require('../src/config/db');

const app = createApp();

async function registerAndLogin(role) {
  const email = `test.users.${role}.${Date.now()}.${Math.random().toString(36).slice(2)}@edugestion.pe`;
  await request(app).post('/api/auth/register').send({
    name: `Usuario ${role}`,
    email,
    password: 'Password123',
    role,
  });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123' });
  return res.body.token;
}

describe('Gestión de usuarios (solo admin)', () => {
  let adminToken;
  let teacherToken;
  let createdUserId;

  beforeAll(async () => {
    adminToken = await registerAndLogin('admin');
    teacherToken = await registerAndLogin('docente');
  });

  afterAll(async () => {
    await db.pool.end();
  });

  test('un docente no puede listar usuarios', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  });

  test('un admin puede listar usuarios', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).not.toHaveProperty('password_hash');
  });

  test('un admin puede crear un nuevo docente', async () => {
    const email = `nuevo.docente.${Date.now()}@edugestion.pe`;
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nuevo Docente', email, password: 'Password123', role: 'docente' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('docente');
    createdUserId = res.body.id;
  });

  test('un docente no puede crear usuarios', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        name: 'No debería crearse',
        email: `no.debe.${Date.now()}@edugestion.pe`,
        password: 'Password123',
        role: 'docente',
      });
    expect(res.status).toBe(403);
  });

  test('rechaza crear un usuario con correo duplicado', async () => {
    const email = `dup.${Date.now()}@edugestion.pe`;
    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Original', email, password: 'Password123', role: 'estudiante' });
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Duplicado', email, password: 'Password123', role: 'estudiante' });
    expect(res.status).toBe(409);
  });

  test('un admin puede editar el nombre y el rol de un usuario', async () => {
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Docente Editado', role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Docente Editado');
    expect(res.body.role).toBe('admin');
  });

  test('un admin no puede eliminar su propia cuenta', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app)
      .delete(`/api/users/${meRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  test('un admin puede eliminar a otro usuario', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  test('eliminar un usuario inexistente devuelve 404', async () => {
    const res = await request(app)
      .delete('/api/users/99999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

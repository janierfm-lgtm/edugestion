const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function list(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id',
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, email, role, password } = req.body;

    if (email) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [
        email,
        req.params.id,
      ]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe otro usuario con ese correo' });
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const result = await db.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         password_hash = COALESCE($4, password_hash)
       WHERE id = $5
       RETURNING id, name, email, role, created_at`,
      [name, email, role, passwordHash, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta mientras la tienes iniciada' });
    }
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };

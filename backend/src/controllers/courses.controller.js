const db = require('../config/db');

async function list(req, res, next) {
  try {
    const result = await db.query(
      `SELECT c.*, u.name AS teacher_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       ORDER BY c.id`,
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Curso no encontrado' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { code, name, description, teacher_id: teacherId } = req.body;
    const result = await db.query(
      `INSERT INTO courses (code, name, description, teacher_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [code, name, description || null, teacherId || null],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un curso con ese código' });
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { code, name, description, teacher_id: teacherId } = req.body;
    const result = await db.query(
      `UPDATE courses SET code = COALESCE($1, code), name = COALESCE($2, name),
       description = COALESCE($3, description), teacher_id = COALESCE($4, teacher_id)
       WHERE id = $5 RETURNING *`,
      [code, name, description, teacherId, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Curso no encontrado' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Curso no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };

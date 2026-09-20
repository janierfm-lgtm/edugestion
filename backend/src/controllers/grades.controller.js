const db = require('../config/db');

async function list(req, res, next) {
  try {
    const { enrollment_id: enrollmentId } = req.query;
    const params = [];
    let where = '';
    if (enrollmentId) {
      params.push(enrollmentId);
      where = 'WHERE g.enrollment_id = $1';
    }
    const result = await db.query(
      `SELECT g.*, u.name AS student_name, c.name AS course_name
       FROM grades g
       JOIN enrollments e ON e.id = g.enrollment_id
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       ${where}
       ORDER BY g.id DESC`,
      params,
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { enrollment_id: enrollmentId, evaluation_name: evaluationName, score } = req.body;
    const result = await db.query(
      `INSERT INTO grades (enrollment_id, evaluation_name, score) VALUES ($1, $2, $3) RETURNING *`,
      [enrollmentId, evaluationName, score],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { evaluation_name: evaluationName, score } = req.body;
    const result = await db.query(
      `UPDATE grades SET evaluation_name = COALESCE($1, evaluation_name), score = COALESCE($2, score)
       WHERE id = $3 RETURNING *`,
      [evaluationName, score, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Nota no encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await db.query('DELETE FROM grades WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Nota no encontrada' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };

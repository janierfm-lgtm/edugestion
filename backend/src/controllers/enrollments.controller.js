const db = require('../config/db');

async function list(req, res, next) {
  try {
    const { student_id: studentId, course_id: courseId } = req.query;
    const clauses = [];
    const params = [];
    if (studentId) {
      params.push(studentId);
      clauses.push(`e.student_id = $${params.length}`);
    }
    if (courseId) {
      params.push(courseId);
      clauses.push(`e.course_id = $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT e.*, u.name AS student_name, c.name AS course_name
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       ${where}
       ORDER BY e.id`,
      params,
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { student_id: studentId, course_id: courseId } = req.body;
    const result = await db.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *`,
      [studentId, courseId],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El estudiante ya está matriculado en ese curso' });
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await db.query('DELETE FROM enrollments WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Matrícula no encontrada' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, remove };

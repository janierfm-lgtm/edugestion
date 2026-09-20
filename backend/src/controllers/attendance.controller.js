const db = require('../config/db');

async function list(req, res, next) {
  try {
    const { enrollment_id: enrollmentId } = req.query;
    const params = [];
    let where = '';
    if (enrollmentId) {
      params.push(enrollmentId);
      where = 'WHERE a.enrollment_id = $1';
    }
    const result = await db.query(
      `SELECT a.*, u.name AS student_name, c.name AS course_name
       FROM attendance a
       JOIN enrollments e ON e.id = a.enrollment_id
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       ${where}
       ORDER BY a.attendance_date DESC`,
      params,
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { enrollment_id: enrollmentId, attendance_date: attendanceDate, status } = req.body;
    const result = await db.query(
      `INSERT INTO attendance (enrollment_id, attendance_date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (enrollment_id, attendance_date) DO UPDATE SET status = EXCLUDED.status
       RETURNING *`,
      [enrollmentId, attendanceDate, status],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create };

const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, activityLogger('attendance'));

router.get('/', controller.list);

router.post(
  '/',
  authorize('admin', 'docente'),
  [
    body('enrollment_id').isInt(),
    body('attendance_date').isISO8601().withMessage('Fecha inválida (usar AAAA-MM-DD)'),
    body('status').isIn(['presente', 'tardanza', 'falta']),
  ],
  validate,
  controller.create,
);

module.exports = router;

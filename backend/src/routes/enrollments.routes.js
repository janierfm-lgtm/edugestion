const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/enrollments.controller');
const { authenticate, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, activityLogger('enrollment'));

router.get('/', controller.list);

router.post(
  '/',
  authorize('admin', 'docente'),
  [
    body('student_id').isInt().withMessage('student_id debe ser numérico'),
    body('course_id').isInt().withMessage('course_id debe ser numérico'),
  ],
  validate,
  controller.create,
);

router.delete('/:id', authorize('admin', 'docente'), controller.remove);

module.exports = router;

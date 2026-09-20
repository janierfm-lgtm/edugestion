const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/grades.controller');
const { authenticate, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, activityLogger('grade'));

router.get('/', controller.list);

router.post(
  '/',
  authorize('admin', 'docente'),
  [
    body('enrollment_id').isInt(),
    body('evaluation_name').trim().notEmpty(),
    body('score').isFloat({ min: 0, max: 20 }).withMessage('La nota debe estar entre 0 y 20'),
  ],
  validate,
  controller.create,
);

router.put('/:id', authorize('admin', 'docente'), controller.update);
router.delete('/:id', authorize('admin', 'docente'), controller.remove);

module.exports = router;

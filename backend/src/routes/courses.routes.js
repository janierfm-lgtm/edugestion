const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/courses.controller');
const { authenticate, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, activityLogger('course'));

router.get('/', controller.list);
// IMPORTANTE: esta ruta va antes de "/:id" para que "teachers" no se
// interprete como un id de curso.
router.get('/teachers', controller.listTeachers);
router.get('/:id', controller.getById);

router.post(
  '/',
  authorize('admin', 'docente'),
  [
    body('code').trim().notEmpty().withMessage('El código es obligatorio'),
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  ],
  validate,
  controller.create,
);

router.put('/:id', authorize('admin', 'docente'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;

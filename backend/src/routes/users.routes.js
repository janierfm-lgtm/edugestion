const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const validate = require('../middleware/validate');

const router = express.Router();

// Toda esta sección es exclusiva del rol admin: solo un administrador puede
// ver la lista completa de usuarios, crear cuentas nuevas (docentes,
// estudiantes u otros admins), editarlas o eliminarlas.
router.use(authenticate, authorize('admin'), activityLogger('user'));

router.get('/', controller.list);
router.get('/:id', controller.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').isIn(['admin', 'docente', 'estudiante']).withMessage('Rol inválido'),
  ],
  validate,
  controller.create,
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Correo inválido'),
    body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'docente', 'estudiante']).withMessage('Rol inválido'),
  ],
  validate,
  controller.update,
);

router.delete('/:id', controller.remove);

module.exports = router;

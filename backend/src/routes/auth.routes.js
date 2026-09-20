const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'docente', 'estudiante']),
  ],
  validate,
  controller.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validate,
  controller.login,
);

router.get('/me', authenticate, controller.me);

module.exports = router;

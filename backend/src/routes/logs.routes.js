const express = require('express');
const mongoose = require('mongoose');
const { ActivityLog } = require('../config/mongo');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  // La bitácora vive en MongoDB, que es un almacén complementario: si no está
  // disponible, se avisa con un 503 claro en vez de colgar la petición o
  // devolver un 500 genérico.
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'El servicio de bitácora (MongoDB) no está disponible en este momento',
    });
  }
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    return res.json(logs);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

const { ActivityLog } = require('../config/mongo');

/**
 * Registra en MongoDB una entrada de auditoría para operaciones de escritura
 * (POST/PUT/PATCH/DELETE). Es "best effort": si Mongo no está disponible,
 * no debe romper la petición principal hacia PostgreSQL.
 */
function activityLogger(entity) {
  return (req, res, next) => {
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!writeMethods.includes(req.method)) {
      return next();
    }
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        ActivityLog.create({
          userId: req.user ? req.user.id : null,
          userEmail: req.user ? req.user.email : null,
          action: `${req.method} ${res.statusCode}`,
          entity,
          entityId: req.params ? req.params.id : undefined,
          method: req.method,
          path: req.originalUrl,
          metadata: { body: req.body },
        }).catch(() => {
          // No interrumpe el flujo si la bitácora falla
        });
      }
    });
    return next();
  };
}

module.exports = activityLogger;

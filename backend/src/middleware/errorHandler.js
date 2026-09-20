// Códigos de error de PostgreSQL que representan un error del cliente (4xx)
// y no un fallo interno del servidor. Referencia: https://www.postgresql.org/docs/current/errcodes-html
const PG_ERROR_STATUS = {
  '23503': { status: 409, message: 'La operación hace referencia a un registro que no existe o ya fue eliminado' }, // foreign_key_violation
  '23505': { status: 409, message: 'El registro ya existe (violación de restricción única)' }, // unique_violation
  '23502': { status: 400, message: 'Falta un campo obligatorio' }, // not_null_violation
  '22P02': { status: 400, message: 'Formato de dato inválido en la petición' }, // invalid_text_representation
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const pgMapping = err.code && PG_ERROR_STATUS[err.code];
  if (pgMapping) {
    return res.status(pgMapping.status).json({ error: err.publicMessage || pgMapping.message });
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: err.publicMessage || 'Error interno del servidor',
  });
}

module.exports = errorHandler;

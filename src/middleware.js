const { AppError } = require('./errors');

function notFound(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `No existe la ruta ${req.method} ${req.path}.`));
}

function errorHandler(error, _req, res, _next) {
  let normalized = error;

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    normalized = new AppError(400, 'INVALID_JSON', 'El cuerpo JSON no es valido.');
  } else if (error.errcode === 2067) {
    normalized = new AppError(409, 'CONFLICT', 'El registro ya existe.');
  } else if (!(error instanceof AppError)) {
    normalized = new AppError(500, 'INTERNAL_ERROR', 'Ocurrio un error interno.');
  }

  const payload = {
    error: {
      code: normalized.code,
      message: normalized.message,
    },
  };
  if (normalized.details !== undefined) payload.error.details = normalized.details;
  res.status(normalized.status).json(payload);
}

module.exports = { errorHandler, notFound };

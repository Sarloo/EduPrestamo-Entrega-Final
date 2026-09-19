const jwt = require('jsonwebtoken');
const { AppError } = require('./errors');

const TOKEN_ISSUER = 'eduprestamo';
const TOKEN_AUDIENCE = 'eduprestamo-api';
const TOKEN_ALGORITHM = 'HS256';

function signAccessToken(user, secret, expiresIn) {
  return jwt.sign(
    { role: user.role, email: user.email },
    secret,
    {
      subject: String(user.id),
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      algorithm: TOKEN_ALGORITHM,
      expiresIn,
    },
  );
}

function createAuthentication({ db, jwtSecret }) {
  function authenticate(req, _res, next) {
    const authorization = req.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Se requiere un token de acceso.'));
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      return next(new AppError(401, 'AUTH_REQUIRED', 'Se requiere un token de acceso.'));
    }

    try {
      const payload = jwt.verify(token, jwtSecret, {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
        algorithms: [TOKEN_ALGORITHM],
      });
      const user = db
        .prepare('SELECT id, name, email, role, locked_until FROM users WHERE id = ?')
        .get(Number(payload.sub));
      if (!user) {
        return next(new AppError(401, 'INVALID_TOKEN', 'El token no corresponde a un usuario.'));
      }
      if (user.locked_until && Date.parse(user.locked_until) > Date.now()) {
        return next(new AppError(423, 'ACCOUNT_LOCKED', 'La cuenta esta bloqueada.'));
      }
      if (user.locked_until) {
        db.prepare(`
          UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?
        `).run(new Date().toISOString(), user.id);
        user.locked_until = null;
      }
      req.user = user;
      return next();
    } catch (error) {
      if (error instanceof AppError) return next(error);
      return next(new AppError(401, 'INVALID_TOKEN', 'El token es invalido o ha expirado.'));
    }
  }

  function authorize(...roles) {
    return (req, _res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError(403, 'FORBIDDEN', 'No tiene permisos para esta operacion.'));
      }
      return next();
    };
  }

  return { authenticate, authorize };
}

module.exports = {
  TOKEN_AUDIENCE,
  TOKEN_ALGORITHM,
  TOKEN_ISSUER,
  createAuthentication,
  signAccessToken,
};

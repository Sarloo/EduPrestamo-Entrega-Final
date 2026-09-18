const { randomBytes } = require('node:crypto');
const path = require('node:path');

const developmentSecret = randomBytes(48).toString('hex');

function getJwtSecret(explicitSecret) {
  const configuredSecret = explicitSecret || process.env.JWT_SECRET;
  if (configuredSecret) {
    if (process.env.NODE_ENV === 'production' && Buffer.byteLength(configuredSecret) < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 bytes en produccion.');
    }
    return configuredSecret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en produccion.');
  }
  return developmentSecret;
}

function integerSetting(value, name, { minimum, maximum = Number.MAX_SAFE_INTEGER }) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} debe ser un entero entre ${minimum} y ${maximum}.`);
  }
  return parsed;
}

function getConfig(overrides = {}) {
  const port = integerSetting(overrides.port ?? process.env.PORT ?? 3000, 'PORT', {
    minimum: 0,
    maximum: 65535,
  });
  return {
    port,
    databasePath:
      overrides.databasePath ??
      process.env.DATABASE_PATH ??
      path.join(process.cwd(), 'data', 'eduprestamo.db'),
    jwtSecret: getJwtSecret(overrides.jwtSecret),
    jwtExpiresIn: overrides.jwtExpiresIn ?? process.env.JWT_EXPIRES_IN ?? '1h',
    maxLoginAttempts: integerSetting(
      overrides.maxLoginAttempts ?? process.env.LOGIN_MAX_ATTEMPTS ?? 3,
      'LOGIN_MAX_ATTEMPTS',
      { minimum: 1, maximum: 100 },
    ),
    lockoutMinutes: integerSetting(
      overrides.lockoutMinutes ?? process.env.LOCKOUT_MINUTES ?? 15,
      'LOCKOUT_MINUTES',
      { minimum: 1, maximum: 1440 },
    ),
    // The browser client and API share one origin by default, so CORS is not
    // required. Explicitly opt in to trusted cross-origin clients when needed.
    corsOrigin: overrides.corsOrigin ?? process.env.CORS_ORIGIN ?? 'same-origin',
  };
}

module.exports = { getConfig, getJwtSecret, integerSetting };

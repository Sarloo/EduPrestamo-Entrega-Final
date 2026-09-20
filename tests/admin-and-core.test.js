const { corsOriginOption } = require('../src/app');
const { getConfig, getJwtSecret, integerSetting } = require('../src/config');
const { createDatabase, transaction } = require('../src/db');
const validate = require('../src/validation');
const { createTestContext, demoSessions } = require('./helpers');

describe('administracion y nucleo de la aplicacion', () => {
  let context;
  let sessions;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    context = createTestContext();
    sessions = await demoSessions(context.api);
  });

  afterEach(() => context.db.close());

  test('expone salud, SPA y errores JSON consistentes', async () => {
    const health = await context.api.get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');
    expect(health.headers['cross-origin-embedder-policy']).toBe('require-corp');
    expect(health.headers['permissions-policy']).toContain('camera=()');
    expect(health.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
    expect(health.headers['strict-transport-security']).toBeUndefined();

    const spa = await context.api.get('/ruta-de-interfaz');
    expect(spa.status).toBe(200);
    expect(spa.text).toContain('EduPréstamo');

    const missing = await context.api.get('/api/no-existe');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    const badJson = await context.api
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(badJson.status).toBe(400);
    expect(badJson.body.error.code).toBe('INVALID_JSON');
  });

  test('administrador consulta usuarios, cambia rol y desbloquea', async () => {
    const users = await context.api
      .get('/api/users')
      .set('Authorization', sessions.admin.authorization);
    expect(users.status).toBe(200);
    expect(users.body.data).toHaveLength(2);

    const userId = sessions.user.user.id;
    const promoted = await context.api
      .patch(`/api/users/${userId}/role`)
      .set('Authorization', sessions.admin.authorization)
      .send({ role: 'ADMIN' });
    expect(promoted.body.data.role).toBe('ADMIN');

    context.db.prepare('UPDATE users SET failed_attempts = 3, locked_until = ? WHERE id = ?')
      .run('2099-01-01T00:00:00.000Z', userId);
    const unlocked = await context.api
      .patch(`/api/users/${userId}/unlock`)
      .set('Authorization', sessions.admin.authorization);
    expect(unlocked.body.data).toMatchObject({ failedAttempts: 0, lockedUntil: null });

    const selfDemotion = await context.api
      .patch(`/api/users/${sessions.admin.user.id}/role`)
      .set('Authorization', sessions.admin.authorization)
      .send({ role: 'USER' });
    expect(selfDemotion.status).toBe(409);
  });

  test('resumen refleja inventario, usuarios y solicitudes', async () => {
    await context.api
      .post('/api/loans')
      .set('Authorization', sessions.user.authorization)
      .send({ resourceId: 1, quantity: 1, purpose: 'Clase de desarrollo web' });

    const summary = await context.api
      .get('/api/reports/summary')
      .set('Authorization', sessions.admin.authorization);
    expect(summary.status).toBe(200);
    expect(summary.body.data.inventory).toMatchObject({ resources: 3, totalUnits: 18, availableUnits: 18 });
    expect(summary.body.data.loans.PENDING).toBe(1);
    expect(summary.body.data.users).toMatchObject({ total: 2, administrators: 1, standardUsers: 1 });
  });

  test('JWT de una cuenta bloqueada se rechaza y un bloqueo vencido se limpia', async () => {
    const userId = sessions.user.user.id;
    context.db.prepare('UPDATE users SET locked_until = ? WHERE id = ?')
      .run('2099-01-01T00:00:00.000Z', userId);
    const blocked = await context.api
      .get('/api/auth/me')
      .set('Authorization', sessions.user.authorization);
    expect(blocked.status).toBe(423);

    context.db.prepare('UPDATE users SET failed_attempts = 3, locked_until = ? WHERE id = ?')
      .run('2000-01-01T00:00:00.000Z', userId);
    const recovered = await context.api
      .get('/api/auth/me')
      .set('Authorization', sessions.user.authorization);
    expect(recovered.status).toBe(200);
    expect(context.db.prepare('SELECT failed_attempts FROM users WHERE id = ?').get(userId).failed_attempts)
      .toBe(0);
  });
});

describe('utilidades y persistencia', () => {
  const originalEnvironment = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  test('configura valores explicitos y exige secreto en produccion', () => {
    expect(getConfig({ port: 4321, jwtSecret: 'explicit', databasePath: ':memory:' }))
      .toMatchObject({ port: 4321, jwtSecret: 'explicit', databasePath: ':memory:' });

    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    expect(() => getJwtSecret()).toThrow('JWT_SECRET es obligatorio');

    process.env.JWT_SECRET = 'short';
    expect(() => getJwtSecret()).toThrow('al menos 32 bytes');

    process.env.JWT_SECRET = 'from-environment-secret-with-32-bytes';
    expect(getJwtSecret()).toBe('from-environment-secret-with-32-bytes');

    expect(integerSetting('3', 'TEST', { minimum: 1, maximum: 5 })).toBe(3);
    expect(() => integerSetting('0', 'TEST', { minimum: 1, maximum: 5 })).toThrow('TEST');
    expect(() => getConfig({ port: 70000, jwtSecret: process.env.JWT_SECRET })).toThrow('PORT');
  });

  test('transaccion confirma o revierte de forma atomica', () => {
    const db = createDatabase(':memory:');
    transaction(db, () => {
      db.prepare(`INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run('Uno', 'uno@example.com', 'hash', 'USER', 'now', 'now');
    });
    expect(db.prepare('SELECT COUNT(*) AS total FROM users').get().total).toBe(1);

    expect(() => transaction(db, () => {
      db.prepare(`INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run('Dos', 'dos@example.com', 'hash', 'USER', 'now', 'now');
      throw new Error('fallo esperado');
    })).toThrow('fallo esperado');
    expect(db.prepare('SELECT COUNT(*) AS total FROM users').get().total).toBe(1);
    db.close();
  });

  test('valida fechas, booleanos, estados e identificadores', () => {
    expect(validate.date('2026-09-17', 'date')).toBe('2026-09-17');
    expect(validate.date('', 'date', { optional: true })).toBeUndefined();
    expect(validate.boolean('true', 'active')).toBe(true);
    expect(validate.boolean('false', 'active')).toBe(false);
    expect(validate.boolean(false, 'active')).toBe(false);
    expect(validate.id('12')).toBe(12);
    expect(validate.role('ADMIN')).toBe('ADMIN');
    expect(validate.status('RETURNED')).toBe('RETURNED');
    expect(validate.condition('FAIR')).toBe('FAIR');
    expect(() => validate.date('2026-02-30', 'date')).toThrow();
    expect(() => validate.boolean('yes', 'active')).toThrow();
    expect(() => validate.id('0')).toThrow();
    expect(() => validate.role('OWNER')).toThrow();
    expect(() => validate.status('LOST')).toThrow();
    expect(() => validate.condition('NEW')).toThrow();
    expect(() => validate.email('correo-invalido')).toThrow();
    expect(() => validate.password('sinmayuscula1')).toThrow();
    expect(() => validate.positiveInteger(1.5, 'quantity')).toThrow();
    expect(validate.optionalString(null, 'notes')).toBeUndefined();
    expect(validate.optionalString(' nota ', 'notes')).toBe('nota');
  });

  test('aplica una lista CORS y rechaza origenes ajenos', () => {
    const sameOrigin = corsOriginOption('same-origin');
    const wildcard = corsOriginOption('*');
    const verifyOrigin = corsOriginOption('https://uno.example, https://dos.example');
    expect(typeof sameOrigin).toBe('function');
    expect(typeof wildcard).toBe('function');

    return new Promise((resolve, reject) => {
      verifyOrigin(undefined, (error, accepted) => {
        try {
          expect(error).toBeNull();
          expect(accepted).toBe(false);
          verifyOrigin('https://uno.example', (allowedError, allowed) => {
            try {
              expect(allowedError).toBeNull();
              expect(allowed).toBe(true);
              verifyOrigin('https://mal.example', (deniedError) => {
                try {
                  expect(deniedError).toBeInstanceOf(Error);
                  wildcard('https://cualquiera.example', (wildcardError, wildcardAllowed) => {
                    try {
                      expect(wildcardError).toBeNull();
                      expect(wildcardAllowed).toBe(true);
                      sameOrigin('https://externo.example', (sameError, sameAllowed) => {
                        try {
                          expect(sameError).toBeNull();
                          expect(sameAllowed).toBe(false);
                          resolve();
                        } catch (assertionError) {
                          reject(assertionError);
                        }
                      });
                    } catch (assertionError) {
                      reject(assertionError);
                    }
                  });
                } catch (assertionError) {
                  reject(assertionError);
                }
              });
            } catch (assertionError) {
              reject(assertionError);
            }
          });
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    });
  });
});

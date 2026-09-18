const jwt = require('jsonwebtoken');
const { TOKEN_AUDIENCE, TOKEN_ISSUER } = require('../src/security');
const { createTestContext, demoSessions, TEST_SECRET } = require('./helpers');

describe('autenticacion JWT y roles', () => {
  let context;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    context = createTestContext();
  });

  afterEach(() => context.db.close());

  test('registra un usuario, entrega JWT y consulta el perfil', async () => {
    const registration = await context.api.post('/api/auth/register').send({
      name: 'Ana Lopez',
      email: 'ANA@example.com',
      password: 'Segura123',
    });

    expect(registration.status).toBe(201);
    expect(registration.body.data.user).toMatchObject({
      name: 'Ana Lopez',
      email: 'ana@example.com',
      role: 'USER',
    });
    expect(registration.body.data.user.passwordHash).toBeUndefined();

    const profile = await context.api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registration.body.data.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.email).toBe('ana@example.com');
  });

  test('rechaza registro duplicado y contrasena debil', async () => {
    const weak = await context.api.post('/api/auth/register').send({
      name: 'Ana Lopez',
      email: 'ana@example.com',
      password: 'debil',
    });
    expect(weak.status).toBe(400);
    expect(weak.body.error.code).toBe('VALIDATION_ERROR');

    const duplicate = await context.api.post('/api/auth/register').send({
      name: 'Usuario Duplicado',
      email: 'usuario@eduprestamo.local',
      password: 'Segura123',
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('EMAIL_IN_USE');
  });

  test('inicia sesion con credenciales validas y deniega una ruta administrativa', async () => {
    const { admin, user } = await demoSessions(context.api);
    expect(admin.user.role).toBe('ADMIN');
    expect(user.user.role).toBe('USER');

    const forbidden = await context.api
      .get('/api/reports/summary')
      .set('Authorization', user.authorization);
    expect(forbidden.status).toBe(403);

    const allowed = await context.api
      .get('/api/reports/summary')
      .set('Authorization', admin.authorization);
    expect(allowed.status).toBe(200);
  });

  test('rechaza token ausente, vacio, alterado, expirado y de usuario inexistente', async () => {
    const missing = await context.api.get('/api/auth/me');
    expect(missing.status).toBe(401);

    const empty = await context.api.get('/api/auth/me').set('Authorization', 'Bearer ');
    expect(empty.status).toBe(401);

    const { user } = await demoSessions(context.api);
    const altered = `${user.token.slice(0, -2)}xx`;
    const invalid = await context.api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${altered}`);
    expect(invalid.status).toBe(401);

    const expired = jwt.sign(
      { role: 'USER', email: 'usuario@eduprestamo.local' },
      TEST_SECRET,
      { subject: String(user.user.id), issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, expiresIn: -1 },
    );
    const expiredResponse = await context.api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expired}`);
    expect(expiredResponse.status).toBe(401);

    const ghost = jwt.sign(
      { role: 'USER', email: 'ghost@example.com' },
      TEST_SECRET,
      { subject: '9999', issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, expiresIn: '1h' },
    );
    const ghostResponse = await context.api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${ghost}`);
    expect(ghostResponse.status).toBe(401);

    const wrongAlgorithm = jwt.sign(
      { role: 'USER', email: 'usuario@eduprestamo.local' },
      TEST_SECRET,
      {
        algorithm: 'HS384',
        subject: String(user.user.id),
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
        expiresIn: '1h',
      },
    );
    const wrongAlgorithmResponse = await context.api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${wrongAlgorithm}`);
    expect(wrongAlgorithmResponse.status).toBe(401);
  });

  test('bloquea la cuenta tras tres fallos y permite entrar al vencer el bloqueo', async () => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await context.api.post('/api/auth/login').send({
        email: 'usuario@eduprestamo.local',
        password: 'Incorrecta123',
      });
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contrasena incorrectos.',
      });
    }

    const locked = await context.api.post('/api/auth/login').send({
      email: 'usuario@eduprestamo.local',
      password: 'Usuario123!',
    });
    expect(locked.status).toBe(401);
    expect(locked.body.error.code).toBe('INVALID_CREDENTIALS');

    context.db.prepare(`
      UPDATE users SET locked_until = ?, failed_attempts = 3 WHERE email = ?
    `).run('2000-01-01T00:00:00.000Z', 'usuario@eduprestamo.local');

    const recovered = await context.api.post('/api/auth/login').send({
      email: 'usuario@eduprestamo.local',
      password: 'Usuario123!',
    });
    expect(recovered.status).toBe(200);
    const row = context.db.prepare('SELECT failed_attempts, locked_until FROM users WHERE email = ?')
      .get('usuario@eduprestamo.local');
    expect(row).toEqual({ failed_attempts: 0, locked_until: null });
  });

  test('no revela si un correo inexistente esta registrado', async () => {
    const unknown = await context.api.post('/api/auth/login').send({
      email: 'nadie@example.com',
      password: 'Incorrecta123',
    });
    const known = await context.api.post('/api/auth/login').send({
      email: 'usuario@eduprestamo.local',
      password: 'Incorrecta123',
    });
    expect(unknown.status).toBe(401);
    expect(known.status).toBe(401);
    expect(unknown.body).toEqual(known.body);
  });
});

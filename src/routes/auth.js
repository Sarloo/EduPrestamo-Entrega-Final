const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler, AppError } = require('../errors');
const { signAccessToken } = require('../security');
const { createUser, now, publicUser } = require('../users');
const validate = require('../validation');

function authRoutes({
  db,
  jwtSecret,
  jwtExpiresIn,
  maxLoginAttempts,
  lockoutMinutes,
  authenticate,
}) {
  const router = express.Router();
  const invalidCredentials = () => new AppError(
    401,
    'INVALID_CREDENTIALS',
    'Correo o contrasena incorrectos.',
  );

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const name = validate.requiredString(req.body?.name, 'name', { min: 2, max: 100 });
      const email = validate.email(req.body?.email);
      const password = validate.password(req.body?.password);
      const user = createUser(db, { name, email, password, role: 'USER' });
      const accessToken = signAccessToken(user, jwtSecret, jwtExpiresIn);
      res.status(201).json({ data: { user, accessToken, tokenType: 'Bearer' } });
    }),
  );

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const email = validate.email(req.body?.email);
      const password = validate.requiredString(req.body?.password, 'password', {
        min: 1,
        max: 72,
      });
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (!user) {
        await bcrypt.compare(password, '$2b$12$w7mZ6Ky7D4iY5YfKxrXeKuIsMYfXtaHvfAlQ6i/J70mUf7s8SVOXq');
        throw invalidCredentials();
      }
      if (user.locked_until && Date.parse(user.locked_until) > Date.now()) {
        // Keep the public response indistinguishable from any other failed
        // login while still doing the expensive password comparison.
        await bcrypt.compare(password, user.password_hash);
        throw invalidCredentials();
      }
      if (user.locked_until) {
        db.prepare(`
          UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?
        `).run(now(), user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        const failedAttempts = user.failed_attempts + 1;
        const lockedUntil =
          failedAttempts >= maxLoginAttempts
            ? new Date(Date.now() + lockoutMinutes * 60_000).toISOString()
            : null;
        db.prepare(`
          UPDATE users SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?
        `).run(failedAttempts, lockedUntil, now(), user.id);

        throw invalidCredentials();
      }

      db.prepare(`
        UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?
      `).run(now(), user.id);
      const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      const accessToken = signAccessToken(freshUser, jwtSecret, jwtExpiresIn);
      res.json({
        data: { user: publicUser(freshUser), accessToken, tokenType: 'Bearer' },
      });
    }),
  );

  router.get('/me', authenticate, (req, res) => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    res.json({ data: publicUser(row) });
  });

  return router;
}

module.exports = authRoutes;

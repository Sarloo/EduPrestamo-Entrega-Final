const express = require('express');
const { AppError } = require('../errors');
const { now, publicUser } = require('../users');
const validate = require('../validation');

function userRoutes({ db, authenticate, authorize }) {
  const router = express.Router();
  router.use(authenticate, authorize('ADMIN'));

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC, id DESC').all();
    res.json({ data: rows.map(publicUser) });
  });

  router.get('/:id', (req, res) => {
    const userId = validate.id(req.params.id);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!row) throw new AppError(404, 'USER_NOT_FOUND', 'El usuario no existe.');
    res.json({ data: publicUser(row) });
  });

  router.patch('/:id/role', (req, res) => {
    const userId = validate.id(req.params.id);
    const role = validate.role(req.body?.role);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!row) throw new AppError(404, 'USER_NOT_FOUND', 'El usuario no existe.');
    if (userId === req.user.id && role !== 'ADMIN') {
      throw new AppError(409, 'SELF_DEMOTION', 'No puede retirar su propio rol administrador.');
    }
    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, now(), userId);
    res.json({ data: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(userId)) });
  });

  router.patch('/:id/unlock', (req, res) => {
    const userId = validate.id(req.params.id);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!row) throw new AppError(404, 'USER_NOT_FOUND', 'El usuario no existe.');
    db.prepare(`
      UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?
    `).run(now(), userId);
    res.json({
      message: 'Cuenta desbloqueada.',
      data: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(userId)),
    });
  });

  return router;
}

module.exports = userRoutes;

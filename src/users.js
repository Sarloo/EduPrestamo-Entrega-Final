const bcrypt = require('bcryptjs');
const { AppError } = require('./errors');

function now() {
  return new Date().toISOString();
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createUser(db, { name, email, password, role = 'USER' }) {
  const timestamp = now();
  const passwordHash = bcrypt.hashSync(password, 12);
  try {
    const result = db
      .prepare(`
        INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(name, email, passwordHash, role, timestamp, timestamp);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    return publicUser(row);
  } catch (error) {
    if (error.errcode === 2067) {
      throw new AppError(409, 'EMAIL_IN_USE', 'El correo ya esta registrado.');
    }
    throw error;
  }
}

module.exports = { createUser, now, publicUser };

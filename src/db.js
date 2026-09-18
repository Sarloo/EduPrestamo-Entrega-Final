const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function ensureDatabaseDirectory(filename) {
  if (filename === ':memory:' || filename.startsWith('file:')) return;
  fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
}

function initializeSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
      failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
      locked_until TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL COLLATE NOCASE UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      condition TEXT NOT NULL DEFAULT 'GOOD' CHECK (condition IN ('GOOD', 'FAIR', 'DAMAGED')),
      quantity_total INTEGER NOT NULL CHECK (quantity_total >= 0),
      quantity_available INTEGER NOT NULL CHECK (
        quantity_available >= 0 AND quantity_available <= quantity_total
      ),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      resource_id INTEGER NOT NULL REFERENCES resources(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'RETURNED', 'CANCELLED')
      ),
      requested_at TEXT NOT NULL,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TEXT,
      rejection_reason TEXT,
      due_date TEXT,
      delivered_at TEXT,
      returned_at TEXT,
      notes TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(active);
    CREATE INDEX IF NOT EXISTS idx_resources_code ON resources(code);
    CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
    CREATE INDEX IF NOT EXISTS idx_loans_resource ON loans(resource_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
  `);
}

function createDatabase(filename = ':memory:') {
  ensureDatabaseDirectory(filename);
  const db = new DatabaseSync(filename);
  initializeSchema(db);
  return db;
}

function transaction(db, operation) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = {
  createDatabase,
  initializeSchema,
  transaction,
};

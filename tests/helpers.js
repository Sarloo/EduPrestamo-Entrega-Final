const request = require('supertest');
const { createApp } = require('../src/app');
const { createDatabase } = require('../src/db');
const { seedDemoData } = require('../src/seed');

const TEST_SECRET = 'test-secret-with-more-than-thirty-two-characters';

function createTestContext(options = {}) {
  const db = createDatabase(':memory:');
  seedDemoData(db);
  const app = createApp({
    db,
    config: {
      jwtSecret: TEST_SECRET,
      jwtExpiresIn: options.jwtExpiresIn ?? '1h',
      maxLoginAttempts: options.maxLoginAttempts ?? 3,
      lockoutMinutes: options.lockoutMinutes ?? 15,
      corsOrigin: options.corsOrigin ?? 'same-origin',
      port: 0,
    },
  });
  return { app, db, api: request(app) };
}

async function login(api, email, password) {
  const response = await api.post('/api/auth/login').send({ email, password });
  if (response.status !== 200) {
    throw new Error(`No fue posible iniciar sesion: ${response.status} ${response.text}`);
  }
  return {
    token: response.body.data.accessToken,
    user: response.body.data.user,
    authorization: `Bearer ${response.body.data.accessToken}`,
  };
}

async function demoSessions(api) {
  const [admin, user] = await Promise.all([
    login(api, 'admin@eduprestamo.local', 'Admin123!'),
    login(api, 'usuario@eduprestamo.local', 'Usuario123!'),
  ]);
  return { admin, user };
}

module.exports = { TEST_SECRET, createTestContext, demoSessions, login };

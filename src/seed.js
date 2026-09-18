const bcrypt = require('bcryptjs');
const { getConfig } = require('./config');
const { createDatabase, transaction } = require('./db');
const { now } = require('./users');
const validate = require('./validation');

const DEMO_USERS = [
  {
    name: 'Administrador EduPrestamo',
    email: 'admin@eduprestamo.local',
    password: 'Admin123!',
    role: 'ADMIN',
  },
  {
    name: 'Usuario Demostracion',
    email: 'usuario@eduprestamo.local',
    password: 'Usuario123!',
    role: 'USER',
  },
];

const DEMO_RESOURCES = [
  {
    code: 'LAP-001',
    name: 'Laptop Dell Latitude',
    description: 'Equipo portatil para actividades academicas.',
    category: 'Computo',
    condition: 'GOOD',
    quantity: 8,
  },
  {
    code: 'PROY-001',
    name: 'Proyector Epson',
    description: 'Proyector multimedia con entrada HDMI.',
    category: 'Audiovisual',
    condition: 'GOOD',
    quantity: 4,
  },
  {
    code: 'KIT-ROB-001',
    name: 'Kit de robotica',
    description: 'Kit educativo con sensores y microcontrolador.',
    category: 'Laboratorio',
    condition: 'FAIR',
    quantity: 6,
  },
];

function upsertUser(db, user) {
  const timestamp = now();
  const passwordHash = bcrypt.hashSync(user.password, 12);
  db.prepare(`
    INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      password_hash = excluded.password_hash,
      role = excluded.role,
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = excluded.updated_at
  `).run(user.name, user.email, passwordHash, user.role, timestamp, timestamp);
}

function seedDemoData(db) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Los datos demo no se pueden cargar en produccion.');
  }
  transaction(db, () => {
    for (const user of DEMO_USERS) upsertUser(db, user);
    for (const resource of DEMO_RESOURCES) {
      const timestamp = now();
      db.prepare(`
        INSERT INTO resources (
          code, name, description, category, condition, quantity_total,
          quantity_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          category = excluded.category,
          condition = excluded.condition,
          updated_at = excluded.updated_at
      `).run(
        resource.code,
        resource.name,
        resource.description,
        resource.category,
        resource.condition,
        resource.quantity,
        resource.quantity,
        timestamp,
        timestamp,
      );
    }
  });
}

function seedAdminFromEnvironment(db) {
  const name = validate.requiredString(process.env.ADMIN_NAME, 'ADMIN_NAME', {
    min: 2,
    max: 100,
  });
  const email = validate.email(process.env.ADMIN_EMAIL);
  const password = validate.password(process.env.ADMIN_PASSWORD);
  upsertUser(db, { name, email, password, role: 'ADMIN' });
}

if (require.main === module) {
  const mode = process.argv[2];
  const config = getConfig();
  const db = createDatabase(config.databasePath);
  try {
    if (mode === 'demo') {
      seedDemoData(db);
      process.stdout.write('Datos de demostracion creados.\n');
    } else if (mode === 'admin') {
      seedAdminFromEnvironment(db);
      process.stdout.write('Usuario administrador creado.\n');
    } else {
      throw new Error('Use `npm run seed:demo` o `npm run seed:admin`.');
    }
  } finally {
    db.close();
  }
}

module.exports = {
  DEMO_RESOURCES,
  DEMO_USERS,
  seedAdminFromEnvironment,
  seedDemoData,
  upsertUser,
};

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getConfig } = require('./config');
const { createDatabase } = require('./db');
const { createAuthentication } = require('./security');
const { errorHandler, notFound } = require('./middleware');
const authRoutes = require('./routes/auth');
const { resourceRoutes } = require('./routes/resources');
const { loanRoutes } = require('./routes/loans');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const { materialRequestRoutes } = require('./routes/material-requests');

function corsOriginOption(value) {
  const configured = value || 'same-origin';
  const allowed = configured === '*' || configured === 'same-origin'
    ? []
    : configured.split(',').map((origin) => origin.trim()).filter(Boolean);
  return (origin, callback) => {
    if (configured === '*') return callback(null, true);
    if (!origin || configured === 'same-origin') return callback(null, false);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS.'));
  };
}

function createApp(options = {}) {
  const config = getConfig(options.config);
  const db = options.db ?? createDatabase(config.databasePath);
  const app = express();
  const publicDirectory = path.join(__dirname, 'public');
  const authentication = createAuthentication({ db, jwtSecret: config.jwtSecret });
  const dependencies = { db, ...config, ...authentication };

  app.locals.db = db;
  app.locals.config = config;
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet({
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    // TLS is not terminated by this Node process in the EC2 classroom deployment.
    // Enabling HSTS or CSP upgrades over plain HTTP makes browsers request static
    // assets through unavailable HTTPS and leaves the interface without styles.
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        upgradeInsecureRequests: null,
      },
    },
  }));
  app.use((_req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    );
    next();
  });
  app.use(cors({ origin: corsOriginOption(config.corsOrigin), credentials: false }));
  app.use(express.json({ limit: '32kb', strict: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'eduprestamo-api', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes(dependencies));
  app.use('/api/resources', resourceRoutes(dependencies));
  app.use('/api/loans', loanRoutes(dependencies));
  app.use('/api/users', userRoutes(dependencies));
  app.use('/api/reports', reportRoutes(dependencies));
  app.use('/api/material-requests', materialRequestRoutes(dependencies));

  app.use(express.static(publicDirectory, {
    etag: true,
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    setHeaders: (res, filePath) => {
      if (path.basename(filePath) === 'index.html') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(publicDirectory, 'index.html'));
    }
    return next();
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { corsOriginOption, createApp };

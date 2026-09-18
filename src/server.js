const { createApp } = require('./app');

const app = createApp();
const { port } = app.locals.config;
const server = app.listen(port, () => {
  process.stdout.write(`EduPrestamo disponible en http://localhost:${port}\n`);
});

function shutdown(signal) {
  process.stdout.write(`Cerrando EduPrestamo por ${signal}.\n`);
  server.close(() => {
    app.locals.db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;

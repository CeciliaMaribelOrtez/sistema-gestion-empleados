// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'test') {
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.test' }));
} else {
  import('dotenv').then(dotenv => dotenv.config());
}

import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('💥 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  logger.error('💥 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
  logger.info('👨‍💼 Sistema de Gestión de Empleados');
  logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 URL: http://localhost:${PORT}`);
  logger.info(`📘 API Docs: http://localhost:${PORT}/info`);
  logger.info(`❤️  Healthcheck: http://localhost:${PORT}/health`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
  case 'EACCES':
    logger.error(`${bind} requiere privilegios elevados`);
    process.exit(1);
    break;
  case 'EADDRINUSE':
    logger.error(`${bind} ya está en uso`);
    process.exit(1);
    break;
  default:
    throw error;
  }
});

export default server;

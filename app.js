// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'test') {
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.test' }));
} else {
  import('dotenv').then(dotenv => dotenv.config());
}

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import logger from './utils/logger.js';

// Rutas del sistema de gestión de empleados
import authRoutes from './routes/auth.js';
import empleadoRoutes from './routes/empleados.js';
import departamentoRoutes from './routes/departamentos.js';

// Middleware personalizado
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tu-dominio.com']
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.'
  }
});
app.use('/api/', limiter);

// Compresión y parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Endpoints de salud e información
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión de Empleados',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'Sistema de Gestión de Empleados',
    description: 'API para gestionar empleados, departamentos y usuarios.',
    version: '1.0.0',
    author: 'Tu Nombre',
    endpoints: {
      auth: '/api/auth',
      empleados: '/api/empleados',
      departamentos: '/api/departamentos'
    }
  });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/departamentos', departamentoRoutes);

// 404 Not Found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Manejo de errores global
app.use(errorHandler);

export default app;

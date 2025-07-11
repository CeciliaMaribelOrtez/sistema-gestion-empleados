import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Limpiar todas las tablas antes de los tests
async function cleanDatabase() {
  try {
    await prisma.permiso.deleteMany?.();
    await prisma.empleado.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.departamento.deleteMany();
    await prisma.rol.deleteMany();
  } catch (error) {
    logger.error('❌ Error limpiando base de datos:', error);
  }
}

// Insertar datos de prueba
async function seedTestData() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Crear roles
    const rolAdmin = await prisma.rol.upsert({
      where: { nombre: 'admin' },
      update: {},
      create: { nombre: 'admin', descripcion: 'Administrador del sistema' }
    });

    const rolEmpleado = await prisma.rol.upsert({
      where: { nombre: 'empleado' },
      update: {},
      create: { nombre: 'empleado', descripcion: 'Empleado general' }
    });

    // Crear departamento
    const departamento = await prisma.departamento.upsert({
      where: { nombre: 'Recursos Humanos' },
      update: {},
      create: { nombre: 'Recursos Humanos', descripcion: 'Gestiona al personal' }
    });

    // Crear usuario administrador
    const usuarioAdmin = await prisma.usuario.upsert({
      where: { email: 'admin@sge.com' },
      update: {},
      create: {
        nombre: 'Admin',
        email: 'admin@sge.com',
        password: hashedPassword,
        rol_id: rolAdmin.id
      }
    });

    // Crear empleado asociado al admin
    await prisma.empleado.create({
      data: {
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan.perez@sge.com',
        telefono: '555-1234',
        departamento_id: departamento.id,
        usuario_id: usuarioAdmin.id
      }
    });

    // ✅ Crear usuario con rolEmpleado
    const usuarioEmpleado = await prisma.usuario.upsert({
      where: { email: 'empleado@sge.com' },
      update: {},
      create: {
        nombre: 'Empleado Base',
        email: 'empleado@sge.com',
        password: hashedPassword,
        rol_id: rolEmpleado.id
      }
    });

    // ✅ Crear empleado asociado al usuarioEmpleado
    await prisma.empleado.create({
      data: {
        nombres: 'Laura',
        apellidos: 'Gómez',
        correo: 'laura.gomez@sge.com',
        telefono: '555-5678',
        departamento_id: departamento.id,
        usuario_id: usuarioEmpleado.id
      }
    });

    logger.log('✅ Datos de prueba creados');
  } catch (error) {
    logger.error('❌ Error creando datos de prueba:', error);
  }
}

// Generador de datos únicos
function generateUniqueData() {
  const uniqueId = Date.now().toString().slice(-6) + Math.floor(Math.random() * 10000);
  return {
    empleado: {
      nombres: `Empleado${uniqueId}`,
      apellidos: `Prueba${uniqueId}`,
      correo: `empleado${uniqueId}@sge.com`,
      telefono: `555${uniqueId}`
    },
    usuario: {
      nombre: `Usuario${uniqueId}`,
      email: `usuario${uniqueId}@sge.com`,
      password: 'test123'
    },
    departamento: {
      nombre: `Depto${uniqueId}`,
      descripcion: 'Departamento de prueba'
    }
  };
}

// Token helper
async function getAuthToken(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

// Variables globales para los tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretosge2024';
process.env.JWT_EXPIRES_IN = '24h';

global.prisma = prisma;
global.cleanDatabase = cleanDatabase;
global.seedTestData = seedTestData;
global.getAuthToken = getAuthToken;

export {
  prisma,
  cleanDatabase,
  seedTestData,
  generateUniqueData,
  getAuthToken
};

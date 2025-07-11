import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear roles
  const roles = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'admin' },
      update: {},
      create: { nombre: 'admin', descripcion: 'Administrador del sistema' }
    }),
    prisma.rol.upsert({
      where: { nombre: 'empleado' },
      update: {},
      create: { nombre: 'empleado', descripcion: 'Empleado general' }
    })
  ]);
  console.log(`✅ Roles creados: ${roles.length}`);

  // Crear departamentos
  const departamentos = await Promise.all([
    prisma.departamento.upsert({
      where: { nombre: 'Recursos Humanos' },
      update: {},
      create: { nombre: 'Recursos Humanos', descripcion: 'Gestiona al personal' }
    }),
    prisma.departamento.upsert({
      where: { nombre: 'TI' },
      update: {},
      create: { nombre: 'TI', descripcion: 'Tecnologías de la información' }
    })
  ]);
  console.log(`✅ Departamentos creados: ${departamentos.length}`);

  // Crear usuarios y empleados
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@sge.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@sge.com',
      password: hashedPassword,
      rol: { connect: { nombre: 'admin' } }
    }
  });

  const usuarioEmpleado = await prisma.usuario.upsert({
    where: { email: 'empleado1@sge.com' },
    update: {},
    create: {
      nombre: 'Empleado Uno',
      email: 'empleado1@sge.com',
      password: await bcrypt.hash('empleado123', 10),
      rol: { connect: { nombre: 'empleado' } }
    }
  });

  const empleado = await prisma.empleado.upsert({
    where: { correo: 'empleado1@sge.com' },
    update: {},
    create: {
      nombres: 'Carlos',
      apellidos: 'Pérez',
      correo: 'empleado1@sge.com',
      telefono: '8888-8888',
      usuario: { connect: { id: usuarioEmpleado.id } },
      departamento: { connect: { nombre: 'TI' } }
    }
  });

  console.log('✅ Usuarios y empleado creados');

  // Crear permisos
  const permisos = await Promise.all([
    prisma.permiso.create({
      data: {
        fecha: new Date(),
        motivo: 'Consulta médica',
        empleado: { connect: { id: empleado.id } }
      }
    }),
    prisma.permiso.create({
      data: {
        fecha: new Date(),
        motivo: 'Trámite personal',
        empleado: { connect: { id: empleado.id } }
      }
    })
  ]);

  console.log(`✅ Permisos creados: ${permisos.length}`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Acceso de prueba:');
  console.log('👤 Admin: admin@sge.com / admin123');
  console.log('👤 Empleado: empleado1@sge.com / empleado123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

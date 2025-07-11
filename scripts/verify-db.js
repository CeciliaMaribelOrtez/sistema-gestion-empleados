import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando base de datos...\n');

    // Contar registros por entidad
    const rolesCount = await prisma.rol.count();
    const usuariosCount = await prisma.usuario.count();
    const empleadosCount = await prisma.empleado.count();
    const departamentosCount = await prisma.departamento.count();
    const permisosCount = await prisma.permiso.count();

    console.log('📊 Estadísticas de la base de datos:');
    console.log(`- Roles: ${rolesCount}`);
    console.log(`- Usuarios: ${usuariosCount}`);
    console.log(`- Empleados: ${empleadosCount}`);
    console.log(`- Departamentos: ${departamentosCount}`);
    console.log(`- Permisos: ${permisosCount}`);

    // Verificar usuario admin
    const admin = await prisma.usuario.findFirst({
      where: {
        rol: {
          nombre: 'admin'
        }
      },
      include: {
        rol: true
      }
    });

    if (admin) {
      console.log('\n✅ Admin encontrado:');
      console.log(`   - Nombre: ${admin.nombre}`);
      console.log(`   - Email: ${admin.email}`);
    } else {
      console.warn('\n⚠️ No se encontró un usuario con rol "admin".');
    }

    // Mostrar departamentos
    const departamentos = await prisma.departamento.findMany();
    console.log('\n🏢 Departamentos existentes:');
    departamentos.forEach(dep => {
      console.log(`- ${dep.nombre}`);
    });

    console.log('\n✅ Verificación completada exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();

import { db } from '../server/db.js';
import { projects, applications, environments } from '../shared/schema.js';

async function seedSampleProjects() {
  try {
    console.log('🌱 Iniciando carga de datos de ejemplo...');

    // Crear proyectos de ejemplo
    const [ecommerceProject] = await db
      .insert(projects)
      .values({
        name: 'E-commerce Principal',
        description: 'Plataforma principal de comercio electrónico de la empresa'
      })
      .returning();

    const [crmProject] = await db
      .insert(projects)
      .values({
        name: 'Sistema CRM',
        description: 'Sistema de gestión de relaciones con clientes'
      })
      .returning();

    const [blogProject] = await db
      .insert(projects)
      .values({
        name: 'Blog Corporativo',
        description: 'Blog y sitio web institucional de la empresa'
      })
      .returning();

    console.log('✅ Proyectos creados:', { ecommerceProject, crmProject, blogProject });

    // Crear aplicaciones para E-commerce
    const [frontendEcommerce] = await db
      .insert(applications)
      .values({
        projectId: ecommerceProject.id,
        name: 'Frontend Web',
        description: 'Aplicación frontend principal del e-commerce'
      })
      .returning();

    const [apiEcommerce] = await db
      .insert(applications)
      .values({
        projectId: ecommerceProject.id,
        name: 'API Backend',
        description: 'API REST del e-commerce en Ruby on Rails'
      })
      .returning();

    const [adminEcommerce] = await db
      .insert(applications)
      .values({
        projectId: ecommerceProject.id,
        name: 'Panel Admin',
        description: 'Panel administrativo del e-commerce'
      })
      .returning();

    // Crear aplicaciones para CRM
    const [crmApp] = await db
      .insert(applications)
      .values({
        projectId: crmProject.id,
        name: 'CRM Web App',
        description: 'Aplicación web principal del CRM'
      })
      .returning();

    // Crear aplicaciones para Blog
    const [blogApp] = await db
      .insert(applications)
      .values({
        projectId: blogProject.id,
        name: 'Blog WordPress',
        description: 'Sitio web WordPress corporativo'
      })
      .returning();

    console.log('✅ Aplicaciones creadas');

    // Crear entornos para Frontend E-commerce
    await db.insert(environments).values([
      {
        applicationId: frontendEcommerce.id,
        name: 'dev',
        displayName: 'Desarrollo',
        url: 'https://dev-ecommerce.ejemplo.com',
        description: 'Entorno de desarrollo para pruebas internas',
        isActive: true
      },
      {
        applicationId: frontendEcommerce.id,
        name: 'staging',
        displayName: 'Staging',
        url: 'https://staging-ecommerce.ejemplo.com',
        description: 'Entorno de pruebas para validación pre-producción',
        isActive: true
      },
      {
        applicationId: frontendEcommerce.id,
        name: 'prod',
        displayName: 'Producción',
        url: 'https://tienda.ejemplo.com',
        description: 'Entorno de producción para clientes finales',
        isActive: true
      }
    ]);

    // Crear entornos para API E-commerce
    await db.insert(environments).values([
      {
        applicationId: apiEcommerce.id,
        name: 'dev',
        displayName: 'Desarrollo',
        url: 'https://api-dev.ejemplo.com',
        description: 'API de desarrollo con datos de prueba',
        isActive: true
      },
      {
        applicationId: apiEcommerce.id,
        name: 'staging',
        displayName: 'Staging',
        url: 'https://api-staging.ejemplo.com',
        description: 'API de staging con datos similares a producción',
        isActive: true
      },
      {
        applicationId: apiEcommerce.id,
        name: 'prod',
        displayName: 'Producción',
        url: 'https://api.ejemplo.com',
        description: 'API de producción en vivo',
        isActive: true
      }
    ]);

    // Crear entornos para Admin E-commerce
    await db.insert(environments).values([
      {
        applicationId: adminEcommerce.id,
        name: 'staging',
        displayName: 'Staging',
        url: 'https://admin-staging.ejemplo.com',
        description: 'Panel administrativo de pruebas',
        isActive: true
      },
      {
        applicationId: adminEcommerce.id,
        name: 'prod',
        displayName: 'Producción',
        url: 'https://admin.ejemplo.com',
        description: 'Panel administrativo de producción',
        isActive: true
      }
    ]);

    // Crear entornos para CRM
    await db.insert(environments).values([
      {
        applicationId: crmApp.id,
        name: 'staging',
        displayName: 'Staging',
        url: 'https://crm-staging.ejemplo.com',
        description: 'CRM de pruebas para capacitación',
        isActive: true
      },
      {
        applicationId: crmApp.id,
        name: 'prod',
        displayName: 'Producción',
        url: 'https://crm.ejemplo.com',
        description: 'CRM de producción para el equipo de ventas',
        isActive: true
      }
    ]);

    // Crear entornos para Blog
    await db.insert(environments).values([
      {
        applicationId: blogApp.id,
        name: 'staging',
        displayName: 'Staging',
        url: 'https://blog-staging.ejemplo.com',
        description: 'Blog de pruebas para revisión de contenido',
        isActive: true
      },
      {
        applicationId: blogApp.id,
        name: 'prod',
        displayName: 'Producción',
        url: 'https://blog.ejemplo.com',
        description: 'Blog público corporativo',
        isActive: true
      }
    ]);

    console.log('✅ Entornos creados');
    console.log('🎉 Datos de ejemplo cargados exitosamente');
    
    // Mostrar resumen
    const projectsCount = await db.select().from(projects);
    const applicationsCount = await db.select().from(applications);
    const environmentsCount = await db.select().from(environments);
    
    console.log('📊 Resumen:');
    console.log(`   - ${projectsCount.length} proyectos`);
    console.log(`   - ${applicationsCount.length} aplicaciones`);
    console.log(`   - ${environmentsCount.length} entornos`);

  } catch (error) {
    console.error('❌ Error cargando datos de ejemplo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedSampleProjects };
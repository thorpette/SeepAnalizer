#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import using require for compatibility
const { db } = require('../server/db.ts');
const { projects, applications, environments, userStories, storyAnalyses } = require('../shared/schema.ts');

async function seedSpringStoriesData() {
  console.log('🌱 Sembrando datos de aplicaciones Spring y historias de usuario...');

  try {
    // Crear proyecto Spring
    const [springProject] = await db.insert(projects).values({
      name: 'Sistema de Gestión Empresarial',
      description: 'Plataforma Spring Boot para gestión integral de recursos empresariales'
    }).returning();

    console.log(`✅ Proyecto creado: ${springProject.name}`);

    // Crear aplicaciones Spring
    const springApplications = [
      {
        projectId: springProject.id,
        name: 'Core API',
        description: 'API principal con Spring Boot y microservicios',
        technology: 'spring',
        springProfile: 'default',
        springConfigServer: 'http://config-server:8888',
        isSpringBoot: true
      },
      {
        projectId: springProject.id,
        name: 'Authentication Service',
        description: 'Servicio de autenticación con Spring Security',
        technology: 'spring',
        springProfile: 'security',
        springConfigServer: 'http://config-server:8888',
        isSpringBoot: true
      },
      {
        projectId: springProject.id,
        name: 'User Management',
        description: 'Gestión de usuarios con Spring Data JPA',
        technology: 'spring',
        springProfile: 'data-jpa',
        springConfigServer: 'http://config-server:8888',
        isSpringBoot: true
      }
    ];

    const createdApps = [];
    for (const app of springApplications) {
      const [createdApp] = await db.insert(applications).values(app).returning();
      createdApps.push(createdApp);
      console.log(`✅ Aplicación Spring creada: ${createdApp.name}`);
    }

    // Crear entornos para cada aplicación
    const environmentTemplates = [
      { name: 'dev', displayName: 'Desarrollo', urlSuffix: '-dev.empresa.local' },
      { name: 'test', displayName: 'Testing', urlSuffix: '-test.empresa.local' },
      { name: 'staging', displayName: 'Staging', urlSuffix: '-staging.empresa.local' },
      { name: 'prod', displayName: 'Producción', urlSuffix: '.empresa.com' }
    ];

    const createdEnvironments = [];
    for (const app of createdApps) {
      for (const envTemplate of environmentTemplates) {
        const baseUrl = app.name.toLowerCase().replace(/\s+/g, '-');
        const [env] = await db.insert(environments).values({
          applicationId: app.id,
          name: envTemplate.name,
          displayName: envTemplate.displayName,
          url: `https://${baseUrl}${envTemplate.urlSuffix}`,
          description: `Entorno de ${envTemplate.displayName} para ${app.name}`,
          isActive: envTemplate.name !== 'test' // Test environments inactive by default
        }).returning();
        createdEnvironments.push(env);
      }
    }

    console.log(`✅ ${createdEnvironments.length} entornos creados`);

    // Crear historias de usuario
    const userStoriesData = [
      // Core API Stories
      {
        applicationId: createdApps[0].id,
        title: 'Como usuario, quiero autenticarme en el sistema',
        description: 'El usuario debe poder iniciar sesión con credenciales válidas y obtener un token de acceso',
        acceptanceCriteria: 'Given: Usuario con credenciales válidas\nWhen: Envía POST /api/auth/login\nThen: Recibe token JWT válido',
        priority: 'high',
        status: 'done',
        storyPoints: 5,
        testUrl: '/api/auth/login',
        isActive: true
      },
      {
        applicationId: createdApps[0].id,
        title: 'Como admin, quiero gestionar usuarios del sistema',
        description: 'Los administradores deben poder crear, editar y eliminar usuarios',
        acceptanceCriteria: 'Given: Usuario con rol admin\nWhen: Accede a /api/users\nThen: Puede realizar CRUD de usuarios',
        priority: 'high',
        status: 'testing',
        storyPoints: 8,
        testUrl: '/api/users',
        isActive: true
      },
      {
        applicationId: createdApps[0].id,
        title: 'Como usuario, quiero consultar mi perfil',
        description: 'Los usuarios autenticados pueden ver y actualizar su información personal',
        acceptanceCriteria: 'Given: Usuario autenticado\nWhen: Accede a /api/profile\nThen: Ve sus datos personales',
        priority: 'medium',
        status: 'in-progress',
        storyPoints: 3,
        testUrl: '/api/profile',
        isActive: true
      },
      // Authentication Service Stories
      {
        applicationId: createdApps[1].id,
        title: 'Como sistema, quiero validar tokens JWT',
        description: 'El servicio debe validar la autenticidad y vigencia de tokens JWT',
        acceptanceCriteria: 'Given: Token JWT\nWhen: Se valida en /api/auth/validate\nThen: Retorna estado de validez',
        priority: 'critical',
        status: 'done',
        storyPoints: 5,
        testUrl: '/api/auth/validate',
        isActive: true
      },
      {
        applicationId: createdApps[1].id,
        title: 'Como usuario, quiero recuperar mi contraseña',
        description: 'Los usuarios pueden solicitar restablecimiento de contraseña por email',
        acceptanceCriteria: 'Given: Email válido\nWhen: Solicita reset en /api/auth/reset\nThen: Recibe email con enlace',
        priority: 'medium',
        status: 'testing',
        storyPoints: 8,
        testUrl: '/api/auth/reset',
        isActive: true
      },
      // User Management Stories
      {
        applicationId: createdApps[2].id,
        title: 'Como admin, quiero importar usuarios masivamente',
        description: 'Importación de usuarios desde archivo CSV con validación de datos',
        acceptanceCriteria: 'Given: Archivo CSV válido\nWhen: Se sube a /api/users/import\nThen: Usuarios son creados correctamente',
        priority: 'low',
        status: 'pending',
        storyPoints: 13,
        testUrl: '/api/users/import',
        isActive: true
      },
      {
        applicationId: createdApps[2].id,
        title: 'Como usuario, quiero buscar otros usuarios',
        description: 'Funcionalidad de búsqueda de usuarios con filtros',
        acceptanceCriteria: 'Given: Criterios de búsqueda\nWhen: Busca en /api/users/search\nThen: Obtiene resultados paginados',
        priority: 'medium',
        status: 'in-progress',
        storyPoints: 5,
        testUrl: '/api/users/search',
        isActive: true
      }
    ];

    const createdStories = [];
    for (const storyData of userStoriesData) {
      const [story] = await db.insert(userStories).values(storyData).returning();
      createdStories.push(story);
      console.log(`✅ Historia creada: ${story.title}`);
    }

    // Crear análisis de historias para entornos específicos
    const storyAnalysesData = [];
    
    for (const story of createdStories) {
      // Obtener entornos de la aplicación de esta historia
      const storyEnvironments = createdEnvironments.filter(env => {
        const app = createdApps.find(a => a.id === story.applicationId);
        return app && env.applicationId === app.id;
      });

      for (const env of storyEnvironments) {
        // Solo crear análisis para historias en estado testing o done
        if (story.status === 'testing' || story.status === 'done') {
          const performanceBaseline = env.name === 'prod' ? 90 : env.name === 'staging' ? 85 : 80;
          const performanceActual = performanceBaseline + (Math.random() * 20 - 10); // ±10 variación
          
          storyAnalysesData.push({
            userStoryId: story.id,
            environmentId: env.id,
            testStatus: story.status === 'done' ? 'passed' : 'running',
            testDuration: (Math.random() * 30 + 10).toFixed(2), // 10-40 segundos
            functionalTestPassed: story.status === 'done',
            performanceBaseline: Math.floor(performanceBaseline),
            performanceActual: Math.floor(performanceActual),
            performanceDelta: Math.floor(performanceActual - performanceBaseline),
            criticalIssues: performanceActual < performanceBaseline - 5 ? [
              { type: 'performance', message: 'Tiempo de respuesta por encima del baseline', severity: 'medium' }
            ] : [],
            recommendations: [
              { type: 'spring', message: 'Considerar habilitar cache de Spring', priority: 'medium' },
              { type: 'jvm', message: 'Optimizar configuración de JVM heap', priority: 'low' }
            ],
            testNotes: `Prueba automatizada en entorno ${env.displayName}`,
            testerName: 'Sistema Automatizado'
          });
        }
      }
    }

    // Insertar análisis de historias
    if (storyAnalysesData.length > 0) {
      await db.insert(storyAnalyses).values(storyAnalysesData);
      console.log(`✅ ${storyAnalysesData.length} análisis de historias creados`);
    }

    console.log('\n🎉 Datos de aplicaciones Spring y historias de usuario sembrados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - 1 proyecto Spring`);
    console.log(`   - ${createdApps.length} aplicaciones Spring Boot`);
    console.log(`   - ${createdEnvironments.length} entornos`);
    console.log(`   - ${createdStories.length} historias de usuario`);
    console.log(`   - ${storyAnalysesData.length} análisis de rendimiento`);

  } catch (error) {
    console.error('❌ Error sembrando datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSpringStoriesData().then(() => process.exit(0));
}

export { seedSpringStoriesData };
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.ts';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seed() {
  console.log('🌱 Seeding complete gamification system...');

  try {
    // Insert Learning Paths
    console.log('📚 Creating learning paths...');
    const learningPathsData = [
      {
        title: 'Optimización de Rendimiento Web',
        description: 'Aprende técnicas avanzadas para mejorar la velocidad y rendimiento de aplicaciones web Spring Boot',
        category: 'performance',
        difficulty: 'intermediate',
        estimatedTime: 240,
        totalLevels: 12,
        pointsReward: 500,
        prerequisites: [],
        skills: ['Core Web Vitals', 'Optimización de imágenes', 'Lazy loading', 'Compresión', 'CDN'],
        icon: 'zap'
      },
      {
        title: 'Accesibilidad Web WCAG',
        description: 'Domina los principios de accesibilidad web y cumplimiento WCAG para crear aplicaciones inclusivas',
        category: 'accessibility',
        difficulty: 'beginner',
        estimatedTime: 180,
        totalLevels: 10,
        pointsReward: 400,
        prerequisites: [],
        skills: ['WCAG 2.1', 'ARIA', 'Navegación por teclado', 'Contraste de colores', 'Lectores de pantalla'],
        icon: 'eye'
      },
      {
        title: 'Seguridad en Aplicaciones Web',
        description: 'Implementa medidas de seguridad robustas en aplicaciones Spring Boot',
        category: 'security',
        difficulty: 'advanced',
        estimatedTime: 300,
        totalLevels: 15,
        pointsReward: 600,
        prerequisites: ['Optimización de Rendimiento Web'],
        skills: ['HTTPS', 'CSP', 'OWASP', 'Autenticación', 'Autorización'],
        icon: 'shield'
      },
      {
        title: 'SEO Técnico Avanzado',
        description: 'Optimiza el SEO técnico de aplicaciones web para mejorar la visibilidad en buscadores',
        category: 'seo',
        difficulty: 'intermediate',
        estimatedTime: 200,
        totalLevels: 8,
        pointsReward: 350,
        prerequisites: ['Accesibilidad Web WCAG'],
        skills: ['Meta tags', 'Schema markup', 'Core Web Vitals', 'Indexación', 'Sitemap'],
        icon: 'search'
      },
      {
        title: 'Arquitectura Escalable',
        description: 'Diseña y implementa arquitecturas escalables para aplicaciones Spring Boot empresariales',
        category: 'architecture',
        difficulty: 'expert',
        estimatedTime: 420,
        totalLevels: 20,
        pointsReward: 800,
        prerequisites: ['Optimización de Rendimiento Web', 'Seguridad en Aplicaciones Web'],
        skills: ['Microservicios', 'Cache distribuido', 'Load balancing', 'Monitoring', 'DevOps'],
        icon: 'layers'
      }
    ];

    const insertedPaths = await db.insert(schema.learningPaths).values(learningPathsData).returning();
    console.log(`✅ Created ${insertedPaths.length} learning paths`);

    // Insert Learning Levels for each path
    console.log('📖 Creating learning levels...');
    const levelData = [];
    
    // Performance Path Levels
    const performanceLevels = [
      { pathId: insertedPaths[0].id, levelNumber: 1, title: 'Fundamentos de Performance', description: 'Conceptos básicos de rendimiento web', content: 'Introducción a Core Web Vitals y métricas clave', pointsReward: 50, isUnlocked: true },
      { pathId: insertedPaths[0].id, levelNumber: 2, title: 'Optimización de Imágenes', description: 'Técnicas para optimizar imágenes web', content: 'WebP, lazy loading, responsive images', pointsReward: 60, isUnlocked: false }
    ];

    // Accessibility Path Levels  
    const accessibilityLevels = [
      { pathId: insertedPaths[1].id, levelNumber: 1, title: 'Introducción a WCAG', description: 'Principios básicos de accesibilidad', content: 'Los 4 principios WCAG: Perceptible, Operable, Comprensible, Robusto', pointsReward: 40, isUnlocked: true },
      { pathId: insertedPaths[1].id, levelNumber: 2, title: 'Contraste y Color', description: 'Optimización del contraste de colores', content: 'Ratios de contraste WCAG AA y AAA', pointsReward: 45, isUnlocked: false }
    ];

    levelData.push(...performanceLevels, ...accessibilityLevels);
    await db.insert(schema.learningLevels).values(levelData);
    console.log(`✅ Created ${levelData.length} learning levels`);

    // Insert Achievements
    console.log('🏆 Creating achievements...');
    const achievementsData = [
      {
        title: 'Primer Análisis',
        description: 'Completa tu primer análisis de rendimiento',
        icon: 'play-circle',
        type: 'milestone',
        category: 'general',
        pointsReward: 100,
        badgeLevel: 'bronze',
        requirements: { analysisCount: 1 }
      },
      {
        title: 'Experto en Accesibilidad',
        description: 'Completa 10 auditorías de accesibilidad WCAG',
        icon: 'eye',
        type: 'milestone',
        category: 'accessibility',
        pointsReward: 250,
        badgeLevel: 'gold',
        requirements: { accessibilityAudits: 10 }
      },
      {
        title: 'Puntuación Perfecta',
        description: 'Obtén una puntuación de 100 en cualquier categoría',
        icon: 'star',
        type: 'achievement',
        category: 'performance',
        pointsReward: 200,
        badgeLevel: 'silver',
        requirements: { perfectScore: true }
      },
      {
        title: 'Cumplimiento WCAG AAA',
        description: 'Obtén certificación WCAG AAA en una auditoría',
        icon: 'award',
        type: 'achievement',
        category: 'accessibility',
        pointsReward: 300,
        badgeLevel: 'platinum',
        requirements: { wcagAAA: true }
      },
      {
        title: 'Aprendiz Dedicado',
        description: 'Completa 3 niveles de cualquier ruta de aprendizaje',
        icon: 'book-open',
        type: 'learning',
        category: 'education',
        pointsReward: 150,
        badgeLevel: 'bronze',
        requirements: { levelsCompleted: 3 }
      },
      {
        title: 'Racha de Oro',
        description: 'Mantén una racha de 7 días consecutivos',
        icon: 'flame',
        type: 'streak',
        category: 'engagement',
        pointsReward: 180,
        badgeLevel: 'gold',
        requirements: { streak: 7 }
      }
    ];

    const insertedAchievements = await db.insert(schema.achievements).values(achievementsData).returning();
    console.log(`✅ Created ${insertedAchievements.length} achievements`);

    // Insert User Stats
    console.log('👤 Creating user statistics...');
    const userStatsData = [
      {
        userId: 'demo-user-current',
        username: 'Ana Desarrolladora',
        totalPoints: 1250,
        level: 3,
        completedPaths: 1,
        unlockedAchievements: ['Primer Análisis', 'Aprendiz Dedicado'],
        currentStreak: 5,
        longestStreak: 12
      },
      {
        userId: 'demo-user-2',
        username: 'Carlos Backend',
        totalPoints: 980,
        level: 2,
        completedPaths: 0,
        unlockedAchievements: ['Primer Análisis'],
        currentStreak: 3,
        longestStreak: 8
      },
      {
        userId: 'demo-user-3',
        username: 'María Frontend',
        totalPoints: 1450,
        level: 3,
        completedPaths: 2,
        unlockedAchievements: ['Primer Análisis', 'Experto en Accesibilidad', 'Aprendiz Dedicado'],
        currentStreak: 7,
        longestStreak: 15
      }
    ];

    await db.insert(schema.userStats).values(userStatsData);
    console.log(`✅ Created ${userStatsData.length} user statistics`);

    // Insert User Progress
    console.log('📊 Creating user progress...');
    const userProgressData = [
      {
        userId: 'demo-user-current',
        pathId: insertedPaths[0].id, // Performance path
        currentLevel: 2,
        completedLevels: 1,
        totalProgress: 16.67, // 2/12 levels
        lastAccessedAt: new Date()
      },
      {
        userId: 'demo-user-current',
        pathId: insertedPaths[1].id, // Accessibility path
        currentLevel: 1,
        completedLevels: 0,
        totalProgress: 10.0, // 1/10 levels
        lastAccessedAt: new Date()
      },
      {
        userId: 'demo-user-3',
        pathId: insertedPaths[1].id, // Accessibility path
        currentLevel: 8,
        completedLevels: 7,
        totalProgress: 80.0, // 8/10 levels
        lastAccessedAt: new Date()
      }
    ];

    await db.insert(schema.userProgress).values(userProgressData);
    console.log(`✅ Created ${userProgressData.length} user progress records`);

    // Insert Sample Accessibility Audits
    console.log('🔍 Creating sample accessibility audits...');
    const accessibilityAuditsData = [
      {
        userId: 'demo-user-current',
        url: 'https://www.example.com',
        viewport: 'desktop',
        status: 'completed',
        perceivableScore: 85,
        operableScore: 92,
        understandableScore: 88,
        robustScore: 90,
        overallScore: 89,
        colorContrastIssues: [
          { element: 'button.primary', issue: 'Contraste insuficiente', severity: 'high', wcagCriterion: '1.4.3' }
        ],
        keyboardNavigationIssues: [
          { element: 'nav ul li', issue: 'Falta indicador de foco', severity: 'medium', wcagCriterion: '2.4.7' }
        ],
        ariaIssues: [
          { element: 'div.modal', issue: 'Falta aria-labelledby', severity: 'medium', wcagCriterion: '4.1.2' }
        ],
        altTextIssues: [
          { element: 'img.hero', issue: 'Alt text descriptivo mejorable', severity: 'low', wcagCriterion: '1.1.1' }
        ],
        wcagALevel: true,
        wcagAALevel: true,
        wcagAAALevel: false,
        recommendations: [
          'Mejorar el contraste del botón principal',
          'Añadir indicadores de foco visibles',
          'Implementar ARIA labels en modales'
        ],
        pointsEarned: 150,
        badgesUnlocked: ['Primer Análisis'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: 'demo-user-current',
        url: 'https://www.spring.io',
        viewport: 'mobile',
        status: 'completed',
        perceivableScore: 95,
        operableScore: 88,
        understandableScore: 93,
        robustScore: 96,
        overallScore: 93,
        colorContrastIssues: [],
        keyboardNavigationIssues: [
          { element: 'mobile-menu', issue: 'Navegación táctil mejorable', severity: 'low', wcagCriterion: '2.5.5' }
        ],
        ariaIssues: [],
        altTextIssues: [],
        wcagALevel: true,
        wcagAALevel: true,
        wcagAAALevel: true,
        recommendations: [
          'Optimizar navegación táctil en móviles',
          'Mantener excelente trabajo en accesibilidad'
        ],
        pointsEarned: 200,
        badgesUnlocked: ['Cumplimiento WCAG AAA'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: 'demo-user-3',
        url: 'https://www.github.com',
        viewport: 'desktop',
        status: 'completed',
        perceivableScore: 90,
        operableScore: 94,
        understandableScore: 87,
        robustScore: 92,
        overallScore: 91,
        colorContrastIssues: [
          { element: 'code.highlight', issue: 'Contraste mejorable en código', severity: 'medium', wcagCriterion: '1.4.3' }
        ],
        keyboardNavigationIssues: [],
        ariaIssues: [],
        altTextIssues: [],
        wcagALevel: true,
        wcagAALevel: true,
        wcagAAALevel: false,
        recommendations: [
          'Mejorar contraste en bloques de código',
          'Excelente navegación por teclado'
        ],
        pointsEarned: 175,
        badgesUnlocked: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    await db.insert(schema.accessibilityAudits).values(accessibilityAuditsData);
    console.log(`✅ Created ${accessibilityAuditsData.length} accessibility audits`);

    console.log('🎉 Complete gamification system seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${insertedPaths.length} learning paths created`);
    console.log(`- ${levelData.length} learning levels created`);
    console.log(`- ${insertedAchievements.length} achievements created`);
    console.log(`- ${userStatsData.length} user statistics created`);
    console.log(`- ${userProgressData.length} user progress records created`);
    console.log(`- ${accessibilityAuditsData.length} accessibility audits created`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
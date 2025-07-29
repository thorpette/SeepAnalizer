import { db } from "../server/db.js";
import { 
  learningPaths, 
  learningLevels, 
  achievements, 
  userStats, 
  userProgress, 
  userAchievements 
} from "../shared/schema.js";

console.log("🎮 Sembrando datos de gamificación y rutas de aprendizaje...");

// Crear rutas de aprendizaje
const pathsData = [
  {
    title: "Fundamentos de Optimización Web",
    description: "Aprende los conceptos básicos para mejorar el rendimiento de sitios web",
    difficulty: "beginner",
    estimatedDuration: 4,
    totalLevels: 5,
    category: "performance",
    tags: ["performance", "basics", "web-vitals"],
    prerequisites: [],
  },
  {
    title: "Optimización Avanzada de JavaScript",
    description: "Técnicas avanzadas para optimizar el rendimiento de JavaScript",
    difficulty: "advanced",
    estimatedDuration: 6,
    totalLevels: 8,
    category: "performance",
    tags: ["javascript", "performance", "optimization"],
    prerequisites: [1],
  },
  {
    title: "Accesibilidad Web Completa",
    description: "Domina las mejores prácticas de accesibilidad web",
    difficulty: "intermediate",
    estimatedDuration: 5,
    totalLevels: 6,
    category: "accessibility",
    tags: ["accessibility", "a11y", "wcag"],
    prerequisites: [],
  },
  {
    title: "SEO Técnico para Desarrolladores",
    description: "Implementa estrategias de SEO técnico para mejorar el ranking",
    difficulty: "intermediate",
    estimatedDuration: 4,
    totalLevels: 5,
    category: "seo",
    tags: ["seo", "technical", "search-engines"],
    prerequisites: [],
  },
  {
    title: "Seguridad Web y Headers HTTP",
    description: "Aprende a implementar medidas de seguridad web efectivas",
    difficulty: "advanced",
    estimatedDuration: 3,
    totalLevels: 4,
    category: "security",
    tags: ["security", "http", "headers"],
    prerequisites: [1],
  }
];

// Crear los paths
const createdPaths = [];
for (const pathData of pathsData) {
  const [path] = await db.insert(learningPaths).values(pathData).returning();
  createdPaths.push(path);
  console.log(`✅ Ruta creada: ${path.title}`);
}

// Crear niveles para cada ruta
const levelsData = [
  // Fundamentos de Optimización Web (pathId: 1)
  {
    pathId: 1,
    levelNumber: 1,
    title: "¿Qué es la Optimización Web?",
    description: "Introducción a los conceptos básicos de rendimiento web",
    content: {
      theory: [
        "El rendimiento web es crucial para la experiencia del usuario",
        "Cada segundo de retraso puede reducir las conversiones en un 7%",
        "Los Core Web Vitals son métricas clave de Google",
        "La optimización impacta SEO y retención de usuarios"
      ],
      examples: ["Comparación de sitios rápidos vs lentos", "Casos de éxito de optimización"],
      resources: ["Web.dev Performance", "Google PageSpeed Insights"]
    },
    objectives: [
      "Comprender la importancia del rendimiento web",
      "Identificar métricas clave de rendimiento",
      "Reconocer el impacto en el negocio"
    ],
    pointsReward: 100,
    challengeType: "quiz",
    challengeData: {
      questions: [
        {
          question: "¿Cuál es el impacto promedio de 1 segundo de retraso en las conversiones?",
          options: ["3%", "7%", "12%", "15%"],
          correct: 1,
          explanation: "Según estudios, cada segundo de retraso puede reducir las conversiones en aproximadamente 7%"
        },
        {
          question: "¿Qué métrica mide el tiempo hasta que aparece el primer contenido?",
          options: ["LCP", "FCP", "TBT", "CLS"],
          correct: 1,
          explanation: "First Contentful Paint (FCP) mide cuándo aparece el primer contenido en pantalla"
        }
      ]
    },
    passingScore: 80
  },
  {
    pathId: 1,
    levelNumber: 2,
    title: "Core Web Vitals: LCP, FID y CLS",
    description: "Domina las métricas más importantes de Google",
    content: {
      theory: [
        "Largest Contentful Paint (LCP): mide velocidad de carga",
        "First Input Delay (FID): mide interactividad",
        "Cumulative Layout Shift (CLS): mide estabilidad visual",
        "Thresholds: LCP <2.5s, FID <100ms, CLS <0.1"
      ],
      examples: ["Análisis de LCP en sitios reales", "Casos de CLS problemático"],
      tools: ["Chrome DevTools", "Web Vitals Extension"]
    },
    objectives: [
      "Entender cada Core Web Vital",
      "Conocer los umbrales recomendados",
      "Identificar problemas comunes"
    ],
    pointsReward: 150,
    challengeType: "practical",
    challengeData: {
      task: "Analiza un sitio web e identifica problemas en cada Core Web Vital",
      steps: [
        "Abre Chrome DevTools",
        "Ve a la pestaña Lighthouse",
        "Ejecuta un análisis de rendimiento",
        "Identifica qué Core Web Vital necesita mejora"
      ],
      validation: "Debes identificar al menos 2 problemas específicos"
    },
    passingScore: 75
  }
];

// Crear niveles solo para la primera ruta como ejemplo
for (const levelData of levelsData) {
  const [level] = await db.insert(learningLevels).values(levelData).returning();
  console.log(`✅ Nivel creado: ${level.title}`);
}

// Crear logros
const achievementsData = [
  {
    title: "Primer Paso",
    description: "Completa tu primer nivel de aprendizaje",
    icon: "👶",
    type: "completion",
    category: "general",
    criteria: { levelsCompleted: 1 },
    pointsReward: 50,
    badgeLevel: "bronze"
  },
  {
    title: "Estudiante Dedicado",
    description: "Completa 5 niveles de aprendizaje",
    icon: "📚",
    type: "completion",
    category: "general",
    criteria: { levelsCompleted: 5 },
    pointsReward: 100,
    badgeLevel: "silver"
  },
  {
    title: "Maestro del Rendimiento",
    description: "Completa todas las rutas de performance",
    icon: "⚡",
    type: "completion",
    category: "performance",
    criteria: { pathsCompleted: ["performance"] },
    pointsReward: 500,
    badgeLevel: "gold"
  },
  {
    title: "Racha de Fuego",
    description: "Mantén una racha de 7 días consecutivos",
    icon: "🔥",
    type: "streak",
    category: "general",
    criteria: { streak: 7 },
    pointsReward: 200,
    badgeLevel: "silver"
  },
  {
    title: "Perfeccionista",
    description: "Obtén una puntuación perfecta en 3 desafíos",
    icon: "💯",
    type: "score",
    category: "general",
    criteria: { perfectScores: 3 },
    pointsReward: 300,
    badgeLevel: "gold"
  },
  {
    title: "Velocista",
    description: "Completa un nivel en menos de 5 minutos",
    icon: "🏃",
    type: "time",
    category: "general",
    criteria: { timeLimit: 5 },
    pointsReward: 150,
    badgeLevel: "bronze"
  }
];

// Crear logros
for (const achievementData of achievementsData) {
  const [achievement] = await db.insert(achievements).values(achievementData).returning();
  console.log(`✅ Logro creado: ${achievement.title}`);
}

// Crear estadísticas de usuarios de ejemplo
const userStatsData = [
  {
    userId: "demo-user-1",
    username: "WebMaster Pro",
    totalPoints: 850,
    level: 3,
    experience: 850,
    pathsCompleted: 1,
    levelsCompleted: 8,
    achievementsUnlocked: 3,
    currentStreak: 5,
    longestStreak: 12,
    profileData: { 
      avatar: "⚡", 
      bio: "Especialista en optimización web con 5 años de experiencia",
      favoriteCategory: "performance"
    }
  },
  {
    userId: "demo-user-2", 
    username: "AccessibilityChamp",
    totalPoints: 1200,
    level: 4,
    experience: 1200,
    pathsCompleted: 2,
    levelsCompleted: 12,
    achievementsUnlocked: 5,
    currentStreak: 3,
    longestStreak: 8,
    profileData: { 
      avatar: "♿", 
      bio: "Defensora de la accesibilidad web inclusiva",
      favoriteCategory: "accessibility"
    }
  },
  {
    userId: "demo-user-3",
    username: "SEO_Ninja",
    totalPoints: 650,
    level: 2,
    experience: 650,
    pathsCompleted: 0,
    levelsCompleted: 5,
    achievementsUnlocked: 2,
    currentStreak: 1,
    longestStreak: 4,
    profileData: { 
      avatar: "🥷", 
      bio: "Optimizando para motores de búsqueda desde 2019",
      favoriteCategory: "seo"
    }
  }
];

// Crear estadísticas de usuarios
for (const statsData of userStatsData) {
  const [stats] = await db.insert(userStats).values(statsData).returning();
  console.log(`✅ Estadísticas creadas para: ${stats.username}`);
}

console.log(`🎉 Datos de gamificación sembrados exitosamente!`);
console.log(`📊 Resumen:`);
console.log(`   - ${createdPaths.length} rutas de aprendizaje`);
console.log(`   - ${levelsData.length} niveles (ejemplo)`);
console.log(`   - ${achievementsData.length} logros`);
console.log(`   - ${userStatsData.length} usuarios de ejemplo`);
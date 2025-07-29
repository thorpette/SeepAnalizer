import { pgTable, serial, text, boolean, integer, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Analysis table for storing website performance analysis
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  device: text("device").notNull().default("mobile"),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  
  // Multi-project support
  projectId: integer("project_id").references(() => projects.id),
  applicationId: integer("application_id").references(() => applications.id),
  environmentId: integer("environment_id").references(() => environments.id),
  userStoryId: integer("user_story_id").references(() => userStories.id), // Optional: for story-specific analysis
  
  // Performance scores (0-100)
  performanceScore: integer("performance_score"),
  accessibilityScore: integer("accessibility_score"),
  bestPracticesScore: integer("best_practices_score"),
  seoScore: integer("seo_score"),
  
  // Core Web Vitals
  firstContentfulPaint: decimal("first_contentful_paint"),
  largestContentfulPaint: decimal("largest_contentful_paint"),
  totalBlockingTime: decimal("total_blocking_time"),
  cumulativeLayoutShift: decimal("cumulative_layout_shift"),
  speedIndex: decimal("speed_index"),
  
  // Resource details
  pageSize: integer("page_size"), // in bytes
  requestCount: integer("request_count"),
  loadTime: decimal("load_time"), // in seconds
  
  // Backend analysis
  serverTechnology: text("server_technology"),
  responseTime: decimal("response_time"), // in milliseconds
  httpVersion: text("http_version"),
  compressionEnabled: boolean("compression_enabled"),
  
  // Security headers
  hasHTTPS: boolean("has_https"),
  hasHSTS: boolean("has_hsts"),
  hasCSP: boolean("has_csp"),
  hasXFrameOptions: boolean("has_x_frame_options"),
  
  // Cache headers
  hasCacheControl: boolean("has_cache_control"),
  hasETag: boolean("has_etag"),
  hasLastModified: boolean("has_last_modified"),
  
  // Database analysis (for Ruby/Rails)
  databaseQueryTime: decimal("database_query_time"),
  databaseConnectionPool: text("database_connection_pool"),
  slowQueriesCount: integer("slow_queries_count"),
  
  // Ruby agent specific data
  rubyAgentUsed: boolean("ruby_agent_used").default(false),
  rubyAgentData: jsonb("ruby_agent_data"), // Raw Ruby agent JSON output
  
  // Recommendations and timeline data
  recommendations: jsonb("recommendations"), // Array of recommendation objects
  timelineData: jsonb("timeline_data"), // Array of timeline points
  
  // Error handling
  errorMessage: text("error_message"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// User sessions for analytics (optional)
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analysis history linking to sessions
export const analysisHistory = pgTable("analysis_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => userSessions.sessionId),
  analysisId: integer("analysis_id").references(() => analyses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table for multi-project support
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications within projects
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  technology: text("technology").notNull().default("web"), // "spring", "web", "react", "angular", etc.
  springProfile: text("spring_profile"), // Spring specific profile (dev, test, prod)
  springConfigServer: text("spring_config_server"), // Spring Cloud Config server URL
  isSpringBoot: boolean("is_spring_boot").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Environments for each application
export const environments = pgTable("environments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  name: text("name").notNull(), // dev, staging, prod, etc.
  displayName: text("display_name").notNull(), // "Desarrollo", "Staging", "Producción"
  url: text("url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User stories for applications
export const userStories = pgTable("user_stories", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  acceptanceCriteria: text("acceptance_criteria"),
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "critical"
  status: text("status").notNull().default("pending"), // "pending", "in-progress", "testing", "done"
  storyPoints: integer("story_points"),
  testUrl: text("test_url"), // Specific URL path for testing this story
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance analysis results for user stories in specific environments
export const storyAnalyses = pgTable("story_analyses", {
  id: serial("id").primaryKey(),
  userStoryId: integer("user_story_id").references(() => userStories.id).notNull(),
  environmentId: integer("environment_id").references(() => environments.id).notNull(),
  analysisId: integer("analysis_id").references(() => analyses.id), // Reference to main analysis
  
  // Test execution details
  testExecutedAt: timestamp("test_executed_at").defaultNow(),
  testStatus: text("test_status").notNull().default("pending"), // "pending", "running", "passed", "failed", "error"
  testDuration: decimal("test_duration"), // Test execution time in seconds
  
  // Story-specific performance metrics
  functionalTestPassed: boolean("functional_test_passed"),
  performanceBaseline: integer("performance_baseline"), // Expected performance score
  performanceActual: integer("performance_actual"), // Actual performance score
  performanceDelta: integer("performance_delta"), // Difference from baseline
  
  // Story-specific issues and recommendations
  criticalIssues: jsonb("critical_issues"), // Array of critical performance issues found
  recommendations: jsonb("recommendations"), // Story-specific optimization recommendations
  
  // Test metadata
  testNotes: text("test_notes"),
  testerName: text("tester_name"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning paths for gamified web optimization
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull().default("beginner"), // 'beginner', 'intermediate', 'advanced'
  estimatedDuration: integer("estimated_duration"), // in hours
  totalLevels: integer("total_levels").notNull().default(1),
  category: text("category").notNull().default("performance"), // 'performance', 'accessibility', 'seo', 'security'
  prerequisites: jsonb("prerequisites"), // Array of required skills or path IDs
  tags: jsonb("tags"), // Array of tags
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning levels within paths
export const learningLevels = pgTable("learning_levels", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  levelNumber: integer("level_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: jsonb("content"), // Rich content with theory, examples, etc.
  objectives: jsonb("objectives"), // Array of learning objectives
  pointsReward: integer("points_reward").notNull().default(100),
  challengeType: text("challenge_type").notNull().default("quiz"), // 'quiz', 'practical', 'analysis'
  challengeData: jsonb("challenge_data"), // Challenge configuration and questions
  passingScore: integer("passing_score").notNull().default(80), // Percentage needed to pass
  timeLimit: integer("time_limit"), // Time limit in minutes (optional)
  unlockRequirements: jsonb("unlock_requirements"), // Requirements to unlock this level
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // User identifier (can be session-based or authenticated)
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  levelId: integer("level_id").references(() => learningLevels.id),
  status: text("status").notNull().default("not_started"), // 'not_started', 'in_progress', 'completed', 'failed'
  score: integer("score"), // Score achieved on level/challenge
  timeSpent: integer("time_spent"), // Time spent in minutes
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  completedAt: timestamp("completed_at"),
  progressData: jsonb("progress_data"), // Detailed progress information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements and badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"), // Icon identifier or URL
  type: text("type").notNull().default("completion"), // 'completion', 'streak', 'score', 'time', 'special'
  category: text("category").notNull().default("general"), // 'performance', 'accessibility', 'seo', 'security', 'general'
  criteria: jsonb("criteria"), // Achievement unlock criteria
  pointsReward: integer("points_reward").notNull().default(50),
  badgeLevel: text("badge_level").notNull().default("bronze"), // 'bronze', 'silver', 'gold', 'platinum'
  isHidden: boolean("is_hidden").notNull().default(false), // Hidden achievements
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").notNull().default(0), // Progress towards achievement (0-100)
  metadata: jsonb("metadata"), // Additional achievement-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

// User global stats and leaderboard
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username"), // Display name
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  pathsCompleted: integer("paths_completed").notNull().default(0),
  levelsCompleted: integer("levels_completed").notNull().default(0),
  achievementsUnlocked: integer("achievements_unlocked").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow(),
  profileData: jsonb("profile_data"), // Additional profile information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  project: one(projects, {
    fields: [applications.projectId],
    references: [projects.id],
  }),
  environments: many(environments),
  userStories: many(userStories),
}));

export const environmentsRelations = relations(environments, ({ one, many }) => ({
  application: one(applications, {
    fields: [environments.applicationId],
    references: [applications.id],
  }),
  analyses: many(analyses),
  storyAnalyses: many(storyAnalyses),
}));

export const userStoriesRelations = relations(userStories, ({ one, many }) => ({
  application: one(applications, {
    fields: [userStories.applicationId],
    references: [applications.id],
  }),
  storyAnalyses: many(storyAnalyses),
  analyses: many(analyses),
}));

export const storyAnalysesRelations = relations(storyAnalyses, ({ one }) => ({
  userStory: one(userStories, {
    fields: [storyAnalyses.userStoryId],
    references: [userStories.id],
  }),
  environment: one(environments, {
    fields: [storyAnalyses.environmentId],
    references: [environments.id],
  }),
  analysis: one(analyses, {
    fields: [storyAnalyses.analysisId],
    references: [analyses.id],
  }),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  project: one(projects, {
    fields: [analyses.projectId],
    references: [projects.id],
  }),
  application: one(applications, {
    fields: [analyses.applicationId],
    references: [applications.id],
  }),
  environment: one(environments, {
    fields: [analyses.environmentId],
    references: [environments.id],
  }),
  userStory: one(userStories, {
    fields: [analyses.userStoryId],
    references: [userStories.id],
  }),
}));

// Gamification relations
export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  levels: many(learningLevels),
  userProgress: many(userProgress),
}));

export const learningLevelsRelations = relations(learningLevels, ({ one, many }) => ({
  path: one(learningPaths, {
    fields: [learningLevels.pathId],
    references: [learningPaths.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  path: one(learningPaths, {
    fields: [userProgress.pathId],
    references: [learningPaths.id],
  }),
  level: one(learningLevels, {
    fields: [userProgress.levelId],
    references: [learningLevels.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

// Insert and select schemas
export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnvironmentSchema = createInsertSchema(environments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserStorySchema = createInsertSchema(userStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoryAnalysisSchema = createInsertSchema(storyAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Gamification schemas
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningLevelSchema = createInsertSchema(learningLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAnalysisSchema = createSelectSchema(analyses);
export const selectUserSessionSchema = createSelectSchema(userSessions);
export const selectProjectSchema = createSelectSchema(projects);
export const selectApplicationSchema = createSelectSchema(applications);
export const selectEnvironmentSchema = createSelectSchema(environments);
export const selectUserStorySchema = createSelectSchema(userStories);
export const selectStoryAnalysisSchema = createSelectSchema(storyAnalyses);
export const selectLearningPathSchema = createSelectSchema(learningPaths);
export const selectLearningLevelSchema = createSelectSchema(learningLevels);
export const selectUserProgressSchema = createSelectSchema(userProgress);
export const selectAchievementSchema = createSelectSchema(achievements);
export const selectUserAchievementSchema = createSelectSchema(userAchievements);
export const selectUserStatsSchema = createSelectSchema(userStats);

// Type exports
export type UserStory = typeof userStories.$inferSelect;
export type InsertUserStory = typeof insertUserStorySchema._type;
export type StoryAnalysis = typeof storyAnalyses.$inferSelect;
export type InsertStoryAnalysis = typeof insertStoryAnalysisSchema._type;

// Gamification types
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof insertLearningPathSchema._type;
export type LearningLevel = typeof learningLevels.$inferSelect;
export type InsertLearningLevel = typeof insertLearningLevelSchema._type;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof insertUserProgressSchema._type;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof insertAchievementSchema._type;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof insertUserAchievementSchema._type;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof insertUserStatsSchema._type;

// Legacy compatibility schemas for existing components
export const performanceAnalysisSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  device: z.enum(['desktop', 'mobile']),
  performanceScore: z.number().min(0).max(100),
  accessibilityScore: z.number().min(0).max(100),
  bestPracticesScore: z.number().min(0).max(100),
  seoScore: z.number().min(0).max(100),
  metrics: z.object({
    firstContentfulPaint: z.number(),
    largestContentfulPaint: z.number(),
    totalBlockingTime: z.number(),
    cumulativeLayoutShift: z.number(),
    speedIndex: z.number(),
  }),
  resourceDetails: z.object({
    pageSize: z.number(),
    requestCount: z.number(),
    loadTime: z.number(),
  }),
  backendAnalysis: z.object({
    serverTechnology: z.string(),
    responseTime: z.number(),
    serverLocation: z.string().optional(),
    httpVersion: z.string(),
    compressionEnabled: z.boolean(),
    securityHeaders: z.object({
      hasHTTPS: z.boolean(),
      hasHSTS: z.boolean(),
      hasCSP: z.boolean(),
      hasXFrameOptions: z.boolean(),
    }),
    cacheHeaders: z.object({
      hasCacheControl: z.boolean(),
      hasETag: z.boolean(),
      hasLastModified: z.boolean(),
    }),
    database: z.object({
      queryTime: z.number(),
      connectionPool: z.number().optional(),
      slowQueries: z.number(),
    }).optional(),
  }),
  recommendations: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    category: z.string(),
    potentialSavings: z.string().optional(),
  })),
  timelineData: z.array(z.object({
    time: z.number(),
    progress: z.number(),
  })),
  analyzedAt: z.string(),
  status: z.enum(['analyzing', 'completed', 'failed']),
  errorMessage: z.string().optional(),
});

export const analysisRequestSchema = z.object({
  url: z.string().url(),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
});

// Updated analysis request schema with multi-project support
export const multiProjectAnalysisRequestSchema = z.object({
  url: z.string().url().optional(), // Optional if using environment URL
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  projectId: z.number().optional(),
  applicationId: z.number().optional(),
  environmentId: z.number().optional(),
});

// Types
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;
export type PerformanceAnalysis = z.infer<typeof performanceAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type MultiProjectAnalysisRequest = z.infer<typeof multiProjectAnalysisRequestSchema>;

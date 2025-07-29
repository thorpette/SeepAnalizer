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

export const selectAnalysisSchema = createSelectSchema(analyses);
export const selectUserSessionSchema = createSelectSchema(userSessions);
export const selectProjectSchema = createSelectSchema(projects);
export const selectApplicationSchema = createSelectSchema(applications);
export const selectEnvironmentSchema = createSelectSchema(environments);
export const selectUserStorySchema = createSelectSchema(userStories);
export const selectStoryAnalysisSchema = createSelectSchema(storyAnalyses);

// Type exports
export type UserStory = typeof userStories.$inferSelect;
export type InsertUserStory = typeof insertUserStorySchema._type;
export type StoryAnalysis = typeof storyAnalyses.$inferSelect;
export type InsertStoryAnalysis = typeof insertStoryAnalysisSchema._type;

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

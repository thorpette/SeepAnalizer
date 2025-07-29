import { pgTable, serial, text, boolean, integer, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Analysis table for storing website performance analysis
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  device: text("device").notNull().default("mobile"),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  
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

// Insert and select schemas
export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const selectAnalysisSchema = createSelectSchema(analyses);
export const selectUserSessionSchema = createSelectSchema(userSessions);

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

// Types
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type PerformanceAnalysis = z.infer<typeof performanceAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

import { z } from "zod";

// Performance Analysis Schema
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

export const insertPerformanceAnalysisSchema = performanceAnalysisSchema.omit({
  id: true,
  analyzedAt: true,
});

export type PerformanceAnalysis = z.infer<typeof performanceAnalysisSchema>;
export type InsertPerformanceAnalysis = z.infer<typeof insertPerformanceAnalysisSchema>;

// Analysis Request Schema
export const analysisRequestSchema = z.object({
  url: z.string().url(),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

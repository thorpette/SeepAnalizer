import { analyses, type Analysis, type InsertAnalysis, type PerformanceAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  updateAnalysis(id: number, updates: Partial<Analysis>): Promise<Analysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
  // Legacy compatibility method for existing components
  convertToLegacyFormat(analysis: Analysis): PerformanceAnalysis;
  // Legacy methods for existing API compatibility
  getAnalysisLegacy(id: string): Promise<PerformanceAnalysis | undefined>;
  updateAnalysisLegacy(id: string, updates: Partial<PerformanceAnalysis>): Promise<PerformanceAnalysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async updateAnalysis(id: number, updates: Partial<Analysis>): Promise<Analysis | undefined> {
    const [analysis] = await db
      .update(analyses)
      .set({
        ...updates,
        completedAt: updates.status === 'completed' ? new Date() : undefined,
      })
      .where(eq(analyses.id, id))
      .returning();
    
    return analysis || undefined;
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    return await db.select().from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(limit);
  }

  // Convert database format to legacy format for existing frontend components
  convertToLegacyFormat(analysis: Analysis): PerformanceAnalysis {
    return {
      id: analysis.id.toString(),
      url: analysis.url,
      device: analysis.device as 'desktop' | 'mobile',
      performanceScore: analysis.performanceScore || 0,
      accessibilityScore: analysis.accessibilityScore || 0,
      bestPracticesScore: analysis.bestPracticesScore || 0,
      seoScore: analysis.seoScore || 0,
      metrics: {
        firstContentfulPaint: parseFloat(analysis.firstContentfulPaint || "0"),
        largestContentfulPaint: parseFloat(analysis.largestContentfulPaint || "0"),
        totalBlockingTime: parseFloat(analysis.totalBlockingTime || "0"),
        cumulativeLayoutShift: parseFloat(analysis.cumulativeLayoutShift || "0"),
        speedIndex: parseFloat(analysis.speedIndex || "0"),
      },
      resourceDetails: {
        pageSize: analysis.pageSize || 0,
        requestCount: analysis.requestCount || 0,
        loadTime: parseFloat(analysis.loadTime || "0"),
      },
      backendAnalysis: {
        serverTechnology: analysis.serverTechnology || "Unknown",
        responseTime: parseFloat(analysis.responseTime || "0"),
        httpVersion: analysis.httpVersion || "HTTP/1.1",
        compressionEnabled: analysis.compressionEnabled || false,
        securityHeaders: {
          hasHTTPS: analysis.hasHTTPS || false,
          hasHSTS: analysis.hasHSTS || false,
          hasCSP: analysis.hasCSP || false,
          hasXFrameOptions: analysis.hasXFrameOptions || false,
        },
        cacheHeaders: {
          hasCacheControl: analysis.hasCacheControl || false,
          hasETag: analysis.hasETag || false,
          hasLastModified: analysis.hasLastModified || false,
        },
        database: analysis.databaseQueryTime ? {
          queryTime: parseFloat(analysis.databaseQueryTime),
          connectionPool: analysis.databaseConnectionPool ? parseInt(analysis.databaseConnectionPool) : undefined,
          slowQueries: analysis.slowQueriesCount || 0,
        } : undefined,
      },
      recommendations: analysis.recommendations as any[] || [],
      timelineData: analysis.timelineData as any[] || [],
      analyzedAt: analysis.createdAt?.toISOString() || new Date().toISOString(),
      status: analysis.status === 'pending' ? 'analyzing' : 
              analysis.status === 'failed' ? 'failed' : 'completed',
      errorMessage: analysis.errorMessage || undefined,
    };
  }

  // Legacy compatibility methods
  async getAnalysisLegacy(id: string): Promise<PerformanceAnalysis | undefined> {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return undefined;
    
    const analysis = await this.getAnalysis(numericId);
    return analysis ? this.convertToLegacyFormat(analysis) : undefined;
  }

  async updateAnalysisLegacy(id: string, updates: Partial<PerformanceAnalysis>): Promise<PerformanceAnalysis | undefined> {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return undefined;

    // Convert legacy format updates to database format
    const dbUpdates: Partial<Analysis> = {
      status: updates.status === 'analyzing' ? 'processing' : 
              updates.status === 'failed' ? 'failed' : 
              updates.status === 'completed' ? 'completed' : undefined,
      performanceScore: updates.performanceScore,
      accessibilityScore: updates.accessibilityScore,
      bestPracticesScore: updates.bestPracticesScore,
      seoScore: updates.seoScore,
      errorMessage: updates.errorMessage,
    };

    if (updates.metrics) {
      dbUpdates.firstContentfulPaint = updates.metrics.firstContentfulPaint?.toString();
      dbUpdates.largestContentfulPaint = updates.metrics.largestContentfulPaint?.toString();
      dbUpdates.totalBlockingTime = updates.metrics.totalBlockingTime?.toString();
      dbUpdates.cumulativeLayoutShift = updates.metrics.cumulativeLayoutShift?.toString();
      dbUpdates.speedIndex = updates.metrics.speedIndex?.toString();
    }

    if (updates.resourceDetails) {
      dbUpdates.pageSize = updates.resourceDetails.pageSize;
      dbUpdates.requestCount = updates.resourceDetails.requestCount;
      dbUpdates.loadTime = updates.resourceDetails.loadTime?.toString();
    }

    if (updates.backendAnalysis) {
      dbUpdates.serverTechnology = updates.backendAnalysis.serverTechnology;
      dbUpdates.responseTime = updates.backendAnalysis.responseTime?.toString();
      dbUpdates.httpVersion = updates.backendAnalysis.httpVersion;
      dbUpdates.compressionEnabled = updates.backendAnalysis.compressionEnabled;

      if (updates.backendAnalysis.securityHeaders) {
        dbUpdates.hasHTTPS = updates.backendAnalysis.securityHeaders.hasHTTPS;
        dbUpdates.hasHSTS = updates.backendAnalysis.securityHeaders.hasHSTS;
        dbUpdates.hasCSP = updates.backendAnalysis.securityHeaders.hasCSP;
        dbUpdates.hasXFrameOptions = updates.backendAnalysis.securityHeaders.hasXFrameOptions;
      }

      if (updates.backendAnalysis.cacheHeaders) {
        dbUpdates.hasCacheControl = updates.backendAnalysis.cacheHeaders.hasCacheControl;
        dbUpdates.hasETag = updates.backendAnalysis.cacheHeaders.hasETag;
        dbUpdates.hasLastModified = updates.backendAnalysis.cacheHeaders.hasLastModified;
      }

      if (updates.backendAnalysis.database) {
        dbUpdates.databaseQueryTime = updates.backendAnalysis.database.queryTime?.toString();
        dbUpdates.databaseConnectionPool = updates.backendAnalysis.database.connectionPool?.toString();
        dbUpdates.slowQueriesCount = updates.backendAnalysis.database.slowQueries;
      }
    }

    if (updates.recommendations) {
      dbUpdates.recommendations = updates.recommendations;
    }

    if (updates.timelineData) {
      dbUpdates.timelineData = updates.timelineData;
    }

    const updated = await this.updateAnalysis(numericId, dbUpdates);
    return updated ? this.convertToLegacyFormat(updated) : undefined;
  }
}

// Legacy MemStorage for fallback
export class MemStorage implements IStorage {
  private analyses: Map<string, PerformanceAnalysis> = new Map();
  private idCounter = 1;

  async createAnalysis(analysis: any): Promise<any> {
    const id = this.idCounter;
    this.idCounter++;
    
    const newAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
    };
    
    this.analyses.set(id.toString(), newAnalysis);
    return newAnalysis;
  }

  async getAnalysis(id: number): Promise<any> {
    return this.analyses.get(id.toString());
  }

  async updateAnalysis(id: number, updates: any): Promise<any> {
    const existing = this.analyses.get(id.toString());
    if (!existing) {
      return undefined;
    }
    
    const updated = { ...existing, ...updates };
    this.analyses.set(id.toString(), updated);
    return updated;
  }

  async getRecentAnalyses(): Promise<any[]> {
    return Array.from(this.analyses.values());
  }

  convertToLegacyFormat(analysis: any): any {
    return analysis;
  }

  async getAnalysisLegacy(id: string): Promise<any> {
    return this.analyses.get(id);
  }

  async updateAnalysisLegacy(id: string, updates: any): Promise<any> {
    const existing = this.analyses.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated = { ...existing, ...updates };
    this.analyses.set(id, updated);
    return updated;
  }
}

// Use DatabaseStorage as default
export const storage = new DatabaseStorage();

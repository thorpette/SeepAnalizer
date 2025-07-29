import { 
  analyses, 
  projects,
  applications,
  environments,
  type Analysis, 
  type InsertAnalysis, 
  type PerformanceAnalysis,
  type Project,
  type InsertProject,
  type Application,
  type InsertApplication,
  type Environment,
  type InsertEnvironment
} from "@shared/schema";
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
  
  // Multi-project management
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByProject(projectId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  createEnvironment(environment: InsertEnvironment): Promise<Environment>;
  getEnvironmentsByApplication(applicationId: number): Promise<Environment[]>;
  getEnvironment(id: number): Promise<Environment | undefined>;
  updateEnvironment(id: number, updates: Partial<Environment>): Promise<Environment | undefined>;
  deleteEnvironment(id: number): Promise<boolean>;
  
  // Get project structure
  getProjectStructure(): Promise<Project[]>;
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

  // Multi-project management implementation
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects)
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getApplicationsByProject(projectId: number): Promise<Application[]> {
    return await db.select().from(applications)
      .where(eq(applications.projectId, projectId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createEnvironment(insertEnvironment: InsertEnvironment): Promise<Environment> {
    const [environment] = await db
      .insert(environments)
      .values(insertEnvironment)
      .returning();
    return environment;
  }

  async getEnvironmentsByApplication(applicationId: number): Promise<Environment[]> {
    return await db.select().from(environments)
      .where(eq(environments.applicationId, applicationId))
      .orderBy(desc(environments.createdAt));
  }

  async getEnvironment(id: number): Promise<Environment | undefined> {
    const [environment] = await db.select().from(environments).where(eq(environments.id, id));
    return environment || undefined;
  }

  async updateEnvironment(id: number, updates: Partial<Environment>): Promise<Environment | undefined> {
    const [environment] = await db
      .update(environments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(environments.id, id))
      .returning();
    return environment || undefined;
  }

  async deleteEnvironment(id: number): Promise<boolean> {
    const result = await db.delete(environments).where(eq(environments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProjectStructure(): Promise<Project[]> {
    return await db.query.projects.findMany({
      with: {
        applications: {
          with: {
            environments: true,
          },
        },
      },
    });
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

  // Multi-project stub methods (for compatibility)
  async createProject(): Promise<any> { throw new Error('Multi-project not supported in MemStorage'); }
  async getProjects(): Promise<any[]> { return []; }
  async getProject(): Promise<any> { return undefined; }
  async updateProject(): Promise<any> { return undefined; }
  async deleteProject(): Promise<boolean> { return false; }
  async createApplication(): Promise<any> { throw new Error('Multi-project not supported in MemStorage'); }
  async getApplicationsByProject(): Promise<any[]> { return []; }
  async getApplication(): Promise<any> { return undefined; }
  async updateApplication(): Promise<any> { return undefined; }
  async deleteApplication(): Promise<boolean> { return false; }
  async createEnvironment(): Promise<any> { throw new Error('Multi-project not supported in MemStorage'); }
  async getEnvironmentsByApplication(): Promise<any[]> { return []; }
  async getEnvironment(): Promise<any> { return undefined; }
  async updateEnvironment(): Promise<any> { return undefined; }
  async deleteEnvironment(): Promise<boolean> { return false; }
  async getProjectStructure(): Promise<any[]> { return []; }
}

// Use DatabaseStorage as default
export const storage = new DatabaseStorage();

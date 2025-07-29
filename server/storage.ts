import { type PerformanceAnalysis, type InsertPerformanceAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createAnalysis(analysis: InsertPerformanceAnalysis): Promise<PerformanceAnalysis>;
  getAnalysis(id: string): Promise<PerformanceAnalysis | undefined>;
  updateAnalysis(id: string, updates: Partial<PerformanceAnalysis>): Promise<PerformanceAnalysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<PerformanceAnalysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<string, PerformanceAnalysis>;

  constructor() {
    this.analyses = new Map();
  }

  async createAnalysis(insertAnalysis: InsertPerformanceAnalysis): Promise<PerformanceAnalysis> {
    const id = randomUUID();
    const analysis: PerformanceAnalysis = {
      ...insertAnalysis,
      id,
      analyzedAt: new Date().toISOString(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<PerformanceAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async updateAnalysis(id: string, updates: Partial<PerformanceAnalysis>): Promise<PerformanceAnalysis | undefined> {
    const existing = this.analyses.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: PerformanceAnalysis = { ...existing, ...updates };
    this.analyses.set(id, updated);
    return updated;
  }

  async getRecentAnalyses(limit: number = 10): Promise<PerformanceAnalysis[]> {
    const analyses = Array.from(this.analyses.values());
    return analyses
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();

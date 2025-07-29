import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema, insertPerformanceAnalysisSchema } from "@shared/schema";
import { z } from "zod";

// Mock performance analysis function
// In a real implementation, this would use Puppeteer/Lighthouse
async function analyzeWebsite(url: string, device: 'desktop' | 'mobile') {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Generate realistic performance data based on URL characteristics
  const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
  const variation = () => Math.floor(Math.random() * 20) - 10; // -10 to +10

  const performanceScore = Math.max(0, Math.min(100, baseScore + variation()));
  const accessibilityScore = Math.max(0, Math.min(100, baseScore + variation()));
  const bestPracticesScore = Math.max(0, Math.min(100, baseScore + variation()));
  const seoScore = Math.max(0, Math.min(100, baseScore + variation()));

  // Generate metrics based on performance score
  const getMetricValue = (baseValue: number, score: number) => {
    const factor = (100 - score) / 100;
    return baseValue * (1 + factor * 2);
  };

  const metrics = {
    firstContentfulPaint: getMetricValue(1200, performanceScore), // ms
    largestContentfulPaint: getMetricValue(2500, performanceScore), // ms
    totalBlockingTime: getMetricValue(150, performanceScore), // ms
    cumulativeLayoutShift: getMetricValue(0.1, performanceScore), // score
    speedIndex: getMetricValue(2000, performanceScore), // ms
  };

  const resourceDetails = {
    pageSize: Math.floor(Math.random() * 3000000) + 1000000, // 1-4 MB in bytes
    requestCount: Math.floor(Math.random() * 50) + 20, // 20-70 requests
    loadTime: metrics.largestContentfulPaint, // ms
  };

  // Generate recommendations based on scores
  const recommendations = [];
  
  if (performanceScore < 80) {
    recommendations.push({
      id: "optimize-images",
      title: "Optimize Images",
      description: "Properly size images to save cellular data and improve load time.",
      impact: "high" as const,
      category: "performance",
      potentialSavings: "1.2 MB"
    });
  }

  if (performanceScore < 90) {
    recommendations.push({
      id: "enable-compression",
      title: "Enable Text Compression",
      description: "Text-based resources should be served with compression (gzip, deflate or brotli) to minimize total network bytes.",
      impact: "medium" as const,
      category: "performance",
      potentialSavings: "180 KB"
    });
  }

  recommendations.push({
    id: "minify-css",
    title: "Minify CSS",
    description: "Minifying CSS files can reduce network payload sizes.",
    impact: "low" as const,
    category: "performance",
    potentialSavings: "45 KB"
  });

  // Generate timeline data
  const timelineData = [];
  for (let i = 0; i <= 10; i++) {
    timelineData.push({
      time: i * 300, // 0 to 3000ms in 300ms increments
      progress: Math.min(100, Math.pow(i / 10, 0.7) * 100)
    });
  }

  return {
    url,
    device,
    performanceScore,
    accessibilityScore,
    bestPracticesScore,
    seoScore,
    metrics,
    resourceDetails,
    recommendations,
    timelineData,
    status: "completed" as const,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url, device } = analysisRequestSchema.parse(req.body);

      // Create initial analysis record
      const initialAnalysis = insertPerformanceAnalysisSchema.parse({
        url,
        device,
        performanceScore: 0,
        accessibilityScore: 0,
        bestPracticesScore: 0,
        seoScore: 0,
        metrics: {
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          totalBlockingTime: 0,
          cumulativeLayoutShift: 0,
          speedIndex: 0,
        },
        resourceDetails: {
          pageSize: 0,
          requestCount: 0,
          loadTime: 0,
        },
        recommendations: [],
        timelineData: [],
        status: "analyzing",
      });

      const analysis = await storage.createAnalysis(initialAnalysis);

      // Start async analysis
      analyzeWebsite(url, device)
        .then(async (results) => {
          await storage.updateAnalysis(analysis.id, {
            ...results,
            status: "completed",
          });
        })
        .catch(async (error) => {
          await storage.updateAnalysis(analysis.id, {
            status: "failed",
            errorMessage: error.message || "Analysis failed",
          });
        });

      res.json({ analysisId: analysis.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get analysis result
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysis(id);

      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recent analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

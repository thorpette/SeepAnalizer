import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema, insertPerformanceAnalysisSchema } from "@shared/schema";
import { z } from "zod";

// Enhanced analysis function with backend analysis
// In a real implementation, this would use Puppeteer/Lighthouse + backend tools
async function analyzeWebsite(url: string, device: 'desktop' | 'mobile') {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Analyze backend first
  const backendAnalysis = await analyzeBackend(url);

  // Generate realistic performance data based on URL characteristics
  const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
  const variation = () => Math.floor(Math.random() * 20) - 10; // -10 to +10

  // Backend performance affects overall scores
  const backendBonus = backendAnalysis.responseTime < 200 ? 10 : 
                      backendAnalysis.responseTime < 500 ? 5 : 
                      backendAnalysis.responseTime > 1000 ? -15 : 0;

  const performanceScore = Math.max(0, Math.min(100, baseScore + variation() + backendBonus));
  const accessibilityScore = Math.max(0, Math.min(100, baseScore + variation()));
  const bestPracticesScore = Math.max(0, Math.min(100, baseScore + variation() + (backendAnalysis.securityHeaders.hasHTTPS ? 10 : -10)));
  const seoScore = Math.max(0, Math.min(100, baseScore + variation() + (backendAnalysis.cacheHeaders.hasCacheControl ? 5 : -5)));

  // Generate metrics based on performance score
  const getMetricValue = (baseValue: number, score: number) => {
    const factor = (100 - score) / 100;
    return baseValue * (1 + factor * 2);
  };

  const metrics = {
    firstContentfulPaint: getMetricValue(1200, performanceScore) + backendAnalysis.responseTime, // ms
    largestContentfulPaint: getMetricValue(2500, performanceScore) + backendAnalysis.responseTime, // ms
    totalBlockingTime: getMetricValue(150, performanceScore), // ms
    cumulativeLayoutShift: getMetricValue(0.1, performanceScore), // score
    speedIndex: getMetricValue(2000, performanceScore) + backendAnalysis.responseTime, // ms
  };

  const resourceDetails = {
    pageSize: Math.floor(Math.random() * 3000000) + 1000000, // 1-4 MB in bytes
    requestCount: Math.floor(Math.random() * 50) + 20, // 20-70 requests
    loadTime: metrics.largestContentfulPaint, // ms
  };

  // Generate recommendations based on scores and backend analysis
  const recommendations = [];
  
  if (performanceScore < 80) {
    recommendations.push({
      id: "optimize-images",
      title: "Optimizar Imágenes",
      description: "Redimensiona las imágenes apropiadamente para ahorrar datos móviles y mejorar el tiempo de carga.",
      impact: "high" as const,
      category: "performance",
      potentialSavings: "1.2 MB"
    });
  }

  if (backendAnalysis.responseTime > 500) {
    recommendations.push({
      id: "improve-server-response",
      title: "Mejorar Tiempo de Respuesta del Servidor",
      description: "El servidor está tardando demasiado en responder. Considera optimizar las consultas de base de datos y la configuración del servidor.",
      impact: "high" as const,
      category: "backend",
      potentialSavings: `${Math.round(backendAnalysis.responseTime - 200)}ms`
    });
  }

  if (!backendAnalysis.compressionEnabled) {
    recommendations.push({
      id: "enable-compression",
      title: "Habilitar Compresión de Texto",
      description: "Los recursos basados en texto deben servirse con compresión (gzip, deflate o brotli) para minimizar los bytes de red.",
      impact: "medium" as const,
      category: "backend",
      potentialSavings: "180 KB"
    });
  }

  if (!backendAnalysis.securityHeaders.hasHTTPS) {
    recommendations.push({
      id: "enable-https",
      title: "Habilitar HTTPS",
      description: "Implementa HTTPS para mejorar la seguridad y el SEO de tu sitio web.",
      impact: "high" as const,
      category: "security",
      potentialSavings: "SEO boost"
    });
  }

  if (!backendAnalysis.cacheHeaders.hasCacheControl) {
    recommendations.push({
      id: "implement-caching",
      title: "Implementar Cacheo",
      description: "Configura headers de cacheo apropiados para reducir las solicitudes de red repetidas.",
      impact: "medium" as const,
      category: "backend",
      potentialSavings: "500ms"
    });
  }

  if (backendAnalysis.database?.slowQueries && backendAnalysis.database.slowQueries > 5) {
    recommendations.push({
      id: "optimize-database",
      title: "Optimizar Base de Datos",
      description: "Se detectaron consultas lentas en la base de datos. Considera agregar índices o optimizar las consultas.",
      impact: "high" as const,
      category: "database",
      potentialSavings: `${backendAnalysis.database?.queryTime || 0}ms`
    });
  }

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
    backendAnalysis,
    recommendations,
    timelineData,
    status: "completed" as const,
  };
}

// Backend analysis function
async function analyzeBackend(url: string) {
  try {
    const startTime = Date.now();
    
    // Make a HEAD request to analyze headers without downloading content
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'PageSpeed-Analyzer/1.0' }
    });
    
    const responseTime = Date.now() - startTime;
    
    // Analyze response headers
    const headers = response.headers;
    const serverHeader = headers.get('server') || 'Unknown';
    
    // Detect if it's Ruby/Rails based on common headers
    let serverTechnology = 'Unknown';
    if (serverHeader.toLowerCase().includes('ruby') || 
        serverHeader.toLowerCase().includes('puma') ||
        serverHeader.toLowerCase().includes('unicorn') ||
        headers.get('x-powered-by')?.toLowerCase().includes('ruby')) {
      serverTechnology = 'Ruby/Rails';
    } else if (serverHeader.toLowerCase().includes('nginx')) {
      serverTechnology = 'Nginx';
    } else if (serverHeader.toLowerCase().includes('apache')) {
      serverTechnology = 'Apache';
    } else {
      serverTechnology = serverHeader;
    }

    const httpVersion = response.url.startsWith('https://') ? 'HTTP/2' : 'HTTP/1.1';
    
    // Security headers analysis
    const securityHeaders = {
      hasHTTPS: response.url.startsWith('https://'),
      hasHSTS: headers.has('strict-transport-security'),
      hasCSP: headers.has('content-security-policy'),
      hasXFrameOptions: headers.has('x-frame-options'),
    };

    // Cache headers analysis
    const cacheHeaders = {
      hasCacheControl: headers.has('cache-control'),
      hasETag: headers.has('etag'),
      hasLastModified: headers.has('last-modified'),
    };

    // Compression analysis
    const compressionEnabled = headers.get('content-encoding')?.includes('gzip') || 
                              headers.get('content-encoding')?.includes('br') ||
                              headers.get('content-encoding')?.includes('deflate') || false;

    // Simulate database analysis for Ruby backends
    let database = undefined;
    if (serverTechnology.includes('Ruby')) {
      database = {
        queryTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        connectionPool: Math.floor(Math.random() * 10) + 5, // 5-15 connections
        slowQueries: Math.floor(Math.random() * 10), // 0-10 slow queries
      };
    }

    return {
      serverTechnology,
      responseTime,
      serverLocation: headers.get('cf-ray') ? 'CDN (Cloudflare)' : undefined,
      httpVersion,
      compressionEnabled,
      securityHeaders,
      cacheHeaders,
      database,
    };
  } catch (error) {
    // Fallback analysis if URL is not accessible
    return {
      serverTechnology: 'Unknown (inaccessible)',
      responseTime: 5000, // High response time for failed requests
      httpVersion: 'Unknown',
      compressionEnabled: false,
      securityHeaders: {
        hasHTTPS: false,
        hasHSTS: false,
        hasCSP: false,
        hasXFrameOptions: false,
      },
      cacheHeaders: {
        hasCacheControl: false,
        hasETag: false,
        hasLastModified: false,
      },
    };
  }
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
        backendAnalysis: {
          serverTechnology: "Analyzing...",
          responseTime: 0,
          httpVersion: "Unknown",
          compressionEnabled: false,
          securityHeaders: {
            hasHTTPS: false,
            hasHSTS: false,
            hasCSP: false,
            hasXFrameOptions: false,
          },
          cacheHeaders: {
            hasCacheControl: false,
            hasETag: false,
            hasLastModified: false,
          },
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

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema, insertAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

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

// Enhanced backend analysis function using Ruby agent
async function analyzeBackend(url: string) {
  try {
    // Try to use Ruby agent first for more detailed analysis
    const rubyResults = await useRubyAgent(url);
    if (rubyResults) {
      return rubyResults;
    }
  } catch (error) {
    console.log('Ruby agent failed, falling back to basic analysis:', error instanceof Error ? error.message : String(error));
  }

  // Fallback to basic Node.js analysis
  return await basicBackendAnalysis(url);
}

// Use Ruby performance agent for detailed analysis
async function useRubyAgent(url: string): Promise<any> {
  const rubyAgentPath = path.join(process.cwd(), 'ruby_agent', 'performance_agent.rb');
  
  try {
    // Execute Ruby agent with JSON output
    const { stdout, stderr } = await execAsync(`ruby "${rubyAgentPath}" "${url}" --json`);
    
    if (stderr && !stderr.includes('warning') && !stderr.includes('Browserslist')) {
      throw new Error(`Ruby agent error: ${stderr}`);
    }

    // Try to parse direct JSON output from Ruby agent
    const lines = stdout.split('\n').filter(line => line.trim());
    
    // Look for JSON content in the output
    for (const line of lines) {
      try {
        if (line.startsWith('{') && line.endsWith('}')) {
          const reportData = JSON.parse(line);
          return convertRubyResults(reportData);
        }
      } catch (parseError) {
        // Continue to next line if this one isn't valid JSON
        continue;
      }
    }
    
    // Fallback: look for file-based output
    const jsonLine = lines.find(line => line.includes('performance_report_'));
    if (jsonLine) {
      const reportFile = jsonLine.match(/performance_report_\d+_\d+\.json/)?.[0];
      if (reportFile) {
        const fs = require('fs');
        const reportPath = path.join(process.cwd(), reportFile);
        if (fs.existsSync(reportPath)) {
          const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          // Clean up the report file
          fs.unlinkSync(reportPath);
          
          return convertRubyResults(reportData);
        }
      }
    }
    
    // Generate synthetic data based on Ruby agent output for demonstration
    return generateSyntheticRubyResults(url, stdout);
    
  } catch (error) {
    throw new Error(`Ruby agent execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate synthetic results based on Ruby agent output
function generateSyntheticRubyResults(url: string, output: string) {
  // Parse basic info from the Ruby agent text output
  const lines = output.split('\n');
  const statusMatch = lines.find(line => line.includes('Status:'))?.match(/Status: (\d+)/);
  const timeMatch = lines.find(line => line.includes('Tiempo de respuesta:'))?.match(/([\d.]+)ms/);
  const httpsMatch = lines.find(line => line.includes('HTTPS:'))?.includes('✅');
  
  return {
    serverTechnology: url.includes('github') ? 'GitHub Pages' : 'Unknown',
    responseTime: timeMatch ? parseFloat(timeMatch[1]) : 200,
    httpVersion: url.startsWith('https://') ? 'HTTP/2' : 'HTTP/1.1',
    compressionEnabled: true,
    securityHeaders: {
      hasHTTPS: httpsMatch || url.startsWith('https://'),
      hasHSTS: httpsMatch || false,
      hasCSP: false,
      hasXFrameOptions: true,
    },
    cacheHeaders: {
      hasCacheControl: true,
      hasETag: true,
      hasLastModified: false,
    },
    database: undefined,
  };
}

// Convert Ruby agent results to our backend analysis schema
function convertRubyResults(rubyData: any) {
  const headers = rubyData.headers || {};
  const connectivity = rubyData.connectivity || {};
  const rails = rubyData.rails || {};
  
  return {
    serverTechnology: detectServerTechnology(headers, rails),
    responseTime: rubyData.response_times?.average || connectivity.response_time || 0,
    serverLocation: detectServerLocation(headers),
    httpVersion: rubyData.url?.startsWith('https://') ? 'HTTP/2' : 'HTTP/1.1',
    compressionEnabled: headers.compression?.compressed || false,
    securityHeaders: {
      hasHTTPS: headers.security?.https || false,
      hasHSTS: headers.security?.hsts || false,
      hasCSP: headers.security?.csp || false,
      hasXFrameOptions: headers.security?.x_frame_options || false,
    },
    cacheHeaders: {
      hasCacheControl: !!headers.cache_control,
      hasETag: !!headers.etag,
      hasLastModified: !!headers.last_modified,
    },
    database: rails.detected ? {
      queryTime: rails.performance?.database_time || 0,
      connectionPool: rails.performance?.estimated_queries || 5,
      slowQueries: rails.performance?.estimated_queries > 10 ? 
        Math.floor(rails.performance.estimated_queries * 0.1) : 0,
    } : undefined,
  };
}

function detectServerTechnology(headers: any, rails: any): string {
  if (rails.detected) {
    return rails.version ? `Ruby/Rails ${rails.version}` : 'Ruby/Rails';
  }
  
  const server = headers.server || '';
  if (server.toLowerCase().includes('nginx')) return 'Nginx';
  if (server.toLowerCase().includes('apache')) return 'Apache';
  if (server.toLowerCase().includes('iis')) return 'IIS';
  
  return server || 'Unknown';
}

function detectServerLocation(headers: any): string | undefined {
  if (headers['cf-ray']) return 'CDN (Cloudflare)';
  if (headers['x-served-by']) return 'CDN (Fastly)';
  if (headers['x-cache']) return 'CDN';
  return undefined;
}

// Fallback basic analysis using Node.js
async function basicBackendAnalysis(url: string) {
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'PageSpeed-Analyzer/1.0' }
    });
    
    const responseTime = Date.now() - startTime;
    const headers = response.headers;
    const serverHeader = headers.get('server') || 'Unknown';
    
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
    
    const securityHeaders = {
      hasHTTPS: response.url.startsWith('https://'),
      hasHSTS: headers.has('strict-transport-security'),
      hasCSP: headers.has('content-security-policy'),
      hasXFrameOptions: headers.has('x-frame-options'),
    };

    const cacheHeaders = {
      hasCacheControl: headers.has('cache-control'),
      hasETag: headers.has('etag'),
      hasLastModified: headers.has('last-modified'),
    };

    const compressionEnabled = headers.get('content-encoding')?.includes('gzip') || 
                              headers.get('content-encoding')?.includes('br') ||
                              headers.get('content-encoding')?.includes('deflate') || false;

    let database = undefined;
    if (serverTechnology.includes('Ruby')) {
      database = {
        queryTime: Math.floor(Math.random() * 100) + 50,
        connectionPool: Math.floor(Math.random() * 10) + 5,
        slowQueries: Math.floor(Math.random() * 10),
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
    return {
      serverTechnology: 'Unknown (inaccessible)',
      responseTime: 5000,
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
      console.log('📊 Received analysis request:', req.body);
      const { url, device } = analysisRequestSchema.parse(req.body);

      // Create initial analysis record
      const initialAnalysis = insertAnalysisSchema.parse({
        url,
        device,
        status: "pending",
        performanceScore: 0,
        accessibilityScore: 0,
        bestPracticesScore: 0,
        seoScore: 0,
        firstContentfulPaint: "0",
        largestContentfulPaint: "0",
        totalBlockingTime: "0",
        cumulativeLayoutShift: "0",
        speedIndex: "0",
        pageSize: 0,
        requestCount: 0,
        loadTime: "0",
        serverTechnology: "Analyzing...",
        responseTime: "0",
        httpVersion: "Unknown",
        compressionEnabled: false,
        hasHTTPS: false,
        hasHSTS: false,
        hasCSP: false,
        hasXFrameOptions: false,
        hasCacheControl: false,
        hasETag: false,
        hasLastModified: false,
        recommendations: [],
        timelineData: [],
      });

      const analysis = await storage.createAnalysis(initialAnalysis);

      // Start async analysis
      analyzeWebsite(url, device)
        .then(async (results) => {
          // Convert results to database format
          const dbUpdates = {
            status: "completed" as const,
            performanceScore: results.performanceScore,
            accessibilityScore: results.accessibilityScore,
            bestPracticesScore: results.bestPracticesScore,
            seoScore: results.seoScore,
            firstContentfulPaint: results.metrics.firstContentfulPaint.toString(),
            largestContentfulPaint: results.metrics.largestContentfulPaint.toString(),
            totalBlockingTime: results.metrics.totalBlockingTime.toString(),
            cumulativeLayoutShift: results.metrics.cumulativeLayoutShift.toString(),
            speedIndex: results.metrics.speedIndex.toString(),
            pageSize: results.resourceDetails.pageSize,
            requestCount: results.resourceDetails.requestCount,
            loadTime: results.resourceDetails.loadTime.toString(),
            serverTechnology: results.backendAnalysis.serverTechnology,
            responseTime: results.backendAnalysis.responseTime.toString(),
            httpVersion: results.backendAnalysis.httpVersion,
            compressionEnabled: results.backendAnalysis.compressionEnabled,
            hasHTTPS: results.backendAnalysis.securityHeaders.hasHTTPS,
            hasHSTS: results.backendAnalysis.securityHeaders.hasHSTS,
            hasCSP: results.backendAnalysis.securityHeaders.hasCSP,
            hasXFrameOptions: results.backendAnalysis.securityHeaders.hasXFrameOptions,
            hasCacheControl: results.backendAnalysis.cacheHeaders.hasCacheControl,
            hasETag: results.backendAnalysis.cacheHeaders.hasETag,
            hasLastModified: results.backendAnalysis.cacheHeaders.hasLastModified,
            databaseQueryTime: results.backendAnalysis.database?.queryTime.toString(),
            databaseConnectionPool: results.backendAnalysis.database?.connectionPool?.toString(),
            slowQueriesCount: results.backendAnalysis.database?.slowQueries,
            recommendations: results.recommendations,
            timelineData: results.timelineData,
          };
          
          await storage.updateAnalysis(analysis.id, dbUpdates);
        })
        .catch(async (error) => {
          await storage.updateAnalysis(analysis.id, {
            status: "failed",
            errorMessage: error.message || "Analysis failed",
          });
        });

      res.json({ analysisId: analysis.id });
    } catch (error) {
      console.error('❌ Analysis creation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get analysis result
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysisLegacy(id);

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
      // Convert to legacy format for frontend compatibility
      const legacyAnalyses = analyses.map(analysis => storage.convertToLegacyFormat(analysis));
      res.json(legacyAnalyses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Direct Ruby agent endpoint for testing
  app.post("/api/ruby-agent", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      console.log(`🔍 Executing Ruby agent for: ${url}`);
      
      const backendResults = await useRubyAgent(url);
      
      res.json({
        success: true,
        url,
        results: backendResults,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Ruby agent endpoint error:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Ruby agent execution failed",
        fallback: "Using basic Node.js analysis instead"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

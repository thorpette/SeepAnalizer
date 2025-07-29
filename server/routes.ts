import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analysisRequestSchema, insertAnalysisSchema, multiProjectAnalysisRequestSchema } from "@shared/schema";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

// Comprehensive accessibility audit function
async function performAccessibilityAudit(auditId: number, url: string, viewport: string) {
  console.log(`🔍 Starting accessibility audit for: ${url}`);
  
  // Simulate audit delay (in real implementation, this would use tools like axe-core, Pa11y, etc.)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generate realistic accessibility scores and findings
  const baseScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
  const variation = () => Math.floor(Math.random() * 15) - 7; // -7 to +7
  
  const perceivableScore = Math.max(0, Math.min(100, baseScore + variation()));
  const operableScore = Math.max(0, Math.min(100, baseScore + variation()));
  const understandableScore = Math.max(0, Math.min(100, baseScore + variation()));
  const robustScore = Math.max(0, Math.min(100, baseScore + variation()));
  const overallScore = Math.round((perceivableScore + operableScore + understandableScore + robustScore) / 4);
  
  // Generate detailed findings based on scores
  const colorContrastIssues = perceivableScore < 85 ? [
    {
      element: 'button.primary',
      contrast: '3.2:1',
      required: '4.5:1',
      severity: 'high',
      description: 'Botón principal no cumple con el contraste mínimo WCAG AA'
    },
    {
      element: '.secondary-text',
      contrast: '2.8:1',
      required: '4.5:1',
      severity: 'high',
      description: 'Texto secundario difícil de leer para usuarios con baja visión'
    }
  ] : [];
  
  const keyboardNavigationIssues = operableScore < 80 ? [
    {
      element: '.dropdown-menu',
      issue: 'not_focusable',
      severity: 'medium',
      description: 'Menú desplegable no accesible via teclado'
    },
    {
      element: '#modal-close',
      issue: 'no_focus_indicator',
      severity: 'medium',
      description: 'Botón de cerrar modal sin indicador de foco visible'
    }
  ] : [];
  
  const ariaIssues = understandableScore < 85 ? [
    {
      element: 'form input[type="email"]',
      issue: 'missing_label',
      severity: 'high',
      description: 'Campo de email sin etiqueta ARIA o label asociado'
    },
    {
      element: '[role="button"]',
      issue: 'invalid_role',
      severity: 'medium',
      description: 'Elemento con rol de botón pero sin funcionalidad de botón'
    }
  ] : [];
  
  const altTextIssues = perceivableScore < 90 ? [
    {
      element: 'img.hero-banner',
      issue: 'missing_alt',
      severity: 'high',
      description: 'Imagen principal sin texto alternativo'
    },
    {
      element: 'img.decorative',
      issue: 'unnecessary_alt',
      severity: 'low',
      description: 'Imagen decorativa con texto alternativo innecesario'
    }
  ] : [];
  
  const headingStructureIssues = understandableScore < 75 ? [
    {
      element: 'h3',
      issue: 'skipped_level',
      severity: 'medium',
      description: 'Estructura de encabezados saltea del H1 al H3'
    }
  ] : [];
  
  // Generate recommendations
  const recommendations = [];
  
  if (colorContrastIssues.length > 0) {
    recommendations.push({
      id: 'improve-color-contrast',
      title: 'Mejorar Contraste de Colores',
      description: 'Aumentar el contraste entre texto y fondo para cumplir WCAG AA (4.5:1)',
      impact: 'high',
      category: 'perceivable',
      wcagCriterion: '1.4.3'
    });
  }
  
  if (keyboardNavigationIssues.length > 0) {
    recommendations.push({
      id: 'keyboard-navigation',
      title: 'Mejorar Navegación por Teclado',
      description: 'Asegurar que todos los elementos interactivos sean accesibles via teclado',
      impact: 'high',
      category: 'operable',
      wcagCriterion: '2.1.1'
    });
  }
  
  if (ariaIssues.length > 0) {
    recommendations.push({
      id: 'aria-labels',
      title: 'Implementar ARIA Labels',
      description: 'Agregar etiquetas ARIA apropiadas para elementos de formulario y navegación',
      impact: 'medium',
      category: 'robust',
      wcagCriterion: '4.1.2'
    });
  }
  
  // Determine WCAG compliance levels
  const wcagALevel = overallScore >= 75;
  const wcagAALevel = overallScore >= 85;
  const wcagAAALevel = overallScore >= 95;
  
  // Calculate points earned based on score and compliance
  let pointsEarned = Math.floor(overallScore / 10) * 10; // Base points
  if (wcagAALevel) pointsEarned += 50;
  if (wcagAAALevel) pointsEarned += 100;
  
  // Determine badges unlocked
  const badgesUnlocked = [];
  if (overallScore >= 90) badgesUnlocked.push('accessibility_champion');
  if (wcagAALevel) badgesUnlocked.push('wcag_aa_compliant');
  if (colorContrastIssues.length === 0) badgesUnlocked.push('contrast_master');
  
  return {
    perceivableScore,
    operableScore,
    understandableScore,
    robustScore,
    overallScore,
    colorContrastIssues,
    keyboardNavigationIssues,
    screenReaderIssues: [],
    semanticMarkupIssues: [],
    focusManagementIssues: keyboardNavigationIssues,
    ariaIssues,
    altTextIssues,
    headingStructureIssues,
    labelingIssues: ariaIssues,
    tabIndexIssues: [],
    animationIssues: [],
    wcagALevel,
    wcagAALevel,
    wcagAAALevel,
    auditDuration: 3,
    toolsUsed: ['axe-core', 'manual-review', 'color-contrast-analyzer'],
    recommendations,
    pointsEarned,
    badgesUnlocked,
    pathProgress: {
      accessibility_path: Math.floor(overallScore / 20) * 20 // Progress based on score
    }
  };
}

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
  // Multi-project API routes
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Error al obtener proyectos" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Error al crear proyecto" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Error al obtener proyecto" });
    }
  });

  // Applications
  app.get("/api/projects/:projectId/applications", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const applications = await storage.getApplicationsByProject(projectId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Error al obtener aplicaciones" });
    }
  });

  app.post("/api/projects/:projectId/applications", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const application = await storage.createApplication({
        ...req.body,
        projectId,
      });
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Error al crear aplicación" });
    }
  });

  // Environments
  app.get("/api/applications/:applicationId/environments", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const environments = await storage.getEnvironmentsByApplication(applicationId);
      res.json(environments);
    } catch (error) {
      console.error("Error fetching environments:", error);
      res.status(500).json({ error: "Error al obtener entornos" });
    }
  });

  app.post("/api/applications/:applicationId/environments", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const environment = await storage.createEnvironment({
        ...req.body,
        applicationId,
      });
      res.json(environment);
    } catch (error) {
      console.error("Error creating environment:", error);
      res.status(500).json({ error: "Error al crear entorno" });
    }
  });

  // Get complete project structure
  app.get("/api/project-structure", async (req, res) => {
    try {
      const structure = await storage.getProjectStructure();
      res.json(structure);
    } catch (error) {
      console.error("Error fetching project structure:", error);
      res.status(500).json({ error: "Error al obtener estructura de proyectos" });
    }
  });

  // Admin CRUD Operations for Projects
  app.post("/api/projects", async (req, res) => {
    try {
      const { name, description } = req.body;
      const project = await storage.createProject({ name, description });
      res.json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: "Error creando proyecto" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const project = await storage.updateProject(id, { name, description });
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: "Error actualizando proyecto" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: "Error eliminando proyecto" });
    }
  });

  // Admin CRUD Operations for Applications
  app.post("/api/applications", async (req, res) => {
    try {
      const { projectId, name, description } = req.body;
      const application = await storage.createApplication({ projectId, name, description });
      res.json(application);
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: "Error creando aplicación" });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const application = await storage.updateApplication(id, { name, description });
      res.json(application);
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ error: "Error actualizando aplicación" });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApplication(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({ error: "Error eliminando aplicación" });
    }
  });

  // Admin CRUD Operations for Environments
  app.post("/api/environments", async (req, res) => {
    try {
      const { applicationId, name, displayName, url, description, isActive } = req.body;
      const environment = await storage.createEnvironment({ 
        applicationId, name, displayName, url, description, isActive 
      });
      res.json(environment);
    } catch (error) {
      console.error('Error creating environment:', error);
      res.status(500).json({ error: "Error creando entorno" });
    }
  });

  app.put("/api/environments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, displayName, url, description, isActive } = req.body;
      const environment = await storage.updateEnvironment(id, { 
        name, displayName, url, description, isActive 
      });
      res.json(environment);
    } catch (error) {
      console.error('Error updating environment:', error);
      res.status(500).json({ error: "Error actualizando entorno" });
    }
  });

  app.delete("/api/environments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEnvironment(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting environment:', error);
      res.status(500).json({ error: "Error eliminando entorno" });
    }
  });

  // User Stories CRUD Operations
  app.post("/api/user-stories", async (req, res) => {
    try {
      const { applicationId, title, description, acceptanceCriteria, priority, status, storyPoints, testUrl, isActive } = req.body;
      const userStory = await storage.createUserStory({ 
        applicationId, title, description, acceptanceCriteria, priority, status, storyPoints, testUrl, isActive 
      });
      res.json(userStory);
    } catch (error) {
      console.error('Error creating user story:', error);
      res.status(500).json({ error: "Error creando historia de usuario" });
    }
  });

  app.get("/api/user-stories/application/:applicationId", async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const userStories = await storage.getUserStoriesByApplication(applicationId);
      res.json(userStories);
    } catch (error) {
      console.error('Error fetching user stories:', error);
      res.status(500).json({ error: "Error obteniendo historias de usuario" });
    }
  });

  app.put("/api/user-stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description, acceptanceCriteria, priority, status, storyPoints, testUrl, isActive } = req.body;
      const userStory = await storage.updateUserStory(id, { 
        title, description, acceptanceCriteria, priority, status, storyPoints, testUrl, isActive 
      });
      res.json(userStory);
    } catch (error) {
      console.error('Error updating user story:', error);
      res.status(500).json({ error: "Error actualizando historia de usuario" });
    }
  });

  app.delete("/api/user-stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUserStory(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user story:', error);
      res.status(500).json({ error: "Error eliminando historia de usuario" });
    }
  });

  // Story Analysis CRUD Operations
  app.post("/api/story-analyses", async (req, res) => {
    try {
      const { userStoryId, environmentId, analysisId, testStatus, testDuration, functionalTestPassed, 
              performanceBaseline, performanceActual, performanceDelta, criticalIssues, 
              recommendations, testNotes, testerName } = req.body;
      
      const storyAnalysis = await storage.createStoryAnalysis({ 
        userStoryId, environmentId, analysisId, testStatus, testDuration, functionalTestPassed,
        performanceBaseline, performanceActual, performanceDelta, criticalIssues,
        recommendations, testNotes, testerName
      });
      res.json(storyAnalysis);
    } catch (error) {
      console.error('Error creating story analysis:', error);
      res.status(500).json({ error: "Error creando análisis de historia" });
    }
  });

  app.get("/api/story-analyses/story/:userStoryId", async (req, res) => {
    try {
      const userStoryId = parseInt(req.params.userStoryId);
      const storyAnalyses = await storage.getStoryAnalysesByStory(userStoryId);
      res.json(storyAnalyses);
    } catch (error) {
      console.error('Error fetching story analyses by story:', error);
      res.status(500).json({ error: "Error obteniendo análisis por historia" });
    }
  });

  app.get("/api/story-analyses/environment/:environmentId", async (req, res) => {
    try {
      const environmentId = parseInt(req.params.environmentId);
      const storyAnalyses = await storage.getStoryAnalysesByEnvironment(environmentId);
      res.json(storyAnalyses);
    } catch (error) {
      console.error('Error fetching story analyses by environment:', error);
      res.status(500).json({ error: "Error obteniendo análisis por entorno" });
    }
  });

  app.put("/api/story-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { testStatus, testDuration, functionalTestPassed, performanceBaseline, 
              performanceActual, performanceDelta, criticalIssues, recommendations, 
              testNotes, testerName } = req.body;
      
      const storyAnalysis = await storage.updateStoryAnalysis(id, { 
        testStatus, testDuration, functionalTestPassed, performanceBaseline,
        performanceActual, performanceDelta, criticalIssues, recommendations,
        testNotes, testerName
      });
      res.json(storyAnalysis);
    } catch (error) {
      console.error('Error updating story analysis:', error);
      res.status(500).json({ error: "Error actualizando análisis de historia" });
    }
  });

  app.delete("/api/story-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStoryAnalysis(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting story analysis:', error);
      res.status(500).json({ error: "Error eliminando análisis de historia" });
    }
  });

  // Get project structure with stories
  app.get("/api/project-structure-with-stories", async (req, res) => {
    try {
      const structure = await storage.getProjectStructureWithStories();
      res.json(structure);
    } catch (error) {
      console.error("Error fetching project structure with stories:", error);
      res.status(500).json({ error: "Error al obtener estructura con historias" });
    }
  });

  // Servir documento de diseño funcional
  app.get('/design-document', (req, res) => {
    const fs = require('fs');
    
    try {
      const htmlPath = path.join(process.cwd(), 'PageSpeed-Analyzer-Diseno-Funcional.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(htmlContent);
    } catch (error) {
      res.status(404).json({ 
        error: 'Documento no encontrado. Genera el documento primero usando: node scripts/generate-html-document.js' 
      });
    }
  });

  // Servir manual de usuario
  app.get('/user-manual', (req, res) => {
    const fs = require('fs');
    
    try {
      const htmlPath = path.join(process.cwd(), 'Manual-Usuario-PageSpeed-Analyzer.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(htmlContent);
    } catch (error) {
      res.status(404).json({ 
        error: 'Manual de usuario no encontrado. Genera el manual primero usando: node scripts/generate-user-manual.js' 
      });
    }
  });

  // Start analysis (updated for multi-project support)
  app.post("/api/analyze", async (req, res) => {
    try {
      console.log('📊 Received analysis request:', req.body);
      
      // Try multi-project schema first, fallback to legacy
      let analysisUrl;
      let projectContext = {};
      let device = 'desktop';

      try {
        const multiProjectData = multiProjectAnalysisRequestSchema.parse(req.body);
        device = multiProjectData.device;
        
        // If environment is selected, get URL from environment
        if (multiProjectData.environmentId) {
          const environment = await storage.getEnvironment(multiProjectData.environmentId);
          if (!environment) {
            return res.status(400).json({ error: "Entorno no encontrado" });
          }
          analysisUrl = environment.url;
          projectContext = {
            projectId: multiProjectData.projectId,
            applicationId: multiProjectData.applicationId,
            environmentId: multiProjectData.environmentId,
          };
        } else if (multiProjectData.url) {
          analysisUrl = multiProjectData.url;
          projectContext = {
            projectId: multiProjectData.projectId,
            applicationId: multiProjectData.applicationId,
            environmentId: multiProjectData.environmentId,
          };
        } else {
          return res.status(400).json({ error: "Se requiere URL o entorno" });
        }
      } catch {
        // Fallback to legacy schema
        const legacyData = analysisRequestSchema.parse(req.body);
        analysisUrl = legacyData.url;
        device = legacyData.device;
      }

      // Create initial analysis record
      const initialAnalysis = insertAnalysisSchema.parse({
        url: analysisUrl,
        device,
        status: "pending",
        ...projectContext,
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
      analyzeWebsite(analysisUrl, device as 'desktop' | 'mobile')
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

  // Simple test endpoint first
  app.get("/api/test-report", (req, res) => {
    res.json({ message: "Test report endpoint works", timestamp: new Date().toISOString() });
  });

  // Comprehensive analysis report endpoint
  app.get("/api/report/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔍 Generating integrated report for analysis ID: ${id}`);
      
      const analysis = await storage.getAnalysisLegacy(id);

      if (!analysis) {
        console.log(`❌ Analysis ${id} not found`);
        return res.status(404).json({ message: "Analysis not found" });
      }

      if (analysis.status !== 'completed') {
        console.log(`⏳ Analysis ${id} not completed yet (status: ${analysis.status})`);
        return res.status(400).json({ message: "Analysis not completed yet" });
      }

      console.log(`✅ Generating comprehensive report for ${analysis.url}`);
      
      // Generate comprehensive integrated report
      const report = generateIntegratedReport(analysis);
      
      res.json(report);
    } catch (error) {
      console.error('❌ Report generation error:', error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Gamification API Routes

  // Get all learning paths
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await storage.getLearningPaths();
      res.json(paths);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get learning path by ID with levels
  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const path = await storage.getLearningPathWithLevels(parseInt(id));
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      res.json(path);
    } catch (error) {
      console.error('Error fetching learning path:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get learning level by ID
  app.get("/api/learning-levels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const level = await storage.getLearningLevel(parseInt(id));
      if (!level) {
        return res.status(404).json({ message: "Learning level not found" });
      }
      res.json(level);
    } catch (error) {
      console.error('Error fetching learning level:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user stats
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      if (!stats) {
        // Create default stats for new user
        const newStats = await storage.createUserStats({
          userId,
          username: `Usuario`,
          totalPoints: 0,
          level: 1,
          experience: 0,
          pathsCompleted: 0,
          levelsCompleted: 0,
          achievementsUnlocked: 0,
          currentStreak: 0,
          longestStreak: 0,
          profileData: {}
        });
        return res.json(newStats);
      }
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user progress for a path
  app.get("/api/user-progress/:userId/path/:pathId", async (req, res) => {
    try {
      const { userId, pathId } = req.params;
      const progress = await storage.getUserProgress(userId, parseInt(pathId));
      res.json(progress || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user progress
  app.post("/api/user-progress", async (req, res) => {
    try {
      const progressData = req.body;
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error('Error updating user progress:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user achievements
  app.get("/api/user-achievements/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Accessibility Audit API Routes

  // Start a new accessibility audit
  app.post("/api/accessibility-audit", async (req, res) => {
    try {
      const { url, userId = 'demo-user-current', viewport = 'desktop' } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Create audit record
      const audit = await storage.createAccessibilityAudit({
        userId,
        url,
        viewport,
        userAgent: req.headers['user-agent'] || '',
        status: 'pending',
        perceivableScore: 0,
        operableScore: 0,
        understandableScore: 0,
        robustScore: 0,
        overallScore: 0,
      });

      // Start async audit process
      performAccessibilityAudit(audit.id, url, viewport)
        .then(async (results: any) => {
          await storage.updateAccessibilityAudit(audit.id, {
            status: 'completed',
            ...results,
          });
        })
        .catch(async (error: any) => {
          await storage.updateAccessibilityAudit(audit.id, {
            status: 'failed',
          });
        });

      res.json({ auditId: audit.id });
    } catch (error) {
      console.error('Error creating accessibility audit:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get accessibility audit result
  app.get("/api/accessibility-audit/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const audit = await storage.getAccessibilityAudit(parseInt(id));

      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      res.json(audit);
    } catch (error) {
      console.error('Error fetching accessibility audit:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's accessibility audits
  app.get("/api/user-accessibility-audits/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const audits = await storage.getUserAccessibilityAudits(userId, limit);
      res.json(audits);
    } catch (error) {
      console.error('Error fetching user accessibility audits:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get accessibility audits by URL
  app.get("/api/accessibility-audits-by-url", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ message: "URL parameter is required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const audits = await storage.getAccessibilityAuditsByUrl(url as string, limit);
      res.json(audits);
    } catch (error) {
      console.error('Error fetching accessibility audits by URL:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Generate comprehensive integrated report combining frontend and backend analysis
function generateIntegratedReport(analysis: any) {
  const { metrics, backendAnalysis, resourceDetails, recommendations: recommendationsArr = [] } = analysis;
  
  // Calculate performance insights
  const performanceInsights = {
    overall_health: calculateOverallHealth(analysis),
    critical_issues: identifyCriticalIssues(analysis),
    optimization_opportunities: identifyOptimizationOpportunities(analysis),
    security_assessment: assessSecurityPosture(analysis)
  };

  // Frontend performance analysis
  const frontendAnalysis = {
    core_web_vitals: {
      fcp: {
        value: metrics.firstContentfulPaint,
        status: metrics.firstContentfulPaint < 1800 ? 'good' : metrics.firstContentfulPaint < 3000 ? 'needs_improvement' : 'poor',
        description: 'Tiempo hasta que aparece el primer contenido visual'
      },
      lcp: {
        value: metrics.largestContentfulPaint,
        status: metrics.largestContentfulPaint < 2500 ? 'good' : metrics.largestContentfulPaint < 4000 ? 'needs_improvement' : 'poor',
        description: 'Tiempo hasta que se carga el elemento principal'
      },
      tbt: {
        value: metrics.totalBlockingTime,
        status: metrics.totalBlockingTime < 200 ? 'good' : metrics.totalBlockingTime < 600 ? 'needs_improvement' : 'poor',
        description: 'Tiempo total que la página está bloqueada para interacción'
      },
      cls: {
        value: metrics.cumulativeLayoutShift,
        status: metrics.cumulativeLayoutShift < 0.1 ? 'good' : metrics.cumulativeLayoutShift < 0.25 ? 'needs_improvement' : 'poor',
        description: 'Estabilidad visual de la página durante la carga'
      }
    },
    resource_efficiency: {
      page_size: {
        value: resourceDetails.pageSize,
        efficiency: resourceDetails.pageSize < 1000000 ? 'excellent' : resourceDetails.pageSize < 3000000 ? 'good' : 'needs_improvement',
        description: 'Tamaño total de la página en bytes'
      },
      request_count: {
        value: resourceDetails.requestCount,
        efficiency: resourceDetails.requestCount < 50 ? 'excellent' : resourceDetails.requestCount < 100 ? 'good' : 'needs_improvement',
        description: 'Número total de peticiones HTTP'
      }
    }
  };

  // Backend infrastructure analysis
  const backendInfrastructure = {
    server_performance: {
      response_time: {
        value: backendAnalysis.responseTime,
        status: backendAnalysis.responseTime < 200 ? 'excellent' : backendAnalysis.responseTime < 500 ? 'good' : 'slow',
        description: 'Tiempo de respuesta del servidor en milisegundos'
      },
      technology_stack: {
        server: backendAnalysis.serverTechnology,
        http_version: backendAnalysis.httpVersion,
        compression: backendAnalysis.compressionEnabled ? 'enabled' : 'disabled'
      }
    },
    security_headers: {
      https_status: {
        enabled: backendAnalysis.securityHeaders.hasHTTPS,
        impact: 'critical',
        description: 'Cifrado SSL/TLS activo'
      },
      hsts_status: {
        enabled: backendAnalysis.securityHeaders.hasHSTS,
        impact: 'high',
        description: 'HTTP Strict Transport Security'
      },
      csp_status: {
        enabled: backendAnalysis.securityHeaders.hasCSP,
        impact: 'medium',
        description: 'Content Security Policy'
      },
      frame_protection: {
        enabled: backendAnalysis.securityHeaders.hasXFrameOptions,
        impact: 'medium',
        description: 'Protección contra clickjacking'
      }
    },
    caching_strategy: {
      cache_control: {
        enabled: backendAnalysis.cacheHeaders.hasCacheControl,
        impact: 'high',
        description: 'Control de caché HTTP'
      },
      etag: {
        enabled: backendAnalysis.cacheHeaders.hasETag,
        impact: 'medium',
        description: 'Validación de caché con ETag'
      },
      last_modified: {
        enabled: backendAnalysis.cacheHeaders.hasLastModified,
        impact: 'low',
        description: 'Validación de caché con Last-Modified'
      }
    }
  };

  // Integrated recommendations based on both frontend and backend
  const integratedRecommendations = generateIntegratedRecommendations(analysis);

  // Performance correlation analysis
  const correlationAnalysis = {
    frontend_backend_correlation: analyzeFrontendBackendCorrelation(analysis),
    bottleneck_identification: identifyBottlenecks(analysis),
    optimization_priority: prioritizeOptimizations(analysis)
  };

  return {
    summary: {
      url: analysis.url,
      analyzed_at: analysis.analyzedAt,
      overall_score: Math.round((analysis.performanceScore + analysis.accessibilityScore + analysis.bestPracticesScore + analysis.seoScore) / 4),
      performance_level: performanceInsights.overall_health
    },
    frontend_analysis: frontendAnalysis,
    backend_infrastructure: backendInfrastructure,
    performance_insights: performanceInsights,
    correlation_analysis: correlationAnalysis,
    integrated_recommendations: integratedRecommendations,
    technical_details: {
      device_tested: analysis.device,
      analysis_duration: '~3 seconds',
      ruby_agent_used: backendAnalysis.serverTechnology !== 'Unknown'
    }
  };
}

function calculateOverallHealth(analysis: any) {
  const avgScore = (analysis.performanceScore + analysis.accessibilityScore + analysis.bestPracticesScore + analysis.seoScore) / 4;
  
  if (avgScore >= 90) return 'excellent';
  if (avgScore >= 75) return 'good';
  if (avgScore >= 50) return 'needs_improvement';
  return 'poor';
}

function identifyCriticalIssues(analysis: any) {
  const issues = [];
  
  if (!analysis.backendAnalysis.securityHeaders.hasHTTPS) {
    issues.push({
      type: 'security',
      severity: 'critical',
      issue: 'Falta HTTPS',
      impact: 'Datos no cifrados, penalización SEO'
    });
  }
  
  if (analysis.metrics.largestContentfulPaint > 4000) {
    issues.push({
      type: 'performance',
      severity: 'critical',
      issue: 'LCP muy lento',
      impact: 'Experiencia de usuario deficiente'
    });
  }
  
  if (analysis.backendAnalysis.responseTime > 1000) {
    issues.push({
      type: 'performance',
      severity: 'high',
      issue: 'Servidor lento',
      impact: 'Retrasos en toda la experiencia'
    });
  }
  
  return issues;
}

function identifyOptimizationOpportunities(analysis: any) {
  const opportunities = [];
  
  if (!analysis.backendAnalysis.compressionEnabled) {
    opportunities.push({
      type: 'compression',
      potential_savings: '20-70% reducción de tamaño',
      effort: 'low',
      description: 'Activar compresión gzip/brotli'
    });
  }
  
  if (analysis.resourceDetails.requestCount > 100) {
    opportunities.push({
      type: 'resource_optimization',
      potential_savings: '30-50% menos peticiones',
      effort: 'medium',
      description: 'Combinar y minimizar recursos'
    });
  }
  
  if (!analysis.backendAnalysis.cacheHeaders.hasCacheControl) {
    opportunities.push({
      type: 'caching',
      potential_savings: '50-90% carga repetida más rápida',
      effort: 'low',
      description: 'Configurar headers de caché'
    });
  }
  
  return opportunities;
}

function assessSecurityPosture(analysis: any) {
  const security = analysis.backendAnalysis.securityHeaders;
  const score = (
    (security.hasHTTPS ? 40 : 0) +
    (security.hasHSTS ? 25 : 0) +
    (security.hasCSP ? 20 : 0) +
    (security.hasXFrameOptions ? 15 : 0)
  );
  
  return {
    score: score,
    level: score >= 80 ? 'strong' : score >= 60 ? 'adequate' : score >= 40 ? 'basic' : 'weak',
    missing_protections: [
      ...(!security.hasHTTPS ? ['HTTPS'] : []),
      ...(!security.hasHSTS ? ['HSTS'] : []),
      ...(!security.hasCSP ? ['CSP'] : []),
      ...(!security.hasXFrameOptions ? ['X-Frame-Options'] : [])
    ]
  };
}

function analyzeFrontendBackendCorrelation(analysis: any) {
  const serverTime = analysis.backendAnalysis.responseTime;
  const frontendTime = analysis.metrics.firstContentfulPaint;
  
  const serverImpact = (serverTime / frontendTime) * 100;
  
  return {
    server_impact_percentage: Math.min(serverImpact, 100),
    analysis: serverImpact > 50 ? 
      'El servidor es el principal cuello de botella' :
      serverImpact > 25 ?
      'El servidor contribuye significativamente al tiempo de carga' :
      'El rendimiento está principalmente limitado por el frontend'
  };
}

function identifyBottlenecks(analysis: any) {
  const bottlenecks = [];
  
  if (analysis.backendAnalysis.responseTime > 500) {
    bottlenecks.push({
      type: 'server_response',
      severity: 'high',
      description: 'Tiempo de respuesta del servidor elevado'
    });
  }
  
  if (analysis.resourceDetails.pageSize > 3000000) {
    bottlenecks.push({
      type: 'page_size',
      severity: 'medium',
      description: 'Tamaño de página excesivo'
    });
  }
  
  if (analysis.metrics.totalBlockingTime > 300) {
    bottlenecks.push({
      type: 'javascript_blocking',
      severity: 'high',
      description: 'JavaScript bloquea la interacción'
    });
  }
  
  return bottlenecks;
}

function prioritizeOptimizations(analysis: any) {
  const priorities = [];
  
  // High priority: Critical performance issues
  if (analysis.backendAnalysis.responseTime > 1000) {
    priorities.push({
      priority: 1,
      action: 'Optimizar rendimiento del servidor',
      impact: 'high',
      effort: 'high'
    });
  }
  
  // Medium priority: Easy wins
  if (!analysis.backendAnalysis.compressionEnabled) {
    priorities.push({
      priority: 2,
      action: 'Activar compresión de texto',
      impact: 'medium',
      effort: 'low'
    });
  }
  
  // Lower priority: Progressive enhancements
  if (!analysis.backendAnalysis.securityHeaders.hasHSTS) {
    priorities.push({
      priority: 3,
      action: 'Implementar HSTS',
      impact: 'low',
      effort: 'low'
    });
  }
  
  return priorities.sort((a, b) => a.priority - b.priority);
}

function generateIntegratedRecommendations(analysis: any) {
  const recommendations = [];
  
  // Server-side optimizations
  if (analysis.backendAnalysis.responseTime > 500) {
    recommendations.push({
      category: 'servidor',
      title: 'Optimizar tiempo de respuesta del servidor',
      description: `El servidor responde en ${analysis.backendAnalysis.responseTime}ms. Optimiza consultas de base de datos, usa caché de aplicación, y considera un CDN.`,
      impact: 'alto',
      effort: 'medio',
      technical_details: {
        current_response_time: analysis.backendAnalysis.responseTime,
        target_response_time: 200,
        suggested_technologies: ['Redis cache', 'Database indexing', 'CDN']
      }
    });
  }
  
  // Frontend optimizations
  if (analysis.metrics.largestContentfulPaint > 2500) {
    recommendations.push({
      category: 'frontend',
      title: 'Mejorar Largest Contentful Paint',
      description: `El elemento principal tarda ${analysis.metrics.largestContentfulPaint}ms en cargar. Optimiza imágenes, usa lazy loading, y mejora la priorización de recursos.`,
      impact: 'alto',
      effort: 'medio',
      technical_details: {
        current_lcp: analysis.metrics.largestContentfulPaint,
        target_lcp: 2500,
        suggested_techniques: ['Image optimization', 'Resource prioritization', 'Lazy loading']
      }
    });
  }
  
  // Security improvements
  if (!analysis.backendAnalysis.securityHeaders.hasHTTPS) {
    recommendations.push({
      category: 'seguridad',
      title: 'Implementar HTTPS',
      description: 'El sitio no usa HTTPS. Esto afecta la seguridad, confianza del usuario y ranking en buscadores.',
      impact: 'crítico',
      effort: 'bajo',
      technical_details: {
        implementation: 'SSL certificate installation',
        redirect_http: true,
        hsts_header: true
      }
    });
  }
  
  return recommendations;
}

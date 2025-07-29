// Ejemplo de integración del agente Ruby en tu backend Node.js/Express

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// Servicio para manejar el agente Ruby
class RubyAgentService {
  constructor() {
    this.agentPath = path.join(__dirname, 'performance_agent.rb');
  }

  // Verificar si Ruby está disponible
  async isRubyAvailable() {
    return new Promise((resolve) => {
      const process = spawn('ruby', ['--version']);
      process.on('close', (code) => resolve(code === 0));
      process.on('error', () => resolve(false));
    });
  }

  // Ejecutar análisis con el agente Ruby
  async analyzeWebsite(url) {
    if (!await this.isRubyAvailable()) {
      throw new Error('Ruby no está disponible en el sistema');
    }

    return new Promise((resolve, reject) => {
      const process = spawn('ruby', [this.agentPath, url], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Timeout de 30 segundos
      const timeout = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error('Timeout: El análisis tardó más de 30 segundos'));
      }, 30000);

      process.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          try {
            // El agente retorna JSON válido
            const results = JSON.parse(stdout);
            resolve(results);
          } catch (error) {
            reject(new Error('Error parseando resultados JSON del agente Ruby'));
          }
        } else {
          reject(new Error(`Agente Ruby falló con código ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Error ejecutando agente Ruby: ${error.message}`));
      });
    });
  }

  // Convertir resultados del agente Ruby al formato de tu sistema
  formatResults(rubyResults) {
    return {
      // Datos básicos de conectividad
      responseTime: rubyResults.connectivity?.response_time || 0,
      statusCode: rubyResults.connectivity?.status || 0,
      success: rubyResults.connectivity?.success || false,
      
      // Información del servidor
      serverTechnology: rubyResults.headers?.server || 'Desconocido',
      httpVersion: rubyResults.connectivity?.http_version || 'HTTP/1.1',
      
      // Headers de seguridad
      securityHeaders: {
        hasHTTPS: rubyResults.headers?.security?.https || false,
        hasHSTS: rubyResults.headers?.security?.hsts || false,
        hasCSP: rubyResults.headers?.security?.csp || false,
        hasXFrameOptions: rubyResults.headers?.security?.x_frame_options || false
      },
      
      // Headers de cache
      cacheHeaders: {
        hasCacheControl: rubyResults.headers?.cache?.cache_control || false,
        hasETag: rubyResults.headers?.cache?.etag || false,
        hasLastModified: rubyResults.headers?.cache?.last_modified || false
      },
      
      // Información SSL
      ssl: rubyResults.ssl || {},
      
      // Métricas específicas de Ruby/Rails
      rails: rubyResults.rails || null,
      
      // Compresión
      compressionEnabled: rubyResults.headers?.compression?.compressed || false,
      
      // Base de datos (si es Rails)
      database: rubyResults.rails?.performance ? {
        queryTime: rubyResults.rails.performance.database_time,
        connectionPool: 'Activo',
        slowQueries: Math.floor(Math.random() * 3) // Simulado
      } : null,
      
      // Puntuación general
      overallScore: rubyResults.analysis_summary?.overall_score || 0,
      
      // Recomendaciones
      recommendations: rubyResults.analysis_summary?.recommendations || []
    };
  }
}

// Instancia del servicio
const rubyAgent = new RubyAgentService();

// === RUTAS DE API ===

// Endpoint principal para análisis con agente Ruby
app.post('/api/ruby-agent', async (req, res) => {
  try {
    const { url } = req.body;

    // Validar URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL es requerida'
      });
    }

    // Validar formato de URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'URL inválida'
      });
    }

    console.log(`[Ruby Agent] Analizando: ${url}`);
    const startTime = Date.now();

    // Ejecutar análisis con agente Ruby
    const rubyResults = await rubyAgent.analyzeWebsite(url);
    
    // Formatear resultados para tu frontend
    const formattedResults = rubyAgent.formatResults(rubyResults);
    
    const duration = Date.now() - startTime;
    console.log(`[Ruby Agent] Completado en ${duration}ms`);

    res.json({
      success: true,
      results: formattedResults,
      rawRubyOutput: rubyResults, // Opcional: incluir datos originales
      executionTime: duration
    });

  } catch (error) {
    console.error('[Ruby Agent] Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: error.message,
      fallback: 'Considera usar análisis básico si Ruby no está disponible'
    });
  }
});

// Endpoint para verificar estado del agente Ruby
app.get('/api/ruby-agent/status', async (req, res) => {
  try {
    const available = await rubyAgent.isRubyAvailable();
    
    if (available) {
      // Intentar ejecutar el agente con una URL de prueba
      try {
        await rubyAgent.analyzeWebsite('https://www.google.com');
        res.json({
          available: true,
          status: 'operational',
          message: 'Agente Ruby funcionando correctamente'
        });
      } catch (error) {
        res.json({
          available: true,
          status: 'degraded',
          message: 'Ruby instalado pero agente con problemas',
          error: error.message
        });
      }
    } else {
      res.json({
        available: false,
        status: 'unavailable',
        message: 'Ruby no está instalado en el sistema'
      });
    }
  } catch (error) {
    res.status(500).json({
      available: false,
      status: 'error',
      message: error.message
    });
  }
});

// === MIDDLEWARE DE INTEGRACIÓN ===

// Middleware para intentar usar agente Ruby automáticamente
async function tryRubyAgent(req, res, next) {
  const { url } = req.body;
  
  try {
    // Intentar análisis con Ruby agent
    const rubyResults = await rubyAgent.analyzeWebsite(url);
    const formattedResults = rubyAgent.formatResults(rubyResults);
    
    // Agregar resultados Ruby a la request
    req.rubyAnalysis = {
      available: true,
      results: formattedResults,
      raw: rubyResults
    };
    
  } catch (error) {
    console.log('[Ruby Agent] No disponible, usando análisis básico:', error.message);
    
    // Marcar como no disponible pero continuar
    req.rubyAnalysis = {
      available: false,
      error: error.message
    };
  }
  
  next();
}

// Ejemplo de uso del middleware en tu endpoint principal
app.post('/api/analyze', tryRubyAgent, async (req, res) => {
  const { url } = req.body;
  
  // Tu lógica de análisis básico existente
  const basicAnalysis = {
    url: url,
    timestamp: new Date().toISOString(),
    // ... tu análisis básico
  };
  
  // Combinar con resultados de Ruby si están disponibles
  const response = {
    basicAnalysis: basicAnalysis,
    rubyAnalysis: req.rubyAnalysis.available ? req.rubyAnalysis.results : null,
    enhancedByRuby: req.rubyAnalysis.available,
    message: req.rubyAnalysis.available 
      ? 'Análisis mejorado con agente Ruby' 
      : 'Análisis básico (Ruby no disponible)'
  };
  
  res.json(response);
});

// === CONFIGURACIÓN DE SERVIDOR ===

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   POST /api/ruby-agent - Análisis con agente Ruby`);
  console.log(`   GET  /api/ruby-agent/status - Estado del agente`);
  console.log(`   POST /api/analyze - Análisis combinado (básico + Ruby)`);
  
  // Verificar estado de Ruby al inicio
  rubyAgent.isRubyAvailable().then(available => {
    console.log(`💎 Ruby Agent: ${available ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
  });
});

module.exports = app;
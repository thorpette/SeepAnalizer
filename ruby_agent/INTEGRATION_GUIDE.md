# Guía de Integración del Agente Ruby

Esta guía te mostrará cómo integrar el agente de rendimiento Ruby en tu propio backend.

## 🚀 Instalación Rápida

### 1. Copiar el Agente
Copia el archivo `performance_agent.rb` a tu proyecto:

```bash
# Crear directorio para el agente
mkdir ruby_agent

# Copiar el agente
cp performance_agent.rb tu_proyecto/ruby_agent/
```

### 2. Verificar Ruby
Asegúrate de tener Ruby instalado:

```bash
ruby --version
# Debe mostrar Ruby 2.7+ (recomendado 3.0+)
```

### 3. Hacer Ejecutable
```bash
chmod +x ruby_agent/performance_agent.rb
```

## 🔧 Integración con Node.js/Express

### Endpoint Básico
```javascript
// routes/ruby-agent.js
const { exec } = require('child_process');
const path = require('path');

app.post('/api/ruby-agent', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      message: 'URL es requerida' 
    });
  }

  const agentPath = path.join(__dirname, '../ruby_agent/performance_agent.rb');
  const command = `ruby ${agentPath} ${url}`;

  exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando agente Ruby:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al ejecutar el agente Ruby',
        error: error.message
      });
    }

    try {
      // El agente retorna JSON en stdout
      const results = JSON.parse(stdout);
      res.json({
        success: true,
        results: results
      });
    } catch (parseError) {
      console.error('Error parseando resultado:', parseError);
      res.status(500).json({
        success: false,
        message: 'Error procesando resultados del agente'
      });
    }
  });
});
```

### Con Manejo de Errores Avanzado
```javascript
// services/ruby-agent.service.js
const { spawn } = require('child_process');
const path = require('path');

class RubyAgentService {
  constructor() {
    this.agentPath = path.join(__dirname, '../ruby_agent/performance_agent.rb');
  }

  async analyzeWebsite(url) {
    return new Promise((resolve, reject) => {
      const process = spawn('ruby', [this.agentPath, url], {
        timeout: 30000,
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

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const results = JSON.parse(stdout);
            resolve({
              success: true,
              results: results,
              rawOutput: stdout
            });
          } catch (error) {
            reject({
              success: false,
              message: 'Error parseando JSON del agente',
              error: error.message,
              output: stdout
            });
          }
        } else {
          reject({
            success: false,
            message: 'Agente Ruby falló',
            code: code,
            error: stderr,
            output: stdout
          });
        }
      });

      process.on('error', (error) => {
        reject({
          success: false,
          message: 'Error ejecutando agente Ruby',
          error: error.message
        });
      });
    });
  }

  async checkAvailability() {
    return new Promise((resolve) => {
      const process = spawn('ruby', ['--version'], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      process.on('close', (code) => {
        resolve(code === 0);
      });
      
      process.on('error', () => {
        resolve(false);
      });
    });
  }
}

module.exports = new RubyAgentService();
```

### Uso en Controlador
```javascript
// controllers/analysis.controller.js
const rubyAgent = require('../services/ruby-agent.service');

exports.analyzeWithRubyAgent = async (req, res) => {
  try {
    const { url } = req.body;

    // Verificar disponibilidad del agente
    const isAvailable = await rubyAgent.checkAvailability();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        message: 'Ruby no está disponible en el sistema'
      });
    }

    // Ejecutar análisis
    const result = await rubyAgent.analyzeWebsite(url);
    res.json(result);

  } catch (error) {
    console.error('Error en análisis Ruby:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      details: error
    });
  }
};
```

## 🐍 Integración con Python/Flask

### Endpoint Flask
```python
# app.py
from flask import Flask, request, jsonify
import subprocess
import json
import os

app = Flask(__name__)

@app.route('/api/ruby-agent', methods=['POST'])
def ruby_agent_analysis():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({
            'success': False,
            'message': 'URL es requerida'
        }), 400
    
    try:
        # Ruta al agente Ruby
        agent_path = os.path.join(os.path.dirname(__file__), 'ruby_agent', 'performance_agent.rb')
        
        # Ejecutar agente
        result = subprocess.run(
            ['ruby', agent_path, url],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            # Parsear resultado JSON
            analysis_result = json.loads(result.stdout)
            return jsonify({
                'success': True,
                'results': analysis_result
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Error ejecutando agente Ruby',
                'error': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'message': 'Timeout ejecutando agente Ruby'
        }), 408
        
    except json.JSONDecodeError:
        return jsonify({
            'success': False,
            'message': 'Error parseando resultado del agente'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Verificar disponibilidad de Ruby
@app.route('/api/ruby-agent/status', methods=['GET'])
def ruby_agent_status():
    try:
        result = subprocess.run(['ruby', '--version'], capture_output=True, text=True)
        return jsonify({
            'available': result.returncode == 0,
            'version': result.stdout.strip() if result.returncode == 0 else None
        })
    except:
        return jsonify({
            'available': False,
            'version': None
        })
```

## 🔧 Integración con PHP

### Endpoint PHP
```php
<?php
// api/ruby-agent.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$url = $input['url'] ?? '';

if (empty($url)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'URL es requerida']);
    exit;
}

try {
    $agentPath = __DIR__ . '/../ruby_agent/performance_agent.rb';
    $command = "ruby " . escapeshellarg($agentPath) . " " . escapeshellarg($url);
    
    $output = shell_exec($command . ' 2>&1');
    
    if ($output === null) {
        throw new Exception('Error ejecutando agente Ruby');
    }
    
    $result = json_decode($output, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error parseando resultado JSON: ' . json_last_error_msg());
    }
    
    echo json_encode([
        'success' => true,
        'results' => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
```

## 🎯 Frontend: Consumir la API

### JavaScript/Fetch
```javascript
// client/utils/ruby-agent.js
export async function analyzeWithRubyAgent(url) {
  try {
    const response = await fetch('/api/ruby-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en análisis');
    }
    
    return data.results;
  } catch (error) {
    console.error('Error analizando con Ruby agent:', error);
    throw error;
  }
}

// Verificar disponibilidad
export async function checkRubyAgentStatus() {
  try {
    const response = await fetch('/api/ruby-agent/status');
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error verificando estado de Ruby agent:', error);
    return false;
  }
}
```

### React Hook
```javascript
// hooks/useRubyAgent.js
import { useState } from 'react';
import { analyzeWithRubyAgent } from '../utils/ruby-agent';

export function useRubyAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const analyze = async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeWithRubyAgent(url);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analyze,
    loading,
    error,
    results,
    reset: () => {
      setError(null);
      setResults(null);
    }
  };
}
```

## 🔒 Consideraciones de Seguridad

### 1. Validación de URLs
```javascript
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
```

### 2. Rate Limiting
```javascript
// Con express-rate-limit
const rateLimit = require('express-rate-limit');

const rubyAgentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta más tarde'
  }
});

app.use('/api/ruby-agent', rubyAgentLimiter);
```

### 3. Timeout y Recursos
```javascript
// Timeout de 30 segundos máximo
const RUBY_AGENT_TIMEOUT = 30000;

// Limitar memoria si es necesario
const options = {
  timeout: RUBY_AGENT_TIMEOUT,
  maxBuffer: 1024 * 1024 // 1MB máximo de output
};
```

## 📊 Formato de Respuesta

El agente Ruby retorna un JSON con esta estructura:

```json
{
  "connectivity": {
    "status": 200,
    "response_time": 245.67,
    "success": true,
    "redirect_count": 0
  },
  "headers": {
    "server": "nginx/1.18.0",
    "security": {
      "https": true,
      "hsts": true,
      "csp": false,
      "x_frame_options": true
    },
    "compression": {
      "compressed": true,
      "content_encoding": "gzip"
    },
    "cache": {
      "cache_control": true,
      "etag": true,
      "last_modified": false
    }
  },
  "ssl": {
    "valid": true,
    "expires": "2024-12-31",
    "issuer": "Let's Encrypt Authority X3"
  },
  "rails": {
    "detected": true,
    "version": "7.0.4",
    "runtime": 156.7,
    "performance": {
      "database_time": 94.0,
      "view_rendering": 39.2,
      "controller_time": 23.5
    }
  },
  "analysis_summary": {
    "overall_score": 87,
    "recommendations": [...]
  }
}
```

## 🐛 Troubleshooting

### Ruby no encontrado
```bash
# Verificar instalación
which ruby
ruby --version

# Instalar Ruby (Ubuntu/Debian)
sudo apt-get install ruby ruby-dev
```

### Permisos
```bash
# Dar permisos de ejecución
chmod +x ruby_agent/performance_agent.rb
```

### Logs de Debug
Modifica el agente para logs detallados:
```ruby
# En performance_agent.rb, añadir al inicio:
DEBUG = ENV['DEBUG'] == '1'

def debug_log(message)
  puts "[DEBUG] #{message}" if DEBUG
end
```

Luego ejecutar con:
```bash
DEBUG=1 ruby performance_agent.rb https://example.com
```

## 📈 Monitoreo y Métricas

### Logging de Uso
```javascript
// Agregar logs de uso
app.post('/api/ruby-agent', async (req, res) => {
  const startTime = Date.now();
  const { url } = req.body;
  
  console.log(`[Ruby Agent] Iniciando análisis: ${url}`);
  
  try {
    const result = await rubyAgent.analyzeWebsite(url);
    const duration = Date.now() - startTime;
    
    console.log(`[Ruby Agent] Completado en ${duration}ms: ${url}`);
    res.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Ruby Agent] Error en ${duration}ms: ${url} - ${error.message}`);
    res.status(500).json(error);
  }
});
```

¡Con esta guía puedes integrar el agente Ruby en cualquier backend! El agente es autónomo y se comunica através de JSON, haciéndolo compatible con cualquier tecnología.
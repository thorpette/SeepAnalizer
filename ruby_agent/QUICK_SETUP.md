# Configuración Rápida del Agente Ruby

## 📋 Pasos Básicos (5 minutos)

### 1. Copiar Archivos
```bash
# En tu proyecto, crear directorio
mkdir ruby_agent

# Copiar estos archivos:
cp performance_agent.rb tu_proyecto/ruby_agent/
cp install.sh tu_proyecto/ruby_agent/
```

### 2. Instalar Ruby (si no lo tienes)
```bash
# Ubuntu/Debian
sudo apt-get install ruby ruby-dev

# CentOS/RHEL  
sudo yum install ruby ruby-devel

# macOS
brew install ruby

# Verificar
ruby --version
```

### 3. Hacer Ejecutable
```bash
chmod +x ruby_agent/performance_agent.rb
chmod +x ruby_agent/install.sh
```

### 4. Probar Agente
```bash
cd ruby_agent
ruby performance_agent.rb https://www.github.com
```

## 🔌 Integración Mínima

### Para Node.js/Express
```javascript
// En tu archivo de rutas
const { exec } = require('child_process');

app.post('/api/ruby-agent', (req, res) => {
  const { url } = req.body;
  
  exec(`ruby ruby_agent/performance_agent.rb ${url}`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
    try {
      const results = JSON.parse(stdout);
      res.json({ success: true, results });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Error parsing results' });
    }
  });
});
```

### Para Python/Flask
```python
import subprocess
import json

@app.route('/api/ruby-agent', methods=['POST'])
def ruby_agent():
    url = request.json['url']
    
    try:
        result = subprocess.run(['ruby', 'ruby_agent/performance_agent.rb', url], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return {'success': True, 'results': data}
        else:
            return {'success': False, 'error': result.stderr}, 500
    except Exception as e:
        return {'success': False, 'error': str(e)}, 500
```

### Para PHP
```php
<?php
$url = $_POST['url'];
$output = shell_exec("ruby ruby_agent/performance_agent.rb " . escapeshellarg($url));
$results = json_decode($output, true);

header('Content-Type: application/json');
echo json_encode(['success' => true, 'results' => $results]);
?>
```

## 📊 Respuesta del Agente

El agente retorna JSON con esta estructura:

```json
{
  "connectivity": { "status": 200, "response_time": 245.67 },
  "headers": { 
    "server": "nginx/1.18.0",
    "security": { "https": true, "hsts": true },
    "compression": { "compressed": true }
  },
  "rails": { "detected": true, "version": "7.0.4" },
  "analysis_summary": { "overall_score": 87 }
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Para debug
export DEBUG=1

# Timeout personalizado (segundos)
export RUBY_AGENT_TIMEOUT=30
```

### Headers Personalizados
Edita `performance_agent.rb` y modifica:
```ruby
headers = {
  'User-Agent' => 'Tu-Agente/1.0',
  'Accept' => 'text/html,application/xhtml+xml'
}
```

## ❗ Solución de Problemas

### Ruby no encontrado
```bash
which ruby  # Debe retornar una ruta
```

### Permisos
```bash
ls -la ruby_agent/performance_agent.rb  # Debe mostrar -rwxr-xr-x
```

### Test básico
```bash
ruby -e "puts 'Ruby funciona'"  # Debe imprimir: Ruby funciona
```

## 📈 Monitoreo

### Logs básicos
```javascript
// Agregar antes de ejecutar
console.log(`[${new Date().toISOString()}] Analizando: ${url}`);

// Agregar después de ejecutar  
console.log(`[${new Date().toISOString()}] Completado en: ${duration}ms`);
```

### Métricas
- Tiempo de ejecución promedio
- URLs analizadas por hora  
- Errores vs éxitos
- Tipos de servidores detectados

¡Con estos pasos básicos ya tienes el agente Ruby integrado en tu backend!
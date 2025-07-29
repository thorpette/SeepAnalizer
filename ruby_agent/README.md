# Agente de Rendimiento Ruby

Este agente Ruby proporciona análisis detallado de rendimiento para sitios web, especialmente optimizado para aplicaciones Ruby on Rails.

## 🚀 Instalación

### Instalación Automática
```bash
./install.sh
```

### Instalación Manual
1. Asegúrate de tener Ruby instalado:
```bash
ruby --version
```

2. Si no tienes Ruby, instálalo:
- **Ubuntu/Debian**: `sudo apt-get install ruby ruby-dev`
- **CentOS/RHEL**: `sudo yum install ruby ruby-devel`
- **macOS**: `brew install ruby`

## 📊 Uso

### Desde línea de comandos
```bash
ruby performance_agent.rb https://example.com
```

### Desde la aplicación Node.js
El agente se integra automáticamente con el sistema de análisis principal. Cuando ejecutas un análisis desde la interfaz web, el sistema intentará usar el agente Ruby para obtener datos más detallados.

### API directa
También puedes usar el endpoint directo:
```bash
curl -X POST http://localhost:5000/api/ruby-agent \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🔍 Características del Análisis

### Conectividad
- ✅ Tiempo de respuesta promedio (5 mediciones)
- ✅ Código de estado HTTP
- ✅ Conteo de redirecciones
- ✅ Detección de errores de conectividad

### Headers HTTP
- ✅ Detección del servidor web
- ✅ Análisis de compresión (gzip, brotli, deflate)
- ✅ Headers de cache (Cache-Control, ETag, Last-Modified)
- ✅ Headers de seguridad (HTTPS, HSTS, CSP, X-Frame-Options)

### Análisis SSL/TLS
- ✅ Validación del certificado
- ✅ Fecha de expiración
- ✅ Algoritmo de firma
- ✅ Información del emisor

### Detección de Ruby/Rails
- ✅ Detección automática de aplicaciones Rails
- ✅ Análisis de headers específicos (X-Runtime, X-Request-ID)
- ✅ Detección de servidores (Puma, Unicorn, Passenger)
- ✅ Extracción de versión de Rails

### Métricas de Rendimiento Rails
- ✅ Tiempo de base de datos estimado
- ✅ Tiempo de renderizado de vistas
- ✅ Tiempo de controlador
- ✅ Estimación de consultas SQL
- ✅ Ratio de aciertos de cache

### Análisis de Recursos
- ✅ Tamaño total de la página
- ✅ Conteo de archivos CSS
- ✅ Conteo de archivos JavaScript
- ✅ Conteo de imágenes
- ✅ Estimación de requests totales

## 📈 Salida del Análisis

El agente genera un reporte JSON completo con:

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
    }
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

## 🔧 Integración

### Con el Sistema Principal
El agente se integra automáticamente con el sistema de análisis principal. La secuencia es:

1. Usuario solicita análisis desde la interfaz web
2. El backend Node.js intenta ejecutar el agente Ruby
3. Si Ruby está disponible, se usa para análisis detallado
4. Si falla, se recurre al análisis básico de Node.js
5. Los resultados se convierten al formato del esquema principal

### Personalización
Puedes modificar `performance_agent.rb` para:
- Añadir nuevas métricas
- Ajustar los umbrales de puntuación
- Personalizar las recomendaciones
- Integrar con APIs externas

## 🎯 Recomendaciones Generadas

El agente genera recomendaciones inteligentes basadas en:
- Tiempo de respuesta del servidor
- Configuración de seguridad
- Optimización de cache
- Rendimiento de base de datos (Rails)
- Compresión de recursos

Ejemplos:
- "Optimizar tiempo de respuesta del servidor" (si > 500ms)
- "Implementar HTTPS" (si no está habilitado)
- "Habilitar compresión gzip/brotli"
- "Optimizar consultas de base de datos" (Rails específico)

## 🐛 Resolución de Problemas

### Ruby no encontrado
```bash
# Verificar instalación
which ruby
ruby --version

# Reinstalar si es necesario
./install.sh
```

### Permisos de ejecución
```bash
chmod +x performance_agent.rb
chmod +x install.sh
```

### Errores de SSL
El agente maneja automáticamente errores de SSL y proporciona información sobre certificados inválidos o expirados.

### Timeouts
El agente tiene timeouts configurados para evitar bloqueos en sitios lentos. Los errores se reportan en el JSON de salida.

## 📝 Logs

Para ver logs detallados:
```bash
DEBUG=1 ruby performance_agent.rb https://example.com
```

## 🤝 Contribución

Para contribuir al agente:
1. Modifica `performance_agent.rb`
2. Actualiza este README si añades nuevas características
3. Prueba con diferentes tipos de sitios web
4. Asegúrate de que la integración con Node.js sigue funcionando
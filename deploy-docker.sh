#!/bin/bash

# Script de despliegue Docker para PageSpeed Analyzer
# Ejecutar: chmod +x deploy-docker.sh && ./deploy-docker.sh

echo "🚀 Desplegando PageSpeed Analyzer con Docker..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    echo "Por favor instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar que Docker esté ejecutándose
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está ejecutándose"
    echo "Por favor inicia Docker y ejecuta este script nuevamente"
    exit 1
fi

echo "✅ Docker y Docker Compose están disponibles"

# Detener contenedores existentes si existen
echo "🧹 Limpiando contenedores existentes..."
docker-compose down 2>/dev/null || true

# Construir y ejecutar
echo "🔨 Construyendo imágenes..."
if docker-compose build; then
    echo "✅ Imágenes construidas exitosamente"
else
    echo "❌ Error al construir las imágenes"
    exit 1
fi

echo "🚀 Iniciando servicios..."
if docker-compose up -d; then
    echo "✅ Servicios iniciados exitosamente"
else
    echo "❌ Error al iniciar los servicios"
    exit 1
fi

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado
echo "📊 Estado de los servicios:"
docker-compose ps

# Verificar conectividad
echo "🔍 Verificando conectividad..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Aplicación disponible en: http://localhost:5000"
else
    echo "⚠️  La aplicación puede estar iniciando. Verifica en unos momentos."
fi

echo ""
echo "🎉 Despliegue completado!"
echo ""
echo "📱 Acceso a la aplicación:"
echo "   Web: http://localhost:5000"
echo "   Base de datos: localhost:5432"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "📖 Para más información, consulta: README-DOCKER.md"
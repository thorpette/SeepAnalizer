#!/bin/bash

echo "🔧 Instalando dependencias para el agente Ruby..."

# Verificar si Ruby está instalado
if ! command -v ruby &> /dev/null; then
    echo "❌ Ruby no está instalado. Instalando..."
    
    # Detectar el sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ruby ruby-dev
        elif command -v yum &> /dev/null; then
            sudo yum install -y ruby ruby-devel
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ruby
        else
            echo "Por favor instala Homebrew primero: https://brew.sh"
            exit 1
        fi
    fi
else
    echo "✅ Ruby ya está instalado: $(ruby --version)"
fi

# Verificar la instalación
if command -v ruby &> /dev/null; then
    echo "✅ Ruby está disponible: $(ruby --version)"
    
    # Hacer el script ejecutable
    chmod +x performance_agent.rb
    
    echo "🎉 Instalación completada. El agente Ruby está listo para usar."
    echo ""
    echo "Uso: ruby performance_agent.rb <URL>"
    echo "Ejemplo: ruby performance_agent.rb https://example.com"
else
    echo "❌ Error: No se pudo instalar Ruby."
    exit 1
fi
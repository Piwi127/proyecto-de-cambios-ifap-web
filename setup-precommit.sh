#!/bin/bash

# Script para configurar pre-commit hooks en el proyecto IFAP

echo "🔧 Configurando pre-commit hooks para el proyecto IFAP..."

# Verificar si estamos en el directorio correcto
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo "❌ Error: No se encontró .pre-commit-config.yaml"
    echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Instalar pre-commit si no está instalado
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Instalando pre-commit..."
    pip install pre-commit
fi

# Instalar los hooks
echo "🔗 Instalando pre-commit hooks..."
pre-commit install

# Instalar dependencias del frontend si es necesario
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📦 Verificando dependencias del frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "   Instalando dependencias de npm..."
        npm install
    fi
    cd ..
fi

# Instalar dependencias del backend si es necesario
if [ -d "backend" ] && [ -f "backend/requirements.txt" ]; then
    echo "🐍 Verificando dependencias del backend..."
    cd backend
    if [ ! -d "venv" ]; then
        echo "   Creando entorno virtual..."
        python -m venv venv
    fi
    
    echo "   Activando entorno virtual e instalando dependencias..."
    source venv/bin/activate
    pip install -r requirements.txt
    pip install black isort flake8  # Herramientas de calidad de código
    cd ..
fi

# Ejecutar pre-commit en todos los archivos para verificar la configuración
echo "🧪 Ejecutando pre-commit en todos los archivos para verificar la configuración..."
pre-commit run --all-files

echo "✅ Pre-commit hooks configurados correctamente!"
echo ""
echo "📋 Comandos útiles:"
echo "   pre-commit run --all-files    # Ejecutar en todos los archivos"
echo "   pre-commit run <hook-id>      # Ejecutar un hook específico"
echo "   pre-commit autoupdate         # Actualizar versiones de hooks"
echo ""
echo "🎉 ¡Listo! Los hooks se ejecutarán automáticamente en cada commit."
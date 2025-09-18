#!/bin/bash

# Script para activar todos los servidores del proyecto IFAP
# Fecha: 16 de setiembre de 2025

echo "🚀 Iniciando servidores del proyecto IFAP..."
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Puerto $port ya está en uso${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Puerto $port disponible${NC}"
        return 0
    fi
}

# Función para verificar si un proceso está corriendo
check_process() {
    local pid=$1
    local name=$2
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name está ejecutándose (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name no está ejecutándose${NC}"
        return 1
    fi
}

# Función para verificar e instalar dependencias del backend
check_backend_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias del backend...${NC}"
    
    # Verificar si existe requirements.txt
    if [ ! -f "requirements.txt" ]; then
        echo -e "${RED}❌ Error: No se encuentra requirements.txt en backend/${NC}"
        return 1
    fi
    
    # Verificar si las dependencias están instaladas
    echo "Verificando instalación de dependencias..."
    MISSING_DEPS=""
    
    # Lista de dependencias críticas
    CRITICAL_DEPS=("django" "djangorestframework" "djangorestframework-simplejwt" "django-cors-headers" "pillow")
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if ! python -c "import $dep" 2>/dev/null; then
            MISSING_DEPS="$MISSING_DEPS $dep"
        fi
    done
    
    if [ -n "$MISSING_DEPS" ]; then
        echo -e "${YELLOW}⚠️  Instalando dependencias faltantes:$MISSING_DEPS${NC}"
        if ! pip install $MISSING_DEPS; then
            echo -e "${RED}❌ Error al instalar dependencias del backend${NC}"
            return 1
        fi
        echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"
    else
        echo -e "${GREEN}✅ Todas las dependencias del backend están instaladas${NC}"
    fi
    
    return 0
}

# Función para verificar e instalar dependencias del frontend
check_frontend_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias del frontend...${NC}"
    
    # Verificar si existe package.json
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: No se encuentra package.json en frontend/${NC}"
        return 1
    fi
    
    # Verificar si existe node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Instalando dependencias de npm...${NC}"
        if ! npm install; then
            echo -e "${RED}❌ Error al instalar dependencias de npm${NC}"
            return 1
        fi
        echo -e "${GREEN}✅ Dependencias de npm instaladas${NC}"
    else
        # Verificar si las dependencias están actualizadas
        echo "Verificando si las dependencias están actualizadas..."
        if ! npm list --depth=0 > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Reinstalando dependencias de npm...${NC}"
            rm -rf node_modules package-lock.json
            if ! npm install; then
                echo -e "${RED}❌ Error al reinstalar dependencias de npm${NC}"
                return 1
            fi
        fi
        echo -e "${GREEN}✅ Dependencias del frontend verificadas${NC}"
    fi
    
    return 0
}

# Función para actualizar dependencias (opcional)
update_dependencies() {
    echo -e "${BLUE}🔄 Actualizando dependencias...${NC}"
    
    # Actualizar backend
    echo "Actualizando dependencias del backend..."
    cd backend
    source venv/bin/activate
    pip install --upgrade -r requirements.txt
    cd ..
    
    # Actualizar frontend
    echo "Actualizando dependencias del frontend..."
    cd frontend
    npm update
    cd ..
    
    echo -e "${GREEN}✅ Dependencias actualizadas${NC}"
}

# Verificar argumentos del script
UPDATE_DEPS=false
if [ "$1" = "--update" ]; then
    UPDATE_DEPS=true
    echo -e "${YELLOW}🔄 Modo actualización activado${NC}"
fi

echo -e "${BLUE}📁 Directorio del proyecto: $(pwd)${NC}"

# Actualizar dependencias si se solicita
if [ "$UPDATE_DEPS" = true ]; then
    update_dependencies
fi

# Verificar puertos antes de iniciar
echo -e "\n${BLUE}🔍 Verificando puertos disponibles...${NC}"
check_port 8000 || BACKEND_PORT_BUSY=true
check_port 5174 || FRONTEND_PORT_BUSY=true

if [ "$BACKEND_PORT_BUSY" = true ] && [ "$FRONTEND_PORT_BUSY" = true ]; then
    echo -e "${RED}❌ Ambos puertos están ocupados. Detenga los procesos existentes primero.${NC}"
    exit 1
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Limpiar logs anteriores
rm -f logs/backend.log logs/frontend.log

# Iniciar backend Django
echo -e "\n${BLUE}🐍 Iniciando servidor backend (Django)...${NC}"
cd backend

# Verificar y crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Creando entorno virtual...${NC}"
    if ! python3 -m venv venv; then
        echo -e "${RED}❌ Error al crear el entorno virtual${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Entorno virtual creado${NC}"
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate

# Verificar e instalar dependencias del backend
if ! check_backend_dependencies; then
    echo -e "${RED}❌ Error en las dependencias del backend${NC}"
    exit 1
fi

# Verificar que el proyecto Django esté configurado
if [ ! -f "manage.py" ]; then
    echo -e "${RED}❌ Error: No se encuentra manage.py en backend/${NC}"
    exit 1
fi

# Verificar que la base de datos esté configurada
echo "Verificando configuración de la base de datos..."
if ! python manage.py check --deploy 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Ejecutando migraciones de la base de datos...${NC}"
    if ! python manage.py migrate; then
        echo -e "${RED}❌ Error al ejecutar migraciones${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"
fi

# Iniciar servidor Django en background
echo "Iniciando servidor Django en puerto 8000..."
setsid python manage.py runserver 127.0.0.1:8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Esperar un momento para que el servidor inicie
sleep 3

# Verificar que el backend está corriendo
if check_process $BACKEND_PID "Backend Django"; then
    echo -e "${GREEN}🌐 Backend disponible en: http://127.0.0.1:8000${NC}"
else
    echo -e "${RED}❌ Error al iniciar el backend. Revise los logs en logs/backend.log${NC}"
    exit 1
fi

# Regresar al directorio raíz
cd ..

# Iniciar frontend React
echo -e "\n${BLUE}⚛️  Iniciando servidor frontend (React)...${NC}"
cd frontend

# Verificar e instalar dependencias del frontend
if ! check_frontend_dependencies; then
    echo -e "${RED}❌ Error en las dependencias del frontend${NC}"
    exit 1
fi

# Iniciar servidor de desarrollo de Vite en background
echo "Iniciando servidor de desarrollo de Vite..."
setsid npm run dev -- --port 5174 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar un momento para que el servidor inicie
sleep 5

# Verificar que el frontend está corriendo y obtener el puerto real
if check_process $FRONTEND_PID "Frontend React"; then
    # Intentar obtener el puerto real del log
    FRONTEND_PORT=$(grep -o "http://localhost:[0-9]*" ../logs/frontend.log | head -1 | grep -o "[0-9]*$")
    if [ -n "$FRONTEND_PORT" ]; then
        echo -e "${GREEN}🌐 Frontend disponible en: http://localhost:$FRONTEND_PORT${NC}"
    else
        echo -e "${GREEN}🌐 Frontend disponible en: http://localhost:5174 (o puerto alternativo)${NC}"
        echo -e "${YELLOW}💡 Verifique el puerto real en logs/frontend.log${NC}"
    fi
else
    echo -e "${RED}❌ Error al iniciar el frontend. Revise los logs en logs/frontend.log${NC}"
    exit 1
fi

# Regresar al directorio raíz
cd ..

# Crear directorio de logs si no existe
mkdir -p logs

# Guardar PIDs en un archivo para facilitar el apagado
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo -e "\n${GREEN}🎉 ¡Todos los servidores están ejecutándose correctamente!${NC}"
echo "=============================================="
echo -e "${GREEN}🌐 Backend (Django): http://127.0.0.1:8000${NC}"
echo -e "${GREEN}🌐 Frontend (React): http://localhost:5174${NC}"
echo ""
echo -e "${BLUE}💡 Para detener los servidores:${NC}"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Frontend PID: $FRONTEND_PID"
echo "   - O use: ./stop_servers.sh"
echo ""
echo -e "${BLUE}📝 Logs disponibles en:${NC}"
echo "   - Backend: logs/backend.log"
echo "   - Frontend: logs/frontend.log"
echo ""
echo -e "${YELLOW}⚠️  Opciones del script:${NC}"
echo "   - ./start_servers.sh          : Inicia servidores con verificación de dependencias"
echo "   - ./start_servers.sh --update : Inicia servidores actualizando dependencias"
echo ""
echo -e "${YELLOW}⚠️  Presione Ctrl+C para detener este script${NC}"
echo -e "${YELLOW}   Los servidores continuarán ejecutándose en segundo plano${NC}"

# Mantener el script corriendo para mostrar que los servidores están activos
echo -e "\n${BLUE}🔄 Monitoreando servidores...${NC}"
while true; do
    if ! check_process $BACKEND_PID "Backend Django" > /dev/null 2>&1; then
        echo -e "\n${RED}❌ El servidor backend se detuvo inesperadamente${NC}"
        break
    fi

    if ! check_process $FRONTEND_PID "Frontend React" > /dev/null 2>&1; then
        echo -e "\n${RED}❌ El servidor frontend se detuvo inesperadamente${NC}"
        break
    fi

    sleep 10
done

echo -e "\n${YELLOW}🛑 Script finalizado${NC}"
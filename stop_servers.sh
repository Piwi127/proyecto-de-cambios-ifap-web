#!/bin/bash

# Script para detener todos los servidores del proyecto IFAP
# Fecha: 16 de setiembre de 2025

echo "🛑 Deteniendo servidores del proyecto IFAP..."
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para detener un proceso por PID
stop_process() {
    local pid=$1
    local name=$2

    if [ -n "$pid" ] && ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo $name (PID: $pid)...${NC}"
        kill $pid 2>/dev/null

        # Esperar hasta 10 segundos para que el proceso termine
        local count=0
        while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done

        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${RED}⚠️  Forzando terminación de $name...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 1
        fi

        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${RED}❌ No se pudo detener $name${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $name detenido correctamente${NC}"
            return 0
        fi
    else
        echo -e "${BLUE}ℹ️  $name no estaba ejecutándose${NC}"
        return 0
    fi
}

# Verificar que estamos en el directorio correcto
if [ ! -d "logs" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde la raíz del proyecto IFAP${NC}"
    echo "   Debe existir la carpeta 'logs'"
    exit 1
fi

# Leer PIDs desde archivos
BACKEND_PID=""
FRONTEND_PID=""

if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
fi

# Detener procesos
echo -e "${BLUE}🐍 Deteniendo servidor backend...${NC}"
stop_process "$BACKEND_PID" "Backend Django"

echo -e "\n${BLUE}⚛️  Deteniendo servidor frontend...${NC}"
stop_process "$FRONTEND_PID" "Frontend React"

# Limpiar archivos de PID
if [ -f "logs/backend.pid" ]; then
    rm logs/backend.pid
    echo -e "${GREEN}🧹 Archivo logs/backend.pid eliminado${NC}"
fi

if [ -f "logs/frontend.pid" ]; then
    rm logs/frontend.pid
    echo -e "${GREEN}🧹 Archivo logs/frontend.pid eliminado${NC}"
fi

# Matar procesos restantes
echo -e "\n${BLUE}🔍 Matando procesos restantes...${NC}"

# Matar procesos de Django
DJANGO_PIDS=$(ps aux | grep "manage.py runserver" | grep -v grep | awk '{print $2}')
if [ -n "$DJANGO_PIDS" ]; then
    echo -e "${YELLOW}Matando procesos de Django...${NC}"
    echo "$DJANGO_PIDS" | xargs kill 2>/dev/null
    sleep 2
    # Verificar si se mataron
    REMAINING=$(ps aux | grep "manage.py runserver" | grep -v grep | wc -l)
    if [ $REMAINING -gt 0 ]; then
        echo "$DJANGO_PIDS" | xargs kill -9 2>/dev/null
    fi
    echo -e "${GREEN}✅ Procesos de Django detenidos${NC}"
else
    echo -e "${GREEN}✅ No hay procesos de Django ejecutándose${NC}"
fi

# Matar procesos de Node.js/Vite
NODE_PIDS=$(ps aux | grep -E "vite|npm.*dev" | grep -v grep | awk '{print $2}')
if [ -n "$NODE_PIDS" ]; then
    echo -e "${YELLOW}Matando procesos de Node/Vite...${NC}"
    echo "$NODE_PIDS" | xargs kill 2>/dev/null
    sleep 2
    # Verificar si se mataron
    REMAINING=$(ps aux | grep -E "vite|npm.*dev" | grep -v grep | wc -l)
    if [ $REMAINING -gt 0 ]; then
        echo "$NODE_PIDS" | xargs kill -9 2>/dev/null
    fi
    echo -e "${GREEN}✅ Procesos de Node/Vite detenidos${NC}"
else
    echo -e "${GREEN}✅ No hay procesos de Node/Vite ejecutándose${NC}"
fi

# Verificar y matar procesos en puertos
echo -e "\n${BLUE}🔍 Verificando puertos...${NC}"

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PORT_PID=$(lsof -Pi :8000 -sTCP:LISTEN -t)
    echo -e "${YELLOW}Matando proceso en puerto 8000 (PID: $PORT_PID)...${NC}"
    kill $PORT_PID 2>/dev/null
    sleep 1
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        kill -9 $PORT_PID 2>/dev/null
    fi
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ No se pudo liberar puerto 8000${NC}"
    else
        echo -e "${GREEN}✅ Puerto 8000 liberado${NC}"
    fi
else
    echo -e "${GREEN}✅ Puerto 8000 liberado${NC}"
fi

if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PORT_PID=$(lsof -Pi :5174 -sTCP:LISTEN -t)
    echo -e "${YELLOW}Matando proceso en puerto 5174 (PID: $PORT_PID)...${NC}"
    kill $PORT_PID 2>/dev/null
    sleep 1
    if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
        kill -9 $PORT_PID 2>/dev/null
    fi
    if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ No se pudo liberar puerto 5174${NC}"
    else
        echo -e "${GREEN}✅ Puerto 5174 liberado${NC}"
    fi
else
    echo -e "${GREEN}✅ Puerto 5174 liberado${NC}"
fi

echo -e "\n${GREEN}🎉 ¡Servidores detenidos correctamente!${NC}"
echo "=============================================="
echo -e "${BLUE}💡 Para reiniciar los servidores:${NC}"
echo "   ./start_servers.sh"
#!/bin/bash

# Script de Auto-Sincronización para Entorno de Desarrollo
# Autor: Sistema IFAP
# Descripción: Sincroniza automáticamente los cambios desde GitHub

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para verificar si hay servidores ejecutándose
check_servers() {
    log "Verificando servidores en ejecución..."
    
    # Verificar si hay procesos de desarrollo ejecutándose
    BACKEND_PID=$(pgrep -f "daphne.*ifap_backend" || echo "")
    FRONTEND_PID=$(pgrep -f "vite.*5174" || echo "")
    
    if [[ -n "$BACKEND_PID" || -n "$FRONTEND_PID" ]]; then
        warning "Servidores de desarrollo detectados en ejecución"
        echo "Backend PID: ${BACKEND_PID:-'No ejecutándose'}"
        echo "Frontend PID: ${FRONTEND_PID:-'No ejecutándose'}"
        return 0
    else
        log "No hay servidores de desarrollo ejecutándose"
        return 1
    fi
}

# Función para detener servidores
stop_servers() {
    log "Deteniendo servidores de desarrollo..."
    
    if [[ -f "./stop_servers.sh" ]]; then
        ./stop_servers.sh
        sleep 2
    else
        # Detener manualmente si el script no existe
        pkill -f "daphne.*ifap_backend" 2>/dev/null || true
        pkill -f "vite.*5174" 2>/dev/null || true
        sleep 2
    fi
    
    success "Servidores detenidos"
}

# Función para iniciar servidores
start_servers() {
    log "Iniciando servidores de desarrollo..."
    
    if [[ -f "./start_servers.sh" ]]; then
        nohup ./start_servers.sh > /dev/null 2>&1 &
        sleep 5
        success "Servidores iniciados en segundo plano"
    else
        error "Script start_servers.sh no encontrado"
        return 1
    fi
}

# Función para hacer backup de cambios locales
backup_local_changes() {
    log "Creando backup de cambios locales..."
    
    # Crear directorio de backups si no existe
    mkdir -p .backups
    
    # Crear backup con timestamp
    BACKUP_NAME="backup_$(date +'%Y%m%d_%H%M%S')"
    
    # Hacer stash de cambios no committeados
    if git diff --quiet && git diff --staged --quiet; then
        log "No hay cambios locales para respaldar"
    else
        git stash push -m "$BACKUP_NAME" --include-untracked
        success "Cambios locales respaldados en stash: $BACKUP_NAME"
    fi
}

# Función para sincronizar desde GitHub
sync_from_github() {
    log "Sincronizando desde GitHub..."
    
    # Fetch los últimos cambios
    git fetch origin
    
    # Verificar si hay cambios remotos
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null)
    
    if [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
        success "El repositorio ya está actualizado"
        return 0
    fi
    
    log "Nuevos cambios detectados en GitHub"
    
    # Determinar la rama principal
    MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@' 2>/dev/null || echo "main")
    
    # Cambiar a la rama principal si no estamos en ella
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]]; then
        log "Cambiando a la rama $MAIN_BRANCH"
        git checkout "$MAIN_BRANCH"
    fi
    
    # Pull los cambios
    git pull origin "$MAIN_BRANCH"
    
    success "Sincronización completada"
}

# Función para instalar/actualizar dependencias
update_dependencies() {
    log "Verificando y actualizando dependencias..."
    
    # Backend dependencies
    if [[ -f "backend/requirements.txt" ]]; then
        log "Actualizando dependencias del backend..."
        cd backend
        if [[ -d "venv" ]]; then
            source venv/bin/activate
            pip install -r requirements.txt --quiet
            deactivate
        else
            warning "Entorno virtual del backend no encontrado"
        fi
        cd ..
    fi
    
    # Frontend dependencies
    if [[ -f "frontend/package.json" ]]; then
        log "Verificando dependencias del frontend..."
        cd frontend
        if [[ -f "package-lock.json" ]]; then
            npm ci --silent
        else
            npm install --silent
        fi
        cd ..
    fi
    
    success "Dependencias actualizadas"
}

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones de base de datos..."
    
    if [[ -f "backend/manage.py" ]]; then
        cd backend
        if [[ -d "venv" ]]; then
            source venv/bin/activate
            python manage.py migrate --no-input
            deactivate
        fi
        cd ..
        success "Migraciones ejecutadas"
    else
        warning "manage.py no encontrado, saltando migraciones"
    fi
}

# Función principal
main() {
    log "=== Iniciando Auto-Sincronización IFAP ==="
    
    # Verificar si estamos en un repositorio Git
    if [[ ! -d ".git" ]]; then
        error "No estás en un repositorio Git"
        exit 1
    fi
    
    # Verificar conexión a internet
    if ! ping -c 1 github.com &> /dev/null; then
        error "No hay conexión a internet o GitHub no es accesible"
        exit 1
    fi
    
    # Verificar si hay servidores ejecutándose
    SERVERS_RUNNING=false
    if check_servers; then
        SERVERS_RUNNING=true
        
        # Preguntar si detener servidores (en modo interactivo)
        if [[ "${1:-}" != "--auto" ]]; then
            read -p "¿Detener servidores para sincronizar? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                stop_servers
            else
                warning "Sincronizando sin detener servidores (puede causar conflictos)"
            fi
        else
            log "Modo automático: deteniendo servidores"
            stop_servers
        fi
    fi
    
    # Backup de cambios locales
    backup_local_changes
    
    # Sincronizar desde GitHub
    sync_from_github
    
    # Actualizar dependencias
    update_dependencies
    
    # Ejecutar migraciones
    run_migrations
    
    # Reiniciar servidores si estaban ejecutándose
    if [[ "$SERVERS_RUNNING" == true ]]; then
        start_servers
    fi
    
    success "=== Auto-Sincronización completada ==="
    log "Tu entorno de desarrollo está actualizado con los últimos cambios de GitHub"
}

# Función de ayuda
show_help() {
    echo "Auto-Sync Script para IFAP"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --auto    Ejecutar en modo automático (sin confirmaciones)"
    echo "  --help    Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                # Ejecutar en modo interactivo"
    echo "  $0 --auto        # Ejecutar automáticamente"
}

# Verificar argumentos
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --auto)
        main --auto
        ;;
    "")
        main
        ;;
    *)
        error "Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac
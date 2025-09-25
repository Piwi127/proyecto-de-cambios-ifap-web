#!/bin/bash

# Script de Monitoreo Continuo de GitHub
# Verifica periódicamente si hay nuevos cambios en GitHub y los sincroniza automáticamente

set -e

# Configuración
CHECK_INTERVAL=300  # 5 minutos en segundos
LOG_FILE="logs/github-sync.log"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Crear directorio de logs si no existe
mkdir -p logs

log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="[SUCCESS] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

warning() {
    local message="[WARNING] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Función para verificar si hay nuevos cambios en GitHub
check_for_updates() {
    log "Verificando actualizaciones en GitHub..."
    
    # Fetch sin hacer merge
    if ! git fetch origin 2>/dev/null; then
        error "Error al conectar con GitHub"
        return 1
    fi
    
    # Comparar commits locales vs remotos
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null)
    
    if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
        log "Nuevos cambios detectados en GitHub"
        return 0  # Hay cambios
    else
        log "No hay nuevos cambios"
        return 1  # No hay cambios
    fi
}

# Función para sincronizar cambios
sync_changes() {
    log "Iniciando sincronización automática..."
    
    if ./auto-sync.sh --auto; then
        success "Sincronización completada exitosamente"
        
        # Notificar al usuario (si está en sesión)
        if command -v notify-send &> /dev/null; then
            notify-send "IFAP Sync" "Proyecto sincronizado con GitHub" --icon=dialog-information
        fi
        
        return 0
    else
        error "Error durante la sincronización"
        return 1
    fi
}

# Función para manejar señales de interrupción
cleanup() {
    log "Deteniendo monitoreo de GitHub..."
    exit 0
}

# Configurar manejo de señales
trap cleanup SIGINT SIGTERM

# Función principal de monitoreo
start_monitoring() {
    log "=== Iniciando Monitoreo de GitHub ==="
    log "Intervalo de verificación: ${CHECK_INTERVAL} segundos"
    log "Archivo de log: $LOG_FILE"
    log "Presiona Ctrl+C para detener"
    
    # Verificar que estamos en un repositorio Git
    if [[ ! -d ".git" ]]; then
        error "No estás en un repositorio Git"
        exit 1
    fi
    
    # Verificar que el script auto-sync existe
    if [[ ! -f "./auto-sync.sh" ]]; then
        error "Script auto-sync.sh no encontrado"
        exit 1
    fi
    
    # Loop principal de monitoreo
    while true; do
        if check_for_updates; then
            sync_changes
        fi
        
        log "Próxima verificación en ${CHECK_INTERVAL} segundos..."
        sleep "$CHECK_INTERVAL"
    done
}

# Función para mostrar el estado
show_status() {
    echo "=== Estado del Monitoreo de GitHub ==="
    echo ""
    
    # Verificar si el proceso está ejecutándose
    if pgrep -f "watch-github.sh" > /dev/null; then
        echo -e "${GREEN}Estado: EJECUTÁNDOSE${NC}"
        echo "PID: $(pgrep -f "watch-github.sh")"
    else
        echo -e "${YELLOW}Estado: DETENIDO${NC}"
    fi
    
    echo ""
    echo "Configuración:"
    echo "  Intervalo: ${CHECK_INTERVAL} segundos"
    echo "  Log: $LOG_FILE"
    
    if [[ -f "$LOG_FILE" ]]; then
        echo ""
        echo "Últimas 5 entradas del log:"
        tail -n 5 "$LOG_FILE"
    fi
}

# Función para detener el monitoreo
stop_monitoring() {
    local pids=$(pgrep -f "watch-github.sh" | grep -v $$)
    
    if [[ -n "$pids" ]]; then
        echo "Deteniendo monitoreo de GitHub..."
        kill $pids
        success "Monitoreo detenido"
    else
        warning "No hay procesos de monitoreo ejecutándose"
    fi
}

# Función de ayuda
show_help() {
    echo "Watch GitHub Script para IFAP"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  start     Iniciar monitoreo en primer plano"
    echo "  daemon    Iniciar monitoreo en segundo plano"
    echo "  stop      Detener monitoreo"
    echo "  status    Mostrar estado del monitoreo"
    echo "  logs      Mostrar logs recientes"
    echo "  help      Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start          # Iniciar monitoreo"
    echo "  $0 daemon         # Iniciar en segundo plano"
    echo "  $0 status         # Ver estado"
}

# Función para mostrar logs
show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo "=== Logs de Sincronización GitHub ==="
        tail -n 20 "$LOG_FILE"
    else
        warning "No hay archivo de logs disponible"
    fi
}

# Procesar argumentos
case "${1:-start}" in
    start)
        start_monitoring
        ;;
    daemon)
        log "Iniciando monitoreo en segundo plano..."
        nohup "$0" start > /dev/null 2>&1 &
        success "Monitoreo iniciado en segundo plano (PID: $!)"
        ;;
    stop)
        stop_monitoring
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
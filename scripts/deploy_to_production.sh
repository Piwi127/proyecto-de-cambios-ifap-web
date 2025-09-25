#!/bin/bash

# Script de despliegue automático a producción
# Este script sincroniza los cambios locales con el servidor de producción

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración (estas variables se pueden sobrescribir con variables de entorno)
SERVER_HOST=${SERVER_HOST:-"tu-servidor-produccion.com"}
SERVER_USER=${SERVER_USER:-"ubuntu"}
BACKEND_PATH=${BACKEND_PATH:-"/var/www/ifap-backend"}
FRONTEND_PATH=${FRONTEND_PATH:-"/var/www/ifap-frontend"}
PRODUCTION_URL=${PRODUCTION_URL:-"https://ifap.edu.pe"}

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar prerrequisitos
check_prerequisites() {
    print_message "Verificando prerrequisitos..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ] && [ ! -f "backend/manage.py" ]; then
        print_error "Este script debe ejecutarse desde la raíz del proyecto IFAP"
        exit 1
    fi
    
    # Verificar que git está limpio
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Hay cambios sin commitear. ¿Deseas continuar? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_error "Despliegue cancelado"
            exit 1
        fi
    fi
    
    # Verificar conexión SSH
    print_message "Verificando conexión SSH..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        print_error "No se puede conectar al servidor $SERVER_HOST"
        print_message "Asegúrate de que:"
        print_message "1. El servidor esté accesible"
        print_message "2. Tu clave SSH esté configurada"
        print_message "3. Las variables SERVER_HOST y SERVER_USER sean correctas"
        exit 1
    fi
    
    print_success "Prerrequisitos verificados"
}

# Función para hacer backup del estado actual en producción
create_backup() {
    print_message "Creando backup del estado actual..."
    
    BACKUP_DIR="/tmp/ifap-backup-$(date +%Y%m%d-%H%M%S)"
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        mkdir -p $BACKUP_DIR
        if [ -d '$BACKEND_PATH' ]; then
            cp -r $BACKEND_PATH $BACKUP_DIR/backend
        fi
        if [ -d '$FRONTEND_PATH' ]; then
            cp -r $FRONTEND_PATH $BACKUP_DIR/frontend
        fi
        echo $BACKUP_DIR > /tmp/ifap-last-backup
    "
    
    print_success "Backup creado en $BACKUP_DIR"
}

# Función para construir el frontend
build_frontend() {
    print_message "Construyendo frontend..."
    
    cd frontend
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        print_message "Instalando dependencias del frontend..."
        npm ci
    fi
    
    # Construir para producción
    print_message "Construyendo aplicación React..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "La construcción del frontend falló"
        exit 1
    fi
    
    cd ..
    print_success "Frontend construido exitosamente"
}

# Función para desplegar el backend
deploy_backend() {
    print_message "Desplegando backend..."
    
    # Sincronizar archivos del backend
    print_message "Sincronizando archivos del backend..."
    rsync -avz --delete \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='venv' \
        --exclude='db.sqlite3' \
        --exclude='logs' \
        --exclude='.env' \
        ./backend/ "$SERVER_USER@$SERVER_HOST:$BACKEND_PATH/"
    
    # Ejecutar comandos en el servidor
    print_message "Ejecutando comandos de despliegue en el servidor..."
    ssh "$SERVER_USER@$SERVER_HOST" "
        cd $BACKEND_PATH
        
        # Activar entorno virtual
        source venv/bin/activate
        
        # Instalar/actualizar dependencias
        pip install -r requirements.txt
        
        # Ejecutar migraciones
        python manage.py migrate --settings=ifap_backend.settings
        
        # Recolectar archivos estáticos
        python manage.py collectstatic --noinput --settings=ifap_backend.settings
        
        # Reiniciar servicios
        sudo systemctl restart ifap-backend || echo 'Servicio ifap-backend no encontrado'
        sudo systemctl restart gunicorn || echo 'Servicio gunicorn no encontrado'
        sudo systemctl reload nginx
    "
    
    print_success "Backend desplegado exitosamente"
}

# Función para desplegar el frontend
deploy_frontend() {
    print_message "Desplegando frontend..."
    
    # Sincronizar archivos del frontend
    rsync -avz --delete \
        ./frontend/dist/ "$SERVER_USER@$SERVER_HOST:$FRONTEND_PATH/"
    
    # Reiniciar nginx
    ssh "$SERVER_USER@$SERVER_HOST" "sudo systemctl reload nginx"
    
    print_success "Frontend desplegado exitosamente"
}

# Función para verificar el despliegue
verify_deployment() {
    print_message "Verificando despliegue..."
    
    # Esperar un momento para que los servicios se reinicien
    sleep 5
    
    # Verificar health check
    for i in {1..5}; do
        if curl -f -s "$PRODUCTION_URL/api/health/" > /dev/null; then
            print_success "Health check del backend: OK"
            break
        else
            print_warning "Esperando que el backend esté listo... (intento $i/5)"
            sleep 10
        fi
    done
    
    # Verificar frontend
    if curl -f -s "$PRODUCTION_URL/" > /dev/null; then
        print_success "Health check del frontend: OK"
    else
        print_error "El frontend no responde correctamente"
        return 1
    fi
    
    print_success "Verificación completada exitosamente"
}

# Función para rollback en caso de error
rollback() {
    print_error "Despliegue falló, iniciando rollback..."
    
    LAST_BACKUP=$(ssh "$SERVER_USER@$SERVER_HOST" "cat /tmp/ifap-last-backup 2>/dev/null || echo ''")
    
    if [ -n "$LAST_BACKUP" ]; then
        ssh "$SERVER_USER@$SERVER_HOST" "
            if [ -d '$LAST_BACKUP/backend' ]; then
                rm -rf $BACKEND_PATH
                mv $LAST_BACKUP/backend $BACKEND_PATH
            fi
            if [ -d '$LAST_BACKUP/frontend' ]; then
                rm -rf $FRONTEND_PATH
                mv $LAST_BACKUP/frontend $FRONTEND_PATH
            fi
            
            cd $BACKEND_PATH
            source venv/bin/activate
            python manage.py migrate --settings=ifap_backend.settings
            sudo systemctl restart ifap-backend || echo 'Servicio ifap-backend no encontrado'
            sudo systemctl restart gunicorn || echo 'Servicio gunicorn no encontrado'
            sudo systemctl reload nginx
        "
        print_success "Rollback completado"
    else
        print_error "No se encontró backup para rollback"
    fi
}

# Función principal
main() {
    print_message "🚀 Iniciando despliegue a producción..."
    print_message "Servidor: $SERVER_HOST"
    print_message "Usuario: $SERVER_USER"
    print_message "URL: $PRODUCTION_URL"
    
    # Verificar prerrequisitos
    check_prerequisites
    
    # Crear backup
    create_backup
    
    # Construir frontend
    build_frontend
    
    # Desplegar backend
    deploy_backend
    
    # Desplegar frontend
    deploy_frontend
    
    # Verificar despliegue
    if verify_deployment; then
        print_success "🎉 Despliegue completado exitosamente!"
        print_message "🌐 Aplicación disponible en: $PRODUCTION_URL"
    else
        rollback
        exit 1
    fi
}

# Manejar interrupciones
trap 'print_error "Despliegue interrumpido"; rollback; exit 1' INT TERM

# Ejecutar función principal
main "$@"
#!/bin/bash

# Script de deployment para staging/production
set -e

echo "🚀 Starting IFAP Web deployment..."

# Variables de entorno
ENVIRONMENT=${1:-staging}
PROJECT_DIR="/var/www/ifap-web"
BACKUP_DIR="/var/backups/ifap-web"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📋 Environment: $ENVIRONMENT"
echo "📁 Project directory: $PROJECT_DIR"

# Función para crear backup
create_backup() {
    echo "💾 Creating backup..."
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $PROJECT_DIR .
    echo "✅ Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
}

# Función para deployment del backend
deploy_backend() {
    echo "🐍 Deploying backend..."
    
    cd $PROJECT_DIR/backend
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Instalar dependencias
    pip install -r requirements.txt
    
    # Ejecutar migraciones
    python manage.py migrate --noinput
    
    # Recolectar archivos estáticos
    python manage.py collectstatic --noinput
    
    # Reiniciar servicios
    sudo systemctl reload nginx
    sudo systemctl restart gunicorn
    
    echo "✅ Backend deployed successfully"
}

# Función para deployment del frontend
deploy_frontend() {
    echo "⚛️ Deploying frontend..."
    
    cd $PROJECT_DIR/frontend
    
    # Instalar dependencias
    npm ci --production
    
    # Build del frontend
    npm run build
    
    # Copiar build a directorio web
    sudo cp -r dist/* /var/www/html/
    
    # Reiniciar nginx
    sudo systemctl reload nginx
    
    echo "✅ Frontend deployed successfully"
}

# Función para health check
health_check() {
    echo "🏥 Running health checks..."
    
    # Check del backend
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/)
    if [ $BACKEND_STATUS -eq 200 ]; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed (Status: $BACKEND_STATUS)"
        exit 1
    fi
    
    # Check del frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
    if [ $FRONTEND_STATUS -eq 200 ]; then
        echo "✅ Frontend health check passed"
    else
        echo "❌ Frontend health check failed (Status: $FRONTEND_STATUS)"
        exit 1
    fi
}

# Función para rollback
rollback() {
    echo "🔄 Rolling back to previous version..."
    
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.tar.gz | head -n 1)
    if [ -z "$LATEST_BACKUP" ]; then
        echo "❌ No backup found for rollback"
        exit 1
    fi
    
    echo "📦 Restoring from: $LATEST_BACKUP"
    tar -xzf $LATEST_BACKUP -C $PROJECT_DIR
    
    # Restart services
    sudo systemctl restart gunicorn
    sudo systemctl reload nginx
    
    echo "✅ Rollback completed"
}

# Función principal
main() {
    case $ENVIRONMENT in
        staging|production)
            create_backup
            deploy_backend
            deploy_frontend
            health_check
            echo "🎉 Deployment completed successfully!"
            ;;
        rollback)
            rollback
            ;;
        *)
            echo "❌ Invalid environment. Use: staging, production, or rollback"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main $@
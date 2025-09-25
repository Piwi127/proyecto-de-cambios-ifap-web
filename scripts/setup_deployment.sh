#!/bin/bash

# Script interactivo para configurar el despliegue automático
# Este script te ayuda a configurar todas las variables necesarias

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_message() {
    echo -e "${BLUE}$1${NC}"
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

# Función para leer input con valor por defecto
read_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        echo -e "${BLUE}$prompt${NC} ${YELLOW}(default: $default)${NC}: "
    else
        echo -e "${BLUE}$prompt${NC}: "
    fi
    
    read -r input
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    eval "$var_name='$input'"
}

# Función para leer contraseñas
read_password() {
    local prompt="$1"
    local var_name="$2"
    
    echo -e "${BLUE}$prompt${NC}: "
    read -s input
    eval "$var_name='$input'"
    echo
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
check_prerequisites() {
    print_header "Verificando Prerrequisitos"
    
    local missing_tools=()
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists ssh; then
        missing_tools+=("ssh")
    fi
    
    if ! command_exists curl; then
        missing_tools+=("curl")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Faltan las siguientes herramientas: ${missing_tools[*]}"
        print_message "Instálalas y vuelve a ejecutar este script"
        exit 1
    fi
    
    print_success "Todos los prerrequisitos están instalados"
}

# Configurar información del servidor
configure_server() {
    print_header "Configuración del Servidor de Producción"
    
    read_with_default "IP o dominio del servidor" "192.168.1.100" SERVER_HOST
    read_with_default "Usuario SSH" "ubuntu" SERVER_USER
    read_with_default "Puerto SSH" "22" SERVER_PORT
    read_with_default "Ruta del backend en el servidor" "/var/www/ifap-backend" BACKEND_PATH
    read_with_default "Ruta del frontend en el servidor" "/var/www/ifap-frontend" FRONTEND_PATH
    read_with_default "URL de producción" "https://ifap.edu.pe" PRODUCTION_URL
    
    print_success "Configuración del servidor completada"
}

# Configurar base de datos
configure_database() {
    print_header "Configuración de Base de Datos"
    
    read_with_default "Nombre de la base de datos" "ifap_production" DB_NAME
    read_with_default "Usuario de la base de datos" "ifap_user" DB_USER
    read_password "Contraseña de la base de datos" DB_PASSWORD
    read_with_default "Host de la base de datos" "localhost" DB_HOST
    read_with_default "Puerto de la base de datos" "5432" DB_PORT
    
    print_success "Configuración de base de datos completada"
}

# Configurar Redis
configure_redis() {
    print_header "Configuración de Redis"
    
    read_with_default "URL de Redis" "redis://localhost:6379/0" REDIS_URL
    
    print_success "Configuración de Redis completada"
}

# Configurar Django
configure_django() {
    print_header "Configuración de Django"
    
    # Generar SECRET_KEY automáticamente
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || openssl rand -base64 50)
    
    print_message "SECRET_KEY generado automáticamente"
    read_with_default "Hosts permitidos (separados por coma)" "$SERVER_HOST,www.$SERVER_HOST" ALLOWED_HOSTS
    
    print_success "Configuración de Django completada"
}

# Configurar email
configure_email() {
    print_header "Configuración de Email (Opcional)"
    
    echo -e "${YELLOW}¿Deseas configurar email? (y/N):${NC} "
    read -r configure_email_choice
    
    if [[ "$configure_email_choice" =~ ^[Yy]$ ]]; then
        read_with_default "Host SMTP" "smtp.gmail.com" EMAIL_HOST
        read_with_default "Puerto SMTP" "587" EMAIL_PORT
        read_with_default "Usuario de email" "" EMAIL_HOST_USER
        read_password "Contraseña de email" EMAIL_HOST_PASSWORD
        
        EMAIL_USE_TLS="True"
        print_success "Configuración de email completada"
    else
        EMAIL_HOST=""
        EMAIL_PORT=""
        EMAIL_HOST_USER=""
        EMAIL_HOST_PASSWORD=""
        EMAIL_USE_TLS=""
        print_message "Configuración de email omitida"
    fi
}

# Verificar conexión SSH
test_ssh_connection() {
    print_header "Verificando Conexión SSH"
    
    print_message "Probando conexión SSH a $SERVER_USER@$SERVER_HOST..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        print_success "Conexión SSH exitosa"
        return 0
    else
        print_error "No se puede conectar por SSH"
        print_message "Asegúrate de que:"
        print_message "1. El servidor esté accesible"
        print_message "2. Tu clave SSH esté configurada"
        print_message "3. El usuario y host sean correctos"
        
        echo -e "${YELLOW}¿Deseas configurar SSH ahora? (y/N):${NC} "
        read -r setup_ssh_choice
        
        if [[ "$setup_ssh_choice" =~ ^[Yy]$ ]]; then
            setup_ssh
        else
            print_warning "Deberás configurar SSH manualmente antes del despliegue"
            return 1
        fi
    fi
}

# Configurar SSH
setup_ssh() {
    print_header "Configuración de SSH"
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        print_message "Generando nueva clave SSH..."
        ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)" -f ~/.ssh/id_rsa -N ""
        print_success "Clave SSH generada"
    fi
    
    print_message "Copiando clave pública al servidor..."
    if ssh-copy-id "$SERVER_USER@$SERVER_HOST"; then
        print_success "Clave SSH copiada al servidor"
    else
        print_error "Error al copiar la clave SSH"
        print_message "Copia manualmente la clave pública:"
        echo
        cat ~/.ssh/id_rsa.pub
        echo
        print_message "Agrégala a ~/.ssh/authorized_keys en el servidor"
    fi
}

# Generar archivo .env.production
generate_env_file() {
    print_header "Generando Archivo de Configuración"
    
    ENV_FILE=".env.production"
    
    cat > "$ENV_FILE" << EOF
# Configuración de producción para IFAP Web
# Generado automáticamente el $(date)

# Configuración del servidor
SERVER_HOST=$SERVER_HOST
SERVER_USER=$SERVER_USER
SERVER_PORT=$SERVER_PORT
BACKEND_PATH=$BACKEND_PATH
FRONTEND_PATH=$FRONTEND_PATH
PRODUCTION_URL=$PRODUCTION_URL

# Configuración de Django
SECRET_KEY=$SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=$ALLOWED_HOSTS

# Configuración de base de datos
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Configuración de Redis
REDIS_URL=$REDIS_URL

# Configuración de email
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USE_TLS=$EMAIL_USE_TLS
EMAIL_HOST_USER=$EMAIL_HOST_USER
EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD

# Configuración de archivos estáticos
STATIC_URL=/static/
MEDIA_URL=/media/
STATIC_ROOT=$BACKEND_PATH/staticfiles
MEDIA_ROOT=$BACKEND_PATH/media

# Configuración de seguridad
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Configuración de CORS
CORS_ALLOWED_ORIGINS=$PRODUCTION_URL
CORS_ALLOW_CREDENTIALS=True
EOF
    
    print_success "Archivo $ENV_FILE generado"
}

# Mostrar información de GitHub Secrets
show_github_secrets() {
    print_header "Configuración de GitHub Secrets"
    
    print_message "Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions"
    print_message "Agrega los siguientes secretos:"
    echo
    
    echo -e "${GREEN}SSH_PRIVATE_KEY${NC}:"
    echo "$(cat ~/.ssh/id_rsa 2>/dev/null || echo 'Clave SSH no encontrada')"
    echo
    
    echo -e "${GREEN}SERVER_HOST${NC}: $SERVER_HOST"
    echo -e "${GREEN}SERVER_USER${NC}: $SERVER_USER"
    echo -e "${GREEN}BACKEND_PATH${NC}: $BACKEND_PATH"
    echo -e "${GREEN}FRONTEND_PATH${NC}: $FRONTEND_PATH"
    echo -e "${GREEN}PRODUCTION_URL${NC}: $PRODUCTION_URL"
    echo
    
    print_warning "¡IMPORTANTE! Copia estos valores exactamente como se muestran"
}

# Generar comandos para el servidor
generate_server_setup() {
    print_header "Comandos para Configurar el Servidor"
    
    SETUP_FILE="server_setup_commands.sh"
    
    cat > "$SETUP_FILE" << EOF
#!/bin/bash
# Comandos para configurar el servidor de producción
# Ejecuta estos comandos en tu servidor

# Crear directorios
sudo mkdir -p $BACKEND_PATH
sudo mkdir -p $FRONTEND_PATH
sudo chown -R $SERVER_USER:$SERVER_USER $BACKEND_PATH
sudo chown -R $SERVER_USER:$SERVER_USER $FRONTEND_PATH

# Configurar entorno virtual
cd $BACKEND_PATH
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias del sistema
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib redis-server python3-pip python3-venv

# Configurar PostgreSQL
sudo -u postgres createdb $DB_NAME
sudo -u postgres createuser $DB_USER
sudo -u postgres psql -c "ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Configurar servicio systemd
sudo tee /etc/systemd/system/ifap-backend.service > /dev/null << EOL
[Unit]
Description=IFAP Backend
After=network.target

[Service]
User=$SERVER_USER
Group=$SERVER_USER
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 ifap_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Activar servicios
sudo systemctl daemon-reload
sudo systemctl enable ifap-backend
sudo systemctl enable nginx
sudo systemctl enable postgresql
sudo systemctl enable redis-server

echo "✅ Configuración del servidor completada"
echo "📝 Recuerda configurar Nginx manualmente con la configuración proporcionada"
EOF
    
    chmod +x "$SETUP_FILE"
    print_success "Archivo $SETUP_FILE generado"
    print_message "Ejecuta este archivo en tu servidor para configurarlo automáticamente"
}

# Función principal
main() {
    clear
    print_header "🚀 Configurador de Despliegue Automático IFAP"
    print_message "Este script te ayudará a configurar el despliegue automático a producción"
    
    # Verificar prerrequisitos
    check_prerequisites
    
    # Configurar componentes
    configure_server
    configure_database
    configure_redis
    configure_django
    configure_email
    
    # Verificar SSH
    test_ssh_connection
    
    # Generar archivos
    generate_env_file
    generate_server_setup
    
    # Mostrar información final
    show_github_secrets
    
    print_header "🎉 Configuración Completada"
    print_success "Archivos generados:"
    print_message "- .env.production (configuración local)"
    print_message "- server_setup_commands.sh (comandos para el servidor)"
    echo
    print_message "Próximos pasos:"
    print_message "1. Ejecuta server_setup_commands.sh en tu servidor"
    print_message "2. Configura los secretos en GitHub"
    print_message "3. Haz push a la rama main para probar el despliegue"
    echo
    print_warning "Lee la documentación en docs/DEPLOYMENT_SETUP.md para más detalles"
}

# Ejecutar función principal
main "$@"
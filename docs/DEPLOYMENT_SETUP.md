# Configuración de Despliegue Automático a Producción

Esta guía te ayudará a configurar el despliegue automático desde tu entorno de desarrollo local directamente a producción usando GitHub Actions.

## 📋 Prerrequisitos

### 1. Servidor de Producción
- Servidor Linux (Ubuntu/Debian recomendado)
- Acceso SSH con clave pública
- Python 3.11+, Node.js 18+, Nginx, PostgreSQL/MySQL
- Servicios systemd configurados para tu aplicación

### 2. Configuración Local
- Git configurado con tu repositorio de GitHub
- SSH configurado para acceso al servidor
- Node.js y Python instalados localmente

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar Secretos en GitHub

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions y agrega estos secretos:

#### Secretos Obligatorios:
```
SSH_PRIVATE_KEY          # Tu clave SSH privada para acceder al servidor
SERVER_HOST              # IP o dominio de tu servidor (ej: 192.168.1.100)
SERVER_USER              # Usuario SSH (ej: ubuntu, root)
BACKEND_PATH             # Ruta del backend en el servidor (ej: /var/www/ifap-backend)
FRONTEND_PATH            # Ruta del frontend en el servidor (ej: /var/www/ifap-frontend)
PRODUCTION_URL           # URL de tu aplicación (ej: https://ifap.edu.pe)
```

#### Secretos Opcionales:
```
SLACK_WEBHOOK_URL        # Para notificaciones de Slack
DISCORD_WEBHOOK_URL      # Para notificaciones de Discord
SENTRY_DSN              # Para monitoreo de errores
```

### Paso 2: Configurar tu Servidor de Producción

#### 2.1 Crear Directorios
```bash
sudo mkdir -p /var/www/ifap-backend
sudo mkdir -p /var/www/ifap-frontend
sudo chown -R $USER:$USER /var/www/ifap-*
```

#### 2.2 Configurar Entorno Virtual de Python
```bash
cd /var/www/ifap-backend
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Configurar Nginx
Crear archivo `/etc/nginx/sites-available/ifap`:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Frontend
    location / {
        root /var/www/ifap-frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Archivos estáticos del backend
    location /static/ {
        alias /var/www/ifap-backend/staticfiles/;
    }
    
    location /media/ {
        alias /var/www/ifap-backend/media/;
    }
}
```

Activar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/ifap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 2.4 Configurar Servicio Systemd
Crear archivo `/etc/systemd/system/ifap-backend.service`:
```ini
[Unit]
Description=IFAP Backend
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/ifap-backend
Environment=PATH=/var/www/ifap-backend/venv/bin
ExecStart=/var/www/ifap-backend/venv/bin/gunicorn --workers 3 --bind localhost:8000 ifap_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Activar el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ifap-backend
sudo systemctl start ifap-backend
```

### Paso 3: Configurar Variables de Entorno

#### 3.1 Crear archivo .env en el servidor
```bash
# En el servidor de producción
cd /var/www/ifap-backend
nano .env
```

Usar el archivo `.env.production.example` como plantilla y configurar los valores reales.

#### 3.2 Configurar variables locales (opcional)
```bash
# En tu máquina local
cp .env.production.example .env.production
# Editar con los valores de tu servidor
```

### Paso 4: Configurar SSH

#### 4.1 Generar clave SSH (si no tienes una)
```bash
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"
```

#### 4.2 Copiar clave pública al servidor
```bash
ssh-copy-id usuario@tu-servidor.com
```

#### 4.3 Agregar clave privada a GitHub Secrets
```bash
# Mostrar clave privada
cat ~/.ssh/id_rsa
# Copiar todo el contenido y pegarlo en GitHub Secrets como SSH_PRIVATE_KEY
```

## 🚀 Uso del Sistema de Despliegue

### Despliegue Automático con GitHub Actions

Cada vez que hagas push a la rama `main`, se ejecutará automáticamente:

1. **Tests**: Backend y frontend
2. **Análisis de seguridad**: Escaneo de vulnerabilidades
3. **Build**: Construcción del frontend
4. **Deploy**: Despliegue a producción
5. **Health Check**: Verificación de que todo funciona
6. **Notificaciones**: Confirmación del despliegue

```bash
# Para desplegar automáticamente:
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# ¡El despliegue se ejecuta automáticamente!
```

### Despliegue Manual con Script

También puedes usar el script local para despliegues manuales:

```bash
# Configurar variables de entorno
export SERVER_HOST="tu-servidor.com"
export SERVER_USER="ubuntu"
export PRODUCTION_URL="https://tu-dominio.com"

# Ejecutar despliegue
./scripts/deploy_to_production.sh
```

## 🔍 Monitoreo y Verificación

### Health Checks
- **Básico**: `https://tu-dominio.com/api/health/`
- **Detallado**: `https://tu-dominio.com/api/health/detailed/`

### Logs del Sistema
```bash
# Ver logs del backend
sudo journalctl -u ifap-backend -f

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs de la aplicación
tail -f /var/www/ifap-backend/logs/api.log
```

### Verificar Estado de Servicios
```bash
sudo systemctl status ifap-backend
sudo systemctl status nginx
sudo systemctl status postgresql
```

## 🛠️ Solución de Problemas

### Error de Conexión SSH
```bash
# Verificar conexión
ssh -v usuario@servidor.com

# Verificar permisos de clave
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Error de Permisos en el Servidor
```bash
# Corregir permisos
sudo chown -R usuario:usuario /var/www/ifap-*
chmod +x /var/www/ifap-backend/manage.py
```

### Error de Base de Datos
```bash
# Verificar conexión a PostgreSQL
sudo -u postgres psql -c "SELECT version();"

# Verificar configuración
cd /var/www/ifap-backend
source venv/bin/activate
python manage.py check --deploy
```

### Rollback Manual
```bash
# En caso de problemas, hacer rollback
cd /var/www/ifap-backend
git log --oneline -5  # Ver últimos commits
git checkout COMMIT_ANTERIOR
source venv/bin/activate
python manage.py migrate
sudo systemctl restart ifap-backend
```

## 📊 Mejores Prácticas

### 1. Seguridad
- Usar HTTPS en producción
- Configurar firewall (UFW)
- Mantener el sistema actualizado
- Usar contraseñas fuertes
- Configurar fail2ban

### 2. Backup
- Backup automático de la base de datos
- Backup de archivos de media
- Backup de configuración

### 3. Monitoreo
- Configurar alertas de sistema
- Monitorear uso de recursos
- Logs centralizados
- Métricas de aplicación

### 4. Performance
- Configurar cache (Redis)
- Optimizar consultas de base de datos
- Comprimir archivos estáticos
- CDN para archivos media

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo Local**: Hacer cambios en tu máquina
2. **Testing**: Ejecutar tests localmente
3. **Commit**: Hacer commit de los cambios
4. **Push**: Subir a GitHub (rama main)
5. **Automático**: GitHub Actions despliega automáticamente
6. **Verificación**: Revisar que todo funcione en producción

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de GitHub Actions
2. Verifica la conectividad SSH
3. Comprueba los secretos de GitHub
4. Revisa los logs del servidor
5. Verifica la configuración de Nginx

¡Tu entorno de desarrollo ahora se sincroniza automáticamente con producción! 🎉
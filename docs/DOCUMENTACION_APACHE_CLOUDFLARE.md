# 📚 Documentación Completa: Configuración Apache + Túnel Cloudflare

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración de Apache](#configuración-de-apache)
4. [Configuración del Túnel Cloudflare](#configuración-del-túnel-cloudflare)
5. [Archivos de Configuración](#archivos-de-configuración)
6. [Comandos Utilizados](#comandos-utilizados)
7. [Verificación y Testing](#verificación-y-testing)
8. [Troubleshooting](#troubleshooting)
9. [Mantenimiento](#mantenimiento)

---

## 🎯 Resumen Ejecutivo

Esta documentación describe la configuración completa implementada para resolver el **Error 1033 de Cloudflare Tunnel** y optimizar la arquitectura del sistema IFAP utilizando **una sola DNS** (`www.ifap-edu.uk`) para manejar tanto el frontend como el backend.

### ✅ Objetivos Alcanzados:
- ✅ Resolución del Error 1033 de Cloudflare
- ✅ Configuración de una sola DNS para todo el sistema
- ✅ Proxy reverso con Apache para enrutamiento inteligente
- ✅ Túnel Cloudflare estable y persistente
- ✅ HTTPS automático para toda la aplicación
- ✅ Servicio systemd para autostart del túnel

---

## 🏗️ Arquitectura del Sistema

```
Internet (HTTPS)
       ↓
Cloudflare CDN/Proxy
       ↓
Túnel Cloudflare (cloudflared)
       ↓
Apache (Puerto 80) - Proxy Reverso
       ↓
┌─────────────────┬─────────────────┐
│   Frontend      │    Backend      │
│   (Vite)        │   (Django)      │
│   Puerto 5174   │   Puerto 8000   │
└─────────────────┴─────────────────┘
```

### 🔄 Flujo de Datos:
1. **Usuario** → `https://www.ifap-edu.uk` → **Cloudflare**
2. **Cloudflare** → **Túnel** → **Apache (puerto 80)**
3. **Apache** analiza la ruta:
   - `/api/*` → **Django Backend (puerto 8000)**
   - `/ws/*` → **WebSockets Django (puerto 8000)**
   - `/*` → **Frontend Vite (puerto 5174)**

---

## ⚙️ Configuración de Apache

### 📍 Ubicación del Archivo:
```
/etc/apache2/sites-available/www.ifap-edu.uk.conf
```

### 🎯 Funcionalidades Implementadas:

#### 1. **Proxy Reverso Inteligente**
- Enrutamiento basado en rutas URL
- Manejo de WebSockets para ambos servicios
- Headers CORS configurados

#### 2. **Enrutamiento de Rutas:**
- `www.ifap-edu.uk/api/*` → Backend Django
- `www.ifap-edu.uk/ws/*` → WebSockets Django  
- `www.ifap-edu.uk/*` → Frontend Vite

#### 3. **Características de Seguridad:**
- Headers CORS habilitados
- Logging detallado
- ProxyPreserveHost activado

### 🔧 Módulos Apache Requeridos:
```bash
# Módulos necesarios (ya habilitados)
mod_proxy
mod_proxy_http
mod_proxy_wstunnel
mod_headers
```

---

## 🌐 Configuración del Túnel Cloudflare

### 📍 Ubicación del Archivo:
```
/root/.cloudflared/config.yml
```

### 🎯 Características:
- **Túnel:** `ifap-tunnel`
- **Credenciales:** Archivo JSON específico del túnel
- **Ingress:** Una sola regla para `www.ifap-edu.uk`
- **Fallback:** HTTP 404 para dominios no configurados

### 🔄 Servicio Systemd:
- **Autostart:** Habilitado en boot del sistema
- **Restart:** Automático en caso de fallo
- **Logging:** Integrado con systemd journal

---

## 📁 Archivos de Configuración

### 1. **Apache Virtual Host**
```apache
<VirtualHost *:80>
    ServerName www.ifap-edu.uk
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy API requests to Django backend
    ProxyPass /api/ http://localhost:8000/api/
    ProxyPassReverse /api/ http://localhost:8000/api/
    
    # Proxy WebSocket connections for API
    ProxyPass /ws/ ws://localhost:8000/ws/
    ProxyPassReverse /ws/ ws://localhost:8000/ws/
    
    # Proxy all other requests to Vite frontend (must be last)
    ProxyPass / http://127.0.0.1:5174/
    ProxyPassReverse / http://127.0.0.1:5174/
    
    # Handle WebSocket connections for Vite HMR
    ProxyPass /vite-hmr ws://127.0.0.1:5174/vite-hmr
    ProxyPassReverse /vite-hmr ws://127.0.0.1:5174/vite-hmr
    
    # Enable CORS headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/www.ifap-edu.uk_error.log
    CustomLog ${APACHE_LOG_DIR}/www.ifap-edu.uk_access.log combined
    LogLevel info
</VirtualHost>
```

### 2. **Configuración Túnel Cloudflare**
```yaml
tunnel: ifap-tunnel
credentials-file: /root/.cloudflared/016715e6-2fb6-4a62-a7e8-3ab94fefcd43.json

ingress:
  - hostname: www.ifap-edu.uk
    service: http://localhost:80
  - service: http_status:404
```

### 3. **Servicio Systemd**
```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /root/.cloudflared/config.yml run
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared

[Install]
WantedBy=multi-user.target
```

### 4. **Variables de Entorno Frontend (.env)**
```bash
# Variables de entorno para Vite
# Nota: Las variables deben comenzar con VITE_ para ser accesibles en el navegador

# URL base de la API del backend (usando dominio público)
VITE_API_URL=https://www.ifap-edu.uk/api
# URL alternativa para desarrollo local
VITE_API_URL_LOCAL=http://localhost:8000/api
# URL para WebSockets (usando dominio público)
VITE_API_WS_URL=wss://www.ifap-edu.uk/ws
# URL alternativa para WebSockets local
VITE_API_WS_URL_LOCAL=ws://localhost:8000
# URL para WebSockets (compatibilidad)
VITE_WS_URL=wss://www.ifap-edu.uk/ws

# Otras configuraciones
VITE_APP_NAME=IFAP - Instituto de Formación Archivística
```

---

## 💻 Comandos Utilizados

### 🔧 **Configuración Inicial de Apache**

```bash
# Habilitar módulos necesarios
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod headers

# Crear archivo de configuración
sudo nano /etc/apache2/sites-available/www.ifap-edu.uk.conf

# Habilitar el sitio
sudo a2ensite www.ifap-edu.uk.conf

# Verificar configuración
sudo apache2ctl configtest

# Recargar Apache
sudo systemctl reload apache2
```

### 🌐 **Configuración del Túnel Cloudflare**

```bash
# Verificar archivos de credenciales
sudo ls -la /root/.cloudflared/

# Crear configuración del túnel
sudo tee /root/.cloudflared/config.yml > /dev/null << 'EOF'
tunnel: ifap-tunnel
credentials-file: /root/.cloudflared/016715e6-2fb6-4a62-a7e8-3ab94fefcd43.json

ingress:
  - hostname: www.ifap-edu.uk
    service: http://localhost:80
  - service: http_status:404
EOF

# Probar configuración del túnel
sudo cloudflared tunnel --config /root/.cloudflared/config.yml run

# Verificar información del túnel
cloudflared tunnel info ifap-tunnel
```

### 🔄 **Configuración del Servicio Systemd**

```bash
# Crear archivo de servicio
sudo tee /etc/systemd/system/cloudflare-tunnel.service > /dev/null << 'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /root/.cloudflared/config.yml run
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio
sudo systemctl enable cloudflare-tunnel.service

# Iniciar servicio
sudo systemctl start cloudflare-tunnel.service

# Verificar estado
sudo systemctl status cloudflare-tunnel.service
```

### 🔍 **Comandos de Verificación**

```bash
# Verificar configuración de Apache
sudo apache2ctl -S

# Verificar sitios habilitados
sudo a2ensite --list

# Verificar logs de Apache
sudo tail -f /var/log/apache2/www.ifap-edu.uk_error.log
sudo tail -f /var/log/apache2/www.ifap-edu.uk_access.log

# Verificar estado del túnel
sudo systemctl status cloudflare-tunnel.service

# Verificar logs del túnel
sudo journalctl -u cloudflare-tunnel.service -f

# Probar conectividad
curl -I https://www.ifap-edu.uk
curl -I https://www.ifap-edu.uk/api/

# Verificar procesos
ps aux | grep cloudflared
ps aux | grep apache2
```

### 🛠️ **Comandos de Mantenimiento**

```bash
# Reiniciar Apache
sudo systemctl restart apache2

# Reiniciar túnel Cloudflare
sudo systemctl restart cloudflare-tunnel.service

# Recargar configuración de Apache (sin downtime)
sudo systemctl reload apache2

# Verificar configuración antes de aplicar
sudo apache2ctl configtest

# Detener túnel manualmente
sudo pkill -f cloudflared

# Ver conexiones activas del túnel
sudo netstat -tlnp | grep cloudflared
```

---

## ✅ Verificación y Testing

### 🧪 **Tests de Conectividad**

```bash
# Test 1: Verificar frontend
curl -I https://www.ifap-edu.uk
# Esperado: HTTP/2 200

# Test 2: Verificar API
curl -I https://www.ifap-edu.uk/api/
# Esperado: HTTP/2 200

# Test 3: Verificar WebSockets (requiere herramientas adicionales)
# wscat -c wss://www.ifap-edu.uk/ws/

# Test 4: Verificar headers CORS
curl -H "Origin: https://example.com" -I https://www.ifap-edu.uk/api/
# Verificar: Access-Control-Allow-Origin: *
```

### 📊 **Verificación de Estado**

```bash
# Estado del túnel
sudo systemctl is-active cloudflare-tunnel.service
# Esperado: active

# Estado de Apache
sudo systemctl is-active apache2
# Esperado: active

# Verificar conexiones del túnel
cloudflared tunnel info ifap-tunnel
# Verificar: Connectors activos

# Verificar logs en tiempo real
sudo journalctl -u cloudflare-tunnel.service -f --since "5 minutes ago"
```

---

## 🚨 Troubleshooting

### ❌ **Problemas Comunes y Soluciones**

#### 1. **Error 1033 de Cloudflare**
```bash
# Causa: Configuración incorrecta del túnel
# Solución: Verificar config.yml y credenciales
sudo cat /root/.cloudflared/config.yml
sudo ls -la /root/.cloudflared/*.json
```

#### 2. **Apache no responde**
```bash
# Verificar configuración
sudo apache2ctl configtest

# Verificar logs
sudo tail -f /var/log/apache2/error.log

# Reiniciar servicio
sudo systemctl restart apache2
```

#### 3. **Túnel no conecta**
```bash
# Verificar credenciales
sudo cloudflared tunnel --config /root/.cloudflared/config.yml run

# Verificar conectividad
ping 1.1.1.1

# Verificar firewall
sudo ufw status
```

#### 4. **WebSockets no funcionan**
```bash
# Verificar módulo proxy_wstunnel
sudo a2enmod proxy_wstunnel
sudo systemctl reload apache2

# Verificar configuración de proxy
grep -n "ws://" /etc/apache2/sites-available/www.ifap-edu.uk.conf
```

### 🔧 **Comandos de Diagnóstico**

```bash
# Diagnóstico completo del sistema
sudo systemctl status apache2 cloudflare-tunnel.service
sudo netstat -tlnp | grep -E "(80|8000|5174)"
sudo ps aux | grep -E "(apache|cloudflared|node|python)"

# Verificar logs de errores
sudo tail -n 50 /var/log/apache2/error.log
sudo journalctl -u cloudflare-tunnel.service --since "1 hour ago"

# Test de conectividad interna
curl -I http://localhost:80
curl -I http://localhost:8000/api/
curl -I http://localhost:5174
```

---

## 🔄 Mantenimiento

### 📅 **Tareas de Mantenimiento Regular**

#### **Diario:**
```bash
# Verificar estado de servicios
sudo systemctl status apache2 cloudflare-tunnel.service

# Verificar logs por errores
sudo journalctl -u cloudflare-tunnel.service --since "24 hours ago" | grep -i error
```

#### **Semanal:**
```bash
# Rotar logs de Apache
sudo logrotate -f /etc/logrotate.d/apache2

# Verificar espacio en disco
df -h /var/log/

# Actualizar cloudflared si es necesario
sudo cloudflared update
```

#### **Mensual:**
```bash
# Backup de configuraciones
sudo cp /etc/apache2/sites-available/www.ifap-edu.uk.conf ~/backups/
sudo cp /root/.cloudflared/config.yml ~/backups/

# Verificar certificados SSL (Cloudflare maneja esto automáticamente)
# Revisar métricas de rendimiento
```

### 🔄 **Procedimientos de Actualización**

#### **Actualizar Configuración de Apache:**
```bash
# 1. Backup actual
sudo cp /etc/apache2/sites-available/www.ifap-edu.uk.conf /tmp/backup.conf

# 2. Editar configuración
sudo nano /etc/apache2/sites-available/www.ifap-edu.uk.conf

# 3. Verificar sintaxis
sudo apache2ctl configtest

# 4. Aplicar cambios
sudo systemctl reload apache2
```

#### **Actualizar Configuración del Túnel:**
```bash
# 1. Backup actual
sudo cp /root/.cloudflared/config.yml /tmp/tunnel-backup.yml

# 2. Editar configuración
sudo nano /root/.cloudflared/config.yml

# 3. Reiniciar túnel
sudo systemctl restart cloudflare-tunnel.service

# 4. Verificar estado
sudo systemctl status cloudflare-tunnel.service
```

---

## 📈 Métricas y Monitoreo

### 📊 **Métricas Clave a Monitorear:**

1. **Disponibilidad del Túnel:** `systemctl is-active cloudflare-tunnel.service`
2. **Estado de Apache:** `systemctl is-active apache2`
3. **Conexiones del Túnel:** `cloudflared tunnel info ifap-tunnel`
4. **Logs de Errores:** `journalctl -u cloudflare-tunnel.service | grep ERROR`
5. **Uso de Recursos:** `htop`, `df -h`

### 🔍 **Scripts de Monitoreo Sugeridos:**

```bash
#!/bin/bash
# Script de monitoreo básico
echo "=== Estado del Sistema IFAP ==="
echo "Fecha: $(date)"
echo ""
echo "Apache: $(systemctl is-active apache2)"
echo "Túnel Cloudflare: $(systemctl is-active cloudflare-tunnel.service)"
echo ""
echo "=== Conectividad ==="
curl -s -o /dev/null -w "Frontend: %{http_code}\n" https://www.ifap-edu.uk
curl -s -o /dev/null -w "API: %{http_code}\n" https://www.ifap-edu.uk/api/
```

---

## 📝 Notas Finales

### ✅ **Configuración Completada:**
- ✅ Apache configurado como proxy reverso
- ✅ Túnel Cloudflare funcionando con una sola DNS
- ✅ Servicio systemd para persistencia
- ✅ Variables de entorno actualizadas
- ✅ HTTPS automático habilitado
- ✅ WebSockets funcionando correctamente

### 🎯 **Beneficios Obtenidos:**
1. **Simplicidad:** Una sola DNS para todo el sistema
2. **Seguridad:** HTTPS automático y headers CORS
3. **Escalabilidad:** Fácil agregar nuevos servicios
4. **Mantenimiento:** Configuración centralizada
5. **Rendimiento:** CDN de Cloudflare + proxy local

### 📞 **Soporte:**
Para cualquier problema o duda sobre esta configuración, revisar:
1. Esta documentación
2. Logs del sistema (`journalctl`)
3. Logs de Apache (`/var/log/apache2/`)
4. Estado de servicios (`systemctl status`)

---

**Documentación creada el:** $(date)  
**Versión:** 1.0  
**Sistema:** IFAP - Instituto de Formación Archivística  
**Configuración:** Apache + Cloudflare Tunnel + Una DNS
# Solución para Error 1033 de Cloudflare Tunnel

## Problema Identificado
El sitio web `www.ifap-edu.uk` mostraba el Error 1033 de Cloudflare, indicando que el túnel no podía resolver la conexión.

## Causas Encontradas

### 1. Configuración Incorrecta de Apache
- Apache estaba configurado para hacer proxy al puerto 5173, pero el frontend de Vite estaba ejecutándose en el puerto 5174
- El puerto 5173 devolvía un error "426 Upgrade Required"

### 2. Configuración Incorrecta del Túnel de Cloudflare
- Los hostnames en `config.yml` estaban configurados como `.com` en lugar de `.uk`
- El servicio para `www.ifap-edu.uk` apuntaba directamente al puerto 5173 en lugar de al puerto 80 (Apache)

### 3. Falta de Registro DNS
- El subdominio `api.ifap-edu.uk` no tiene registro DNS configurado en Cloudflare

## Soluciones Implementadas

### 1. Corrección de la Configuración de Apache
```bash
# Backup de la configuración original
sudo cp /etc/apache2/sites-enabled/www.ifap-edu.uk.conf /etc/apache2/sites-enabled/www.ifap-edu.uk.conf.backup

# Actualización del puerto de 5173 a 5174
sudo sed -i 's/127.0.0.1:5173/127.0.0.1:5174/g' /etc/apache2/sites-enabled/www.ifap-edu.uk.conf

# Recarga de Apache
sudo systemctl reload apache2
```

### 2. Corrección de la Configuración del Túnel
```yaml
# Archivo: /root/.cloudflared/config.yml
tunnel: 016715e6-2fb6-4a62-a7e8-3ab94fefcd43
credentials-file: /root/.cloudflared/016715e6-2fb6-4a62-a7e8-3ab94fefcd43.json

ingress:
  - hostname: www.ifap-edu.uk
    service: http://localhost:80
  - hostname: api.ifap-edu.uk
    service: http://localhost:80
  - service: http_status:404
```

### 3. Creación de Servicio Systemd
Se creó un servicio systemd para hacer el túnel persistente:

```ini
# Archivo: /etc/systemd/system/cloudflare-tunnel.service
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

## Estado Actual

### ✅ Funcionando Correctamente
- `www.ifap-edu.uk` - Responde con HTTP/2 200
- Túnel de Cloudflare con 4 conexiones activas
- Servicio systemd configurado para inicio automático

### ⚠️ Pendiente de Configuración DNS
- `api.ifap-edu.uk` - Necesita registro DNS en Cloudflare

## Arquitectura de la Solución

```
Internet → Cloudflare → Túnel → Apache (puerto 80) → Aplicaciones Locales
                                    ├── www.ifap-edu.uk → Vite (puerto 5174)
                                    └── api.ifap-edu.uk → Django (puerto 8000)
```

## Comandos de Verificación

### Verificar Estado del Túnel
```bash
cloudflared tunnel info 016715e6-2fb6-4a62-a7e8-3ab94fefcd43
```

### Verificar Servicio Systemd
```bash
sudo systemctl status cloudflare-tunnel.service
```

### Probar Conectividad
```bash
curl -I https://www.ifap-edu.uk
```

## Próximos Pasos Recomendados

1. **Configurar DNS para API**: Agregar registro CNAME para `api.ifap-edu.uk` en Cloudflare
2. **Monitoreo**: Configurar alertas para el estado del túnel
3. **Backup**: Documentar procedimiento de respaldo para configuraciones críticas

## Archivos Modificados

- `/etc/apache2/sites-enabled/www.ifap-edu.uk.conf`
- `/root/.cloudflared/config.yml`
- `/etc/systemd/system/cloudflare-tunnel.service` (nuevo)

## Archivos de Backup Creados

- `/etc/apache2/sites-enabled/www.ifap-edu.uk.conf.backup`
- `/root/.cloudflared/config.yml.backup`
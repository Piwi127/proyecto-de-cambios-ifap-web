# Configuración de Red y Túnel - IFAP

## Resumen de la Configuración

Este documento detalla la configuración completa de red, túnel de Cloudflare y proxy Apache para el proyecto IFAP.

## Arquitectura de Red

```
Internet → Cloudflare → Cloudflare Tunnel → Apache (puerto 80) → Backend/Frontend
```

### Flujo de Datos:
1. **Cloudflare** recibe las peticiones de `www.ifap-edu.uk`
2. **Cloudflare Tunnel** redirige a Apache en `localhost:80`
3. **Apache** actúa como proxy reverso:
   - `/api/*` → Django Backend (puerto 8000)
   - `/ws/*` → Django WebSockets (puerto 8000)
   - `/vite-hmr` → Vite HMR WebSockets (puerto 5174)
   - `/*` → Frontend React/Vite (puerto 5174)

## Configuraciones Aplicadas

### 1. Cloudflare Tunnel (`/root/.cloudflared/config.yml`)
```yaml
tunnel: ifap-tunnel
credentials-file: /root/.cloudflared/016715e6-2fb6-4a62-a7e8-3ab94fefcd43.json

ingress:
  - hostname: www.ifap-edu.uk
    service: http://localhost:80
  - service: http_status:404
```

### 2. Apache Virtual Host (`/etc/apache2/sites-available/www.ifap-edu.uk.conf`)
```apache
<VirtualHost *:80>
    ServerName www.ifap-edu.uk
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyRequests Off
    
    # API requests to Django backend (PRIORITY: FIRST)
    ProxyPass /api/ http://127.0.0.1:8000/api/ nocanon
    ProxyPassReverse /api/ http://127.0.0.1:8000/api/
    
    # WebSocket connections for Django Channels
    ProxyPass /ws/ ws://127.0.0.1:8000/ws/ nocanon
    ProxyPassReverse /ws/ ws://127.0.0.1:8000/ws/
    
    # Vite HMR WebSocket connections
    ProxyPass /vite-hmr ws://127.0.0.1:5174/vite-hmr nocanon
    ProxyPassReverse /vite-hmr ws://127.0.0.1:5174/vite-hmr
    
    # Frontend requests (PRIORITY: LAST)
    ProxyPass / http://127.0.0.1:5174/ nocanon
    ProxyPassReverse / http://127.0.0.1:5174/
    
    # CORS headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</VirtualHost>
```

### 3. Django Backend (`backend/ifap_backend/settings.py`)
```python
# Hosts permitidos
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'www.ifap-edu.uk', 'ifap-edu.uk']

# CORS origins permitidos
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:8003",
    "http://127.0.0.1:8003",
    "https://www.ifap-edu.uk",
    "https://ifap-edu.uk",
    "http://www.ifap-edu.uk",
    "http://ifap-edu.uk",
]
```

### 4. Frontend Vite (`frontend/vite.config.js`)
```javascript
server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    hmr: {
        port: 5174,
    },
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
},
```

## Puertos Utilizados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Apache | 80 | Proxy reverso principal |
| Django Backend | 8000 | API REST y WebSockets |
| Vite Frontend | 5174 | Servidor de desarrollo React |
| Cloudflare Tunnel | - | Túnel seguro a Cloudflare |

## Problemas Resueltos

### 1. Error 400 "Datos inválidos en la solicitud"
- **Causa**: `www.ifap-edu.uk` no estaba en `ALLOWED_HOSTS`
- **Solución**: Agregado a `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`

### 2. Error WebSocket de Vite
- **Causa**: Conflicto de puerto entre config (5173) y script (5174)
- **Solución**: Unificado puerto 5174 en toda la configuración

### 3. Configuración de WebSocket
- **Estado**: Configurado correctamente para Django y Vite HMR

## Verificación de Estado

Para verificar que todo funciona correctamente:

```bash
# Verificar servicios activos
ps aux | grep -E "(daphne|vite)" | grep -v grep

# Probar API
curl -X POST https://www.ifap-edu.uk/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'

# Verificar frontend
curl -I http://localhost:5174/
```

## Notas Importantes

1. **Orden de ProxyPass**: Las rutas más específicas (`/api/`) deben ir antes que las generales (`/`)
2. **nocanon**: Usado para evitar problemas con caracteres especiales en URLs
3. **WebSocket**: Configurado tanto para Django Channels como para Vite HMR
4. **CORS**: Configurado para permitir requests desde todos los dominios necesarios
5. **Seguridad**: El túnel de Cloudflare proporciona cifrado automático HTTPS

## Mantenimiento

- Los logs de Apache están en `/var/log/apache2/`
- Los logs del proyecto están en `logs/`
- Para reiniciar servicios usar `./start_servers.sh`
- Para detener servicios usar `./stop_servers.sh`
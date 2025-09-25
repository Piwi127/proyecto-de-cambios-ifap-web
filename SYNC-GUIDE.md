# 🔄 Guía de Sincronización Automática IFAP

Esta guía te explica cómo usar el sistema de sincronización automática entre GitHub y tu entorno de desarrollo local.

## 📋 Resumen del Sistema

El sistema incluye tres componentes principales:

1. **`auto-sync.sh`** - Script de sincronización manual/automática
2. **`watch-github.sh`** - Monitoreo continuo de cambios en GitHub
3. **Git Hooks** - Automatización post-merge
4. **GitHub Actions** - Notificaciones desde el repositorio

## 🚀 Uso Rápido

### Sincronización Manual

```bash
# Sincronización interactiva (te pregunta antes de detener servidores)
./auto-sync.sh

# Sincronización automática (detiene y reinicia servidores automáticamente)
./auto-sync.sh --auto
```

### Monitoreo Automático

```bash
# Iniciar monitoreo en primer plano
./watch-github.sh start

# Iniciar monitoreo en segundo plano (recomendado)
./watch-github.sh daemon

# Ver estado del monitoreo
./watch-github.sh status

# Detener monitoreo
./watch-github.sh stop

# Ver logs recientes
./watch-github.sh logs
```

## 📖 Guía Detallada

### 1. Script de Auto-Sincronización (`auto-sync.sh`)

Este script sincroniza tu entorno local con los últimos cambios de GitHub.

**Características:**
- ✅ Backup automático de cambios locales
- ✅ Detección inteligente de servidores en ejecución
- ✅ Actualización automática de dependencias
- ✅ Ejecución de migraciones cuando es necesario
- ✅ Reinicio automático de servidores

**Opciones:**
```bash
./auto-sync.sh          # Modo interactivo
./auto-sync.sh --auto   # Modo automático
./auto-sync.sh --help   # Mostrar ayuda
```

**¿Cuándo usar?**
- Cuando quieras sincronizar manualmente
- Después de que alguien haga push a GitHub
- Antes de empezar a trabajar en el proyecto

### 2. Monitoreo Continuo (`watch-github.sh`)

Este script verifica automáticamente cada 5 minutos si hay nuevos cambios en GitHub.

**Características:**
- 🔄 Verificación automática cada 5 minutos
- 📝 Logging detallado
- 🔔 Notificaciones de escritorio (si están disponibles)
- ⚡ Sincronización automática cuando detecta cambios

**Comandos:**
```bash
./watch-github.sh start    # Iniciar en primer plano
./watch-github.sh daemon   # Iniciar en segundo plano
./watch-github.sh stop     # Detener monitoreo
./watch-github.sh status   # Ver estado actual
./watch-github.sh logs     # Ver logs recientes
```

**¿Cuándo usar?**
- Para mantener tu entorno siempre actualizado
- Cuando trabajas en equipo y quieres recibir cambios automáticamente
- Para entornos de desarrollo que deben estar siempre sincronizados

### 3. Git Hooks Automáticos

Se ejecutan automáticamente después de hacer `git pull`.

**Características:**
- 🎯 Detección inteligente de cambios críticos
- 📦 Actualización automática de dependencias solo cuando es necesario
- 🗄️ Ejecución de migraciones cuando hay cambios en modelos
- 🔄 Reinicio de servidores solo cuando es requerido

**Se activa automáticamente cuando:**
- Cambias de rama
- Haces `git pull`
- Haces `git merge`

### 4. GitHub Actions

Proporciona información detallada sobre los cambios en cada push.

**Características:**
- 📊 Análisis automático de cambios
- 🔔 Notificaciones en GitHub
- 📋 Resumen de acciones recomendadas
- 🎯 Detección de tipos de cambios (dependencias, migraciones, etc.)

## 🛠️ Configuración Inicial

### 1. Verificar Permisos

```bash
# Hacer scripts ejecutables (ya hecho)
chmod +x auto-sync.sh
chmod +x watch-github.sh
chmod +x .git/hooks/post-merge
```

### 2. Configurar Notificaciones (Opcional)

Para recibir notificaciones de escritorio:

```bash
# Ubuntu/Debian
sudo apt install libnotify-bin

# Fedora/RHEL
sudo dnf install libnotify
```

### 3. Configurar Variables de Entorno (Opcional)

Puedes personalizar el comportamiento creando un archivo `.sync-config`:

```bash
# .sync-config
CHECK_INTERVAL=300          # Intervalo en segundos (5 minutos)
AUTO_RESTART_SERVERS=true   # Reiniciar servidores automáticamente
BACKUP_CHANGES=true         # Hacer backup de cambios locales
ENABLE_NOTIFICATIONS=true   # Habilitar notificaciones
```

## 📋 Flujos de Trabajo Recomendados

### Para Desarrollo Individual

```bash
# Al empezar el día
./auto-sync.sh

# Iniciar monitoreo automático
./watch-github.sh daemon

# Trabajar normalmente...
# Los cambios se sincronizarán automáticamente cada 5 minutos
```

### Para Trabajo en Equipo

```bash
# Mantener monitoreo activo siempre
./watch-github.sh daemon

# Verificar estado periódicamente
./watch-github.sh status

# Ver qué cambios se han sincronizado
./watch-github.sh logs
```

### Para Sincronización Manual

```bash
# Antes de empezar a trabajar
./auto-sync.sh

# Después de que alguien haga push
./auto-sync.sh --auto
```

## 🔍 Solución de Problemas

### El monitoreo no funciona

```bash
# Verificar estado
./watch-github.sh status

# Ver logs para errores
./watch-github.sh logs

# Reiniciar monitoreo
./watch-github.sh stop
./watch-github.sh daemon
```

### Error de conexión con GitHub

```bash
# Verificar conectividad
ping github.com

# Verificar configuración de Git
git remote -v

# Probar fetch manual
git fetch origin
```

### Servidores no se reinician

```bash
# Verificar que los scripts existen
ls -la start_servers.sh stop_servers.sh

# Reiniciar manualmente
./stop_servers.sh
./start_servers.sh
```

### Conflictos de merge

```bash
# Ver cambios locales
git status

# Hacer backup manual
git stash push -m "backup_manual"

# Sincronizar
./auto-sync.sh --auto

# Recuperar cambios si es necesario
git stash pop
```

## 📊 Logs y Monitoreo

### Ubicación de Logs

- **Sincronización:** `logs/github-sync.log`
- **Backend:** `logs/backend.log`
- **Frontend:** `logs/frontend.log`

### Comandos Útiles

```bash
# Ver logs de sincronización en tiempo real
tail -f logs/github-sync.log

# Ver últimos 20 logs
./watch-github.sh logs

# Ver estado de servidores
ps aux | grep -E "(daphne|vite)"

# Ver puertos en uso
ss -tlnp | grep -E "(8000|5174)"
```

## 🎯 Mejores Prácticas

1. **Mantén el monitoreo activo** durante el desarrollo
2. **Haz commit frecuente** de tus cambios locales
3. **Usa branches** para features grandes
4. **Verifica logs** si algo no funciona como esperado
5. **Sincroniza manualmente** antes de cambios importantes

## 🆘 Comandos de Emergencia

```bash
# Detener todo y reiniciar limpio
./watch-github.sh stop
./stop_servers.sh
git stash
./auto-sync.sh --auto

# Verificar que todo funciona
./watch-github.sh status
ps aux | grep -E "(daphne|vite)"
```

---

¡Tu entorno de desarrollo ahora se mantiene automáticamente sincronizado con GitHub! 🎉
# Scripts de Servidores - Proyecto IFAP

Este proyecto incluye scripts automatizados para gestionar los servidores de desarrollo.

## 📋 Requisitos Previos

Antes de usar los scripts, asegúrese de que:

1. **Python y entorno virtual**: El backend requiere Python 3.13+ con un entorno virtual configurado
2. **Node.js y npm**: El frontend requiere Node.js 22+ y npm
3. **Dependencias instaladas**:
   - Backend: `pip install django djangorestframework djangorestframework-simplejwt`
   - Frontend: `npm install` en el directorio frontend

## 🚀 Scripts Disponibles

### `start_servers.sh`
Inicia todos los servidores del proyecto IFAP:
- **Backend Django**: Puerto 8000 (http://127.0.0.1:8000)
- **Frontend React/Vite**: Puerto preferido 5174, pero puede usar alternativo (http://localhost:5174+)

**Uso:**
```bash
./start_servers.sh
```

**Características:**
- ✅ Verifica puertos disponibles antes de iniciar
- ✅ Valida que las dependencias estén instaladas
- ✅ Inicia servidores en segundo plano
- ✅ Monitorea el estado de los procesos
- ✅ Detecta automáticamente el puerto real usado por Vite
- ✅ Guarda logs en `logs/backend.log` y `logs/frontend.log`
- ✅ Guarda PIDs en `logs/backend.pid` y `logs/frontend.pid`

### `stop_servers.sh`
Detiene todos los servidores activos del proyecto IFAP.

**Uso:**
```bash
./stop_servers.sh
```

**Características:**
- ✅ Detiene procesos gracefully (SIGTERM)
- ✅ Forza terminación si es necesario (SIGKILL)
- ✅ Limpia archivos de PID
- ✅ Verifica que los puertos queden liberados
- ✅ Detecta procesos huérfanos

## 📁 Estructura de Archivos

```
proyecto-ifap/
├── start_servers.sh      # Script para iniciar servidores
├── stop_servers.sh       # Script para detener servidores
├── logs/                 # Directorio de logs (creado automáticamente)
│   ├── backend.log       # Logs del servidor Django
│   ├── frontend.log      # Logs del servidor React/Vite
│   ├── backend.pid       # PID del proceso backend
│   └── frontend.pid      # PID del proceso frontend
├── backend/              # Código del backend Django
└── frontend/             # Código del frontend React
```

## 🔧 Solución de Problemas

### Puertos ocupados
Si los puertos 8000 o 5174 están ocupados:
```bash
# Ver qué proceso usa el puerto
lsof -i :8000
lsof -i :5174

# Detener procesos específicos
./stop_servers.sh
```

### Dependencias faltantes
```bash
# Backend
cd backend
source venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt

# Frontend
cd ../frontend
npm install
```

### Permisos de ejecución
```bash
chmod +x start_servers.sh stop_servers.sh
```

## 📊 Estados de los Servidores

### Verificación manual
```bash
# Verificar procesos
ps aux | grep "manage.py\|vite\|node.*dev"

# Verificar puertos
netstat -tlnp | grep ":8000\|:5174"
```

### Logs en tiempo real
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

## 🎯 Flujo de Trabajo Recomendado

1. **Desarrollo diario**:
   ```bash
   ./start_servers.sh
   # Trabajar en el código
   ./stop_servers.sh
   ```

2. **Desarrollo continuo**:
   ```bash
   ./start_servers.sh &
   # Los servidores se mantienen ejecutándose
   ```

3. **Debugging**:
   ```bash
   ./start_servers.sh
   # En otra terminal
   tail -f logs/backend.log
   tail -f logs/frontend.log
   ```

## ⚠️ Notas Importantes

- Los scripts verifican automáticamente la estructura del proyecto
- Se crean logs automáticamente en el directorio `logs/`
- Los servidores se ejecutan en segundo plano para no bloquear la terminal
- Use `./stop_servers.sh` para una parada limpia
- Los scripts incluyen colores para mejor legibilidad
- **Vite** puede elegir un puerto alternativo si el 5174 está ocupado (5175, 5176, etc.)

## 🔧 Comportamiento de Vite

El servidor de desarrollo de Vite (frontend) tiene las siguientes características:

- **Puerto preferido**: 5174
- **Puertos alternativos**: Si 5174 está ocupado, usa 5175, 5176, etc.
- **Detección automática**: El script detecta automáticamente qué puerto está usando
- **Información en logs**: El puerto real se muestra en `logs/frontend.log`

**Ejemplo de salida:**
```
🌐 Frontend disponible en: http://localhost:5174
```
o si el puerto 5174 está ocupado:
```
🌐 Frontend disponible en: http://localhost:5175
```

## 📞 Soporte

Si encuentra problemas:
1. Verifique los logs en `logs/`
2. Asegúrese de que las dependencias estén instaladas
3. Verifique que los puertos no estén ocupados
4. Reinicie los scripts con permisos de ejecución

---
**Proyecto IFAP** - Instituto de Formación Archivística del Perú
*Fecha: 16 de setiembre de 2025*
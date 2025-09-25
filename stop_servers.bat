@echo off
echo 🛑 Deteniendo servidores del proyecto IFAP en Windows...
echo.

echo Deteniendo procesos en puerto 8000 (backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    if errorlevel 1 (
        echo No se pudo detener el proceso en puerto 8000
    ) else (
        echo ✅ Proceso en puerto 8000 detenido
    )
)

echo Deteniendo procesos en puerto 5173 (frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    if errorlevel 1 (
        echo No se pudo detener el proceso en puerto 5173
    ) else (
        echo ✅ Proceso en puerto 5173 detenido
    )
)

echo.
echo ✅ Servidores detenidos. Presiona cualquier tecla para continuar...
pause >nul
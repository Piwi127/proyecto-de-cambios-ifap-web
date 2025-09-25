@echo off
echo 🚀 Iniciando servidores del proyecto IFAP en Windows...
echo.

cd backend
echo Iniciando backend...
start "Backend Server" cmd /c "python manage.py runserver"
cd ..

cd frontend
echo Iniciando frontend...
start "Frontend Server" cmd /c "npm run dev"
cd ..

echo.
echo ✅ Servidores iniciados. Presiona cualquier tecla para continuar...
pause >nul
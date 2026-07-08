@echo off
cd /d "%~dp0apps\web"
echo Iniciando CRM Jupa Frontend...
echo Abre http://localhost:3000 en tu navegador
node node_modules\next\dist\bin\next dev -p 3000
pause

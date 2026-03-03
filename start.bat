@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              RV Car Solutions - Início Rápido             ║
echo ║                   Backend TypeScript                       ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ⚡ Iniciando projeto com backend TypeScript...
echo.

REM Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar/Instalar dependências
if not exist "node_modules\" (
    echo 📦 Instalando dependências...
    call npm install --silent
)

echo.
echo ════════════════════════════════════════════════════════════
echo  Frontend rodando em: http://localhost:8080
echo  Admin: http://localhost:8080/admin/login
echo.
echo  Credenciais: admin / admin123
echo ════════════════════════════════════════════════════════════
echo.

REM Iniciar
start http://localhost:8080
npm run dev

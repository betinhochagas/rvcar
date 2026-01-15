@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║         RV Car Solutions - Deploy para Vercel              ║
echo ║              Backend TypeScript + Frontend                 ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📦 Este script irá fazer o deploy completo do projeto na Vercel
echo.
echo ⚠️  Certifique-se de:
echo    1. Ter uma conta na Vercel (https://vercel.com)
echo    2. Ter feito login: vercel login
echo    3. Ter configurado as variáveis de ambiente
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p CONFIRMA="Deseja continuar com o deploy? (S/N): "
if /i not "%CONFIRMA%"=="S" (
    echo.
    echo ❌ Deploy cancelado
    pause
    exit /b 0
)

echo.
echo [1/3] Verificando Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI não encontrado. Instalando...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar Vercel CLI
        pause
        exit /b 1
    )
) else (
    echo ✅ Vercel CLI instalado
)
echo.

echo [2/3] Fazendo build do frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha no build do frontend
    pause
    exit /b 1
)
echo ✅ Build concluído
echo.

echo [3/3] Fazendo deploy...
echo.
echo 📍 Escolha o tipo de deploy:
echo    1. Staging (preview)
echo    2. Produção
echo.
set /p TIPO="Digite 1 ou 2: "

if "%TIPO%"=="2" (
    echo.
    echo 🚀 Deploy para PRODUÇÃO...
    call vercel --prod
) else (
    echo.
    echo 🚀 Deploy para STAGING...
    call vercel
)

if %errorlevel% neq 0 (
    echo [ERRO] Falha no deploy
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ Deploy concluído com sucesso!
echo ════════════════════════════════════════════════════════════
echo.
echo 📝 Próximos passos:
echo    1. Acesse a URL fornecida pela Vercel
echo    2. Teste o login: admin / admin123
echo    3. Verifique todas as funcionalidades
echo.
echo 💡 Dica: Configure as variáveis de ambiente no dashboard da Vercel:
echo    - RATE_LIMIT_MAX_ATTEMPTS=5
echo    - RATE_LIMIT_WINDOW_MINUTES=15
echo.
pause

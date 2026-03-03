@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              Deploy Rápido - Vercel                        ║
echo ║           (Para testar login imediatamente)                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Este script fará o deploy do backend TypeScript na Vercel
echo    para que você possa testar o login imediatamente.
echo.

echo [1/4] Verificando Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Instalando Vercel CLI...
    call npm install -g vercel
)
echo ✅ Vercel CLI pronto
echo.

echo [2/4] Fazendo login na Vercel...
echo     (Uma página do navegador vai abrir)
echo.
call vercel login
if %errorlevel% neq 0 (
    echo ❌ Login cancelado ou falhou
    pause
    exit /b 1
)
echo ✅ Login realizado
echo.

echo [3/4] Fazendo build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build falhou
    pause
    exit /b 1
)
echo ✅ Build concluído
echo.

echo [4/4] Fazendo deploy...
echo.
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deploy falhou
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ DEPLOY CONCLUÍDO!
echo ════════════════════════════════════════════════════════════
echo.
echo 📋 Próximos passos:
echo.
echo 1. Copie a URL que a Vercel forneceu (ex: https://seu-projeto.vercel.app)
echo.
echo 2. Abra: vite.config.ts
echo.
echo 3. Na linha do proxy, substitua:
echo    target: 'http://localhost:3000',
echo    POR:
echo    target: 'https://SUA-URL.vercel.app',
echo.
echo 4. Reinicie o servidor local: npm run dev
echo.
echo 5. Agora o login vai funcionar!
echo.
echo ════════════════════════════════════════════════════════════
pause

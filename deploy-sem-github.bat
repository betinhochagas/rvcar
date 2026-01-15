@echo off
echo ========================================
echo Deploy Vercel SEM Conectar ao GitHub
echo ========================================
echo.

REM Limpar cache
if exist .vercel (
    rmdir /s /q .vercel
    echo [OK] Cache limpo
)

echo.
echo Fazendo deploy local...
echo.

REM Deploy sem link ao GitHub
vercel deploy --prod --yes

echo.
echo ========================================
echo Se funcionou, copie a URL acima!
echo ========================================
pause

# Script Completo - Frontend + Backend Local

Write-Host ""
Write-Host "=== RV CAR - Ambiente de Desenvolvimento COMPLETO ===" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Limpar processos anteriores
Write-Host "Limpando processos anteriores..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
Write-Host "OK - Processos limpos" -ForegroundColor Green
Write-Host ""

# Passo 2: Verificar se .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "Criando arquivo .env.local..." -ForegroundColor Yellow
    
    $envContent = @"
# Backend Local
VITE_API_URL=http://localhost:3000/api
VITE_USE_API=true
NODE_ENV=development
"@
    
    Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
    Write-Host "OK - .env.local criado" -ForegroundColor Green
}

Write-Host "Configuracao atual (.env.local):" -ForegroundColor Cyan
Get-Content ".env.local" | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
Write-Host ""

# Passo 3: Abrir Backend em janela separada
Write-Host "Iniciando Backend (Express Local na porta 3000)..." -ForegroundColor Yellow
$backendWindow = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '=== BACKEND LOCAL (Express + TS-Node) ===' -ForegroundColor Cyan; cd '$PWD'; npx tsx server-local.mjs"
) -PassThru -WindowStyle Normal

Write-Host "Aguardando backend iniciar (10 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "OK - Backend iniciado" -ForegroundColor Green
Write-Host ""

# Passo 4: Iniciar Frontend
Write-Host "Iniciando Frontend (Vite na porta 8080)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== AMBIENTE PRONTO ===" -ForegroundColor Green
Write-Host ""
Write-Host "URLs Disponiveis:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:8080" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor White
Write-Host "   Admin:     http://localhost:8080/admin" -ForegroundColor White
Write-Host ""
Write-Host "Login Admin: admin / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar: Pressione Ctrl+C" -ForegroundColor Red
Write-Host ""

# Iniciar Vite (bloqueia o terminal)
try {
    npm run dev
} finally {
    Write-Host ""
    Write-Host "Parando servidores..." -ForegroundColor Yellow
    
    if ($backendWindow -and -not $backendWindow.HasExited) {
        $backendWindow.Kill()
    }
    
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Servidores parados" -ForegroundColor Green
}

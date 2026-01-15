# 🚀 Script de inicialização completo - Frontend + Backend

Write-Host "`n=== RV Car - Ambiente de Desenvolvimento ===" -ForegroundColor Cyan
Write-Host "Iniciando servidores locais...`n" -ForegroundColor Yellow

# 1. Matar processos existentes
Write-Host "1. Limpando processos anteriores..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# 2. Iniciar servidor de APIs (porta 3000)
Write-Host "2. Iniciando servidor de APIs (porta 3000)..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.mjs
}
Start-Sleep -Seconds 3

# 3. Verificar se API iniciou
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/api/vehicles" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ API Server iniciada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  API Server pode não ter iniciado corretamente" -ForegroundColor Yellow
}

# 4. Iniciar frontend Vite (porta 8080)
Write-Host "3. Iniciando frontend Vite (porta 8080)..." -ForegroundColor Yellow
$viteJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}
Start-Sleep -Seconds 3

# 5. Verificar se Vite iniciou
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Frontend Vite iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend Vite pode não ter iniciado corretamente" -ForegroundColor Yellow
}

Write-Host "`n=== AMBIENTE PRONTO! ===" -ForegroundColor Green
Write-Host "`n📱 Frontend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔌 API:       http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "🛡️  Admin:     http://localhost:8080/admin" -ForegroundColor Cyan

Write-Host "`n⌨️  Comandos:" -ForegroundColor Yellow
Write-Host "   - Ctrl+C para parar os servidores" -ForegroundColor Gray
Write-Host "   - Ou execute: Get-Job | Stop-Job; Get-Job | Remove-Job`n" -ForegroundColor Gray

# 6. Manter script rodando e monitorar jobs
Write-Host "Monitorando servidores... (Pressione Ctrl+C para sair)`n" -ForegroundColor Yellow

try {
    while ($true) {
        $apiState = (Get-Job -Id $apiJob.Id).State
        $viteState = (Get-Job -Id $viteJob.Id).State
        
        if ($apiState -ne "Running") {
            Write-Host "❌ API Server parou! Reiniciando..." -ForegroundColor Red
            $apiJob = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                node server.mjs
            }
        }
        
        if ($viteState -ne "Running") {
            Write-Host "❌ Vite parou! Reiniciando..." -ForegroundColor Red
            $viteJob = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                npm run dev
            }
        }
        
        Start-Sleep -Seconds 5
    }
} finally {
    Write-Host "`n`n=== Parando servidores ===" -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Servidores parados" -ForegroundColor Green
}

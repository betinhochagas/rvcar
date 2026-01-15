# Script de Testes dos Endpoints TypeScript
# Execute: .\test-endpoints.ps1

$BASE_URL = "http://localhost:3000/api"
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$RESET = "`e[0m"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  TESTES DOS ENDPOINTS TYPESCRIPT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Variável global para armazenar token
$global:TOKEN = $null

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [bool]$ExpectSuccess = $true
    )
    
    Write-Host "`n📍 Testando: $Name" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json"
            Headers     = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "   Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        if ($ExpectSuccess) {
            Write-Host "   ✅ SUCESSO" -ForegroundColor Green
            Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
            return $response
        }
        else {
            Write-Host "   ⚠️  DEVERIA FALHAR mas teve sucesso" -ForegroundColor Yellow
            return $response
        }
    }
    catch {
        if (-not $ExpectSuccess) {
            Write-Host "   ✅ FALHOU COMO ESPERADO" -ForegroundColor Green
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
            return $null
        }
        else {
            Write-Host "   ❌ ERRO" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.ErrorDetails.Message) {
                Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
            return $null
        }
    }
}

# ============================================================================
# 1. TESTES DE AUTENTICAÇÃO
# ============================================================================

Write-Host "`n`n===========================================" -ForegroundColor Cyan
Write-Host "  1️⃣  TESTES DE AUTENTICAÇÃO" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 1.1. Login com credenciais inválidas (deve falhar)
Test-Endpoint -Name "Login com senha inválida" `
    -Method "POST" `
    -Url "$BASE_URL/auth/login" `
    -Body @{ username = "admin"; password = "senha_errada" } `
    -ExpectSuccess $false

# 1.2. Login com credenciais corretas
$loginResponse = Test-Endpoint -Name "Login com credenciais corretas" `
    -Method "POST" `
    -Url "$BASE_URL/auth/login" `
    -Body @{ username = "admin"; password = "admin123" }

if ($loginResponse -and $loginResponse.token) {
    $global:TOKEN = $loginResponse.token
    Write-Host "`n   🔑 Token obtido: $($global:TOKEN.Substring(0, 20))..." -ForegroundColor Green
}

# 1.3. Verificar token
if ($global:TOKEN) {
    Test-Endpoint -Name "Verificar token válido" `
        -Method "POST" `
        -Url "$BASE_URL/auth/verify" `
        -Body @{ token = $global:TOKEN }
    
    # 1.4. Verificar token inválido (deve falhar)
    Test-Endpoint -Name "Verificar token inválido" `
        -Method "POST" `
        -Url "$BASE_URL/auth/verify" `
        -Body @{ token = "token_invalido_123" } `
        -ExpectSuccess $false
}

# ============================================================================
# 2. TESTES DE VEÍCULOS
# ============================================================================

Write-Host "`n`n===========================================" -ForegroundColor Cyan
Write-Host "  2️⃣  TESTES DE VEÍCULOS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$authHeaders = @{}
if ($global:TOKEN) {
    $authHeaders["Authorization"] = "Bearer $global:TOKEN"
}

# 2.1. Listar veículos (sem auth - público)
$vehicles = Test-Endpoint -Name "Listar todos os veículos" `
    -Method "GET" `
    -Url "$BASE_URL/vehicles"

# 2.2. Criar veículo sem autenticação (deve falhar)
Test-Endpoint -Name "Criar veículo sem auth" `
    -Method "POST" `
    -Url "$BASE_URL/vehicles" `
    -Body @{
    name     = "Carro Teste"
    price    = "R$ 50.000"
    image    = "/uploads/test.jpg"
    features = @("Ar condicionado", "Direção elétrica")
} `
    -ExpectSuccess $false

# 2.3. Criar veículo com autenticação
$newVehicle = Test-Endpoint -Name "Criar veículo com auth" `
    -Method "POST" `
    -Url "$BASE_URL/vehicles" `
    -Headers $authHeaders `
    -Body @{
    name      = "Carro Teste API"
    price     = "R$ 55.000"
    image     = "/uploads/test.jpg"
    features  = @("Ar condicionado", "Direção elétrica", "Vidros elétricos")
    available = $true
}

$vehicleId = $null
if ($newVehicle -and $newVehicle.id) {
    $vehicleId = $newVehicle.id
    Write-Host "`n   🚗 Veículo criado com ID: $vehicleId" -ForegroundColor Green
    
    # 2.4. Buscar veículo específico
    Test-Endpoint -Name "Buscar veículo por ID" `
        -Method "GET" `
        -Url "$BASE_URL/vehicles/$vehicleId"
    
    # 2.5. Atualizar veículo
    Test-Endpoint -Name "Atualizar veículo" `
        -Method "PUT" `
        -Url "$BASE_URL/vehicles/$vehicleId" `
        -Headers $authHeaders `
        -Body @{
        name  = "Carro Teste Atualizado"
        price = "R$ 60.000"
    }
    
    # 2.6. Toggle disponibilidade
    Test-Endpoint -Name "Toggle disponibilidade do veículo" `
        -Method "PATCH" `
        -Url "$BASE_URL/vehicles/$vehicleId" `
        -Headers $authHeaders
    
    # 2.7. Deletar veículo
    Test-Endpoint -Name "Deletar veículo" `
        -Method "DELETE" `
        -Url "$BASE_URL/vehicles/$vehicleId" `
        -Headers $authHeaders
}

# ============================================================================
# 3. TESTES DE CONFIGURAÇÕES DO SITE
# ============================================================================

Write-Host "`n`n===========================================" -ForegroundColor Cyan
Write-Host "  3️⃣  TESTES DE CONFIGURAÇÕES" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 3.1. Listar configurações (público)
$settings = Test-Endpoint -Name "Listar todas as configurações" `
    -Method "GET" `
    -Url "$BASE_URL/site-settings"

# 3.2. Criar/Atualizar configuração sem auth (deve falhar)
Test-Endpoint -Name "Atualizar config sem auth" `
    -Method "POST" `
    -Url "$BASE_URL/site-settings" `
    -Body @{
    config_key   = "test_config"
    config_value = "test value"
    config_type  = "text"
} `
    -ExpectSuccess $false

# 3.3. Criar/Atualizar configuração com auth
$newSetting = Test-Endpoint -Name "Criar configuração com auth" `
    -Method "POST" `
    -Url "$BASE_URL/site-settings" `
    -Headers $authHeaders `
    -Body @{
    config_key   = "test_config_api"
    config_value = "Valor de teste da API"
    config_type  = "text"
    description  = "Configuração de teste criada via API"
}

if ($newSetting) {
    $settingKey = "test_config_api"
    
    # 3.4. Buscar configuração específica
    Test-Endpoint -Name "Buscar configuração por key" `
        -Method "GET" `
        -Url "$BASE_URL/site-settings/$settingKey"
    
    # 3.5. Atualizar configuração
    Test-Endpoint -Name "Atualizar configuração" `
        -Method "PUT" `
        -Url "$BASE_URL/site-settings/$settingKey" `
        -Headers $authHeaders `
        -Body @{
        config_value = "Valor atualizado"
    }
    
    # 3.6. Deletar configuração
    Test-Endpoint -Name "Deletar configuração" `
        -Method "DELETE" `
        -Url "$BASE_URL/site-settings/$settingKey" `
        -Headers $authHeaders
}

# ============================================================================
# 4. TESTE DE LOGOUT
# ============================================================================

Write-Host "`n`n===========================================" -ForegroundColor Cyan
Write-Host "  4️⃣  TESTE DE LOGOUT" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

if ($global:TOKEN) {
    # 4.1. Fazer logout
    Test-Endpoint -Name "Logout" `
        -Method "POST" `
        -Url "$BASE_URL/auth/logout" `
        -Headers $authHeaders
    
    # 4.2. Tentar usar token após logout (deve falhar)
    Test-Endpoint -Name "Usar token após logout" `
        -Method "POST" `
        -Url "$BASE_URL/vehicles" `
        -Headers $authHeaders `
        -Body @{ name = "Teste" } `
        -ExpectSuccess $false
}

# ============================================================================
# RESUMO
# ============================================================================

Write-Host "`n`n===========================================" -ForegroundColor Cyan
Write-Host "  ✅ TESTES CONCLUÍDOS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "`nVerifique os resultados acima." -ForegroundColor Yellow
Write-Host "Se todos os testes passaram, o backend TypeScript está funcionando! 🎉`n" -ForegroundColor Green

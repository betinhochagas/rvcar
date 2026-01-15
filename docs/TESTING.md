# 🧪 Guia de Testes - Backend PHP + MySQL

## 📋 Objetivo

Testar a API PHP localmente no XAMPP antes de fazer deploy em produção.

---

## 🚀 Pré-requisitos

Antes de começar os testes, certifique-se de que:

- ✅ XAMPP está instalado e rodando
- ✅ Apache ativo (verde no XAMPP Control Panel)
- ✅ MySQL ativo (verde no XAMPP Control Panel)
- ✅ Pasta `api/` está em `C:\xampp\htdocs\rvcar-api`
- ✅ Banco de dados instalado (via install.php)

---

## 1️⃣ Testar API - Comandos PowerShell

### Teste 1: GET - Listar todos os veículos

```powershell
# Método 1: Navegador
# Abra: http://localhost/rvcar-api/vehicles.php

# Método 2: PowerShell
Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php" -Method GET
```

**Resultado esperado:**

```json
[
  {
    "id": "1",
    "name": "Fiat Mobi",
    "price": "R$650",
    "image": "/assets/mobi.jpg",
    "features": ["Econômico", "Ar Condicionado", ...],
    "available": true,
    "created_at": "2025-10-18 10:30:00",
    "updated_at": "2025-10-18 10:30:00"
  },
  ... (mais 7 veículos)
]
```

### Teste 2: GET - Buscar veículo específico

```powershell
Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=1" -Method GET
```

**Resultado esperado:**

```json
{
  "id": "1",
  "name": "Fiat Mobi",
  ...
}
```

### Teste 3: POST - Adicionar novo veículo

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    name = "Teste Veículo"
    price = "R$800"
    image = "/assets/teste.jpg"
    features = @("Teste 1", "Teste 2", "Teste 3")
    available = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response
```

**Resultado esperado:**

```json
{
  "id": "veh_67308f1a2b3c4",
  "name": "Teste Veículo",
  "price": "R$800",
  ...
}
```

### Teste 4: PUT - Atualizar veículo

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

# Primeiro, pegue o ID do veículo de teste que criamos
$vehicles = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php"
$testeId = ($vehicles | Where-Object { $_.name -eq "Teste Veículo" }).id

# Agora atualize
$body = @{
    name = "Teste Veículo ATUALIZADO"
    price = "R$900"
    available = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=$testeId" `
    -Method PUT `
    -Headers $headers `
    -Body $body

$response
```

**Resultado esperado:**

```json
{
  "id": "veh_67308f1a2b3c4",
  "name": "Teste Veículo ATUALIZADO",
  "price": "R$900",
  "available": false,
  ...
}
```

### Teste 5: PATCH - Toggle disponibilidade

```powershell
# Alternar disponibilidade do Fiat Mobi
$response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=1" -Method PATCH

Write-Host "Disponibilidade alterada para: $($response.available)"
```

### Teste 6: DELETE - Remover veículo

```powershell
# Remover o veículo de teste
$vehicles = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php"
$testeId = ($vehicles | Where-Object { $_.name -like "*Teste*" }).id

$response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=$testeId" -Method DELETE

$response
```

**Resultado esperado:**

```json
{
  "success": true,
  "message": "Veículo removido com sucesso"
}
```

---

## 2️⃣ Testar via Navegador

### Abrir no Navegador

1. **Listar veículos:**

   ```
   http://localhost/rvcar-api/vehicles.php
   ```

2. **Buscar veículo ID=1:**

   ```
   http://localhost/rvcar-api/vehicles.php?id=1
   ```

3. **Ver banco de dados:**
   ```
   http://localhost/phpmyadmin
   → Banco: rvcar_db
   → Tabela: vehicles
   ```

---

## 3️⃣ Testar Frontend React

### Passo 1: Configurar

1. Certifique-se de que `.env.local` existe:

   ```env
   VITE_API_URL=http://localhost/rvcar-api/vehicles.php
   VITE_USE_API=true
   ```

2. Reinicie o servidor React:
   ```powershell
   # Ctrl+C para parar (se estiver rodando)
   npm run dev
   ```

### Passo 2: Testar Site Público

1. Abra: http://localhost:8080
2. Role até "Nossos Veículos"
3. **Deve mostrar os 8 veículos do banco**
4. Abra DevTools (F12) → Console
5. Procure por:
   ```
   🔧 VehicleManager Config: { API_URL: "http://localhost/rvcar-api/vehicles.php", USE_API: true }
   🌐 Buscando veículos da API: http://localhost/rvcar-api/vehicles.php
   ✅ Veículos carregados: 8
   ```

### Passo 3: Testar Admin

1. Acesse: http://localhost:8080/admin/login
2. Login: `admin` / `rvcar2024`
3. **Teste: Adicionar Veículo**

   - Clique em "Adicionar Veículo"
   - Nome: "Teste Frontend"
   - Preço: "R$850"
   - Features: "Teste 1, Teste 2"
   - Salvar
   - ✅ Deve aparecer no dashboard
   - ✅ Abra phpMyAdmin e veja na tabela!

4. **Teste: Editar Veículo**

   - Clique em "Editar" no "Teste Frontend"
   - Mude o preço para "R$950"
   - Salvar
   - ✅ Deve atualizar no dashboard
   - ✅ Confira no phpMyAdmin

5. **Teste: Toggle Disponibilidade**

   - Clique no switch do "Teste Frontend"
   - ✅ Imagem fica em cinza
   - ✅ Badge "INDISPONÍVEL" aparece
   - ✅ Verifique no banco: `available = 0`

6. **Teste: Remover Veículo**
   - Clique em "Excluir" no "Teste Frontend"
   - Confirme
   - ✅ Some do dashboard
   - ✅ Some do banco (phpMyAdmin)

---

## 4️⃣ Testar Sincronização

### Cenário: Desktop ↔ Banco ↔ Mobile

1. **Desktop:**

   - Admin → Adicionar veículo "Sync Test"
   - Marcar como indisponível

2. **Navegador Anônimo (simular mobile):**

   - Abrir: http://localhost:8080
   - Ver catálogo
   - ✅ "Sync Test" aparece em cinza!

3. **phpMyAdmin:**
   - Ver tabela `vehicles`
   - ✅ "Sync Test" está lá com `available = 0`

---

## 5️⃣ Verificar Logs

### Console do Navegador (F12)

**Busca bem-sucedida:**

```
🔧 VehicleManager Config: { API_URL: "...", USE_API: true }
🌐 Buscando veículos da API: http://localhost/rvcar-api/vehicles.php
✅ Veículos carregados: 8
```

**Se der erro:**

```
❌ Erro ao buscar veículos da API: TypeError: Failed to fetch
⚠️ Usando localStorage como fallback
```

### Logs do Apache (se necessário)

```powershell
# Ver últimas 50 linhas do log de erro
Get-Content C:\xampp\apache\logs\error.log -Tail 50
```

### Logs do MySQL (se necessário)

```powershell
# Ver erros do MySQL
Get-Content C:\xampp\mysql\data\*.err -Tail 50
```

---

## 6️⃣ Testes de Performance

### Medir Tempo de Resposta

```powershell
# PowerShell
Measure-Command {
    Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php"
}
```

**Esperado:** < 100ms (local)

### Verificar Queries SQL

1. phpMyAdmin → vehicles → Procurar → aba SQL
2. Execute:
   ```sql
   EXPLAIN SELECT * FROM vehicles ORDER BY created_at ASC;
   ```
3. Verifique se usa índice

---

## 7️⃣ Testes de Erro

### Teste 1: Banco de Dados Offline

```powershell
# Pare o MySQL no XAMPP
# Depois tente:
Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php"
```

**Deve retornar erro 500:**

```json
{
  "error": true,
  "message": "Erro ao conectar com o banco de dados"
}
```

### Teste 2: Veículo Inexistente

```powershell
Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=9999"
```

**Deve retornar erro 404:**

```json
{
  "error": true,
  "message": "Veículo não encontrado"
}
```

### Teste 3: Dados Inválidos

```powershell
$body = @{
    name = ""  # Nome vazio
    price = ""
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
} catch {
    Write-Host "Erro capturado corretamente: $($_.Exception.Message)"
}
```

**Deve retornar erro 400:**

```json
{
  "error": true,
  "message": "Nome e preço são obrigatórios"
}
```

---

## 8️⃣ Checklist Completo

### API Backend

- [ ] GET - Lista 8 veículos padrão
- [ ] GET com ID - Retorna veículo específico
- [ ] GET com ID inválido - Retorna 404
- [ ] POST - Adiciona novo veículo
- [ ] POST sem nome/preço - Retorna 400
- [ ] PUT - Atualiza veículo existente
- [ ] PUT com ID inválido - Retorna 404
- [ ] DELETE - Remove veículo
- [ ] DELETE com ID inválido - Retorna 404
- [ ] PATCH - Alterna disponibilidade
- [ ] CORS habilitado (headers corretos)

### Frontend React

- [ ] Catálogo carrega veículos da API
- [ ] Console mostra "Buscando veículos da API"
- [ ] Admin adiciona veículo → salva no banco
- [ ] Admin edita veículo → atualiza no banco
- [ ] Admin remove veículo → exclui do banco
- [ ] Admin toggle disponível → altera no banco
- [ ] Veículo indisponível aparece em cinza
- [ ] Badge "INDISPONÍVEL" visível
- [ ] Fallback para localStorage se API falhar

### Sincronização

- [ ] Mudanças no admin aparecem no site público
- [ ] Mudanças aparecem no banco (phpMyAdmin)
- [ ] Múltiplas abas sincronizam (após refresh)

### Performance

- [ ] API responde em < 100ms (local)
- [ ] Sem erros no console do navegador
- [ ] Sem erros no log do Apache
- [ ] Sem erros no log do MySQL

---

## 9️⃣ Script de Teste Automático

Copie e execute no PowerShell:

```powershell
Write-Host "🧪 Iniciando testes automatizados..." -ForegroundColor Cyan

# Teste 1: API está online
try {
    $vehicles = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php"
    Write-Host "✅ Teste 1: API online - $($vehicles.Count) veículos" -ForegroundColor Green
} catch {
    Write-Host "❌ Teste 1: API offline" -ForegroundColor Red
    exit
}

# Teste 2: Adicionar veículo
try {
    $body = @{
        name = "Teste Automatizado"
        price = "R$999"
        features = @("Teste")
        available = $true
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body

    $testeId = $response.id
    Write-Host "✅ Teste 2: Veículo adicionado - ID: $testeId" -ForegroundColor Green
} catch {
    Write-Host "❌ Teste 2: Falha ao adicionar" -ForegroundColor Red
}

# Teste 3: Atualizar veículo
try {
    $body = @{
        name = "Teste Automatizado EDITADO"
        price = "R$1000"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=$testeId" `
        -Method PUT `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body

    Write-Host "✅ Teste 3: Veículo atualizado" -ForegroundColor Green
} catch {
    Write-Host "❌ Teste 3: Falha ao atualizar" -ForegroundColor Red
}

# Teste 4: Toggle disponibilidade
try {
    $response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=$testeId" -Method PATCH
    Write-Host "✅ Teste 4: Disponibilidade alterada" -ForegroundColor Green
} catch {
    Write-Host "❌ Teste 4: Falha ao alterar" -ForegroundColor Red
}

# Teste 5: Remover veículo
try {
    $response = Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php?id=$testeId" -Method DELETE
    Write-Host "✅ Teste 5: Veículo removido" -ForegroundColor Green
} catch {
    Write-Host "❌ Teste 5: Falha ao remover" -ForegroundColor Red
}

Write-Host "`n🎉 Testes concluídos!" -ForegroundColor Cyan
```

---

## 🎯 Próximos Passos

Após todos os testes passarem:

1. ✅ **Documentar problemas encontrados**
2. ✅ **Fazer backup do banco:** phpMyAdmin → Export
3. ✅ **Preparar para produção:** Seguir `CPANEL-DEPLOY.md`
4. 🚀 **Deploy no cPanel**

---

**Boa sorte nos testes! 🧪✨**

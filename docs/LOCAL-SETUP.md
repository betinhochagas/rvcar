# 🏠 Configuração Local - XAMPP

## 📋 Pré-requisitos

✅ Você já tem:

- XAMPP instalado em `C:\xampp`
- Projeto React em `d:\website\rv-car-solutions-main`
- MySQL e Apache funcionando

---

## 🚀 Passo a Passo - Configuração

### 1. Criar Link Simbólico (Recomendado)

Abra o **PowerShell como Administrador** e execute:

```powershell
# Criar link simbólico do projeto para o htdocs
New-Item -ItemType SymbolicLink -Path "C:\xampp\htdocs\rvcar-api" -Target "d:\website\rv-car-solutions-main\api"
```

**OU**, se preferir copiar (mais simples):

```powershell
# Copiar pasta api para htdocs
Copy-Item -Path "d:\website\rv-car-solutions-main\api" -Destination "C:\xampp\htdocs\rvcar-api" -Recurse
```

### 2. Iniciar Serviços do XAMPP

1. Abra o **XAMPP Control Panel**
2. Inicie os serviços:
   - ✅ **Apache** (porta 80 ou 8080)
   - ✅ **MySQL** (porta 3306)

### 3. Criar Banco de Dados

Você tem **duas opções**:

#### Opção A: Instalador Automático (Mais Fácil) ⭐

1. Abra o navegador
2. Acesse: http://localhost/rvcar-api/install.php
3. Clique em **"🚀 Instalar Banco de Dados"**
4. Aguarde a instalação (5-10 segundos)
5. Pronto! ✅

#### Opção B: Manual via phpMyAdmin

1. Acesse: http://localhost/phpmyadmin
2. Clique em **"SQL"** no topo
3. Copie e cole o conteúdo do arquivo `api/schema.sql`
4. Clique em **"Executar"**
5. Pronto! ✅

### 4. Testar a API

#### Teste 1: Listar Veículos

Abra o navegador e acesse:

```
http://localhost/rvcar-api/vehicles.php
```

**Deve retornar JSON com 8 veículos:**

```json
[
  {
    "id": "1",
    "name": "Fiat Mobi",
    "price": "R$650",
    "features": ["Econômico", "Ar Condicionado", ...],
    "available": true,
    ...
  },
  ...
]
```

#### Teste 2: Buscar Veículo Específico

```
http://localhost/rvcar-api/vehicles.php?id=1
```

#### Teste 3: Testar via cURL (PowerShell)

```powershell
# GET - Listar todos
curl http://localhost/rvcar-api/vehicles.php

# POST - Adicionar novo (teste)
$body = @{
    name = "Teste Veículo"
    price = "R$800"
    features = @("Teste 1", "Teste 2")
    available = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/rvcar-api/vehicles.php" -Method POST -Body $body -ContentType "application/json"
```

---

## 🔧 Configurar Frontend React

Agora vamos atualizar o projeto React para usar sua API local!

### 1. Criar arquivo de configuração da API

O frontend já está preparado. Você só precisa criar um arquivo `.env.local`:

```bash
# No diretório do projeto React
cd d:\website\rv-car-solutions-main
```

Crie o arquivo `.env.local` (vou criar para você no próximo passo)

### 2. Testar Frontend + Backend

1. **Terminal 1 - Backend (XAMPP):**

   - XAMPP Control Panel → Apache rodando

2. **Terminal 2 - Frontend:**

   ```bash
   cd d:\website\rv-car-solutions-main
   npm run dev
   ```

3. **Abrir navegador:**

   ```
   http://localhost:8080
   ```

4. **Testar Admin:**
   - Login: `admin` / `rvcar2024`
   - Adicionar/editar veículos
   - Ver no site público → deve sincronizar! ✅

---

## 🧪 Testes Funcionais

### Checklist de Testes

- [ ] **API - GET:** Lista veículos
- [ ] **API - POST:** Adiciona veículo
- [ ] **API - PUT:** Edita veículo
- [ ] **API - DELETE:** Remove veículo
- [ ] **API - PATCH:** Toggle disponibilidade
- [ ] **Frontend:** Carrega veículos da API
- [ ] **Admin:** Adiciona veículo → aparece no banco
- [ ] **Admin:** Edita veículo → atualiza no banco
- [ ] **Admin:** Remove veículo → some do banco
- [ ] **Admin:** Toggle disponível → atualiza estado
- [ ] **Site Público:** Mostra veículos da API
- [ ] **Site Público:** Veículo indisponível em cinza

### Comandos de Teste Rápido

```powershell
# Ver se API está respondendo
curl http://localhost/rvcar-api/vehicles.php

# Ver logs do Apache (se der erro)
Get-Content C:\xampp\apache\logs\error.log -Tail 20

# Ver logs do MySQL
Get-Content C:\xampp\mysql\data\mysql_error.log -Tail 20
```

---

## 🐛 Solução de Problemas

### Erro: "Failed to connect to database"

**Causa:** MySQL não está rodando ou credenciais incorretas

**Solução:**

1. Abra XAMPP Control Panel
2. Verifique se MySQL está ativo (verde)
3. Edite `api/config.php` se necessário:
   ```php
   define('DB_USER', 'root');
   define('DB_PASS', '');  // Vazio no XAMPP
   ```

### Erro: "Access denied for user 'root'@'localhost'"

**Solução:**

1. Abra phpMyAdmin: http://localhost/phpmyadmin
2. Vá em "Contas de usuário"
3. Verifique se o usuário `root` tem senha
4. Se tiver senha, edite `api/config.php`

### Erro: "Table 'rvcar_db.vehicles' doesn't exist"

**Solução:**

1. Acesse: http://localhost/rvcar-api/install.php
2. Execute o instalador
3. OU rode o SQL manualmente no phpMyAdmin

### API retorna HTML em vez de JSON

**Causa:** Erro de PHP não tratado

**Solução:**

1. Veja erro no navegador (deve aparecer)
2. Verifique logs: `C:\xampp\apache\logs\error.log`
3. Ative display de erros temporariamente em `config.php`:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

### CORS Error no Frontend

**Causa:** Headers CORS não configurados

**Solução:**

1. Verifique se `.htaccess` existe na pasta `api/`
2. Se não resolver, adicione no topo de `config.php`:
   ```php
   header('Access-Control-Allow-Origin: *');
   ```

### Porta 80 já está em uso

**Causa:** Outro programa usando porta 80 (Skype, IIS, etc.)

**Solução Rápida:**

1. XAMPP Control Panel → Config → Apache
2. Edite `httpd.conf`
3. Mude `Listen 80` para `Listen 8080`
4. Acesse: http://localhost:8080/rvcar-api/vehicles.php

---

## 📊 Monitoramento

### Ver Banco de Dados

```
http://localhost/phpmyadmin
→ Banco: rvcar_db
→ Tabela: vehicles
```

### Ver Logs em Tempo Real

**PowerShell:**

```powershell
# Apache
Get-Content C:\xampp\apache\logs\access.log -Wait

# MySQL
Get-Content C:\xampp\mysql\data\*.err -Wait
```

### Status dos Serviços

```powershell
# Ver processos XAMPP
Get-Process | Where-Object {$_.Name -like "*apache*" -or $_.Name -like "*mysql*"}
```

---

## ✅ Checklist de Configuração Completa

- [ ] XAMPP instalado e funcionando
- [ ] Apache rodando (porta 80 ou 8080)
- [ ] MySQL rodando (porta 3306)
- [ ] Pasta `api/` acessível via http://localhost/rvcar-api
- [ ] Banco de dados `rvcar_db` criado
- [ ] Tabela `vehicles` criada com 8 registros
- [ ] API retorna JSON ao acessar `vehicles.php`
- [ ] Frontend configurado com URL da API
- [ ] Teste de adicionar veículo funcionando
- [ ] Teste de editar veículo funcionando
- [ ] Teste de remover veículo funcionando
- [ ] Sincronização desktop ↔ banco funcionando

---

## 🎯 Próximos Passos

Após tudo funcionar localmente:

1. ✅ Testar todas as funcionalidades
2. ✅ Verificar logs para erros
3. ✅ Fazer backup do banco: `Tools > Export` no phpMyAdmin
4. 🚀 Preparar para deploy em produção (próximo guia)

---

## 💡 Dicas

### Atalhos Úteis

- phpMyAdmin: http://localhost/phpmyadmin
- API Vehicles: http://localhost/rvcar-api/vehicles.php
- Instalador: http://localhost/rvcar-api/install.php
- Dashboard: http://localhost/phpmyadmin/db_structure.php?db=rvcar_db

### Comandos Rápidos

```powershell
# Reiniciar Apache (se travar)
cd C:\xampp
.\apache_stop.bat
.\apache_start.bat

# Reiniciar MySQL
.\mysql_stop.bat
.\mysql_start.bat

# Ver versões
php -v
mysql --version
```

### Produtividade

- Use **Postman** ou **Insomnia** para testar API
- Use **VS Code** com extensão **PHP Intelephense**
- Mantenha XAMPP Control Panel sempre aberto

---

**Tudo pronto para desenvolvimento local! 🎉**

Se encontrar problemas, consulte a seção "Solução de Problemas" acima.

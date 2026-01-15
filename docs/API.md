# 📡 Documentação da API - RV Car

Documentação completa dos endpoints da API RESTful do sistema RV Car.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Veículos](#veículos)
  - [Configurações do Site](#configurações-do-site)
  - [Upload de Arquivos](#upload-de-arquivos)
- [Códigos de Status](#códigos-de-status)
- [Exemplos](#exemplos)

## Visão Geral

**Base URL**: `https://seu-backend.com/api`

**Formato**: JSON  
**Autenticação**: JWT Bearer Token (exceto endpoints públicos)  
**CORS**: Configurável via `.env`

### Headers Comuns

```http
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf-token}
```

## Autenticação

### Login

Autentica um usuário e retorna um token JWT.

**Endpoint**: `POST /auth.php`

**Body**:

```json
{
  "action": "login",
  "username": "admin",
  "password": "sua-senha"
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login realizado com sucesso",
  "requiresPasswordChange": false
}
```

**Resposta de Erro** (401):

```json
{
  "success": false,
  "message": "Credenciais inválidas",
  "remainingAttempts": 3
}
```

**Rate Limiting**: 5 tentativas a cada 15 minutos

### Trocar Senha

Troca a senha do usuário autenticado.

**Endpoint**: `POST /auth.php`

**Headers**:

```http
Authorization: Bearer {token}
X-CSRF-Token: {csrf-token}
```

**Body**:

```json
{
  "action": "change_password",
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha-forte"
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### Verificar Token

Valida se um token JWT ainda é válido.

**Endpoint**: `POST /auth.php`

**Headers**:

```http
Authorization: Bearer {token}
```

**Body**:

```json
{
  "action": "verify"
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "valid": true
}
```

## Endpoints

## Veículos

### Listar Veículos

Lista todos os veículos cadastrados.

**Endpoint**: `GET /vehicles.php`

**Autenticação**: ❌ Não necessária

**Resposta de Sucesso** (200):

```json
{
  "vehicles": [
    {
      "id": "veiculo-1",
      "nome": "Toyota Corolla 2024",
      "categoria": "Sedan",
      "preco": "180",
      "imagem": "/uploads/corolla.jpg",
      "descricao": "Sedan executivo completo",
      "features": ["Ar Condicionado", "Direção Elétrica", "Câmbio Automático"],
      "disponivel": true
    }
  ]
}
```

### Adicionar Veículo

Adiciona um novo veículo ao catálogo.

**Endpoint**: `POST /vehicles.php`

**Autenticação**: ✅ Bearer Token

**Headers**:

```http
Authorization: Bearer {token}
X-CSRF-Token: {csrf-token}
```

**Body**:

```json
{
  "action": "add",
  "vehicle": {
    "nome": "Honda Civic 2024",
    "categoria": "Sedan",
    "preco": "200",
    "imagem": "/uploads/civic.jpg",
    "descricao": "Sedan esportivo",
    "features": ["Turbo", "Multimídia", "Bancos de Couro"],
    "disponivel": true
  }
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Veículo adicionado com sucesso",
  "vehicle": {
    "id": "veiculo-2",
    "nome": "Honda Civic 2024",
    ...
  }
}
```

### Atualizar Veículo

Atualiza um veículo existente.

**Endpoint**: `POST /vehicles.php`

**Autenticação**: ✅ Bearer Token

**Body**:

```json
{
  "action": "update",
  "id": "veiculo-1",
  "vehicle": {
    "nome": "Toyota Corolla 2025",
    "preco": "190",
    ...
  }
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Veículo atualizado com sucesso"
}
```

### Deletar Veículo

Remove um veículo do catálogo.

**Endpoint**: `POST /vehicles.php`

**Autenticação**: ✅ Bearer Token

**Body**:

```json
{
  "action": "delete",
  "id": "veiculo-1"
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Veículo deletado com sucesso"
}
```

## Configurações do Site

### Obter Configurações

Retorna todas as configurações do site.

**Endpoint**: `GET /site-settings.php`

**Autenticação**: ❌ Não necessária

**Resposta de Sucesso** (200):

```json
{
  "titulo": "RV Car - Locação de Veículos",
  "descricao": "Aluguel de carros com as melhores condições",
  "logo": "/uploads/logo.svg",
  "favicon": "/uploads/favicon.ico",
  "ogImage": "/uploads/og-image.jpg",
  "contatos": {
    "locacao": {
      "telefone": "(11) 98765-4321",
      "email": "locacao@rvcar.com"
    },
    "investimento": {
      "telefone": "(11) 91234-5678",
      "email": "investimento@rvcar.com"
    }
  },
  "redesSociais": {
    "instagram": "https://instagram.com/rvcar",
    "facebook": "https://facebook.com/rvcar",
    "whatsapp": "5511987654321"
  }
}
```

### Atualizar Configurações

Atualiza as configurações do site.

**Endpoint**: `POST /site-settings.php`

**Autenticação**: ✅ Bearer Token

**Headers**:

```http
Authorization: Bearer {token}
X-CSRF-Token: {csrf-token}
```

**Body**:

```json
{
  "action": "update",
  "settings": {
    "titulo": "RV Car Premium",
    "descricao": "Nova descrição",
    ...
  }
}
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Configurações atualizadas com sucesso"
}
```

## Upload de Arquivos

### Upload de Imagem

Faz upload de uma imagem (veículo, logo, etc).

**Endpoint**: `POST /upload.php`

**Autenticação**: ✅ Bearer Token

**Headers**:

```http
Authorization: Bearer {token}
X-CSRF-Token: {csrf-token}
Content-Type: multipart/form-data
```

**Form Data**:

```
file: [binary]
type: vehicle|logo|favicon|og-image
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Upload realizado com sucesso",
  "url": "/uploads/imagem-123456.jpg"
}
```

**Validações**:

- Tamanho máximo: 5MB
- Formatos aceitos: JPG, PNG, SVG, WEBP, ICO
- Validação de MIME type real

## Códigos de Status

| Código | Significado                     |
| ------ | ------------------------------- |
| 200    | Sucesso                         |
| 400    | Requisição inválida             |
| 401    | Não autenticado                 |
| 403    | Sem permissão                   |
| 404    | Não encontrado                  |
| 429    | Muitas requisições (rate limit) |
| 500    | Erro interno do servidor        |

## Exemplos

### JavaScript/Fetch

```javascript
// Login
const login = async (username, password) => {
  const response = await fetch("https://seu-backend.com/api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  return response.json();
};

// Listar veículos
const getVehicles = async () => {
  const response = await fetch("https://seu-backend.com/api/vehicles.php");
  return response.json();
};

// Adicionar veículo (autenticado)
const addVehicle = async (vehicle, token, csrfToken) => {
  const response = await fetch("https://seu-backend.com/api/vehicles.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ action: "add", vehicle }),
  });
  return response.json();
};
```

### cURL

```bash
# Login
curl -X POST https://seu-backend.com/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"action":"login","username":"admin","password":"senha"}'

# Listar veículos
curl https://seu-backend.com/api/vehicles.php

# Adicionar veículo
curl -X POST https://seu-backend.com/api/vehicles.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "X-CSRF-Token: SEU_CSRF_TOKEN" \
  -d '{"action":"add","vehicle":{...}}'

# Upload de imagem
curl -X POST https://seu-backend.com/api/upload.php \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "X-CSRF-Token: SEU_CSRF_TOKEN" \
  -F "file=@imagem.jpg" \
  -F "type=vehicle"
```

## Segurança

### Rate Limiting

- **Login**: 5 tentativas a cada 15 minutos por IP
- **Upload**: 10 uploads por hora
- **API Geral**: 100 requisições por minuto

### CSRF Protection

Todas as operações de escrita (POST com auth) requerem um token CSRF válido:

```javascript
// Obter CSRF token
const csrfToken = await fetch('/api/csrf-token.php').then(r => r.text());

// Usar em requisições
headers: {
  'X-CSRF-Token': csrfToken
}
```

### Headers de Segurança

Todos os endpoints retornam:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

## Logs

Todas as operações críticas são logadas em `data/logs/security.log`:

```
[2026-01-14 10:30:45] [INFO] Login successful - IP: 192.168.1.1
[2026-01-14 10:31:20] [WARNING] Failed login attempt - IP: 192.168.1.100
[2026-01-14 10:32:00] [INFO] Vehicle added - ID: veiculo-3
```

---

**Próximo**: [Deployment](DEPLOY.md) | [Segurança](../SECURITY.md)

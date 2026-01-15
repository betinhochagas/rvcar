# Migração Backend PHP → TypeScript/Vercel

## 📋 Análise Completa do Backend PHP Atual

### Arquitetura Geral

**Sistema de Armazenamento:**

- JSON files em `data/` com file locking para evitar race conditions
- Sem banco de dados, 100% baseado em arquivos
- Logs em `logs/security.log` e `logs/access.log`
- Uploads em `uploads/vehicles/` e `uploads/site/`

**Sistema de Segurança:**

- Rate limiting: 5 tentativas em 15 minutos
- CSRF protection com tokens de 1 hora
- Input validation para todos os dados
- Security logging de todas as operações
- JWT tokens com expiração de 7 dias

---

## 🗂️ Estrutura de Arquivos Atual

### Arquivos de API (20 arquivos)

#### **APIs Principais:**

1. **auth.php** (436 linhas)

   - POST /api/auth.php
   - Actions: login, change_password, verify_token
   - Rate limiting integrado (5 tentativas/15min)
   - JWT tokens armazenados em data/admin-tokens.json
   - Senha default aleatória no primeiro uso

2. **vehicles.php** (369 linhas)

   - GET /api/vehicles.php - Lista todos (público)
   - GET /api/vehicles.php?id=X - Busca específico
   - POST /api/vehicles.php - Criar (requer auth)
   - PUT /api/vehicles.php?id=X - Atualizar (requer auth)
   - DELETE /api/vehicles.php?id=X - Remover (requer auth)
   - PATCH /api/vehicles.php?id=X - Toggle disponibilidade (requer auth)

3. **site-settings.php** (195 linhas)

   - GET /api/site-settings.php - Lista todas configurações
   - GET /api/site-settings.php?key=X - Busca específica
   - GET /api/site-settings.php?category=X - Filtrar por categoria
   - POST /api/site-settings.php - Criar (batch ou single)
   - PUT /api/site-settings.php?key=X - Atualizar (requer auth)
   - DELETE /api/site-settings.php?key=X - Remover (requer auth)

4. **upload.php** (340 linhas)
   - POST /api/upload.php
   - Tipos: vehicle, logo, favicon, og-image
   - Validação: MIME type, extensão, tamanho (5MB max)
   - Deep validation com getimagesize()
   - Rate limiting: 2 uploads/minuto
   - Limite total: 500MB de storage

#### **Middleware de Segurança:**

5. **rate-limiter.php** (169 linhas)

   - `checkRateLimit($identifier)` - Verifica se está dentro do limite
   - `recordLoginAttempt($identifier, $success)` - Registra tentativa
   - `getRateLimitIdentifier($username)` - Gera hash SHA256 de IP+UA+username
   - `cleanOldRateLimits()` - Manutenção automática
   - Storage: data/rate-limits.json
   - Default: 5 tentativas em 15 minutos

6. **csrf-protection.php** (137 linhas)

   - `generateCsrfToken()` - Gera token random de 64 chars
   - `storeCsrfToken($adminId, $token)` - Armazena com TTL de 1h
   - `validateCsrfToken($adminId, $providedToken)` - Valida com timing-safe comparison
   - `getCsrfTokenFromRequest()` - Busca em header ou body
   - Storage: data/csrf-tokens.json

7. **input-validator.php** (360 linhas)

   - `sanitizeString($input, $allowHtml)` - Remove tags perigosas
   - `sanitizeInt($input, $min, $max)` - Valida números inteiros
   - `sanitizeFloat($input, $min, $max)` - Valida decimais
   - `sanitizeEmail($input)` - Valida email
   - `sanitizeUrl($input)` - Valida URL
   - `sanitizeBoolean($input)` - Normaliza booleans
   - `sanitizePhone($input)` - Valida telefone BR (10-11 dígitos)
   - `sanitizeDocument($input)` - Valida CPF/CNPJ
   - `sanitizeYear($input)` - Valida ano
   - `sanitizeStringArray($input)` - Valida arrays

8. **security-logger.php** (240 linhas)

   - `logSecurityEvent($event, $severity, $details)` - Log genérico
   - `logLoginAttempt($username, $success, $reason)` - Log de login
   - `logPasswordChange($userId, $username)` - Log de senha
   - `logCrudOperation($entity, $operation, $entityId, $userId)` - Log de CRUD
   - `logFileUpload($filename, $filesize, $mimetype, $userId)` - Log de upload
   - `logRateLimitBlock($identifier, $attempts)` - Log de bloqueio
   - `logCsrfViolation($userId)` - Log de CSRF inválido
   - `logUnauthorizedAccess($resource, $userId)` - Log de acesso negado
   - Storage: logs/security.log (0600 permissions)

9. **file-operations.php** (187 linhas)
   - `readJsonFile($filePath, $assoc)` - Leitura com LOCK_SH (shared lock)
   - `writeJsonFile($filePath, $data, $permissions)` - Escrita com LOCK_EX (exclusive lock)
   - `updateJsonFile($filePath, $callback, $permissions)` - Atualização atômica
   - Todos com try/catch e error logging
   - Auto-criação de diretórios
   - Permissões restritivas (0600 para dados sensíveis)

#### **Utilitários:**

10. **env-loader.php** (100 linhas)

    - `loadEnv($filePath)` - Carrega .env
    - `env($key, $default)` - Busca variável com fallback
    - Auto-load quando incluído
    - Fallback para config-producao.php

11. **config.php** - Configurações antigas
12. **config-producao.php** - Configurações de produção

---

## 🔒 Padrões de Segurança Identificados

### CORS Configuration (repetido em TODOS os endpoints)

```php
$is_production = !in_array($server_name, ['localhost', '127.0.0.1']);
if ($is_production) {
    // Strict origin checking
    $allowed_origins = [
        $protocol . '://' . $domain,
        'https://' . $domain,
        'http://' . $domain,
    ];
} else {
    // Allow local development
    $isLocal = preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/', $origin);
}
```

### Autenticação

```php
function checkAuth() {
    // GET requests são públicas
    if ($_SERVER['REQUEST_METHOD'] === 'GET') return true;

    // POST/PUT/DELETE requerem Bearer token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    // Verificar em data/admin-tokens.json
    // Validar expiração
}
```

### Response Pattern

```php
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => true, 'message' => $message]);
    exit();
}
```

---

## 📊 Estrutura de Dados (JSON Files)

### data/admin-users.json

```json
[
  {
    "id": 1,
    "username": "admin",
    "password": "$2y$10$...", // bcrypt hash
    "name": "Administrador",
    "must_change_password": false,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

### data/admin-tokens.json

```json
[
  {
    "admin_id": 1,
    "token": "64_char_hex_string",
    "expires_at": "2024-01-08T00:00:00",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### data/vehicles.json

```json
[
  {
    "id": 1,
    "name": "Fiat Uno",
    "price": 25000.0,
    "image": "/uploads/vehicles/abc123.jpg",
    "features": ["Ar condicionado", "Direção hidráulica"],
    "available": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

### data/site-settings.json

```json
{
  "site_name": {
    "value": "RV Car Solutions",
    "type": "text",
    "description": "Nome do site"
  },
  "site_phone": {
    "value": "(11) 99999-9999",
    "type": "text",
    "description": "Telefone principal"
  }
}
```

### data/rate-limits.json

```json
{
  "sha256_hash_of_identifier": {
    "count": 3,
    "first_attempt": 1704067200,
    "last_attempt": 1704067300
  }
}
```

### data/csrf-tokens.json

```json
{
  "admin_id_1": {
    "token": "64_char_hex_string",
    "created_at": 1704067200,
    "expires_at": 1704070800
  }
}
```

---

## 🎯 Plano de Migração para TypeScript

### Estrutura de Diretórios Proposta

```
/api
├── auth
│   ├── login
│   │   └── route.ts          # POST /api/auth/login
│   ├── verify
│   │   └── route.ts          # POST /api/auth/verify
│   └── change-password
│       └── route.ts          # POST /api/auth/change-password
├── vehicles
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]
│       └── route.ts          # GET, PUT, DELETE, PATCH
├── site-settings
│   ├── route.ts              # GET (list), POST (create/batch)
│   └── [key]
│       └── route.ts          # GET, PUT, DELETE
├── upload
│   └── route.ts              # POST /api/upload
├── lib
│   ├── auth.ts               # Authentication helpers
│   ├── cors.ts               # CORS configuration
│   ├── rate-limiter.ts       # Rate limiting
│   ├── csrf.ts               # CSRF protection
│   ├── validator.ts          # Input validation
│   ├── logger.ts             # Security logging
│   ├── file-ops.ts           # File operations with locking
│   └── response.ts           # Response helpers
└── types
    ├── user.ts               # Admin user types
    ├── vehicle.ts            # Vehicle types
    ├── settings.ts           # Settings types
    └── auth.ts               # Auth/token types
```

### Tecnologias a Utilizar

1. **Next.js API Routes** (Vercel Serverless Functions)

   - Padrão para Vercel
   - Suporte nativo a TypeScript
   - Edge Runtime ou Node.js Runtime

2. **Bibliotecas:**

   - `bcrypt` ou `bcryptjs` - Hash de senhas
   - `jsonwebtoken` - JWT tokens (opcional, atual usa tokens simples)
   - `sharp` - Validação de imagens (substitui getimagesize)
   - `zod` - Validação de schemas TypeScript
   - `nanoid` - Geração de IDs/tokens seguros

3. **File System:**
   - `fs/promises` - Operações assíncronas
   - `lockfile` ou implementação custom de locking
   - Edge Runtime tem limitações de file system

---

## ⚠️ Desafios da Migração

### 1. File Locking em Serverless

**Problema:** Vercel Serverless Functions são stateless e podem ter múltiplas instâncias
**Solução:**

- Opção A: Migrar para banco de dados (PostgreSQL/MySQL no Vercel)
- Opção B: Usar Vercel KV (Redis) para dados transacionais
- Opção C: Implementar locking distribuído com timestamps
- Opção D: Aceitar race conditions raras (JSON é pequeno)

**Recomendação:** Começar com Opção D (file system), depois migrar para KV se necessário

### 2. File System em Edge Runtime

**Problema:** Edge Runtime não tem acesso a file system
**Solução:** Usar Node.js Runtime para todas as funções que precisam de FS

### 3. CORS Configuration

**Problema:** Vercel precisa de configuração em vercel.json
**Solução:** Implementar CORS em cada route handler + vercel.json

### 4. Uploads de Imagem

**Problema:** Serverless tem limites de tamanho de payload (4.5MB Hobby, 50MB Pro)
**Solução:**

- Usar Vercel Blob Storage para uploads maiores
- Ou manter limite de 4MB em Hobby plan

### 5. Rate Limiting Global

**Problema:** Rate limit em memória não funciona em stateless functions
**Solução:**

- Usar Vercel KV para contadores distribuídos
- Ou implementar em arquivo JSON (menos eficiente)

---

## 📝 Checklist de Migração

### Fase 1: Setup e Infraestrutura ✅

- [ ] Criar estrutura /api
- [ ] Configurar TypeScript (tsconfig.json)
- [ ] Criar tipos compartilhados
- [ ] Implementar helpers de CORS
- [ ] Implementar helpers de Response
- [ ] Setup variáveis de ambiente (.env.local)

### Fase 2: Core APIs

- [ ] Migrar auth.php → /api/auth/\*
  - [ ] Login
  - [ ] Verify token
  - [ ] Change password
- [ ] Migrar vehicles.php → /api/vehicles
  - [ ] GET list
  - [ ] POST create
  - [ ] GET/:id
  - [ ] PUT/:id
  - [ ] DELETE/:id
  - [ ] PATCH/:id
- [ ] Migrar site-settings.php → /api/site-settings
  - [ ] GET list
  - [ ] POST create/batch
  - [ ] GET/:key
  - [ ] PUT/:key
  - [ ] DELETE/:key

### Fase 3: Middleware de Segurança

- [ ] Rate Limiter TypeScript
- [ ] CSRF Protection TypeScript
- [ ] Input Validator TypeScript (com Zod)
- [ ] Security Logger TypeScript
- [ ] File Operations TypeScript (com locking)

### Fase 4: Upload

- [ ] Migrar upload.php → /api/upload
- [ ] Validação de imagens com sharp
- [ ] Decidir: File system ou Vercel Blob

### Fase 5: Testing

- [ ] Testar autenticação
- [ ] Testar CRUD de veículos
- [ ] Testar configurações
- [ ] Testar uploads
- [ ] Testar rate limiting
- [ ] Testar CSRF protection

### Fase 6: Frontend

- [ ] Atualizar authManager.ts para novos endpoints
- [ ] Atualizar vehicleManager.ts
- [ ] Atualizar settingsManager.ts
- [ ] Testar integração completa

### Fase 7: Deploy

- [ ] Configurar vercel.json
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Deploy preview
- [ ] Testar em produção
- [ ] Deploy final

---

## 🚀 Próximos Passos

1. **Criar estrutura base TypeScript** (30min)
2. **Migrar sistema de autenticação** (2-3 horas)
3. **Migrar CRUD de veículos** (2 horas)
4. **Migrar configurações** (1 hora)
5. **Implementar middleware de segurança** (3-4 horas)
6. **Migrar upload** (2 horas)
7. **Testes** (2 horas)
8. **Atualizar frontend** (1 hora)
9. **Deploy e validação** (1 hora)

**Total estimado: 15-17 horas** (2 dias de trabalho focado)

---

## 💡 Benefícios da Migração

1. ✅ Stack unificado (TypeScript front + back)
2. ✅ Type safety completo
3. ✅ Deploy automático (Vercel CI/CD)
4. ✅ Escalabilidade (serverless auto-scale)
5. ✅ Free tier generoso (100GB bandwidth, 100k requests/mês)
6. ✅ HTTPS automático
7. ✅ Edge network global
8. ✅ Logs e monitoring integrados
9. ✅ Preview deployments para cada PR
10. ✅ Portfolio profissional moderno

---

## 📌 Decisões Importantes

### Armazenamento de Dados

**Decisão:** Começar com JSON files, migrar para Vercel KV/Postgres se necessário
**Justificativa:** Menos mudanças iniciais, MVP mais rápido

### File Locking

**Decisão:** Implementar locking baseado em timestamps + retry logic
**Justificativa:** Suficiente para baixo tráfego, mais simples que Redis

### Upload de Imagens

**Decisão:** File system com limite de 4MB
**Justificativa:** Grátis, suficiente para fotos de carros comprimidas

### Rate Limiting

**Decisão:** JSON file + cleanup automático (igual ao PHP)
**Justificativa:** Funciona para baixo/médio tráfego, não requer Redis

### CSRF Tokens

**Decisão:** Manter sistema de tokens em JSON
**Justificativa:** Funciona bem, não precisa de mudanças

---

**Documento criado em:** $(date)
**Última atualização:** $(date)
**Status:** Análise Completa - Pronto para Implementação

# ⚙️ Guia de Configuração - RV Car

Este documento explica todas as configurações disponíveis no sistema RV Car.

## 📋 Índice

- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Configurações do Site](#configurações-do-site)
- [Configurações de Segurança](#configurações-de-segurança)
- [Configurações de Performance](#configurações-de-performance)

## Variáveis de Ambiente

### Frontend (`.env`)

Arquivo na raiz do projeto.

```env
# URL da API Backend (OBRIGATÓRIO)
# Não inclua barra "/" no final
VITE_API_URL=http://localhost/rvcar/api

# Ambiente (optional)
# Valores: development | production
VITE_ENVIRONMENT=development
```

#### Detalhes:

**VITE_API_URL** (obrigatório)

- URL completa do backend PHP
- Desenvolvimento local: `http://localhost/rvcar/api`
- Produção: `https://seu-dominio.com/api`
- ⚠️ **NÃO** adicione `/` no final

**VITE_ENVIRONMENT** (opcional)

- Define o ambiente de execução
- `development`: Modo de desenvolvimento (logs detalhados)
- `production`: Modo de produção (otimizado)
- Default: `production` se não especificado

### Backend (`api/.env`)

Arquivo em `api/.env`.

```env
# Ambiente de Execução
ENVIRONMENT=production

# Segurança JWT
JWT_SECRET=SUA-CHAVE-SECRETA-MINIMO-32-CARACTERES

# Credenciais Admin
ADMIN_PASSWORD=senha-temporaria-forte

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15

# CORS - URLs permitidas (separadas por vírgula)
ALLOWED_ORIGINS=https://rvcar.vercel.app,https://seu-dominio.com

# Upload (opcional)
MAX_UPLOAD_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp,svg,ico

# Logs (opcional)
ENABLE_LOGGING=true
LOG_LEVEL=INFO
```

#### Detalhes:

**ENVIRONMENT** (obrigatório)

- `development`: Modo de desenvolvimento (logs verbose)
- `production`: Modo de produção (optimizado)

**JWT_SECRET** (obrigatório)

- Chave para assinar tokens JWT
- Mínimo 32 caracteres
- Use caracteres aleatórios
- **NUNCA** commite esta chave no git

Gerar chave segura:

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Online: https://randomkeygen.com/
```

**ADMIN_PASSWORD** (obrigatório)

- Senha temporária do admin
- Será solicitada para trocar no primeiro login
- Use senha forte (min 8 caracteres)

**MAX_LOGIN_ATTEMPTS** (opcional, default: 5)

- Máximo de tentativas de login falhadas
- Após atingir, IP é bloqueado temporariamente

**LOGIN_TIMEOUT_MINUTES** (opcional, default: 15)

- Tempo de bloqueio após exceder tentativas
- Em minutos

**ALLOWED_ORIGINS** (obrigatório)

- URLs permitidas para requisições CORS
- Separe múltiplas URLs com vírgula
- Exemplo: `https://site1.com,https://site2.com`
- Em desenvolvimento, inclua `http://localhost:5173`

**MAX_UPLOAD_SIZE** (opcional, default: 5MB)

- Tamanho máximo de upload em bytes
- 5MB = 5242880 bytes
- 10MB = 10485760 bytes

**ALLOWED_EXTENSIONS** (opcional)

- Extensões de arquivo permitidas no upload
- Separadas por vírgula
- Default: `jpg,jpeg,png,webp,svg,ico`

**ENABLE_LOGGING** (opcional, default: true)

- Habilita/desabilita sistema de logs
- `true`: Logs ativos
- `false`: Logs desabilitados

**LOG_LEVEL** (opcional, default: INFO)

- Nível de verbosidade dos logs
- `ERROR`: Apenas erros
- `WARNING`: Erros + avisos
- `INFO`: Erros + avisos + informações
- `DEBUG`: Tudo (verbose)

## Configurações do Site

Editáveis via painel admin ou arquivo `data/site-config.json`.

### Informações Básicas

```json
{
  "titulo": "RV Car - Locação de Veículos",
  "descricao": "Aluguel de carros com as melhores condições do mercado",
  "palavrasChave": "locação, aluguel, carros, veículos, RV Car"
}
```

### Identidade Visual

```json
{
  "logo": "/uploads/logo.svg",
  "favicon": "/uploads/favicon.ico",
  "ogImage": "/uploads/og-image.jpg"
}
```

**Recomendações**:

- **Logo**: SVG ou PNG transparente, 200x60px ideal
- **Favicon**: ICO ou PNG, 32x32px ou 64x64px
- **OG Image**: JPG ou PNG, 1200x630px (Facebook/LinkedIn)

### Contatos

```json
{
  "contatos": {
    "locacao": {
      "telefone": "(11) 98765-4321",
      "email": "locacao@rvcar.com"
    },
    "investimento": {
      "telefone": "(11) 91234-5678",
      "email": "investimento@rvcar.com"
    }
  }
}
```

### Redes Sociais

```json
{
  "redesSociais": {
    "instagram": "https://instagram.com/rvcar",
    "facebook": "https://facebook.com/rvcar",
    "whatsapp": "5511987654321"
  }
}
```

**Formato WhatsApp**: Código do país + DDD + número (sem espaços ou caracteres especiais)

### Seções da Página

```json
{
  "secoes": {
    "hero": {
      "titulo": "Alugue o Veículo dos Seus Sonhos",
      "subtitulo": "Frota moderna e preços competitivos",
      "cta": "Ver Veículos"
    },
    "sobre": {
      "titulo": "Sobre Nós",
      "descricao": "Mais de 10 anos no mercado..."
    },
    "investimento": {
      "titulo": "Invista em Nossa Frota",
      "descricao": "Rentabilidade garantida..."
    }
  }
}
```

## Configurações de Segurança

### Rate Limiting

Configurado via `api/.env`:

```env
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15
```

**Comportamento**:

1. Usuário pode tentar login 5 vezes
2. Na 6ª tentativa falhada, IP é bloqueado por 15 minutos
3. Após 15 minutos, contador é zerado

### CSRF Protection

Habilitado automaticamente em todas operações de escrita.

**Como funciona**:

1. Frontend solicita token CSRF ao iniciar
2. Token é incluído em todas requisições POST/PUT/DELETE
3. Backend valida token antes de processar
4. Token expira após 1 hora

### Upload Security

Validações automáticas:

1. **Tamanho**: Máximo 5MB (configurável)
2. **Extensão**: Apenas imagens permitidas
3. **MIME Type**: Validação profunda do tipo real
4. **Conteúdo**: Verificação de arquivo malicioso

### Headers de Segurança

Aplicados automaticamente:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

## Configurações de Performance

### Code Splitting (Frontend)

Lazy loading de rotas já configurado:

```typescript
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
```

### Caching (Backend)

Headers de cache aplicados automaticamente:

```http
# Imagens estáticas
Cache-Control: public, max-age=31536000, immutable

# JSON data
Cache-Control: no-cache, must-revalidate
```

### Compressão

**Frontend (Vite)**:

- Build gera arquivos gzipped automaticamente
- Vercel serve com Brotli compression

**Backend (PHP)**:
Configure no `.htaccess`:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/json
</IfModule>
```

### CDN

Frontend no Vercel usa CDN global automaticamente.

Para backend, considere usar Cloudflare:

1. Aponte DNS para Cloudflare
2. Ative proxy (nuvem laranja)
3. Cache configurado automaticamente

## Troubleshooting

### Frontend não conecta com backend

**Verifique**:

1. `VITE_API_URL` está correta (sem `/` no final)
2. Backend está acessível (teste no navegador)
3. CORS configurado no backend `.env`

### Erro "Invalid JWT"

**Causa**: `JWT_SECRET` diferente entre .env e tokens salvos

**Solução**:

1. Delete `data/auth.json`
2. Faça login novamente

### Upload falha

**Verifique**:

1. Pasta `uploads/` com permissão 777
2. `MAX_UPLOAD_SIZE` no `.env`
3. `upload_max_filesize` no `php.ini`

---

**Próximo**: [Deploy](DEPLOY.md) | [API](API.md)

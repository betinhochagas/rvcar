# 📦 Guia de Instalação Completo - RV Car

Este guia cobre todos os cenários de instalação do sistema RV Car.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação Local](#instalação-local)
- [Instalação em Produção](#instalação-em-produção)
- [Solução de Problemas](#solução-de-problemas)

## Pré-requisitos

### Para Desenvolvimento Local

✅ **Node.js** 18+ ou **Bun** 1.0+  
✅ **PHP** 7.4+ com extensões: `json`, `fileinfo`, `gd`  
✅ **Git**  
✅ Editor de código (VS Code recomendado)

### Para Produção

✅ **Servidor PHP** 7.4+ (compartilhado ou VPS)  
✅ **Conta Vercel** (gratuita) para frontend  
✅ **Domínio** (opcional, mas recomendado)

## Instalação Local

### 1. Clone o Repositório

```bash
git clone https://github.com/betinhochagas/rvcar.git
cd rvcar
```

### 2. Instale as Dependências

**Com npm:**

```bash
npm install
```

**Com Bun (mais rápido):**

```bash
bun install
```

### 3. Configure o Backend

#### 3.1. Crie o arquivo de configuração

```bash
cp api/.env.example api/.env
```

#### 3.2. Edite `api/.env`

```env
# Ambiente
ENVIRONMENT=development

# Chave JWT (gere uma chave forte)
JWT_SECRET=desenvolvimento-local-chave-123

# Senha Admin (será solicitada para trocar)
ADMIN_PASSWORD=admin123

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15

# CORS (permitir localhost)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 3.3. Configure permissões (Linux/macOS)

```bash
chmod 777 data/
chmod 777 uploads/
chmod 666 api/.env
```

**Windows:** As permissões são automáticas.

### 4. Configure o Frontend

#### 4.1. Crie o arquivo de configuração

```bash
cp .env.example .env
```

#### 4.2. Edite `.env`

```env
# URL da API (sem barra no final)
VITE_API_URL=http://localhost/rvcar/api

# Ambiente
VITE_ENVIRONMENT=development
```

> **Nota**: Ajuste `localhost/rvcar` conforme sua configuração de servidor local (XAMPP, WAMP, etc.)

### 5. Inicie o Servidor PHP

**XAMPP/WAMP:**

1. Copie a pasta `api/` para `htdocs/rvcar/api/`
2. Inicie Apache
3. Acesse: `http://localhost/rvcar/api/vehicles.php`

**Servidor embutido PHP:**

```bash
cd api/
php -S localhost:8000
```

Depois ajuste no `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 6. Inicie o Frontend

```bash
npm run dev
```

Ou com Bun:

```bash
bun dev
```

**Acesse**: `http://localhost:5173`

### ✅ Verificação

- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost/rvcar/api/vehicles.php`

## Instalação em Produção

### Frontend (Vercel)

#### 1. Conecte o Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New"** → **"Project"**
3. Importe seu repositório GitHub
4. Vercel detecta automaticamente Vite

#### 2. Configure Variáveis de Ambiente

No painel do Vercel, adicione:

```
VITE_API_URL = https://seu-backend.com/api
VITE_ENVIRONMENT = production
```

> **⚠️ IMPORTANTE**: NÃO inclua barra `/` no final da URL!

#### 3. Deploy Automático

✅ Cada push no branch `master` faz deploy automático  
✅ Preview deployments para pull requests  
✅ Rollback instantâneo disponível

### Backend (Servidor PHP)

#### Opção 1: Hospedagem Compartilhada (Recomendado)

**Provedores Recomendados:**

| Provedor                                   | Custo   | PHP | SSL | Suporte |
| ------------------------------------------ | ------- | --- | --- | ------- |
| [InfinityFree](https://infinityfree.net/)  | Grátis  | ✅  | ✅  | Email   |
| [000webhost](https://www.000webhost.com/)  | Grátis  | ✅  | ✅  | Email   |
| [Hostinger](https://www.hostinger.com.br/) | R$6/mês | ✅  | ✅  | 24/7    |

##### Passos:

**1. Faça Upload via FTP/cPanel**

Conecte via FTP e faça upload de:

```
public_html/
└── api/
    ├── .env
    ├── auth.php
    ├── vehicles.php
    ├── site-settings.php
    ├── upload.php
    ├── (todos os arquivos .php)
    ├── data/
    └── uploads/
```

**2. Configure o `.env`**

Edite `api/.env` no servidor:

```env
ENVIRONMENT=production
JWT_SECRET=SUA-CHAVE-SUPER-SECRETA-AQUI-MIN-32-CHARS
ADMIN_PASSWORD=senha-aleatoria-forte
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15
ALLOWED_ORIGINS=https://rvcar.vercel.app,https://seu-dominio.com
```

> **🔒 SEGURANÇA**: Gere uma chave JWT forte (mínimo 32 caracteres)

**3. Configure Permissões (via cPanel/FTP)**

```
data/ → 777 (rwxrwxrwx)
uploads/ → 777 (rwxrwxrwx)
api/.env → 600 (rw-------)
```

**4. Teste a API**

Acesse: `https://seu-dominio.com/api/vehicles.php`

Resposta esperada:

```json
{ "vehicles": [] }
```

#### Opção 2: VPS (Avançado)

**Provedores:**

- DigitalOcean ($4/mês)
- Linode ($5/mês)
- Vultr ($2.50/mês)

##### Instalação no VPS:

```bash
# 1. Conecte via SSH
ssh root@seu-servidor

# 2. Instale PHP e extensões
sudo apt update
sudo apt install php php-json php-fileinfo php-gd

# 3. Instale Nginx/Apache
sudo apt install nginx

# 4. Configure virtual host
sudo nano /etc/nginx/sites-available/api

# 5. Clone ou faça upload dos arquivos
cd /var/www/html
git clone https://github.com/betinhochagas/rvcar.git

# 6. Configure permissões
chmod 777 data/
chmod 777 uploads/
chmod 600 api/.env

# 7. Reinicie o servidor
sudo systemctl restart nginx
```

### Conectando Frontend e Backend

**1. No Vercel, atualize a variável:**

```
VITE_API_URL = https://seu-backend.com/api
```

**2. No Backend `.env`, adicione o frontend:**

```env
ALLOWED_ORIGINS=https://rvcar.vercel.app
```

**3. Faça o redeploy do frontend:**

```bash
git commit --allow-empty -m "Update API URL"
git push origin master
```

Vercel fará o redeploy automaticamente.

### ✅ Verificação Final

1. **Teste a API diretamente:**

   ```bash
   curl https://seu-backend.com/api/vehicles.php
   ```

2. **Teste o frontend:**

   - Acesse: `https://rvcar.vercel.app`
   - Vá ao admin: `https://rvcar.vercel.app/admin`
   - Tente fazer login

3. **Verifique CORS:**
   - Abra DevTools (F12)
   - Console não deve mostrar erros de CORS

## Solução de Problemas

### Erro: "Failed to fetch"

**Causa**: Frontend não consegue conectar com backend

**Solução**:

1. Verifique se `VITE_API_URL` está correto (sem `/` no final)
2. Teste a API diretamente no navegador
3. Verifique CORS no `api/.env`:
   ```env
   ALLOWED_ORIGINS=https://rvcar.vercel.app
   ```

### Erro: "CORS policy"

**Causa**: Backend não permite requisições do frontend

**Solução**:

```env
# No api/.env, adicione a URL do frontend
ALLOWED_ORIGINS=https://rvcar.vercel.app,https://seu-dominio.com
```

### Erro: "Permission denied" ao salvar

**Causa**: Pastas sem permissão de escrita

**Solução**:

```bash
chmod 777 data/
chmod 777 uploads/
```

### Erro: "Invalid JWT"

**Causa**: Chave JWT diferente entre .env e tokens salvos

**Solução**:

1. Delete os dados em `data/auth.json`
2. Faça login novamente

### Frontend não atualiza após deploy

**Causa**: Cache do Vercel

**Solução**:

1. Vá ao Vercel Dashboard
2. Clique em **"Deployments"**
3. Force redeploy no último deployment

### Upload de imagens falha

**Causa**: Pasta sem permissão ou limite de tamanho

**Solução**:

1. Verifique permissões: `chmod 777 uploads/`
2. Verifique `php.ini`:
   ```ini
   upload_max_filesize = 10M
   post_max_size = 10M
   ```

## 🆘 Suporte

Se o problema persistir:

1. **Verifique os logs**:

   - Frontend: Console do navegador (F12)
   - Backend: `data/logs/security.log`

2. **Teste a API isoladamente**:

   ```bash
   curl -X GET https://seu-backend.com/api/vehicles.php
   ```

3. **Abra uma issue**: [GitHub Issues](https://github.com/betinhochagas/rvcar/issues)

---

**Próximos passos**: [Configuração](CONFIGURACAO.md) | [API](API.md) | [Deployment](DEPLOY.md)

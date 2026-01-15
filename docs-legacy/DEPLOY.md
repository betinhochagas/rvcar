# 🚀 Guia de Deploy - RV Car

Guia completo para fazer deploy do sistema RV Car em produção.

## 📋 Índice

- [Arquitetura de Deploy](#arquitetura-de-deploy)
- [Deploy do Frontend](#deploy-do-frontend-vercel)
- [Deploy do Backend](#deploy-do-backend-php)
- [Configuração Completa](#configuração-completa)
- [Checklist de Produção](#checklist-de-produção)
- [Monitoramento](#monitoramento)

## Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                        USUÁRIO                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL (Frontend CDN)                      │
│  • React + TypeScript compilado                         │
│  • Servido via CDN global                               │
│  • Auto-deploy via GitHub                               │
│  • URL: https://rvcar.vercel.app                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ API Calls (HTTPS)
                 ▼
┌─────────────────────────────────────────────────────────┐
│          SERVIDOR PHP (Backend API)                     │
│  • PHP 7.4+ com APIs RESTful                           │
│  • Armazenamento JSON                                   │
│  • Sistema de autenticação                              │
│  • URL: https://seu-backend.com/api                    │
└─────────────────────────────────────────────────────────┘
```

## Deploy do Frontend (Vercel)

### Por Que Vercel?

- ✅ **Deploy automático** via GitHub
- ✅ **CDN global** para performance máxima
- ✅ **SSL gratuito** incluído
- ✅ **Preview deployments** para cada PR
- ✅ **Rollback instantâneo** se necessário
- ✅ **Plano gratuito** generoso

### Passo a Passo

#### 1. Prepare o Repositório

Certifique-se de que seu código está no GitHub:

```bash
git add .
git commit -m "Preparando para deploy"
git push origin master
```

#### 2. Conecte ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New"** → **"Project"**
4. Selecione o repositório `rvcar`
5. Vercel detecta automaticamente o Vite

#### 3. Configure o Projeto

**Framework Preset**: Vite (detectado automaticamente)

**Build Command**:

```bash
npm run build
```

**Output Directory**:

```
dist
```

**Install Command**:

```bash
npm install
```

#### 4. Adicione Variáveis de Ambiente

No painel do Vercel, vá em **"Settings"** → **"Environment Variables"**:

```
Nome: VITE_API_URL
Valor: https://seu-backend.com/api
Ambiente: Production, Preview
```

```
Nome: VITE_ENVIRONMENT
Valor: production
Ambiente: Production
```

> **⚠️ IMPORTANTE**: NÃO adicione `/` no final da `VITE_API_URL`!

#### 5. Deploy

Clique em **"Deploy"** e aguarde (1-2 minutos).

#### 6. Configure Domínio Customizado (Opcional)

1. No painel do Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio: `www.rvcar.com.br`
3. Configure o DNS conforme instruções:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Configuração Automática via GitHub

O arquivo [`vercel.json`](../vercel.json) já está configurado:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Deploy Automático

✅ Cada `push` no branch `master` faz deploy automático  
✅ Pull requests geram preview deployments  
✅ Vercel envia notificação no GitHub quando deploy está pronto

## Deploy do Backend (PHP)

### Opções de Hospedagem

#### Opção 1: Hospedagem Compartilhada (Recomendado)

**Ideal para**: Pequenas e médias aplicações

**Provedores**:

| Provedor                                   | Custo   | Especificações           |
| ------------------------------------------ | ------- | ------------------------ |
| [InfinityFree](https://infinityfree.net/)  | Grátis  | 5GB espaço, SSL grátis   |
| [000webhost](https://www.000webhost.com/)  | Grátis  | 300MB, SSL grátis        |
| [Hostinger](https://www.hostinger.com.br/) | R$6/mês | 100GB, SSL, Suporte 24/7 |

#### Opção 2: VPS

**Ideal para**: Aplicações maiores, controle total

**Provedores**:

| Provedor                                      | Custo     | Especificações      |
| --------------------------------------------- | --------- | ------------------- |
| [DigitalOcean](https://www.digitalocean.com/) | $4/mês    | 512MB RAM, 10GB SSD |
| [Linode](https://www.linode.com/)             | $5/mês    | 1GB RAM, 25GB SSD   |
| [Vultr](https://www.vultr.com/)               | $2.50/mês | 512MB RAM, 10GB SSD |

### Deploy em Hospedagem Compartilhada

#### Passo 1: Prepare os Arquivos

**Via FTP/cPanel File Manager**, faça upload da pasta `api/`:

```
public_html/
└── api/
    ├── .env
    ├── .htaccess
    ├── auth.php
    ├── vehicles.php
    ├── site-settings.php
    ├── upload.php
    ├── page-sections.php
    ├── rate-limiter.php
    ├── csrf-protection.php
    ├── input-validator.php
    ├── security-logger.php
    ├── file-operations.php
    ├── env-loader.php
    ├── config-producao.php
    ├── data/
    │   ├── .htaccess
    │   ├── vehicles.json
    │   ├── contacts.json
    │   ├── site-config.json
    │   └── logs/
    └── uploads/
        └── .htaccess
```

#### Passo 2: Configure o `.env`

Crie/edite `api/.env` no servidor:

```env
# Ambiente
ENVIRONMENT=production

# Segurança JWT (ALTERE ESTA CHAVE!)
JWT_SECRET=SUA-CHAVE-SUPER-SECRETA-ALEATORIA-MIN-32-CARACTERES

# Senha Admin (será solicitada para trocar no primeiro acesso)
ADMIN_PASSWORD=senha-aleatoria-forte-temporaria

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15

# CORS - Adicione a URL do seu frontend Vercel
ALLOWED_ORIGINS=https://rvcar.vercel.app,https://seu-dominio.com
```

> **🔒 CRÍTICO**:
>
> - Gere uma `JWT_SECRET` forte (mínimo 32 caracteres aleatórios)
> - Use senha temporária em `ADMIN_PASSWORD` (será trocada no primeiro login)
> - Adicione TODAS as URLs do frontend em `ALLOWED_ORIGINS`

**Gerar JWT_SECRET forte** (use no terminal):

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Passo 3: Configure Permissões

**Via cPanel/SSH**:

```bash
chmod 755 api/
chmod 600 api/.env
chmod 777 api/data/
chmod 777 api/uploads/
chmod 777 api/data/logs/
```

**Via cPanel File Manager**:

- `api/` → 755 (rwxr-xr-x)
- `api/.env` → 600 (rw-------)
- `api/data/` → 777 (rwxrwxrwx)
- `api/uploads/` → 777 (rwxrwxrwx)

#### Passo 4: Teste a API

Acesse no navegador:

```
https://seu-dominio.com/api/vehicles.php
```

**Resposta esperada**:

```json
{ "vehicles": [] }
```

Se ver essa resposta, o backend está funcionando! ✅

### Deploy em VPS (DigitalOcean, Linode, etc)

#### Passo 1: Crie o Droplet/VPS

1. Escolha **Ubuntu 22.04 LTS**
2. Selecione o plano (mínimo $4/mês)
3. Configure SSH keys

#### Passo 2: Instale as Dependências

```bash
# Conecte via SSH
ssh root@seu-ip

# Atualize o sistema
apt update && apt upgrade -y

# Instale PHP e extensões
apt install -y php8.1 php8.1-fpm php8.1-json php8.1-gd php8.1-fileinfo

# Instale Nginx
apt install -y nginx

# Instale Certbot para SSL
apt install -y certbot python3-certbot-nginx
```

#### Passo 3: Configure o Nginx

Crie o virtual host:

```bash
nano /etc/nginx/sites-available/api
```

Cole:

```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    root /var/www/api;
    index index.php;

    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    # Deny access to sensitive files
    location ~ /\.env {
        deny all;
    }

    location ~ /data/ {
        deny all;
    }
}
```

Ative o site:

```bash
ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Passo 4: Faça Deploy dos Arquivos

```bash
# Crie o diretório
mkdir -p /var/www/api

# Clone ou faça upload
cd /var/www
git clone https://github.com/betinhochagas/rvcar.git temp
mv temp/api/* api/
rm -rf temp

# Configure permissões
chown -R www-data:www-data /var/www/api
chmod 755 /var/www/api
chmod 777 /var/www/api/data
chmod 777 /var/www/api/uploads
chmod 600 /var/www/api/.env
```

#### Passo 5: Configure SSL

```bash
certbot --nginx -d api.seu-dominio.com
```

Certbot configurará automaticamente o SSL e renovação automática.

## Configuração Completa

### 1. Conecte Frontend e Backend

**No Vercel**, atualize a variável de ambiente:

```
VITE_API_URL = https://seu-dominio.com/api
```

**No Backend** (`api/.env`), adicione o frontend:

```env
ALLOWED_ORIGINS=https://rvcar.vercel.app
```

### 2. Redeploy do Frontend

Força o Vercel a recompilar com a nova URL:

```bash
git commit --allow-empty -m "Update API URL"
git push origin master
```

### 3. Primeiro Acesso ao Admin

1. Acesse: `https://rvcar.vercel.app/admin`
2. Faça login com a senha temporária do `.env`
3. Sistema pedirá para trocar a senha
4. Defina uma senha forte

### 4. Teste End-to-End

✅ **Frontend**: Acesse `https://rvcar.vercel.app`  
✅ **Admin**: Faça login em `/admin`  
✅ **API**: Teste CRUD de veículos  
✅ **Upload**: Teste upload de imagens  
✅ **Configurações**: Teste edição de configurações

## Checklist de Produção

### Segurança

- [ ] `JWT_SECRET` forte e único no `.env`
- [ ] Senha admin temporária trocada
- [ ] `ALLOWED_ORIGINS` configurado corretamente
- [ ] SSL ativo (HTTPS) em frontend e backend
- [ ] Permissões de arquivo configuradas (600 para `.env`, 777 para `data/`)
- [ ] `.htaccess` protegendo pastas sensíveis
- [ ] Source maps desabilitados em produção

### Performance

- [ ] Build de produção do frontend (`npm run build`)
- [ ] Imagens otimizadas (WebP quando possível)
- [ ] CDN ativo (Vercel)
- [ ] Gzip/Brotli ativo no servidor PHP

### Funcionalidades

- [ ] Login admin funcionando
- [ ] CRUD de veículos funcionando
- [ ] Upload de imagens funcionando
- [ ] Configurações do site funcionando
- [ ] Formulários de contato enviando
- [ ] Modal de consultor funcionando
- [ ] WhatsApp integration funcionando

### Monitoramento

- [ ] Logs funcionando (`data/logs/security.log`)
- [ ] Vercel analytics configurado
- [ ] Domínio customizado configurado (se aplicável)
- [ ] Backup configurado (data/ e uploads/)

## Monitoramento

### Logs do Backend

Verifique regularmente:

```bash
tail -f /path/to/api/data/logs/security.log
```

Logs incluem:

- Tentativas de login
- Operações CRUD
- Erros de validação
- Ataques bloqueados

### Vercel Analytics

No painel do Vercel:

- **Analytics**: Veja pageviews, performance
- **Deployments**: Histórico de deploys
- **Functions**: Logs de erros (se usar)

### Backups

**Automatize backups diários**:

```bash
# Crie um script de backup
nano /root/backup-rvcar.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /root/backups/rvcar-$DATE.tar.gz /var/www/api/data /var/www/api/uploads
find /root/backups -mtime +30 -delete
```

```bash
chmod +x /root/backup-rvcar.sh
crontab -e
```

Adicione:

```
0 2 * * * /root/backup-rvcar.sh
```

## Troubleshooting

### Frontend não conecta com backend

**Verifique**:

1. `VITE_API_URL` sem `/` no final
2. Backend acessível via `curl https://seu-backend.com/api/vehicles.php`
3. CORS configurado no backend `.env`

### Erro 500 no backend

**Verifique**:

1. Logs do servidor: `/var/log/nginx/error.log` ou cPanel errors
2. Permissões das pastas `data/` e `uploads/`
3. PHP extensions instaladas: `json`, `fileinfo`, `gd`

### Upload de imagens falha

**Verifique**:

1. Pasta `uploads/` com permissão 777
2. `php.ini` com `upload_max_filesize = 10M`
3. Espaço em disco disponível

---

**Próximo**: [API Documentation](API.md) | [Security](../SECURITY.md)

# 🚀 Deploy para Produção - RV Car Solutions

## Pré-requisitos

Antes do deploy, você precisa configurar os serviços de storage da Vercel:

### 1. Criar Vercel KV (Redis) - Para dados

1. Acesse o Dashboard da Vercel
2. Vá em **Storage** → **Create Database**
3. Selecione **KV** (Redis)
4. Dê um nome (ex: `rvcar-kv`)
5. Escolha a região **São Paulo (GRU1)**
6. Clique em **Create**
7. Conecte ao seu projeto

As variáveis serão configuradas automaticamente:

- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 2. Criar Vercel Blob - Para uploads de imagens

1. No Dashboard da Vercel
2. Vá em **Storage** → **Create Database**
3. Selecione **Blob**
4. Dê um nome (ex: `rvcar-blob`)
5. Clique em **Create**
6. Conecte ao seu projeto

A variável será configurada automaticamente:

- `BLOB_READ_WRITE_TOKEN`

### 3. Configurar variável SEED_SECRET_KEY

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - Name: `SEED_SECRET_KEY`
   - Value: Uma chave secreta forte (ex: `rv-car-seed-2026-abc123xyz`)
   - Environment: Production

---

## Deploy

### Via CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Deploy de produção
vercel --prod
```

### Via Dashboard

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório Git
3. As configurações serão detectadas automaticamente do `vercel.json`
4. Clique em **Deploy**

---

## Após o Deploy

### Inicializar Dados (IMPORTANTE!)

Após o primeiro deploy, você precisa inicializar os dados no KV:

```bash
# Usando curl
curl -X POST https://seu-dominio.vercel.app/api/seed \
  -H "x-seed-secret: sua-seed-secret-key"
```

Ou acesse diretamente:

```
GET https://seu-dominio.vercel.app/api/seed
```

Para verificar o status dos dados.

### Credenciais de Admin Padrão

Após o seed, use estas credenciais para primeiro acesso:

- **Usuário**: `admin`
- **Senha**: `rvcar2024`

⚠️ **IMPORTANTE**: Troque a senha imediatamente após o primeiro login!

---

## Verificação Pós-Deploy

### Checklist

- [ ] Site carrega normalmente
- [ ] API `/api/vehicles` retorna veículos
- [ ] API `/api/site-settings` retorna configurações
- [ ] Login admin funciona em `/admin`
- [ ] Upload de imagens funciona
- [ ] Dados persistem após novo deploy

### URLs para Testar

```
GET  /api/seed              # Verificar status do KV
GET  /api/vehicles          # Listar veículos
GET  /api/site-settings     # Configurações do site
POST /api/auth/login        # Testar login
```

---

## Solução de Problemas

### "Dados não persistem"

1. Verifique se o KV está conectado ao projeto
2. Verifique as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`
3. Execute o seed novamente: `POST /api/seed`

### "Upload não funciona"

1. Verifique se o Blob está conectado
2. Verifique a variável `BLOB_READ_WRITE_TOKEN`
3. Verifique os logs no dashboard da Vercel

### "Erro 500 nas APIs"

1. Verifique os logs em **Deployments** → **Functions**
2. Certifique-se que todas as variáveis de ambiente estão configuradas
3. Verifique se o Node.js está na versão 20.x

---

## Arquitetura de Produção

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Vercel KV     │
│   (React/Vite)  │     │   (Redis)       │
│   Static Files  │     │   - vehicles    │
└────────┬────────┘     │   - settings    │
         │              │   - users       │
         │              │   - tokens      │
         ▼              └────────▲────────┘
┌─────────────────┐              │
│   API Routes    │──────────────┘
│   (Serverless)  │
│   - /api/*      │──────────────┐
└─────────────────┘              │
                                 ▼
                    ┌─────────────────┐
                    │  Vercel Blob    │
                    │  (Imagens)      │
                    │  - uploads/     │
                    └─────────────────┘
```

---

## Custos Estimados

| Serviço        | Plano Free | Observação                     |
| -------------- | ---------- | ------------------------------ |
| Vercel Hosting | ✅ Grátis  | 100GB bandwidth                |
| Vercel KV      | ✅ Grátis  | 30MB storage, 30K requests/mês |
| Vercel Blob    | ✅ Grátis  | 1GB storage                    |

Para um site de baixo/médio tráfego, o plano gratuito é suficiente.

---

## Suporte

Em caso de problemas, verifique:

1. [Vercel Status](https://www.vercel-status.com/)
2. [Documentação Vercel KV](https://vercel.com/docs/storage/vercel-kv)
3. [Documentação Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

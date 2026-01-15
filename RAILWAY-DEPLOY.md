# 🚂 Deploy no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Projeto atualizado e buildando localmente

## 🔧 Configuração do Projeto

### 1. Conectar Repositório

1. Acesse [railway.app/new](https://railway.app/new)
2. Clique em **"Deploy from GitHub repo"**
3. Selecione o repositório `rvcar`
4. Railway detectará automaticamente a configuração

### 2. Variáveis de Ambiente (OBRIGATÓRIO)

No dashboard do Railway, vá em **Settings > Variables** e adicione:

```env
# Obrigatórias
NODE_ENV=production
PORT=3000

# URL do Frontend (substitua pelo seu domínio)
FRONTEND_URL=https://seu-projeto.railway.app

# Rate Limiting (opcional, valores padrão já funcionam)
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
```

### 3. Volume Persistente (⚠️ CRÍTICO)

**O Railway usa containers efêmeros.** Sem um volume, todos os dados (veículos, usuários, uploads) serão **perdidos a cada deploy**.

#### Configurar Volume:

1. No dashboard, vá em **Settings > Volumes**
2. Clique em **"Add Volume"**
3. Configure:
   - **Mount Path:** `/app/storage`
   - **Size:** 1GB (ou mais, conforme necessidade)

4. Reinicie o serviço após criar o volume

#### Estrutura do Volume:
```
/app/storage/
├── data/
│   ├── vehicles.json
│   ├── admin-users.json
│   ├── admin-tokens.json
│   ├── site-settings.json
│   └── rate-limits.json
└── uploads/
    ├── vehicles/
    └── site/
```

## 🚀 Deploy

### Automático (Recomendado)
O Railway faz deploy automático a cada push no branch principal.

### Manual
```bash
# Via CLI Railway
railway login
railway link
railway up
```

## ✅ Verificação Pós-Deploy

### 1. Health Check
Acesse: `https://seu-projeto.railway.app/api/health`

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T...",
  "environment": "production",
  "storage": {
    "available": true,
    "type": "file",
    "message": "Storage de arquivos funcionando"
  }
}
```

### 2. Inicialização de Dados
Na primeira execução, chame o endpoint de seed:

```bash
curl -X POST https://seu-projeto.railway.app/api/seed
```

Isso criará:
- Usuário admin padrão
- Veículos de exemplo
- Configurações iniciais do site

⚠️ **IMPORTANTE:** Verifique os logs do Railway para ver a **senha temporária** do admin gerada automaticamente.

### 3. Login no Admin
Acesse: `https://seu-projeto.railway.app/admin`
- Usuário: `admin`
- Senha: (gerada nos logs - troque no primeiro login!)

## 🔒 Segurança em Produção

### Checklist:
- [ ] Volume configurado para persistência
- [ ] Variáveis de ambiente definidas
- [ ] Senha do admin alterada
- [ ] HTTPS habilitado (Railway faz automaticamente)
- [ ] Domínio personalizado configurado (opcional)

## 📊 Monitoramento

### Logs
```bash
railway logs
# ou no dashboard: Deployments > View Logs
```

### Métricas
O Railway fornece métricas de:
- CPU
- Memória
- Network
- Requests

## 🐛 Troubleshooting

### Erro: "Storage não disponível"
- Verifique se o volume está montado em `/app/storage`
- Reinicie o serviço após criar o volume

### Erro: "502 Bad Gateway"
- Verifique os logs de deploy
- Confirme que `PORT` está usando `process.env.PORT`

### Erro: "Dados perdidos após deploy"
- Volume não configurado ou caminho incorreto
- O mount path deve ser exatamente `/app/storage`

### Erro de Build
```bash
# Teste local antes do deploy
npm run build:railway
npm run start:railway
```

## 💡 Alternativas de Persistência

Se preferir não usar volume, considere:

1. **PostgreSQL Railway**
   - Railway oferece PostgreSQL managed
   - Requer refatoração do backend

2. **Supabase**
   - Já tem `@supabase/supabase-js` instalado
   - Storage + Database inclusos

3. **PlanetScale (MySQL)**
   - Serverless MySQL

## 📝 Comandos Úteis

```bash
# Build para Railway
npm run build:railway

# Start local simulando produção
NODE_ENV=production npm run start:railway

# Verificar health local
curl http://localhost:3000/api/health

# Deploy via CLI
railway up

# Ver logs
railway logs -f
```

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway Volumes](https://docs.railway.app/reference/volumes)
- [Railway Variables](https://docs.railway.app/develop/variables)

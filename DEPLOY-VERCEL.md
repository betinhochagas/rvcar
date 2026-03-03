# Configuração de Deploy na Vercel

Este documento descreve os passos necessários para fazer o deploy do RV Car na Vercel.

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Repositório do projeto no GitHub/GitLab/Bitbucket

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel da Vercel:

### Obrigatórias para Backend

| Variável            | Descrição                    | Exemplo                              |
| ------------------- | ---------------------------- | ------------------------------------ |
| `KV_REST_API_URL`   | URL da API do Vercel KV      | Gerado automaticamente ao criar o KV |
| `KV_REST_API_TOKEN` | Token de acesso ao Vercel KV | Gerado automaticamente ao criar o KV |
| `KV_URL`            | URL de conexão do Vercel KV  | Gerado automaticamente ao criar o KV |

### Opcionais para Upload de Imagens

| Variável                | Descrição                    | Exemplo                                |
| ----------------------- | ---------------------------- | -------------------------------------- |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob Storage | Gerado automaticamente ao criar o Blob |

### Opcionais de Segurança

| Variável                    | Descrição                        | Exemplo                     |
| --------------------------- | -------------------------------- | --------------------------- |
| `SEED_SECRET_KEY`           | Chave secreta para inicialização | Uma string aleatória segura |
| `RATE_LIMIT_MAX_ATTEMPTS`   | Máximo de tentativas por janela  | `5`                         |
| `RATE_LIMIT_WINDOW_MINUTES` | Janela de tempo em minutos       | `15`                        |

## Passo a Passo do Deploy

### 1. Criar Projeto na Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do projeto
3. O framework será detectado automaticamente como Vite

### 2. Configurar Vercel KV (Redis)

1. No painel do projeto, vá em **Storage** → **Create Database**
2. Selecione **KV (Key-Value)**
3. Escolha a região `gru1` (São Paulo) para menor latência
4. As variáveis de ambiente serão adicionadas automaticamente

### 3. Configurar Vercel Blob (Opcional - para uploads)

1. No painel do projeto, vá em **Storage** → **Create Database**
2. Selecione **Blob**
3. A variável `BLOB_READ_WRITE_TOKEN` será adicionada automaticamente

### 4. Adicionar Variáveis de Segurança

1. Vá em **Settings** → **Environment Variables**
2. Adicione `SEED_SECRET_KEY` com uma string aleatória segura:
   ```
   openssl rand -hex 32
   ```

### 5. Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar

### 6. Inicializar Dados (Seed)

Após o primeiro deploy, execute o seed para criar os dados iniciais:

```bash
curl -X POST https://seu-projeto.vercel.app/api/seed \
  -H "X-Seed-Secret: sua-seed-secret-key"
```

Ou acesse a URL diretamente (se configurou autenticação admin):

```
POST https://seu-projeto.vercel.app/api/seed
Authorization: Bearer <seu-token>
```

## Credenciais Padrão do Admin

Após o seed, o usuário admin será criado:

- **Usuário:** `admin`
- **Senha:** `rvcar2024`
- **IMPORTANTE:** Altere a senha no primeiro login!

## Endpoints da API

| Método | Endpoint                    | Descrição              | Autenticação |
| ------ | --------------------------- | ---------------------- | ------------ |
| GET    | `/api/vehicles`             | Lista veículos         | Não          |
| POST   | `/api/vehicles`             | Cria veículo           | Sim          |
| GET    | `/api/vehicles/:id`         | Busca veículo          | Não          |
| PUT    | `/api/vehicles/:id`         | Atualiza veículo       | Sim          |
| DELETE | `/api/vehicles/:id`         | Remove veículo         | Sim          |
| PATCH  | `/api/vehicles/:id`         | Toggle disponibilidade | Sim          |
| GET    | `/api/site-settings`        | Lista configurações    | Não          |
| POST   | `/api/site-settings`        | Cria configurações     | Sim          |
| GET    | `/api/site-settings/:key`   | Busca configuração     | Não          |
| PUT    | `/api/site-settings/:key`   | Atualiza configuração  | Sim          |
| DELETE | `/api/site-settings/:key`   | Remove configuração    | Sim          |
| POST   | `/api/auth/login`           | Login                  | Não          |
| POST   | `/api/auth/logout`          | Logout                 | Sim          |
| POST   | `/api/auth/verify`          | Verifica token         | Não          |
| POST   | `/api/auth/change-password` | Altera senha           | Sim          |
| POST   | `/api/upload`               | Upload de imagem       | Sim          |
| GET    | `/api/seed`                 | Status do seed         | Não          |
| POST   | `/api/seed`                 | Executa seed           | Sim\*        |

\*Requer `X-Seed-Secret` header ou autenticação admin.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│  │   Frontend  │   │  Serverless │   │  Vercel Blob    │   │
│  │   (Vite +   │   │  Functions  │   │  (Imagens)      │   │
│  │   React)    │   │  (Node.js)  │   │                 │   │
│  └─────────────┘   └──────┬──────┘   └─────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│                   ┌─────────────┐                           │
│                   │  Vercel KV  │                           │
│                   │   (Redis)   │                           │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Solução de Problemas

### API retorna 500

- Verifique se as variáveis de ambiente do KV estão configuradas
- Verifique os logs em **Deployments** → **Functions** → **Logs**

### Upload falha

- Verifique se `BLOB_READ_WRITE_TOKEN` está configurado
- Verifique se a imagem é menor que 5MB
- Verifique se o formato é JPG, PNG ou WebP

### Dados não persistem

- Verifique se o Vercel KV está configurado corretamente
- Execute o seed novamente se necessário

### CORS errors

- As APIs já incluem headers CORS automaticamente
- Em produção, apenas a origem do próprio domínio é permitida

## Monitoramento

- **Logs:** Vercel Dashboard → Deployments → Functions → Logs
- **Métricas:** Vercel Dashboard → Analytics
- **KV Status:** Vercel Dashboard → Storage → KV

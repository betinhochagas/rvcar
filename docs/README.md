# 📚 Documentação RV Car

Sistema de locação de veículos desenvolvido com **React + TypeScript** (frontend) e **Vercel Serverless Functions** (backend).

**Versão atual:** 2.1.4  
**Score de Segurança:** 10/10  
**Última atualização:** 17 de janeiro de 2026

## 🚀 Quick Start

```bash
# Clone e instale
git clone https://github.com/betinhochagas/rvcar.git
cd rvcar
npm install

# Inicie em desenvolvimento
npm run dev
```

Acesse:

- Frontend: http://localhost:8080
- API: http://localhost:8080/api

## 📖 Guias Principais

### Para Desenvolvedores

- **[API.md](API.md)** - Documentação completa da API REST
- **[TESTING.md](TESTING.md)** - Guia de testes (unitários e integração)

### Para Deploy

- **Deploy Vercel**: Conecte o repositório no dashboard da Vercel
- **Variáveis de Ambiente**: Configure `JWT_SECRET` no dashboard
- **Domínio Personalizado**: Configure em Settings > Domains

## 🏗️ Arquitetura

```
Frontend (React + Vite)
    ↓ HTTP Requests
Backend (TypeScript Serverless)
    ↓ Read/Write
Data (JSON Files)
```

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/change-password` - Alterar senha

### Veículos

- `GET /api/vehicles` - Listar todos
- `GET /api/vehicles/[id]` - Buscar por ID
- `POST /api/vehicles` - Criar novo (requer auth)
- `PUT /api/vehicles/[id]` - Atualizar (requer auth)
- `DELETE /api/vehicles/[id]` - Remover (requer auth)
- `PATCH /api/vehicles/[id]` - Toggle disponibilidade (requer auth)

### Configurações

- `GET /api/site-settings` - Listar todas
- `GET /api/site-settings/[key]` - Buscar por chave
- `POST /api/site-settings` - Criar/atualizar (requer auth)
- `DELETE /api/site-settings/[key]` - Remover (requer auth)

### Upload

- `POST /api/upload` - Upload de imagens (requer auth)

## 🔒 Segurança

- ✅ Rate limiting (5 tentativas/15min)
- ✅ JWT tokens com expiração (24h)
- ✅ CORS configurado
- ✅ Validação de entrada (Zod)
- ✅ Upload seguro (MIME type validation)
- ✅ File locking (previne race conditions)
- ✅ HTTP Headers de segurança (X-Frame-Options, CSP, etc.)
- ✅ Error Boundaries implementados
- ✅ Logger condicional (sem logs em produção)
- ✅ Sem credenciais hardcoded

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com interface
npm run test:ui

# Coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build local
npm run build

# Preview do build
npm run preview

# Deploy Vercel (automático via Git)
git push origin master
```

## 🛠️ Tecnologias

**Frontend:**

- React 18.3
- TypeScript 5.6
- Vite 6.0
- TailwindCSS 3.4
- shadcn/ui

**Backend:**

- TypeScript 5.6
- Vercel Serverless Functions
- Node.js 20.x runtime
- JSON file storage

## 📞 Suporte

- 🐛 **Bugs**: [GitHub Issues](https://github.com/betinhochagas/rvcar/issues)
- 📧 **Email**: contato@rvcar.com.br
- 📝 **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

---

**Desenvolvido com ❤️ por Betinho Chagas**

# 🚗 RV Car - Sistema de Locação de Veículos

Sistema completo para locação de veículos e gestão de investimentos em frota, desenvolvido com React + TypeScript no frontend e Vercel Serverless Functions no backend.

[![Versão](https://img.shields.io/badge/versão-2.1.1-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Sumário

- [Características](#-características)
- [Demonstração](#-demonstração)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Deploy](#-deploy)
- [Documentação](#-documentação)
- [Contribuindo](#-contribuindo)

## ✨ Características

### Frontend (React + TypeScript)

- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Componentes Reutilizáveis**: Baseado em shadcn/ui
- **Performance Otimizada**: Code splitting e lazy loading
- **Segurança**: Error boundaries e validação de entrada
- **Acessibilidade**: Componentes acessíveis (WCAG)

### Backend (TypeScript Serverless)

- **API RESTful**: Endpoints bem documentados com Vercel Functions
- **Armazenamento JSON**: Sem necessidade de banco de dados
- **Segurança Avançada**:
  - Rate limiting (5 tentativas/15min)
  - CSRF protection
  - Validação profunda de uploads
  - Headers de segurança HTTP
  - Sistema de logs
- **Autenticação**: Sistema de tokens JWT seguro

### Funcionalidades para Clientes

- ✅ Catálogo de veículos com busca e filtros
- ✅ Formulários inteligentes (Locação e Investimento)
- ✅ Integração direta com WhatsApp
- ✅ Modal adaptativo por contexto
- ✅ Design responsivo para mobile
- ✅ Formatação automática de dados

### Painel Administrativo

- ✅ Gestão completa de veículos (CRUD)
- ✅ Upload de imagens com preview
- ✅ Configurações do site editáveis
- ✅ Gerenciamento de contatos separados
- ✅ Configuração de redes sociais
- ✅ Sistema de autenticação seguro
- ✅ Preview de SEO/Open Graph

## 🌐 Demonstração

**Frontend**: [https://rvcar.vercel.app](https://rvcar.vercel.app)  
**Painel Admin**: [https://rvcar.vercel.app/admin](https://rvcar.vercel.app/admin)

> **Nota**: Backend e frontend hospedados no Vercel (deploy único).

## 🛠️ Tecnologias

### Frontend

| Tecnologia      | Versão | Uso                 |
| --------------- | ------ | ------------------- |
| React           | 18.3+  | Framework principal |
| TypeScript      | 5.6+   | Tipagem estática    |
| Vite            | 6.0+   | Build tool          |
| Tailwind CSS    | 3.4+   | Estilização         |
| shadcn/ui       | Latest | Componentes UI      |
| React Router    | 7.0+   | Roteamento          |
| Zod             | 3.24+  | Validação           |
| React Hook Form | 7.54+  | Formulários         |

### Backend

| Tecnologia          | Requisito              |
| ------------------- | ---------------------- |
| Node.js             | 20.x+ (Vercel Runtime) |
| TypeScript          | 5.6+                   |
| Sistema de arquivos | Permissões de escrita  |

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18+ ou **Bun** 1.0+
- **Git**

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/betinhochagas/rvcar.git
cd rvcar

# 2. Instale as dependências
npm install

# 3. Configure o backend
cp api/.env.example api/.env
# Edite api/.env com suas configurações

# 4. Configure o frontend
cp .env.example .env
# Edite .env com a URL do seu backend

# 5. Inicie o desenvolvimento
npm run dev
```

📚 **Guia completo**: [docs/INSTALACAO.md](docs/INSTALACAO.md)

## 📁 Estrutura do Projeto

```
rvcar/
├── api/                          # Backend PHP
│   ├── .env.example             # Template TypeScript (Serverless)
│   ├── auth/
│   │   ├── login/route.ts       # Login
│   │   ├── logout/route.ts      # Logout
│   │   ├── verify/route.ts      # Verificação de token
│   │   └── change-password/route.ts
│   ├── vehicles/
│   │   ├── route.ts             # CRUD veículos
│   │   └── [id]/route.ts        # Operações por ID
│   ├── site-settings/
│   │   ├── route.ts             # Configurações
│   │   └── [key]/route.ts       # Por chave
│   ├── upload/route.ts          # Upload de imagens
│   └── lib/                     # Utilitários do backend
│       ├── auth.ts
│       ├── cors.ts
│       ├── rate-limiter.ts
│       ├── validator.ts
│       └── file-ops.ts
├── src/                          # Frontend React
│   ├── components/              # Componentes React
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── admin/              # Componentes do admin
│   │   ├── ErrorBoundary.tsx   # Error boundary
│   │   └── LoadingFallback.tsx # Loading UI
│   │
│   ├── pages/                   # Páginas
│   │   ├── Home.tsx            # Página inicial
│   │   └── AdminDashboard.tsx  # Painel admin
│   │
│   ├── lib/                     # Utilitários
│   │   ├── api.ts              # Cliente API
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   ├── fetchWithRetry.ts   # Retry logic
│   │   ├── authManager.ts      # Gerenciador de auth
│   │   ├── vehicleManager.ts   # Gerenciador de veículos
│   │   └── siteConfigManager.ts # Configurações
│   │
│   └── types/                   # Tipos TypeScript
│
├── data/                        # Armazenamento JSON
│   ├── vehicles.json           # Dados dos veículos
│   ├── contacts.json           # Contatos
│   └── site-config.json        # Configurações
│
├── uploads/                     # Imagens uploadadas
│   └── .htaccess               # Proteção de segurança
│
├── docs/                        # Documentação
│   ├── INSTALACAO.md           # Guia de instalação
│   ├── API.md                  # Documentação da API
│   └── DEPLOY.md               # Guia de deploy
│
├── .env.example                 # Template frontend
├── vercel.json                  # Config Vercel
├── vite.config.ts              # Config Vite
└── package.json                # Dependências
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### Frontend (`.env`)

````env
# URLEnvironment Variables (Vercel)

Configure no dashboard da Vercel ou em `.env.local`:

```env
# JWT Secret (gerado automaticamente se não definido)
JWT_SECRET=sua-chave-secreta-forte-256-bits

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15

# CORS (opcional, configura no vercel.json)enciais Admin
ADMIN_PASSWORD=senha-aleatoria

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT_MINUTES=15

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com
````

📚 **Documentação completa**: [docs/INSTALACAO.md](docs/INSTALACAO.md)
Vercel (Recomendado - Deploy Único)

O projeto completo (frontend + backend) é deployado no Vercel:

1. **Conecte seu repositório** ao Vercel
2. **Deploy automático** acontece a cada push no `master`
3. **Sem configuração extra** necessária (vercel.json já configurado)
4. **Opcional**: Configure variáveis de ambiente:
   - `JWT_SECRET` = Chave secreta para tokens
   - `MAX_LOGIN_ATTEMPTS` = Limite de tentativas de login

- **Gratuitos**: InfinityFree, 000webhost
- **Pagos**: Hostinger (R$6/mês), DigitalOcean ($4/mês)

📚 **Guia completo de deploy**: [docs/DEPLOY.md](docs/DEPLOY.md)

## 🔒 Segurança

### Recursos Implementados

- ✅ **Rate Limiting**: Proteção contra brute force
- ✅ **CSRF Protection**: Tokens em operações de escrita
- ✅ **Input Validation**: Validação profunda de dados
- ✅ **Upload Security**: Validação de MIME type
- ✅ **HTTP Headers**: CSP, X-Frame-Options, HSTS
- ✅ **File Locking**: Prevenção de race conditions
- ✅ **Security Logs**: Log de operações críticas
- ✅ **Environment Variables**: Credenciais fora do código

**Score de Segurança**: Backend 9.5/10 | Frontend 9.5/10

📚 **Detalhes**: [SECURITY.md](SECURITY.md)

## 📖 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de dev
npm run build            # Build de produção
npm run preview          # Preview do build

# Testes
npm run test             # Executa testes
npm run test:ui          # Interface de testes
npm run test:coverage    # Relatório de cobertura

# Linting
npm run lint             # Verifica código
```

## 📚 Documentação

- 📦 [Guia de Instalação](docs/INSTALACAO.md)
- 📡 [Documentação da API](docs/API.md)
- 🚀 [Guia de Deploy](docs/DEPLOY.md)
- 🔒 [Segurança](SECURITY.md)
- 📝 [Changelog](CHANGELOG.md)
- 🤝 [Contribuindo](CONTRIBUTING.md)

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com interface
npm run test:ui

# Coverage
npm run test:coverage
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Betinho Chagas**

- GitHub: [@betinhochagas](https://github.com/betinhochagas)
- Email: contato@rvcar.com.br

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](docs/)
2. Consulte o [CHANGELOG](CHANGELOG.md)
3. Abra uma [issue](https://github.com/betinhochagas/rvcar/issues)

---

**Desenvolvido com ❤️ para facilitar a locação de veículos**

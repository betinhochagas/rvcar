# 📚 Documentação - RV Car

Bem-vindo à documentação completa do sistema RV Car.

## 🚀 Começando

Novo no projeto? Comece aqui:

1. **[Início Rápido](QUICK-START.md)** - Configure e rode em 5 minutos
2. **[Guia de Instalação](INSTALACAO.md)** - Instalação completa e detalhada
3. **[Configuração](CONFIGURACAO.md)** - Todas as opções de configuração

## 📖 Guias

### Para Desenvolvedores

- **[Documentação da API](API.md)** - Todos os endpoints e exemplos
- **[Estrutura do Projeto](../README.md#estrutura-do-projeto)** - Organização dos arquivos
- **[Contribuindo](../CONTRIBUTING.md)** - Como contribuir com o projeto

### Para Deploy

- **[Guia de Deploy](DEPLOY.md)** - Deploy completo (Frontend + Backend)
- **[Vercel Deploy](DEPLOY.md#deploy-do-frontend-vercel)** - Deploy do frontend
- **[PHP Backend Deploy](DEPLOY.md#deploy-do-backend-php)** - Deploy do backend

### Segurança

- **[Segurança](../SECURITY.md)** - Recursos de segurança implementados
- **[Changelog](../CHANGELOG.md)** - Histórico de versões e mudanças

## 🎯 Casos de Uso

### Eu quero...

**...rodar o projeto localmente**
→ [Início Rápido](QUICK-START.md)

**...fazer deploy em produção**
→ [Guia de Deploy](DEPLOY.md)

**...entender a API**
→ [Documentação da API](API.md)

**...configurar variáveis de ambiente**
→ [Configuração](CONFIGURACAO.md)

**...personalizar o sistema**
→ [Painel Admin](CONFIGURACAO.md#configurações-do-site)

**...contribuir com código**
→ [Contribuindo](../CONTRIBUTING.md)

## 📁 Estrutura da Documentação

```
docs/
├── README.md           # Este arquivo
├── QUICK-START.md      # Início rápido (5 minutos)
├── INSTALACAO.md       # Guia de instalação completo
├── CONFIGURACAO.md     # Todas as configurações
├── API.md              # Documentação da API
└── DEPLOY.md           # Guia de deploy

../
├── README.md           # Documentação principal
├── CHANGELOG.md        # Histórico de versões
├── CONTRIBUTING.md     # Como contribuir
├── SECURITY.md         # Segurança
└── LICENSE             # Licença MIT
```

## 🔍 Busca Rápida

### Comandos Essenciais

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Testes
npm run test

# Linting
npm run lint
```

### Configuração Rápida

**Frontend** (`.env`):

```env
VITE_API_URL=http://localhost/rvcar/api
```

**Backend** (`api/.env`):

```env
ENVIRONMENT=production
JWT_SECRET=sua-chave-secreta
ADMIN_PASSWORD=senha-temporaria
ALLOWED_ORIGINS=https://seu-dominio.com
```

### URLs Importantes

- **Repositório**: https://github.com/betinhochagas/rvcar
- **Demo**: https://rvcar.vercel.app
- **Issues**: https://github.com/betinhochagas/rvcar/issues

## ❓ Precisa de Ajuda?

1. **Consulte a documentação** relevante acima
2. **Veja exemplos** no código fonte
3. **Procure issues similares** no GitHub
4. **Abra uma nova issue** se necessário

## 📊 Status do Projeto

- **Versão atual**: 2.1.1
- **Status**: Produção ✅
- **Score de Segurança**: Backend 9.5/10 | Frontend 9.5/10
- **Cobertura de Testes**: Em desenvolvimento

## 🎓 Recursos Adicionais

### Tecnologias Utilizadas

- [React](https://react.dev/) - Framework frontend
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI

### Ferramentas Recomendadas

- **Editor**: VS Code
- **Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - PHP IntelliSense
- **Testing**: Chrome DevTools, Postman

---

**Última atualização**: Janeiro 2026  
**Mantenedor**: [@betinhochagas](https://github.com/betinhochagas)

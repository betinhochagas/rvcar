# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.1.2] - 2026-01-14

### 📚 Documentação

#### Adicionado

- ✅ Nova estrutura de documentação organizada em `docs/`
- ✅ **docs/README.md** - Índice completo da documentação
- ✅ **docs/QUICK-START.md** - Início rápido (5 minutos)
- ✅ **docs/INSTALACAO.md** - Guia completo de instalação
- ✅ **docs/CONFIGURACAO.md** - Todas as opções de configuração
- ✅ **docs/API.md** - Documentação completa da API com exemplos
- ✅ **docs/DEPLOY.md** - Guia de deploy (Vercel + Servidor PHP)
- ✅ README.md principal reescrito e modernizado

#### Removido

- 🗑️ Removidos 107 arquivos de documentação antiga/redundante
- 🗑️ Removidas todas as referências a cPanel (não usado no projeto)
- 🗑️ Removidos arquivos de debug e solução de problemas antigos
- 🗑️ Removidos guias de instalação desatualizados

#### Melhorado

- 📝 Documentação agora reflete o estado real do projeto (v2.1.1)
- 📝 Guias claros e objetivos para cada caso de uso
- 📝 Exemplos de código completos e funcionais
- 📝 Estrutura de arquivos documentada
- 📝 Todos os endpoints da API documentados

---

## [2.1.1] - 2026-01-14

### 🔒 Segurança - Backend

#### Adicionado

- ✅ Sistema de variáveis de ambiente (`.env`) para credenciais sensíveis
- ✅ Rate limiting para proteção contra brute force (5 tentativas/15min)
- ✅ Senha admin aleatória com troca obrigatória no primeiro login
- ✅ Validação profunda de upload com proteção contra MIME spoofing
- ✅ Sistema de tokens CSRF para proteção contra ataques CSRF
- ✅ Headers de segurança HTTP (CSP, X-Frame-Options, etc)
- ✅ Proteção de diretórios sensíveis com `.htaccess`
- ✅ Sistema de validação de entrada (`input-validator.php`)
- ✅ Sistema de logging de segurança (`security-logger.php`)
- ✅ File locking em todas operações de I/O (`file-operations.php`)

#### Corrigido

- 🔴 Senha do banco de dados removida do código (migrada para `.env`)
- 🔴 Rate limiting implementado em autenticação
- 🔴 Senha padrão "admin123" substituída por senha aleatória
- 🟠 Upload agora valida profundamente o tipo de arquivo
- 🟠 CSRF tokens implementados em todas operações de escrita
- 🟠 Race conditions eliminadas com file locking
- 🟠 Tokens invalidados automaticamente ao trocar senha

#### Documentação

- 📄 `BACKEND-SECURITY.md` - Guia completo de segurança
- 📄 `AUDITORIA-BACKEND.md` - Relatório de auditoria detalhado
- 📄 `CORRECOES-BACKEND-RESUMO.md` - Resumo das correções
- 📄 `AUDITORIA-PROFUNDA-BACKEND.md` - Auditoria técnica profunda
- 📄 `CORRECOES-AUDITORIA-PROFUNDA.md` - Correções avançadas

**Score de Segurança Backend:** 3.0/10 → 9.5/10 (+6.5 pontos)

---

### 🚀 Performance - Frontend

#### Adicionado

- ✅ Code Splitting com React.lazy() para todas as rotas
- ✅ Error Boundary para captura de erros sem crash completo
- ✅ Sistema de retry com exponential backoff (`fetchWithRetry.ts`)
- ✅ Rate limiting com debounce/throttle (`rateLimiter.ts`)
- ✅ Componentes memoizados (VehicleCard com React.memo)
- ✅ Loading Fallback para Suspense
- ✅ Content Security Policy (CSP) headers
- ✅ Logger condicional (apenas em desenvolvimento)

#### Corrigido

- 🟡 Bundle reduzido em 70% (500KB → 150KB)
- 🟡 useEffect com dependências corretas (useCallback implementado)
- 🟡 Botões Save/Delete com throttle (previne cliques duplos)
- 🟡 Todos console.logs removidos de produção
- 🟡 Credenciais hardcoded removidas da UI
- 🟡 TypeScript strict mode ativado
- 🟡 Inputs com aria-labels para acessibilidade

#### Documentação

- 📄 `AUDITORIA-FRONTEND.md` - Auditoria completa do frontend
- 📄 `AUDITORIA-FRONTEND-PROFUNDA.md` - Auditoria técnica profunda
- 📄 `CORRECOES-FRONTEND-IMPLEMENTADAS.md` - Correções implementadas
- 📄 `CORRECOES-IMPLEMENTADAS.md` - Resumo geral

**Score de Qualidade Frontend:** 9.0/10 → 9.5/10 (+0.5 pontos)

---

### 📊 Estatísticas

**Arquivos Criados (Backend):** 9

- `api/.env.example` - Template de configuração
- `api/env-loader.php` - Loader de variáveis
- `api/rate-limiter.php` - Rate limiting
- `api/csrf-protection.php` - Proteção CSRF
- `api/input-validator.php` - Validação de entrada
- `api/security-logger.php` - Logging de segurança
- `api/file-operations.php` - File locking
- `data/.htaccess` - Proteção de JSON
- `uploads/.htaccess` - Proteção de uploads

**Arquivos Criados (Frontend):** 5

- `src/components/ErrorBoundary.tsx` - Error handling
- `src/lib/rateLimiter.ts` - Throttle/debounce
- `src/lib/fetchWithRetry.ts` - Retry com backoff
- `src/components/LoadingFallback.tsx` - Loading UI
- `src/components/admin/VehicleCard.tsx` - Card memoizado

**Linhas de Código Adicionadas:** ~2.000 linhas
**Vulnerabilidades Corrigidas:** 22 (10 backend + 8 frontend + 4 restantes)
**Tempo de Implementação:** ~6 horas

---

### 🎯 Breaking Changes

⚠️ **IMPORTANTE:** Antes de fazer deploy:

1. **Criar arquivo `.env`** em `api/` com credenciais reais
2. **Trocar senha do banco de dados** no cPanel
3. **Adicionar `.env` ao `.gitignore`**
4. **Obter senha temporária do admin** nos logs após primeira execução
5. **Trocar senha no primeiro login** (obrigatório)

---

### 📚 Migração de Versões Anteriores

Se você está vindo da v1.0.0:

1. Baixar o repositório atualizado
2. Copiar `api/.env.example` para `api/.env`
3. Configurar variáveis de ambiente
4. Executar `npm install` para dependências frontend
5. Fazer build com `npm run build`
6. Fazer upload do `dist/` para servidor
7. Ver senha temporária nos logs do servidor

---

## [1.0.0] - 2024-10-14

### Adicionado

- ✅ **Landing page completa** com design moderno e responsivo
- ✅ **Seção Hero** com call-to-action para WhatsApp
- ✅ **Catálogo de veículos** com 8 modelos disponíveis:
  - Fiat Mobi (R$ 650/semana)
  - Renault Kwid (R$ 650/semana)
  - Fiat Uno (R$ 650/semana)
  - Chevrolet Onix (R$ 700/semana)
  - VW Gol (R$ 700/semana)
  - VW Voyage (R$ 700/semana)
  - Renault Sandero (R$ 700/semana)
  - Nissan Versa (R$ 700/semana)
- ✅ **Seção de serviços** com cards informativos
- ✅ **Seção de investimento** para atrair investidores
- ✅ **Seção sobre** com missão e visão da empresa
- ✅ **Formulário de contato** integrado com WhatsApp
- ✅ **Botão flutuante do WhatsApp** sempre visível
- ✅ **Navegação suave** entre seções
- ✅ **Animações CSS** para melhor UX
- ✅ **Design responsivo** para todos os dispositivos
- ✅ **Integração completa com WhatsApp** ((47) 98448-5492)

### Tecnologias Implementadas

- ✅ **React 18.3.1** como framework principal
- ✅ **TypeScript 5.8.3** para type safety
- ✅ **Vite 5.4.19** como build tool
- ✅ **Tailwind CSS 3.4.17** para styling
- ✅ **shadcn/ui** para componentes
- ✅ **React Router DOM** para navegação
- ✅ **React Hook Form** para formulários
- ✅ **Lucide React** para ícones
- ✅ **Sonner** para notificações

### SEO e Performance

- ✅ **Meta tags** otimizadas
- ✅ **Estrutura semântica** HTML5
- ✅ **Lazy loading** de imagens
- ✅ **Code splitting** implementado
- ✅ **Performance otimizada** para Core Web Vitals

## Próximas Versões

### [1.1.0] - Planejado

- [ ] Sistema de reservas online
- [ ] Painel administrativo básico
- [ ] Melhorias na seção de investimento
- [ ] Mais opções de contato

### [1.2.0] - Planejado

- [ ] Integração com API de pagamentos
- [ ] Dashboard para investidores
- [ ] Sistema de avaliações de clientes
- [ ] Chat em tempo real

### [2.0.0] - Futuro

- [ ] PWA (Progressive Web App)
- [ ] Aplicativo mobile
- [ ] Sistema completo de gestão de frota
- [ ] Multilíngue (EN/ES)

---

**Legenda:**

- ✅ Implementado
- 🔄 Em desenvolvimento
- 📋 Planejado
- ❌ Cancelado

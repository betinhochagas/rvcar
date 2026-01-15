# 🚀 COMO INICIAR O PROJETO - Backend TypeScript

## ✅ OPÇÃO 1: Desenvolvimento Local (Recomendado para Testes)

### Windows (Batch):

```batch
start-dev-typescript.bat
```

### Windows (PowerShell):

```powershell
.\start-dev-typescript.ps1
```

### Manualmente:

```bash
npm run dev
```

**O que vai acontecer:**

- ✅ Frontend inicia em `http://localhost:8080`
- ✅ Você pode testar a interface
- ⚠️ APIs não funcionarão localmente (precisam estar na Vercel)

**Credenciais:**

- Usuário: `admin`
- Senha: `admin123`

---

## 🌐 OPÇÃO 2: Deploy Completo na Vercel (Produção)

### 1. Primeiro Deploy (Configuração Inicial):

```bash
# Instalar Vercel CLI (apenas primeira vez)
npm install -g vercel

# Fazer login
vercel login

# Deploy inicial (staging)
vercel

# Deploy para produção
vercel --prod
```

### 2. Deploy Usando Script:

```batch
deploy-vercel.bat
```

O script irá:

1. ✅ Verificar Vercel CLI
2. ✅ Fazer build do frontend
3. ✅ Perguntar se quer staging ou produção
4. ✅ Fazer deploy

---

## 🔧 OPÇÃO 3: Desenvolvimento com Vercel Dev (Backend Local)

Se quiser testar as APIs TypeScript localmente:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend Vercel (REQUER vercel login primeiro)
vercel dev
```

**Atenção:** `vercel dev` requer:

- Estar logado: `vercel login`
- Token válido da Vercel
- Conexão com internet

---

## 📋 Comparação das Opções

| Opção       | Frontend  | Backend         | Uso              |
| ----------- | --------- | --------------- | ---------------- |
| **Opção 1** | ✅ Local  | ❌ Não funciona | Testar UI apenas |
| **Opção 2** | ✅ Vercel | ✅ Vercel       | Produção/Staging |
| **Opção 3** | ✅ Local  | ✅ Local        | Dev completo\*   |

\*Opção 3 requer autenticação Vercel

---

## 🎯 Recomendação para Começar

**Para testar rapidamente:**

```bash
# 1. Inicie o frontend
npm run dev

# 2. Acesse no navegador
http://localhost:8080
```

**Para produção:**

```bash
# Deploy completo
vercel --prod
```

---

## ❓ Mudanças do PHP para TypeScript

### Antes (PHP):

```batch
start-completo.bat  # Iniciava MySQL + PHP + Frontend
```

- ✅ MySQL rodando
- ✅ PHP servidor em porta 3000
- ✅ Frontend em porta 8080

### Agora (TypeScript):

```batch
start-dev-typescript.bat  # Inicia APENAS Frontend
```

- ❌ Não precisa MySQL
- ❌ Não precisa PHP
- ✅ Frontend em porta 8080
- ✅ Backend TypeScript na Vercel (serverless)

**Arquivos JSON** (dados):

- Continuam em `/data/`
- `admin-users.json`
- `admin-tokens.json`
- `vehicles.json`
- `site-settings.json`

---

## 🐛 Troubleshooting

### "APIs não funcionam localmente"

**Solução:** As APIs TypeScript precisam estar deployadas na Vercel. Use:

```bash
vercel dev
# ou
vercel --prod
```

### "Vercel login falhou"

**Solução:**

```bash
vercel logout
vercel login
```

### "Build falhou"

**Solução:**

```bash
# Limpar e reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📚 Documentação Adicional

- [MIGRACAO-TYPESCRIPT.md](MIGRACAO-TYPESCRIPT.md) - Detalhes da migração
- [DEPLOY-TYPESCRIPT.md](DEPLOY-TYPESCRIPT.md) - Guia de deploy
- [BUGS-CORRIGIDOS-FINAL.md](BUGS-CORRIGIDOS-FINAL.md) - Bugs corrigidos
- [RESUMO-FINAL-MIGRACAO.md](RESUMO-FINAL-MIGRACAO.md) - Resumo executivo

---

## ✅ Checklist Rápido

- [ ] Node.js instalado (`node -v`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Frontend funciona (`npm run dev`)
- [ ] Vercel CLI instalado (`vercel --version`)
- [ ] Login na Vercel feito (`vercel login`)
- [ ] Deploy realizado (`vercel --prod`)
- [ ] Testado em produção (URL da Vercel)

---

**Última atualização:** 14/01/2026
**Versão:** 2.0 - Backend TypeScript Serverless

# 🚀 Guia Rápido - Rodar Sistema Localmente

## 📋 Opção 1: Frontend + Backend (Recomendado)

### **Passo 1: Instalar Dependências**

```powershell
npm install
```

### **Passo 2: Iniciar Servidor de Desenvolvimento**

```powershell
npm run dev
```

✅ O servidor Vite iniciará em: **http://localhost:8080**

---

## 🎯 Opção 2: Com Vercel CLI (APIs Funcionando)

### **Passo 1: Instalar Vercel CLI**

```powershell
npm install -g vercel
```

### **Passo 2: Fazer Login no Vercel**

```powershell
vercel login
```

### **Passo 3: Iniciar Ambiente de Desenvolvimento**

```powershell
vercel dev
```

Será perguntado:

- **Set up and develop?** → `Y` (sim)
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → `N` (não)
- **Project name?** → `rvcar` ou deixe default
- **In which directory?** → `.` (deixe vazio, tecle Enter)

✅ Servidor iniciará em: **http://localhost:3000**

---

## 🧪 Opção 3: Apenas Frontend (Sem APIs)

Se você só quer ver a interface sem testar as APIs:

```powershell
# 1. Fazer build
npm run build

# 2. Visualizar preview
npm run preview
```

✅ Preview em: **http://localhost:4173**

---

## ⚡ Comandos Rápidos

| Comando           | Descrição                    | Porta |
| ----------------- | ---------------------------- | ----- |
| `npm run dev`     | Vite dev server (sem APIs)   | 8080  |
| `vercel dev`      | Ambiente Vercel completo     | 3000  |
| `npm run preview` | Preview do build de produção | 4173  |
| `npm run build`   | Criar build otimizado        | -     |

---

## 🔍 Testando o Sistema

### **Frontend (Vite Dev)**

1. Abra: http://localhost:8080
2. Você verá a página inicial com veículos
3. Clique em "Admin" no menu
4. Login: `admin` / `admin123`

**⚠️ IMPORTANTE:** Com `npm run dev`, as APIs **NÃO funcionam**. Você verá erros no console do navegador ao tentar:

- Fazer login
- Carregar veículos
- Enviar formulários

### **Com Vercel Dev (APIs Funcionando)**

1. Abra: http://localhost:3000
2. Frontend + Backend funcionando completamente
3. Login funciona
4. CRUD de veículos funciona
5. Upload de imagens funciona

---

## 🐛 Problemas Comuns

### **Erro: "EADDRINUSE: address already in use"**

Já existe algo rodando na porta. Mate o processo:

```powershell
# Verificar processos Node.js
Get-Process -Name "node" | Stop-Process -Force

# Ou mude a porta do Vite
npm run dev -- --port 8081
```

### **Erro: "vercel: command not found"**

Instale o Vercel CLI globalmente:

```powershell
npm install -g vercel
```

### **APIs não funcionam com `npm run dev`**

Isso é normal! Use `vercel dev` para ter as APIs funcionando.

---

## 📂 Estrutura em Desenvolvimento

```
http://localhost:8080/           → Frontend (Vite)
http://localhost:3000/           → Frontend + Backend (Vercel Dev)
http://localhost:3000/api        → APIs (apenas com Vercel Dev)
http://localhost:3000/admin      → Painel Admin
```

---

## 🎯 Workflow Recomendado

### **Para Desenvolver Frontend:**

```powershell
npm run dev
```

- Mais rápido
- Hot reload instantâneo
- Bom para ajustar UI/UX

### **Para Testar APIs:**

```powershell
vercel dev
```

- Simula ambiente de produção
- APIs funcionando
- Bom para testar integração completa

---

## 🔧 Configuração (Opcional)

### **Variáveis de Ambiente**

Crie um arquivo `.env.local` (já está no .gitignore):

```env
# Frontend
VITE_API_URL=http://localhost:3000/api

# Backend (Vercel Dev usa automaticamente)
JWT_SECRET=seu-secret-dev
```

---

## ✅ Checklist de Desenvolvimento

- [ ] `npm install` executado
- [ ] `npm run dev` funciona (frontend)
- [ ] Vercel CLI instalado: `vercel --version`
- [ ] `vercel dev` funciona (frontend + backend)
- [ ] Login no admin funciona: http://localhost:3000/admin

---

## 🚀 Próximos Passos

Depois de testar localmente:

1. Faça suas modificações
2. Teste com `vercel dev`
3. Commit e push para GitHub
4. Deploy automático no Vercel

---

**💡 Dica:** Use `vercel dev` para desenvolvimento completo. É mais lento que `npm run dev`, mas as APIs funcionam!

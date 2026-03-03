# 🔧 Configuração do Vercel Dashboard

## ❌ ERRO ATUAL

O Vercel está configurado como **Next.js** mas o projeto é **Vite**!

```
Framework Preset: Next.js ❌
Node.js Version: 24.x ❌
```

Isso causa o erro: **"Function Runtimes must have a valid version"**

---

## ✅ CONFIGURAÇÃO CORRETA

### **1. Framework Settings**

Acesse: **Vercel Dashboard → Settings → General → Build & Development Settings**

Configure:

| Campo                | Valor                      |
| -------------------- | -------------------------- |
| **Framework Preset** | `Other` ou `Vite`          |
| **Build Command**    | `npm run build` (Override) |
| **Output Directory** | `dist` (Override)          |
| **Install Command**  | `npm install` (Override)   |

**IMPORTANTE:** Clique em **Override** nos 3 campos!

---

### **2. Node.js Version**

Acesse: **Vercel Dashboard → Settings → General → Node.js Version**

Configure:

| Campo               | Valor  |
| ------------------- | ------ |
| **Node.js Version** | `20.x` |

Clique em **Save**

---

### **3. Root Directory**

Acesse: **Vercel Dashboard → Settings → General → Root Directory**

Configure:

| Campo              | Valor       |
| ------------------ | ----------- |
| **Root Directory** | ` ` (vazio) |

---

## 🚀 PASSOS PARA APLICAR

### **Passo 1: Limpar Framework Preset**

1. Vá para: **Settings → General**
2. Role até **Build & Development Settings**
3. Em **Framework Preset**, selecione **`Other`**
4. Marque **Override** nos 3 campos:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Clique em **Save**

### **Passo 2: Ajustar Node.js Version**

1. Role até **Node.js Version**
2. Selecione **`20.x`** no dropdown
3. Clique em **Save**

### **Passo 3: Forçar Novo Deploy**

1. Vá para: **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione **Redeploy**
4. **DESMARQUE** "Use existing Build Cache"
5. Clique em **Redeploy**

---

## 📋 Checklist de Verificação

Após as mudanças, o build deve mostrar:

```bash
✅ Found .vercelignore
✅ Removed 32 ignored files defined in .vercelignore
✅ Running 'vercel build'
✅ Vercel CLI 50.3.1
✅ Build machine configuration: 2 cores, 8 GB
✅ Cloning github.com/betinhochagas/rvcar (Branch: master)
✅ Cloning completed: 694.000ms
✅ Running 'npm install'
✅ Running 'npm run build'
✅ > vite build
✅ dist/index.html generated
✅ Build Completed
```

**NÃO DEVE APARECER:**

```bash
❌ Framework Preset: Next.js
❌ Error: Function Runtimes must have a valid version
```

---

## 🔍 Verificação Final

Após deploy bem-sucedido:

1. **Homepage:** https://seu-dominio.vercel.app
2. **Admin:** https://seu-dominio.vercel.app/admin
3. **API Test:** https://seu-dominio.vercel.app/api/vehicles

---

## 📱 Prints para Seguir

### Framework Settings - ANTES ❌

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: dist
```

### Framework Settings - DEPOIS ✅

```
Framework Preset: Other (ou Vite)
Build Command: npm run build (Override ativo)
Output Directory: dist (Override ativo)
Install Command: npm install (Override ativo)
```

### Node.js Version - ANTES ❌

```
Node.js Version: 24.x
```

### Node.js Version - DEPOIS ✅

```
Node.js Version: 20.x
```

---

## ⚠️ IMPORTANTE

- **NÃO use "Next.js" como Framework Preset**
- **USE "Other" ou "Vite"**
- **ATIVE os Overrides** nos comandos de build
- **USE Node.js 20.x** (compatível com vercel.json)
- **SEMPRE** desmarque cache ao fazer redeploy após mudanças

---

## 🆘 Se Ainda Falhar

Se após essas mudanças ainda falhar:

1. **Delete o projeto** no Vercel Dashboard
2. **Reimporte** do GitHub
3. O Vercel vai detectar automaticamente como Vite
4. Configure Node.js 20.x manualmente

---

**Última atualização:** 14/01/2026

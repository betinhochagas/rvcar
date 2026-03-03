# 🚨 SOLUÇÃO DEFINITIVA - DELETE E RECRIE O PROJETO

## ❌ O PROBLEMA

O erro `"Function Runtimes must have a valid version, for example now-php@1.0.0"` persiste porque:

- ✅ O código está 100% limpo (sem PHP)
- ✅ O `vercel.json` está correto
- ✅ O build local funciona perfeitamente
- ❌ **MAS o projeto do Vercel tem configurações antigas "travadas"**

**Testamos até sem a pasta `api/` e o erro continuou!**

---

## ✅ SOLUÇÃO: DELETE E RECRIE

### **Passo 1: Deletar Projeto Antigo no Dashboard**

1. Acesse: https://vercel.com/roberto-chagas-projects/rvcar-master
2. Vá em: **Settings → General** (role até o final)
3. Clique em: **Delete Project**
4. Digite: `rvcar-master` para confirmar
5. Clique em: **Delete**

---

### **Passo 2: Criar Projeto Novo via Dashboard**

1. Vá para: https://vercel.com/new
2. Clique em: **Import Git Repository**
3. Selecione: **betinhochagas/rvcar**
4. **Configure Projeto:**

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| **Project Name**     | `rvcar` (ou outro nome) |
| **Framework Preset** | `Vite`                  |
| **Root Directory**   | `.` (vazio/raiz)        |
| **Build Command**    | `npm run build`         |
| **Output Directory** | `dist`                  |
| **Install Command**  | `npm install`           |

5. **NÃO adicione variáveis de ambiente agora**
6. Clique em: **Deploy**

---

### **Passo 3: Configurar Node.js Version**

Após o primeiro deploy:

1. Vá em: **Settings → General → Node.js Version**
2. Selecione: **20.x**
3. Clique em: **Save**

---

### **Passo 4: Redeploy**

1. Vá em: **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione: **Redeploy**
4. **DESMARQUE** "Use existing Build Cache"
5. Clique em: **Redeploy**

---

## 🎯 POR QUE ISSO VAI FUNCIONAR?

Quando você cria um projeto **DO ZERO** no Vercel:

- ✅ Vercel detecta automaticamente como **Vite**
- ✅ Lê o `vercel.json` sem configurações antigas
- ✅ Não tem cache de builds anteriores com PHP
- ✅ Não tem configurações de runtime antigas

**O projeto atual tem "fantasmas" de configurações antigas que não conseguimos limpar via CLI ou código.**

---

## 📋 CHECKLIST FINAL

Após criar o projeto novo:

- [ ] Deploy bem-sucedido (sem erro de PHP)
- [ ] Frontend carrega: `https://seu-novo-projeto.vercel.app`
- [ ] Admin carrega: `https://seu-novo-projeto.vercel.app/admin`
- [ ] API funciona: `https://seu-novo-projeto.vercel.app/api/vehicles`

---

## 🆘 SE AINDA FALHAR

Se mesmo deletando e recriando o erro persistir:

1. **Verifique se deletou o projeto certo** (rvcar-master)
2. **Limpe o cache do navegador**
3. **Crie com outro nome** (ex: `rvcar-new` ou `rvcar-v2`)

---

## 📝 RESUMO

**FAÇA NO DASHBOARD:**

1. Delete `rvcar-master`
2. Importe novamente do GitHub
3. Configure como Vite
4. Use Node.js 20.x
5. Deploy

**MOTIVO:** Configurações antigas do projeto estão "travadas" e não podem ser limpas via CLI/código.

---

**Última atualização:** 14/01/2026  
**Status do código:** ✅ Pronto para produção  
**Status do Vercel:** ❌ Projeto com configurações corrompidas

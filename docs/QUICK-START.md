# 📝 Início Rápido - RV Car

Guia rápido para começar a desenvolver no RV Car em 5 minutos.

## ⚡ Quick Start

### 1. Clone e Instale (2 minutos)

```bash
git clone https://github.com/betinhochagas/rvcar.git
cd rvcar
npm install
```

### 2. Configure (2 minutos)

**Backend** (`api/.env`):

```bash
cp api/.env.example api/.env
```

Edite `api/.env`:

```env
ENVIRONMENT=development
JWT_SECRET=chave-desenvolvimento-local-123
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** (`.env`):

```bash
cp .env.example .env
```

Edite `.env`:

```env
VITE_API_URL=http://localhost/rvcar/api
```

### 3. Inicie (1 minuto)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (se usando PHP embutido)
cd api
php -S localhost:8000
```

Depois ajuste no `.env` frontend:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Acesse

- **Frontend**: http://localhost:5173
- **Admin**: http://localhost:5173/admin
- **Login**: `admin` / `admin123`

## 🎯 Próximos Passos

1. **Customize o site**

   - Acesse `/admin`
   - Vá em "Configurações"
   - Altere logo, título, descrição

2. **Adicione veículos**

   - Em "Veículos"
   - Clique "Adicionar Veículo"
   - Preencha os dados e faça upload da imagem

3. **Teste o sistema**
   - Volte para a home
   - Veja o veículo adicionado
   - Clique em "Consultar" e teste o modal

## 📚 Documentação Completa

- [Instalação Detalhada](INSTALACAO.md)
- [Configuração](CONFIGURACAO.md)
- [API](API.md)
- [Deploy](DEPLOY.md)

## 🆘 Problemas Comuns

### Erro: "Failed to fetch"

**Solução**: Verifique se `VITE_API_URL` está correto e o backend está rodando.

```bash
# Teste o backend
curl http://localhost:8000/vehicles.php
```

### Erro: "CORS policy"

**Solução**: Adicione a URL do frontend no backend `.env`:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Upload de imagens não funciona

**Solução**: Configure permissões da pasta `uploads/`:

```bash
# Linux/Mac
chmod 777 uploads/

# Windows: Automático
```

---

**Está pronto para desenvolver!** 🚀

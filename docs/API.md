# 📡 Documentação da API

API REST desenvolvida com **TypeScript Serverless Functions** no Vercel.

## Base URL

```
Produção: https://seu-projeto.vercel.app/api
Desenvolvimento: http://localhost:8080/api
```

## Autenticação

Todas as rotas protegidas requerem header:

```
Authorization: Bearer {token}
```

O token é obtido via `/api/auth/login` e expira em 24 horas.

---

## 🔐 Autenticação

### Login

**POST** `/api/auth/login`

```json
{
  "username": "admin",
  "password": "sua-senha"
}
```

**Resposta (200)**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrador"
  },
  "expires_at": "2024-01-15T12:00:00.000Z"
}
```

### Logout

**POST** `/api/auth/logout`

Headers: `Authorization: Bearer {token}`

**Resposta (200)**:

```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### Verificar Token

**GET** `/api/auth/verify`

Headers: `Authorization: Bearer {token}`

**Resposta (200)**:

```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrador"
  }
}
```

### Alterar Senha

**POST** `/api/auth/change-password`

Headers: `Authorization: Bearer {token}`

```json
{
  "currentPassword": "senha-atual",
  "newPassword": "senha-nova-forte"
}
```

**Resposta (200)**:

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

## 🚗 Veículos

### Listar Todos

**GET** `/api/vehicles`

Query params opcionais:

- `disponivel=true` - Filtrar apenas disponíveis
- `categoria=suv` - Filtrar por categoria

**Resposta (200)**:

```json
[
  {
    "id": "1",
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2023,
    "placa": "ABC-1234",
    "categoria": "sedan",
    "precoLocacao": 150.0,
    "disponivel": true,
    "imagem": "/uploads/corolla.jpg",
    "caracteristicas": ["Ar condicionado", "Direção hidráulica"]
  }
]
```

### Buscar por ID

**GET** `/api/vehicles/{id}`

**Resposta (200)**: Objeto do veículo

### Criar Veículo

**POST** `/api/vehicles` 🔒

Headers: `Authorization: Bearer {token}`

```json
{
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "placa": "XYZ-5678",
  "categoria": "sedan",
  "precoLocacao": 180.0,
  "disponivel": true,
  "imagem": "/uploads/civic.jpg",
  "caracteristicas": ["Automático", "Ar digital"]
}
```

**Resposta (201)**:

```json
{
  "success": true,
  "id": "2",
  "vehicle": {
    /* dados do veículo criado */
  }
}
```

### Atualizar Veículo

**PUT** `/api/vehicles/{id}` 🔒

Headers: `Authorization: Bearer {token}`

Body: Dados do veículo a atualizar

**Resposta (200)**:

```json
{
  "success": true,
  "vehicle": {
    /* dados atualizados */
  }
}
```

### Remover Veículo

**DELETE** `/api/vehicles/{id}` 🔒

Headers: `Authorization: Bearer {token}`

**Resposta (200)**:

```json
{
  "success": true,
  "message": "Veículo removido com sucesso"
}
```

### Toggle Disponibilidade

**PATCH** `/api/vehicles/{id}` 🔒

Headers: `Authorization: Bearer {token}`

```json
{
  "disponivel": false
}
```

**Resposta (200)**:

```json
{
  "success": true,
  "vehicle": {
    /* veículo com disponibilidade atualizada */
  }
}
```

---

## ⚙️ Configurações do Site

### Listar Todas

**GET** `/api/site-settings`

Query params opcionais:

- `category=contact` - Filtrar por categoria
- `key=whatsapp` - Buscar chave específica

**Resposta (200)**:

```json
[
  {
    "key": "whatsapp",
    "value": "+55 11 99999-9999",
    "category": "contact",
    "label": "WhatsApp"
  }
]
```

### Buscar por Chave

**GET** `/api/site-settings/{key}`

**Resposta (200)**:

```json
{
  "key": "whatsapp",
  "value": "+55 11 99999-9999",
  "category": "contact",
  "label": "WhatsApp"
}
```

### Criar/Atualizar

**POST** `/api/site-settings` 🔒

Headers: `Authorization: Bearer {token}`

Suporta batch update:

```json
[
  {
    "key": "email",
    "value": "contato@empresa.com",
    "category": "contact"
  },
  {
    "key": "telefone",
    "value": "(11) 1234-5678",
    "category": "contact"
  }
]
```

**Resposta (200)**:

```json
{
  "success": true,
  "settings": [
    /* configurações criadas/atualizadas */
  ]
}
```

### Remover

**DELETE** `/api/site-settings/{key}` 🔒

Headers: `Authorization: Bearer {token}`

**Resposta (200)**:

```json
{
  "success": true,
  "message": "Configuração removida"
}
```

---

## 📤 Upload de Imagens

### Upload

**POST** `/api/upload` 🔒

Headers:

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

Form data:

- `file`: Arquivo de imagem (JPG, PNG, WebP)
- `category`: Categoria (opcional, padrão: "vehicles")

**Resposta (200)**:

```json
{
  "success": true,
  "url": "/uploads/abc123-civic.jpg",
  "filename": "abc123-civic.jpg"
}
```

**Validações**:

- Tamanho máximo: 5MB
- Formatos: JPG, PNG, WebP
- MIME type validation
- Nome sanitizado automaticamente

---

## 🚨 Códigos de Erro

| Código | Significado                    |
| ------ | ------------------------------ |
| 200    | Sucesso                        |
| 201    | Criado com sucesso             |
| 400    | Dados inválidos                |
| 401    | Não autenticado                |
| 403    | Sem permissão                  |
| 404    | Não encontrado                 |
| 409    | Conflito (ex: placa duplicada) |
| 429    | Rate limit excedido            |
| 500    | Erro interno do servidor       |

## 🔒 Rate Limiting

Limite de **5 tentativas de login** a cada **15 minutos** por IP.

Após exceder, resposta:

```json
{
  "error": "Muitas tentativas. Tente novamente em 15 minutos",
  "code": 429
}
```

## 📝 Exemplos com Fetch

### Login e Request Autenticado

```typescript
// Login
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "senha",
  }),
});

const { token } = await loginResponse.json();

// Request autenticado
const response = await fetch("/api/vehicles", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    /* dados do veículo */
  }),
});
```

### Upload de Imagem

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("category", "vehicles");

const response = await fetch("/api/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const { url } = await response.json();
console.log("Imagem uploadada:", url);
```

---

## 📚 Links Úteis

- [README Principal](../README.md)
- [Guia de Testes](TESTING.md)
- [Changelog](../CHANGELOG.md)
- [Segurança](../SECURITY.md)

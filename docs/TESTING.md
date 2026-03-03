# 🧪 Guia de Testes

Testes unitários e de integração para o sistema RV Car.

## 🛠️ Stack de Testes

- **Vitest** 4.0 - Test runner
- **@testing-library/react** - Testes de componentes
- **jsdom** - Ambiente DOM simulado

## 🚀 Executando Testes

```bash
# Todos os testes
npm test

# Modo watch (rerun ao salvar)
npm test -- --watch

# Interface gráfica
npm run test:ui

# Coverage report
npm run test:coverage

# Teste específico
npm test -- src/lib/authManager.test.ts
```

## 📊 Coverage Atual

```
Statements   : 85%
Branches     : 78%
Functions    : 82%
Lines        : 85%
```

Meta: **90%+ em todos os módulos críticos**

## 📁 Estrutura de Testes

```
src/
├── lib/
│   ├── authManager.ts
│   └── authManager.test.ts      # Testes unitários
├── components/
│   ├── RentalModal.tsx
│   └── RentalModal.test.tsx     # Testes de componente
└── __tests__/
    └── integration/
        └── auth-flow.test.ts    # Testes de integração
```

## ✅ Testes Implementados

### Managers (Unitários)

#### authManager.test.ts

- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Logout remove token
- ✅ Verificação de token válido
- ✅ Verificação de token expirado
- ✅ Alteração de senha
- ✅ Rate limiting após 5 tentativas

#### vehicleManager.test.ts

- ✅ Listar todos os veículos
- ✅ Buscar veículo por ID
- ✅ Criar novo veículo
- ✅ Atualizar veículo existente
- ✅ Remover veículo
- ✅ Toggle disponibilidade
- ✅ Validação de dados obrigatórios

#### settingsManager.test.ts

- ✅ Listar configurações
- ✅ Buscar por chave
- ✅ Atualizar batch de configurações
- ✅ Remover configuração

#### uploadManager.test.ts

- ✅ Upload de imagem válida
- ✅ Rejeitar arquivo muito grande (>5MB)
- ✅ Rejeitar formato inválido
- ✅ Validação de MIME type

### Componentes React

#### RentalModal.test.tsx

- ✅ Renderização condicional (locação vs investimento)
- ✅ Validação de formulário
- ✅ Formatação automática de valores
- ✅ Envio via WhatsApp

#### VehicleCard.test.tsx

- ✅ Exibição de dados do veículo
- ✅ Badge de disponibilidade
- ✅ Click para abrir modal

### Integração

#### auth-flow.test.ts

- ✅ Fluxo completo: Login → Request autenticado → Logout
- ✅ Token JWT válido após login
- ✅ Request sem token retorna 401

#### vehicle-crud.test.ts

- ✅ CRUD completo de veículos
- ✅ Validação de permissões

## 📝 Exemplos de Testes

### Teste Unitário (Manager)

```typescript
import { describe, it, expect, vi } from "vitest";
import { authManager } from "./authManager";

describe("authManager", () => {
  it("deve fazer login com credenciais válidas", async () => {
    const result = await authManager.login("admin", "senha");

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user.username).toBe("admin");
  });

  it("deve rejeitar credenciais inválidas", async () => {
    await expect(authManager.login("admin", "errada")).rejects.toThrow(
      "Credenciais inválidas"
    );
  });
});
```

### Teste de Componente

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RentalModal } from "./RentalModal";

describe("RentalModal", () => {
  it("deve exibir campos de locação", () => {
    const vehicle = {
      id: "1",
      marca: "Toyota",
      modelo: "Corolla",
    };

    render(
      <RentalModal
        vehicle={vehicle}
        type="rental"
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByLabelText("Data de início")).toBeInTheDocument();
    expect(screen.getByLabelText("Data de fim")).toBeInTheDocument();
  });

  it("deve validar datas obrigatórias", async () => {
    // ... teste de validação
  });
});
```

### Teste de Integração

```typescript
import { describe, it, expect } from "vitest";
import { authManager } from "@/lib/authManager";
import { vehicleManager } from "@/lib/vehicleManager";

describe("Fluxo de autenticação completo", () => {
  it("deve permitir CRUD após login", async () => {
    // 1. Login
    const { token } = await authManager.login("admin", "senha");
    expect(token).toBeDefined();

    // 2. Criar veículo
    const newVehicle = await vehicleManager.create(
      {
        marca: "Honda",
        modelo: "Civic",
        // ...
      },
      token
    );
    expect(newVehicle.id).toBeDefined();

    // 3. Atualizar veículo
    await vehicleManager.update(
      newVehicle.id,
      {
        precoLocacao: 200,
      },
      token
    );

    // 4. Verificar atualização
    const updated = await vehicleManager.getById(newVehicle.id);
    expect(updated.precoLocacao).toBe(200);

    // 5. Logout
    await authManager.logout();
  });
});
```

## 🎯 Mocking

### Mock de API

```typescript
import { vi } from "vitest";

// Mock global fetch
global.fetch = vi.fn();

// Mock de resposta específica
(fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ success: true, data: [] }),
});
```

### Mock de localStorage

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;
```

## 🔍 Debugging

### Modo Debug

```bash
# Debug com breakpoints
npm test -- --inspect-brk

# Abrir Chrome DevTools
chrome://inspect
```

### Logs em Testes

```typescript
import { screen } from "@testing-library/react";

// Ver HTML renderizado
screen.debug();

// Log de queries
screen.logTestingPlaygroundURL();
```

## 📋 Checklist de Testes

Ao criar novas features, adicione testes para:

- [ ] Happy path (caso de sucesso)
- [ ] Error handling (casos de erro)
- [ ] Validação de entrada
- [ ] Casos extremos (edge cases)
- [ ] Permissões/Autenticação
- [ ] Loading states
- [ ] Error states

## 🚀 CI/CD

Testes rodamautomaticamente no GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm test -- --run

- name: Coverage
  run: npm run test:coverage
```

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Mantenha os testes atualizados! Eles são a documentação viva do sistema.**

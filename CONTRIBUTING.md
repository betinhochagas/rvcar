# Contribuindo para RV Car Solutions

Obrigado por considerar contribuir com o projeto RV Car Solutions! 🚗

## Como Contribuir

### 🐛 Reportando Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/betinhochagas/rvcar/issues)
2. Abra uma nova issue usando o template de bug report
3. Inclua informações detalhadas:
   - Descrição do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Versão do navegador/SO

### 💡 Sugerindo Melhorias

1. Abra uma issue com o template de feature request
2. Descreva detalhadamente a funcionalidade
3. Explique por que seria útil para o projeto
4. Inclua mockups ou exemplos se possível

### 🔧 Desenvolvimento

#### Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/betinhochagas/rvcar.git
cd rvcar

# Instale as dependências
bun install
# ou npm install

# Inicie o servidor de desenvolvimento
bun dev
# ou npm run dev
```

#### Processo de Desenvolvimento

1. **Fork** o repositório
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Faça suas alterações seguindo os padrões do projeto
4. **Teste** suas mudanças localmente
5. **Commit** suas alterações:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
6. **Push** para sua branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
7. Abra um **Pull Request**

## 📋 Padrões de Código

### TypeScript

- Use TypeScript para todos os novos arquivos
- Defina tipos apropriados para props e estados
- Evite `any`, prefira tipos específicos

### React

- Use componentes funcionais com hooks
- Prefira custom hooks para lógica reutilizável
- Mantenha componentes pequenos e focados

### Styling

- Use Tailwind CSS para estilização
- Mantenha consistência com o design system
- Use variáveis CSS para cores personalizadas

### Commits

Siga a convenção [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação/styling
- `refactor:` refatoração de código
- `test:` testes
- `chore:` tarefas de manutenção

### Estrutura de Arquivos

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── lib/           # Utilitários
├── assets/        # Imagens e recursos
└── types/         # Definições de tipos
```

## 🧪 Testes

```bash
# Execute os testes
npm run test

# Testes com coverage
npm run test:coverage

# Linting
npm run lint
```

### Diretrizes para Testes

- Escreva testes para novas funcionalidades
- Mantenha coverage acima de 80%
- Use nomes descritivos para testes
- Teste casos de sucesso e erro

## 📱 Responsividade

- Teste em diferentes tamanhos de tela
- Use breakpoints do Tailwind CSS
- Verifique em dispositivos móveis reais
- Considere acessibilidade (a11y)

## 🔍 Code Review

Seu PR será revisado considerando:

- Funcionalidade correta
- Qualidade do código
- Testes adequados
- Documentação atualizada
- Performance
- Acessibilidade

## 🆘 Precisa de Ajuda?

- Abra uma [Discussion](https://github.com/betinhochagas/rvcar/discussions)
- Entre em contato via WhatsApp: (47) 98448-5492
- Consulte a documentação no README.md

## 📋 Checklist do Pull Request

- [ ] Código testado localmente
- [ ] Testes unitários passando
- [ ] Lint sem erros
- [ ] Documentação atualizada
- [ ] Responsividade verificada
- [ ] Acessibilidade considerada
- [ ] Performance não degradada

## 🎯 Áreas que Precisam de Contribuição

- [ ] Melhorias de acessibilidade
- [ ] Otimizações de performance
- [ ] Testes automatizados
- [ ] Documentação
- [ ] Novas funcionalidades
- [ ] Correções de bugs

## 🏆 Reconhecimento

Todos os contribuidores serão reconhecidos no README.md e releases do projeto.

---

**Obrigado por contribuir! 🚗💙**

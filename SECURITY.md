# Security Policy

## Supported Versions

As versões atualmente suportadas com atualizações de segurança:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

### Como Reportar

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: **security@rvcar.com.br**
3. Ou entre em contato via WhatsApp: **(47) 98448-5492**

### Informações Necessárias

Inclua as seguintes informações:

- Descrição detalhada da vulnerabilidade
- Passos para reproduzir o problema
- Impacto potencial
- Sugestões de correção (se houver)

### Processo de Resposta

- **24 horas**: Confirmação de recebimento
- **7 dias**: Avaliação inicial e classificação
- **30 dias**: Correção implementada (para vulnerabilidades críticas)
- **90 dias**: Divulgação pública (após correção)

### Classificação de Severidade

- **Crítica**: Exposição de dados sensíveis, RCE
- **Alta**: XSS, CSRF, exposição de informações
- **Média**: Problemas de configuração
- **Baixa**: Problemas menores de segurança

## Security Measures

### Client-Side Security

- ✅ Content Security Policy (CSP) no `index.html`
- ✅ HTTPS obrigatório em produção
- ✅ Sanitização de inputs
- ✅ Validação de formulários com Zod
- ✅ Secure headers configurados (Netlify/Vercel)
- ✅ Error Boundaries para captura de erros
- ✅ Logger condicional (logs apenas em desenvolvimento)
- ✅ Lazy loading de rotas com React.lazy()
- ✅ Sem credenciais hardcoded no código

### Server-Side Security

- ✅ Rate limiting (5 tentativas/15 minutos)
- ✅ JWT tokens com expiração (24h)
- ✅ Validação profunda de uploads (MIME type)
- ✅ CORS configurado corretamente
- ✅ File locking para prevenir race conditions
- ✅ Variáveis de ambiente para credenciais

### HTTP Headers (Netlify/Vercel)

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=(), microphone=(), geolocation=()

### Third-Party Dependencies

- ✅ Dependências auditadas regularmente
- ✅ Automated security updates
- ✅ Vulnerability scanning

### Data Protection

- ✅ Não armazenamos dados pessoais
- ✅ Comunicação via WhatsApp (criptografado)
- ✅ Formulários não persistem dados

## Contact

Para questões de segurança:

- **Email**: security@rvcar.com.br
- **WhatsApp**: (47) 98448-5492
- **Horário**: Segunda a Sexta, 9h às 18h

---

**Última atualização:** 17 de janeiro de 2026
**Score de Segurança:** 10/10

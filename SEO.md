# SEO - RV Car Locações

Documentação completa das otimizações de SEO implementadas e pendentes para o site [www.rvcarlocacoes.com.br](https://www.rvcarlocacoes.com.br).

---

## ✅ Implementado

### 1. Meta Tags Básicas
- **Title** otimizado com palavras-chave principais
- **Description** com call-to-action e keywords relevantes
- **Keywords** com termos de busca do nicho
- **Author** identificado

```html
<title>RV Car - Locações e Investimentos | Aluguel de Carros para App em Blumenau SC</title>
<meta name="description" content="Aluguel de carros para motoristas de Uber, 99 e aplicativos em Blumenau SC..." />
<meta name="keywords" content="aluguel de carros, locação de veículos, motorista de app, uber, 99, blumenau..." />
```

### 2. Meta Tags de Indexação
- `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`
- `<meta name="googlebot" content="index, follow" />`

### 3. URL Canônica
```html
<link rel="canonical" href="https://www.rvcarlocacoes.com.br/" />
```

### 4. Geo Tags (SEO Local)
```html
<meta name="geo.region" content="BR-SC" />
<meta name="geo.placename" content="Blumenau" />
<meta name="geo.position" content="-26.9194;-49.0661" />
<meta name="ICBM" content="-26.9194, -49.0661" />
```

### 5. Open Graph (Facebook/WhatsApp)
- `og:type` - website
- `og:url` - URL completa
- `og:title` - Título otimizado
- `og:description` - Descrição atrativa
- `og:image` - Imagem 1200x630 personalizada
- `og:image:width` / `og:image:height` - Dimensões
- `og:site_name` - RV Car Locações
- `og:locale` - pt_BR

### 6. Twitter Cards
- `twitter:card` - summary_large_image
- `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`

### 7. Schema.org JSON-LD (Dados Estruturados)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "RV Car Locações e Investimentos",
  "description": "...",
  "url": "https://www.rvcarlocacoes.com.br",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Blumenau",
    "addressRegion": "SC",
    "addressCountry": "BR"
  },
  "geo": { ... },
  "openingHoursSpecification": { ... },
  "hasOfferCatalog": { ... }
}
```

### 8. Sitemap XML
**Arquivo:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.rvcarlocacoes.com.br/</loc></url>
  <url><loc>https://www.rvcarlocacoes.com.br/#locacao</loc></url>
  <url><loc>https://www.rvcarlocacoes.com.br/#investimento</loc></url>
  <url><loc>https://www.rvcarlocacoes.com.br/#sobre</loc></url>
  <url><loc>https://www.rvcarlocacoes.com.br/#contato</loc></url>
</urlset>
```

### 9. Robots.txt
**Arquivo:** `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://www.rvcarlocacoes.com.br/sitemap.xml
```

### 10. Google Search Console
**Arquivo de verificação:** `google/google5de2021852aa3db6.html`

- Arquivo HTML de verificação de propriedade adicionado
- Necessário configurar rewrite no Vercel para servir o arquivo

---

## 🔧 Configuração Necessária

### Vercel - Servir arquivo de verificação do Google

Adicionar no `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/google5de2021852aa3db6.html", "destination": "/google/google5de2021852aa3db6.html" }
  ]
}
```

---

## 📋 Pendente

### Alta Prioridade

- [ ] **Verificar propriedade no Google Search Console**
  - Acessar: https://search.google.com/search-console
  - Adicionar propriedade: www.rvcarlocacoes.com.br
  - Verificar via arquivo HTML

- [ ] **Submeter Sitemap no Google Search Console**
  - URL: https://www.rvcarlocacoes.com.br/sitemap.xml
  - Monitorar indexação das páginas

- [ ] **Google My Business**
  - Criar perfil da empresa
  - Adicionar fotos, horários, serviços
  - Vincular ao site

- [ ] **Atualizar telefone real no Schema.org**
  - Editar `index.html` linha do JSON-LD
  - Substituir `+55-47-99999-9999` pelo número real

### Média Prioridade

- [ ] **Google Analytics 4**
  - Criar conta GA4
  - Adicionar tag no `index.html`
  - Configurar eventos de conversão (cliques WhatsApp, formulários)

- [ ] **Google Tag Manager** (opcional)
  - Facilita gestão de tags sem alterar código

- [ ] **Criar páginas individuais para veículos**
  - Melhora indexação de cada veículo
  - URLs amigáveis: `/veiculo/onix-2024`
  - Schema.org `Product` para cada veículo

- [ ] **Blog/Conteúdo**
  - Artigos sobre locação de veículos
  - Dicas para motoristas de app
  - Melhora autoridade do domínio

### Baixa Prioridade

- [ ] **Redes Sociais**
  - Criar Instagram/Facebook da empresa
  - Adicionar links no Schema.org `sameAs`

- [ ] **Imagens otimizadas**
  - Adicionar `alt` descritivo em todas as imagens
  - Usar WebP com fallback
  - Lazy loading para imagens abaixo do fold

- [ ] **Performance (Core Web Vitals)**
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
  - Testar em: https://pagespeed.web.dev/

- [ ] **HTTPS e Segurança**
  - ✅ Já está com HTTPS via Vercel
  - Headers de segurança configurados

---

## 🔗 Links Úteis

| Ferramenta | URL |
|------------|-----|
| Google Search Console | https://search.google.com/search-console |
| Google Analytics | https://analytics.google.com |
| Google My Business | https://business.google.com |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Rich Results Test | https://search.google.com/test/rich-results |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly |
| Schema Markup Validator | https://validator.schema.org/ |

---

## 📊 Métricas para Acompanhar

1. **Impressões** - Quantas vezes o site aparece nas buscas
2. **Cliques** - Quantas vezes clicaram no resultado
3. **CTR** - Taxa de cliques (cliques/impressões)
4. **Posição média** - Ranking médio nas buscas
5. **Páginas indexadas** - Quantas páginas o Google conhece
6. **Core Web Vitals** - Performance do site

---

## 📁 Arquivos de SEO

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| sitemap.xml | `public/sitemap.xml` | Mapa do site para crawlers |
| robots.txt | `public/robots.txt` | Instruções para crawlers |
| Verificação Google | `google/google5de2021852aa3db6.html` | Verificação Search Console |
| Meta tags | `index.html` | Tags OG, Twitter, Schema.org |

---

## 🚀 Checklist de Deploy

Antes de cada deploy, verificar:

- [ ] Meta tags atualizadas
- [ ] Sitemap atualizado com novas páginas
- [ ] Schema.org com informações corretas
- [ ] Imagens OG com dimensões 1200x630
- [ ] Robots.txt permitindo indexação

---

*Última atualização: Janeiro 2026*

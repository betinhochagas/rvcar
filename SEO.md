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
  "description": "Aluguel de carros para motoristas de aplicativo em Blumenau SC...",
  "url": "https://www.rvcarlocacoes.com.br",
  "telephone": "+55-47-98855-6370",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Blumenau",
    "addressRegion": "SC",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-26.9194",
    "longitude": "-49.0661"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.instagram.com/rvcarlocacoes.investimentos/"
  ],
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

### 10. Google Search Console - Verificação ✅
**Meta Tag de verificação:** Adicionada no `index.html`

```html
<meta name="google-site-verification" content="_H_RsE_hJaeTEWOrAW9v07MJG-eUBo3mmOQSg06cgeU" />
```

**Arquivo HTML de backup:** `public/google5de2021852aa3db6.html`

### 11. Telefone Real no Schema.org ✅
- Telefone atualizado para: `+55-47-98855-6370`

### 12. Redes Sociais no Schema.org ✅
- Instagram adicionado: `https://www.instagram.com/rvcarlocacoes.investimentos/`

---

## ⏳ Aguardando Deploy

> **Nota:** O Vercel atingiu o limite de 100 deploys/dia. Aguardando liberação (~3 horas a partir de 15/01/2026).

Após o deploy, será possível:
1. Verificar propriedade no Google Search Console (via Tag HTML)
2. Submeter o sitemap

---

## 📋 Pendente

### Alta Prioridade

- [ ] **Verificar propriedade no Google Search Console**
  - Acessar: https://search.google.com/search-console
  - Usar método: **Tag HTML** (já configurada)
  - Clicar em VERIFICAR após deploy

- [ ] **Submeter Sitemap no Google Search Console**
  - URL: https://www.rvcarlocacoes.com.br/sitemap.xml
  - Menu: Sitemaps → Adicionar → `sitemap.xml`
  - Monitorar indexação das páginas

- [ ] **Google My Business**
  - Criar perfil da empresa
  - Adicionar fotos, horários, serviços
  - Vincular ao site

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

- [ ] **Facebook da empresa**
  - Criar página no Facebook
  - Adicionar ao Schema.org `sameAs`

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
  - ✅ Headers de segurança configurados (CSP)

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
| Verificação Google | `public/google5de2021852aa3db6.html` | Verificação Search Console (backup) |
| Meta tags | `index.html` | Tags OG, Twitter, Schema.org, verificação Google |

---

## 🚀 Checklist de Deploy

Antes de cada deploy, verificar:

- [x] Meta tags atualizadas
- [x] Sitemap atualizado com novas páginas
- [x] Schema.org com informações corretas
- [x] Imagens OG com dimensões 1200x630
- [x] Robots.txt permitindo indexação
- [x] Telefone real no Schema.org
- [x] Redes sociais no Schema.org
- [x] Meta tag de verificação do Google

---

## 📅 Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 15/01/2026 | Implementação inicial de SEO (meta tags, OG, Twitter, Schema.org) |
| 15/01/2026 | Criação do sitemap.xml e atualização do robots.txt |
| 15/01/2026 | Adição da meta tag de verificação do Google Search Console |
| 15/01/2026 | Atualização do telefone real: +55-47-98855-6370 |
| 15/01/2026 | Adição do Instagram ao Schema.org sameAs |

---

*Última atualização: 15 de Janeiro de 2026*

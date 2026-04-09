# 📊 Tracking Playbook — Do Zero ao Stack Completo
> Versão 1.1 | 2026  
> Guia tático para dev experiente | Cobre Google, Meta, Bing, TikTok, LinkedIn, AEO/GEO

---

## Índice

1. [Modelo Mental: As 5 Camadas](#1-modelo-mental)
2. [Pré-requisitos: Antes de Tocar em Qualquer Ferramenta](#2-pré-requisitos)
3. [Camada 1 — Foundation: GTM + Consent](#3-camada-1--foundation)
4. [Camada 2 — Analytics: GA4 Server-Side](#4-camada-2--analytics)
5. [Camada 3 — Search: GSC + Bing Webmaster + SEO Técnico](#5-camada-3--search)
6. [Camada 4 — Ads: Meta, Google, Bing, TikTok, LinkedIn](#6-camada-4--ads)
7. [Camada 5 — AEO/GEO: Visibilidade em IAs](#7-camada-5--aeogeo)
8. [Comportamento do Usuário: Clarity + Hotjar](#8-comportamento-do-usuário)
9. [Padrão UTM — Nomenclatura e Gestão](#9-padrão-utm)
10. [Deduplication: o Princípio do event_id](#10-deduplication)
11. [LGPD / Consent Mode v2](#11-lgpd--consent-mode-v2)
12. [Roadmap de Implementação](#12-roadmap-de-implementação)
13. [Rotina de Monitoramento](#13-rotina-de-monitoramento)
14. [Checklist Final — Antes de ir ao Ar](#14-checklist-final)

---

## 1. Modelo Mental

### As 5 Camadas de Tracking

```
┌──────────────────────────────────────────────────────┐
│  CAMADA 5 — AEO/GEO   Visibilidade em IAs            │
│  CAMADA 4 — ADS       Conversão e atribuição         │
│  CAMADA 3 — SEARCH    Indexação orgânica             │
│  CAMADA 2 — ANALYTICS Coleta e análise de dados      │
│  CAMADA 1 — FOUNDATION GTM + Consent + Infraestrutura│
└──────────────────────────────────────────────────────┘
```

**Regra de ouro:** implementar de baixo para cima, sempre. Camada 1 com problema contamina todas as outras. Nunca instale Pixel antes de ter GTM e Consent Mode funcionando.

### Arquitetura Alvo

```
BROWSER
  └─ GTM Web Container
       └─ dataLayer.push({ event_id: uuid, ... })
            │
            ▼
GTM SERVER-SIDE (seu subdomínio: metrics.seusite.com)
  ├─ GA4 Measurement Protocol
  ├─ Meta Conversions API
  ├─ TikTok Events API
  ├─ LinkedIn Insight Tag (client-side suficiente)
  └─ Bing UET (client-side suficiente)
            │
            ▼
BANCO DE DADOS (fonte da verdade)
  └─ events table: event_id | type | user | page | timestamp
```

### Por que Server-Side é Mandatório em 2026

| Problema | Client-side | Server-side |
|---|---|---|
| Ad blockers | Bloqueado ~30% dos usuários | Não interceptado |
| Safari ITP | Cookie dura 7 dias | Cookie 1st-party dura meses |
| Match rate Meta | ~60-70% | ~85-95% |
| Controle de dados | Nenhum | Total |
| LGPD | Difícil auditar | Auditável |

---

## 2. Pré-requisitos

### 2.1 Antes de Tocar em Qualquer Ferramenta

- [ ] Domínio registrado e com acesso ao painel DNS
- [ ] Subdomínio criado para GTM server-side: `metrics.seusite.com` (ou `track.`, `data.`, `t.`)
- [ ] Conta Google criada (usada para GA4, GTM, GSC, Google Ads)
- [ ] Conta Meta Business criada em business.facebook.com
- [ ] Acesso ao código do site (ou ao CMS)
- [ ] Variáveis de ambiente configuráveis (`.env` ou painel do hosting/Vercel)

### 2.2 Contas a Criar (em ordem)

1. **Google Tag Manager** — tagmanager.google.com → criar conta + container Web
2. **Google Analytics 4** — analytics.google.com → criar property
3. **Google Search Console** — search.google.com/search-console → adicionar propriedade
4. **Google Ads** — ads.google.com → criar conta (mesmo que não vá usar agora)
5. **Meta Business Suite** — business.facebook.com → criar Business Portfolio
6. **Meta Events Manager** — criar Pixel dentro do Business
7. **Microsoft Advertising** — ads.microsoft.com → criar conta
8. **Bing Webmaster Tools** — bing.com/webmasters → adicionar site
9. **TikTok for Business** — business.tiktok.com → criar conta
10. **TikTok Events Manager** — criar Pixel Web
11. **LinkedIn Campaign Manager** — linkedin.com/campaignmanager → criar conta
12. **Stape.io** — stape.io → criar conta (hosting do GTM server-side)

---

## 3. Camada 1 — Foundation

### 3.1 GTM — Container Web

1. Em tagmanager.google.com, criar **Conta** (empresa) e **Container** (site, tipo Web)
2. Copiar o snippet GTM — duas partes:
   - `<head>`: snippet JS principal (colar o mais alto possível)
   - `<body>`: `<noscript>` iframe (colar imediatamente após `<body>`)
3. Em Next.js, usar `next/script` com `strategy="afterInteractive"` para o snippet head
4. Publicar uma versão vazia ("Initial setup") para validar instalação
5. Instalar extensão **Tag Assistant** (Chrome) para verificar se GTM carrega

### 3.2 GTM — Container Server-Side

1. Em tagmanager.google.com, criar novo Container → tipo **Server**
2. Copiar o **Container Config** gerado (string longa que começa com `GTM-...`)
3. Em stape.io:
   - Criar novo servidor → colar o Container Config
   - Selecionar data center (US-East ou EU dependendo do público)
   - Copiar a URL do servidor gerada pelo Stape (ex: `https://abc123.stape.io`)
4. No DNS do seu domínio, criar registro CNAME:
   ```
   metrics.seusite.com  →  abc123.stape.io
   ```
5. Em stape.io, adicionar o custom domain `metrics.seusite.com`
6. Aguardar propagação DNS (5-30 min) e validar HTTPS funcionando
7. No GTM Web Container, ir em Admin → Container Settings → atualizar Server Container URL para `https://metrics.seusite.com`

### 3.3 Consent Mode v2 — Implementar ANTES de qualquer tag

**Por que primeiro:** sem Consent Mode, Google não consegue modelar conversões de usuários que recusam cookies. Isso degrada performance de campanhas desde o primeiro dia.

1. Instalar um CMP (Consent Management Platform). Opções:
   - **CookieYes** (~$10/mês) — mais simples, integração GTM nativa
   - **Cookiebot** (~$15/mês) — mais robusto, auto-scan de cookies
   - **Usercentrics** — enterprise
2. No CMP, configurar os 4 sinais obrigatórios:
   - `ad_storage` — cookies de ads
   - `analytics_storage` — cookies de analytics
   - `ad_user_data` — envio de dados de usuário para Google
   - `ad_personalization` — personalização de anúncios
3. No GTM Web Container, criar tag **Google Consent Mode Default** (dispara em All Pages, antes de tudo):
   ```javascript
   gtag('consent', 'default', {
     'ad_storage': 'denied',
     'analytics_storage': 'denied',
     'ad_user_data': 'denied',
     'ad_personalization': 'denied',
     'wait_for_update': 500
   });
   ```
4. Configurar o CMP para disparar `gtag('consent', 'update', {...})` após aceite do usuário
5. Ativar **Consent Mode** nas configurações do GTM (Admin → Container Settings → Enable Consent Overview)
6. Marcar cada tag com os sinais de consent que ela requer

---

## 4. Camada 2 — Analytics

### 4.1 Criar Property GA4

1. Em analytics.google.com → Admin → Create Property
2. Preencher nome, timezone (America/Sao_Paulo), moeda (BRL)
3. Copiar o **Measurement ID** (formato `G-XXXXXXXXXX`)
4. Em Admin → Data Streams → Web → copiar também o **API Secret** (necessário para Measurement Protocol)
5. Em Admin → Google Signals → Ativar (melhora modelagem de audiências)
6. Em Admin → Data Retention → mudar para 14 meses (padrão é 2 meses)

### 4.2 Instalar GA4 via GTM Server-Side (não client-side)

**No GTM Web Container:**

1. Criar Tag → tipo **Google Analytics: GA4 Configuration**
   - Measurement ID: `G-XXXXXXXXXX`
   - **Server Container URL:** `https://metrics.seusite.com` ← isso redireciona hits para sGTM
   - Trigger: All Pages
2. Criar Tag → tipo **Google Analytics: GA4 Event** para eventos customizados
   - Usar variável `{{Event}}` para capturar nome do evento do dataLayer
   - Incluir parâmetros: `event_id`, `page_location`, `page_title`

**No GTM Server Container:**

1. Criar Client → **GA4** (recebe hits do web container)
2. Criar Tag → **GA4** (encaminha para Google com sua API Secret)
   - Endpoint: `https://www.google-analytics.com/mp/collect`
   - Measurement ID + API Secret

### 4.3 Eventos Essenciais para Implementar

Estes eventos devem ser disparados via `dataLayer.push` no código do site e capturados pelo GTM:

```javascript
// Padrão mínimo para todo evento
window.dataLayer.push({
  event: 'nome_do_evento',
  event_id: crypto.randomUUID(), // sempre único
  // parâmetros específicos do evento abaixo
});
```

| Evento | Quando disparar | Parâmetros chave |
|---|---|---|
| `page_view` | Toda navegação (automático no GTM) | `page_location`, `page_title` |
| `scroll` | 25%, 50%, 75%, 90% | `percent_scrolled` |
| `form_start` | Primeiro foco em campo de form | `form_id` |
| `lead` | Submit de form com sucesso | `event_id`, `form_id`, `page_slug` |
| `sign_up` | Cadastro concluído | `event_id`, `method` |
| `purchase` | Compra confirmada | `event_id`, `value`, `currency`, `transaction_id` |
| `begin_checkout` | Início do checkout | `value`, `currency` |
| `cta_click` | Clique em botão de CTA | `cta_text`, `cta_location` |
| `video_play` | 25% e 75% de vídeo | `video_title`, `percent` |

### 4.4 Conectar GA4 ao BigQuery

1. Em GA4 → Admin → BigQuery Linking → Link
2. Selecionar projeto GCP (criar um se não existir — free tier é suficiente)
3. Escolher frequência: **daily** (streaming é pago e raramente necessário)
4. Isso habilita SQL sobre todos os eventos brutos — essencial para análises avançadas e dashboards customizados

---

## 5. Camada 3 — Search

### 5.1 Google Search Console

1. Em search.google.com/search-console → Add Property → Domain (não URL prefix — cobre HTTP, HTTPS e subdomínios)
2. Verificar via **DNS TXT record** (mais robusto):
   - Copiar o TXT record fornecido pelo GSC
   - No DNS do domínio, criar registro `TXT @ "google-site-verification=XXXXXX"`
   - Aguardar propagação e clicar em Verify
3. Após verificação, submeter sitemaps:
   - `/sitemap.xml` — sitemap geral
   - `/blog-sitemap.xml` — se tiver blog separado
   - `/sitemap-index.xml` — se usar sitemap index
4. Vincular GA4 ao GSC: em GA4 → Admin → Search Console Links → Add
5. Verificar Core Web Vitals na aba Experience semanalmente

### 5.2 Bing Webmaster Tools

1. Em bing.com/webmasters → Add a Site
2. Verificar propriedade via XML file, meta tag ou DNS TXT (mesma lógica do GSC)
3. **Atalho:** importar do Google Search Console (1 clique, importa sitemap + configurações)
4. Em Settings → IndexNow → copiar API Key e ativar
5. Implementar IndexNow no site para notificar Bing instantaneamente sobre novos conteúdos:
   ```
   POST https://www.bing.com/indexnow
   Body: { "host": "seusite.com", "key": "SUA_KEY", "urlList": ["https://seusite.com/novo-post"] }
   ```

### 5.3 Bing Places for Business

**Por que é obrigatório em 2026:** sem Bing Places, o negócio fica invisível para o ecossistema Microsoft completo — Bing Maps, Windows Search e, criticamente, **ChatGPT e Copilot**. Qualquer IA que usa Bing como fonte de dados não vai recomendar um negócio sem Bing Places cadastrado.

1. Acessar bingplaces.com → Sign in com conta Microsoft
2. Opção mais rápida: **importar do Google Business Profile** (1 clique, puxa todas as informações)
3. Se importar manualmente, preencher com os mesmos dados do GMB — **NAP idêntico é obrigatório:**
   - **N**ame: nome exato igual ao GMB e site
   - **A**ddress: endereço exato igual
   - **P**hone: telefone exato igual
   - Qualquer divergência entre fontes reduz confiança das IAs no cadastro
4. Adicionar fotos, horários, categorias e descrição rica em palavras-chave
5. Verificar o cadastro (SMS ou carta física)
6. Após verificação, o negócio passa a aparecer em: Bing Maps, Bing Search local, Windows 11 Search, ChatGPT (quando busca locais), Copilot

> **NAP Consistency:** manter Nome, Endereço e Telefone **idênticos** em Google Business Profile, Bing Places, site (schema markup), e qualquer outro diretório. Divergência = perda de confiança dos buscadores e IAs. Verificar periodicamente se alguma fonte desatualizou.

> **Georreferenciamento de imagens (SEO local):** para negócios físicos, usar **GeoIMGR** (geoimgr.com) para adicionar metadados geográficos (latitude/longitude) nas imagens antes de fazer upload no GMB e no site. Google e IAs usam esses dados como sinal geográfico adicional de confiança. Ferramenta gratuita, processo: upload da imagem → marcar localização no mapa → baixar imagem com EXIF atualizado.

### 5.4 SEO Técnico — Arquivos Obrigatórios

**sitemap.xml** — gerar automaticamente no build:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seusite.com/pagina</loc>
    <lastmod>2026-02-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**robots.txt** — bloquear o que não deve ser indexado, liberar AI crawlers:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /_next/

# Liberar AI crawlers explicitamente
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://seusite.com/sitemap.xml
```

**llms.txt** — padrão emergente para instruir LLMs sobre seu conteúdo:
```
# Nome do Produto/Empresa
> Descrição em 1 linha do que você faz e para quem

## Páginas principais
- [Home](https://seusite.com): descrição
- [Produto](https://seusite.com/produto): descrição

## Blog
- [Post relevante](https://seusite.com/blog/post): descrição

## Documentação
- [Docs](https://docs.seusite.com): descrição
```

### 5.5 Schema Markup — JSON-LD

Injetar via `<script type="application/ld+json">` no `<head>` de cada página relevante:

**Organization (homepage, obrigatório):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nome da Empresa",
  "url": "https://seusite.com",
  "logo": "https://seusite.com/logo.png",
  "sameAs": [
    "https://linkedin.com/company/...",
    "https://twitter.com/...",
    "https://instagram.com/..."
  ]
}
```

**FAQPage (landing pages, blog posts):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pergunta frequente?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Resposta direta e completa."
      }
    }
  ]
}
```

**Article (posts do blog):**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Título do Artigo",
  "author": { "@type": "Person", "name": "Autor" },
  "datePublished": "2026-01-01",
  "publisher": {
    "@type": "Organization",
    "name": "Nome da Empresa"
  }
}
```

**SoftwareApplication (SaaS):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Nome do Produto",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  }
}
```

Validar sempre em: **schema.org/validator** e **Google Rich Results Test**.

---

## 6. Camada 4 — Ads

### 6.1 Meta Ads — Pixel + CAPI

**Criar o Pixel:**
1. business.facebook.com → Events Manager → Connect Data Sources → Web
2. Nomear o Pixel (ex: "Site Principal")
3. Copiar o **Pixel ID** (número de 15-16 dígitos)

**Instalar via GTM (client-side):**
1. No GTM Web Container → Nova Tag → Custom HTML
2. Colar o código base do Pixel (sem os eventos — esses vêm via dataLayer)
3. Trigger: All Pages
4. Criar tags de evento separadas para `Lead`, `Purchase`, `InitiateCheckout`, etc.

**Configurar CAPI (server-side) via GTM Server Container:**
1. No GTM Server Container → New Tag → Facebook Conversions API
2. Preencher:
   - Pixel ID: `SEU_PIXEL_ID`
   - Access Token: gerar em Events Manager → Settings → Conversions API → Generate Access Token
3. Mapear parâmetros:
   - `event_name`: `{{Event Name}}`
   - `event_id`: `{{event_id}}` ← chave da deduplication
   - `user_data.em`: hash SHA256 do email (se disponível)
   - `user_data.ph`: hash SHA256 do telefone (se disponível)
   - `event_source_url`: URL da página
4. **Advanced Matching** — enviar sempre que disponível:
   - `em` (email hasheado)
   - `ph` (telefone hasheado)
   - `external_id` (ID interno do usuário)
5. Verificar no Events Manager que eventos chegam em ambos os canais com mesmo `event_id`

**Checklist Meta:**
- [ ] Pixel disparando em todas as páginas
- [ ] CAPI enviando com `event_id` idêntico ao Pixel
- [ ] Match rate > 80% no Events Manager
- [ ] Advanced Matching ativo
- [ ] Domain verification feita em Business Settings → Brand Safety → Domains

### 6.2 Google Ads — Conversões

**Nunca instale a tag do Google Ads diretamente no site.** Use importação de GA4.

1. Google Ads → Tools → Measurement → Conversions → New Conversion Action
2. Selecionar **Import → Google Analytics 4 properties**
3. Selecionar os eventos GA4 que representam conversões (`lead`, `purchase`, `sign_up`)
4. Configurar valor de conversão se aplicável
5. Ativar **Enhanced Conversions**:
   - Google Ads → Tools → Conversions → Settings → Enhanced Conversions → Turn on
   - No GTM, configurar a tag Enhanced Conversions para enviar email/telefone hasheados

### 6.3 Microsoft / Bing Ads — UET Tag

1. Microsoft Advertising → Tools → UET Tag → Create UET Tag
2. Copiar o ID da tag (ex: `12345678`)
3. No GTM Web Container → Nova Tag → **Microsoft Advertising Universal Event Tracking**
4. Inserir o Tag ID
5. Trigger: All Pages
6. Criar conversion goals em Microsoft Advertising → Tools → Conversion Goals
7. Em Bing Webmaster Tools, vincular a conta Microsoft Ads para dados de search query

### 6.4 TikTok Ads — Pixel + Events API

**Criar o Pixel:**
1. business.tiktok.com → Assets → Events → Manage → Create Pixel
2. Selecionar Web → TikTok Pixel
3. Copiar o **Pixel ID**

**Instalar via GTM:**
1. No GTM Web Container → Nova Tag → **TikTok Pixel** (template disponível na galeria)
2. Inserir Pixel ID
3. Trigger: All Pages
4. Adicionar eventos: `ViewContent`, `Lead`, `CompleteRegistration`, `Purchase`

**TikTok Events API (server-side):**
1. Em TikTok Events Manager → Manage → Add New Data Source → Events API
2. Gerar Access Token
3. No GTM Server Container, criar tag custom para TikTok Events API:
   - Endpoint: `https://business-api.tiktok.com/open_api/v1.3/event/track/`
   - Headers: `Access-Token: SEU_TOKEN`
   - Payload com `event_id` para deduplication

### 6.5 LinkedIn Ads — Insight Tag

LinkedIn não tem uma solução server-side robusta — client-side via GTM é o padrão atual.

1. LinkedIn Campaign Manager → Assets → Insight Tag → Install with a Tag Manager
2. Copiar o **Partner ID** (ex: `123456`)
3. No GTM Web Container → Nova Tag → **LinkedIn Insight Tag** (template da galeria)
4. Inserir Partner ID
5. Trigger: All Pages
6. Criar conversion tracking: Campaign Manager → Assets → Conversions → Create

---

## 7. Camada 5 — AEO/GEO

### 7.1 O que é e por que importa

AEO (Answer Engine Optimization) é o processo de fazer sua marca ser **citada nas respostas de IAs** como ChatGPT, Perplexity, Gemini e Claude — não apenas rankeada no Google. Em 2026, IAs já geram tráfego mensurável para sites, especialmente B2B. Ignorar essa camada é o equivalente a ignorar mobile em 2012.

**Diferença fundamental:**

| SEO | AEO |
|---|---|
| Aparecer no ranking | Ser citado na resposta |
| Métrica: posição + CTR | Métrica: citation share |
| Algoritmo: links + relevância | Algoritmo: autoridade de entidade + confiança |

### 7.2 Como Rastrear Tráfego de IAs no GA4

Criar um segmento de audiência chamado "AI Referrals" com source matching:

```
Regex para Session Source:
perplexity\.ai|chat\.openai\.com|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com
```

Monitorar mensalmente o crescimento desse segmento — é o KPI de AEO mais direto disponível sem ferramentas pagas.

### 7.3 Fundações Técnicas para AEO

**1. Schema markup como base (já coberto na Camada 3)**
IAs parsam JSON-LD para entender entidades. `Organization`, `FAQPage` e `HowTo` são os mais citados.

**2. Entidade consolidada**
Nome da empresa/produto deve ser idêntico em todas as fontes que IAs consomem:
- Google Business Profile
- LinkedIn Company Page
- Crunchbase (criar perfil se não existir)
- G2, Capterra, Product Hunt (se SaaS)
- Wikipedia (se relevante)
- Schema `sameAs` linkando todos

**3. Conteúdo estruturado para resposta direta**
IAs preferem citar conteúdo que:
- Responde a pergunta nos primeiros 2 parágrafos (não depois de enrolação)
- Tem FAQ com perguntas exatas que usuários fazem
- Usa linguagem clara, sem jargão excessivo
- É citado em fóruns que IAs confiam (Reddit, Stack Overflow, Hacker News)

**4. Documentação técnica crawlável**
Se é SaaS: docs, changelog e API reference devem ser públicos e indexáveis. IAs são muito propensas a citar documentação técnica.

### 7.4 Ferramentas de Monitoramento AEO

| Ferramenta | Para quê | Custo |
|---|---|---|
| **SE Ranking** | SEO + AEO tracker nativo (Google AI Overviews, ChatGPT, Gemini) | ~$55/mês |
| **Goodie AI** | Dashboards simples de brand mention em IAs | ~$99/mês |
| **Profound** | Enterprise, GA4 attribution + 10 engines | $99–$399/mês |
| **Monitoramento manual** | Pesquisar marca/produto no ChatGPT e Perplexity mensalmente | Gratuito |

**Recomendação para early-stage:** SE Ranking cobre SEO tradicional + AEO básico num único plano. Adicionar monitoramento manual mensal como rotina.

---

## 8. Comportamento do Usuário

### 8.1 Microsoft Clarity (gratuito, obrigatório)

1. clarity.microsoft.com → Create New Project → copiar o **Project ID**
2. No GTM Web Container → Nova Tag → Custom HTML → colar snippet do Clarity
3. Trigger: All Pages
4. Habilitar integração com GA4:
   - Em Clarity → Settings → Google Analytics → Connect
   - Isso injeta `clarity_session_url` como dimensão customizada no GA4
5. Principais recursos:
   - Session recordings — ver exatamente o que usuários fazem
   - Heatmaps — onde clicam, onde scrollam
   - Rage clicks — onde ficam frustrados
   - Dead clicks — onde clicam achando que é clicável

### 8.2 Hotjar (opcional, se precisar de feedback qualitativo)

1. hotjar.com → criar site → copiar Site ID
2. Instalar via GTM (template disponível)
3. Usar principalmente para: surveys in-page, NPS, feedback widgets
4. Clarity é suficiente para comportamento — Hotjar adiciona valor apenas na camada de feedback

---

## 9. Padrão UTM

### 9.1 Nomenclatura Padrão

```
utm_source   = google | meta | bing | tiktok | linkedin | email | whatsapp | organic | direct
utm_medium   = cpc | social | email | referral | sms | push | affiliate
utm_campaign = [produto-ou-objetivo]-[variante]-[período]  ex: plano-pro-summer-jun26
utm_content  = [criativo]                                  ex: video-testimonial-v2
utm_term     = [keyword]                                   ex: software-gestao-financeira
```

**Regras:**
- Sempre lowercase, sem espaços (usar hífen)
- `utm_source` + `utm_medium` + `utm_campaign` são obrigatórios
- `utm_content` obrigatório em A/B tests
- `utm_term` obrigatório em Google Search Ads

### 9.2 URL Builder

Manter uma planilha ou usar o [Google Campaign URL Builder](https://ga4.google.com/tools/utm-builder) para gerar e registrar todos os links com UTM. Nenhum link de campanha deve ser criado sem UTM — sem UTM = sem atribuição.

### 9.3 UTM Shortener Interno

Para links longos expostos (bio do Instagram, WhatsApp), criar redirecionamentos curtos internos: `seusite.com/go/nome-campanha → URL com UTM completo`. Isso preserva UTMs (ao contrário de encurtadores externos que podem quebrar o tracking) e permite trocar a URL de destino sem mudar o link curto.

---

## 10. Deduplication

### 10.1 O Princípio do event_id

Qualquer evento que dispara em múltiplos canais (Pixel client-side + CAPI server-side, por exemplo) precisa de um identificador único para que as plataformas desconsiderem o duplicado.

**Regra:** gerar um `event_id` com `crypto.randomUUID()` no momento do evento, no cliente, e repassar esse mesmo ID para TODOS os destinos que receberem esse evento.

```typescript
// Geração no cliente
const eventId = crypto.randomUUID();

// 1. dataLayer (vai para GA4 via GTM)
window.dataLayer.push({
  event: 'lead',
  event_id: eventId,
  // ... outros parâmetros
});

// 2. API route interna (vai para Meta CAPI, TikTok Events API, etc.)
await fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'Lead',
    event_id: eventId, // MESMO ID
    email: hashedEmail,
    phone: hashedPhone,
    page_url: window.location.href
  })
});

// 3. Banco de dados (fonte da verdade)
await db.events.insert({
  event_id: eventId, // UNIQUE constraint
  event_type: 'lead',
  // ...
});
```

### 10.2 Tabela de Eventos (Banco de Dados)

```sql
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID UNIQUE NOT NULL,  -- deduplication key
  event_type  TEXT NOT NULL,
  user_id     UUID REFERENCES users(id),
  page_slug   TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON events (event_type, created_at DESC);
CREATE INDEX ON events (user_id);
CREATE INDEX ON events (page_slug);
```

A constraint `UNIQUE` no `event_id` garante idempotência — mesmo que o mesmo evento chegue duas vezes (retry, falha de rede), apenas uma entrada é criada.

### 10.3 Hashing de Dados de Usuário

Antes de enviar dados pessoais para Meta CAPI ou TikTok Events API, hashear com SHA-256:

```typescript
async function hashData(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Uso
const hashedEmail = await hashData(user.email);
const hashedPhone = await hashData(user.phone.replace(/\D/g, ''));
```

---

## 11. LGPD / Consent Mode v2

### 11.1 O que Precisa Existir Legalmente

- **Política de Privacidade** em `/privacy` — descrever quais dados são coletados, como são usados, com quem são compartilhados, direitos do titular
- **Cookie Banner** — antes de qualquer cookie de analytics ou ads ser setado
- **Registro de consentimento** — salvar `consent_at` timestamp para cada usuário
- **Opção de revogação** — usuário deve poder revogar consentimento a qualquer momento

### 11.2 Implementação Técnica

**Fluxo completo:**
1. Usuário acessa o site
2. Consent Mode v2 no GTM define todos os sinais como `denied` por padrão
3. CMP exibe o banner
4. Se aceitar: CMP dispara `gtag('consent', 'update', { ... 'granted' })` + seta cookie de preferência
5. Se recusar: nenhuma tag de analytics/ads dispara
6. Em formulários de lead: checkbox LGPD obrigatório (não pré-marcado)

**Armazenamento:**
```sql
-- Na tabela de contacts/users
consent_at        TIMESTAMPTZ,  -- quando consentiu
consent_ip        INET,          -- IP no momento (evidência)
consent_version   TEXT           -- versão da política aceita
```

### 11.3 Campos Sensíveis

Nunca enviar para plataformas de ads sem hashing: email, telefone, CPF, nome completo. Sempre SHA-256 antes de enviar.

---

## 12. Roadmap de Implementação

### Semana 1 — Foundation (Bloqueante para tudo)

| # | Tarefa | Tempo estimado |
|---|---|---|
| 1.1 | Criar todas as contas (GTM, GA4, GSC, Meta, Bing, TikTok, LinkedIn) | 2h |
| 1.2 | Criar subdomínio `metrics.seusite.com` no DNS | 15min |
| 1.3 | Configurar Stape.io + GTM Server Container | 1h |
| 1.4 | Instalar GTM Web Container no site | 30min |
| 1.5 | Implementar Consent Mode v2 (CMP + GTM tags) | 2h |
| 1.6 | Validar GTM com Tag Assistant | 30min |

### Semana 2 — Analytics + Search

| # | Tarefa | Tempo estimado |
|---|---|---|
| 2.1 | Configurar GA4 via GTM Server-Side | 1.5h |
| 2.2 | Implementar eventos customizados via dataLayer | 2h |
| 2.3 | Verificar GSC via DNS + submeter sitemap | 30min |
| 2.4 | Verificar Bing Webmaster Tools + IndexNow | 30min |
| 2.5 | **Cadastrar Bing Places for Business (importar do GMB)** | 20min |
| 2.6 | Gerar sitemap.xml, robots.txt, llms.txt | 1h |
| 2.7 | Implementar Schema markup (Organization, FAQ, Article) | 2h |
| 2.8 | Instalar Microsoft Clarity via GTM | 20min |
| 2.9 | Conectar GA4 ao BigQuery | 20min |

### Semana 3 — Ads

| # | Tarefa | Tempo estimado |
|---|---|---|
| 3.1 | Meta Pixel via GTM (client-side base) | 45min |
| 3.2 | Meta CAPI via GTM Server-Side + event_id | 2h |
| 3.3 | Advanced Matching (hashing email/phone) | 1h |
| 3.4 | Google Ads Enhanced Conversions (importar de GA4) | 1h |
| 3.5 | Microsoft Ads UET Tag via GTM | 30min |
| 3.6 | TikTok Pixel + Events API | 1.5h |
| 3.7 | LinkedIn Insight Tag via GTM | 30min |

### Semana 4 — Deduplication + Validação

| # | Tarefa | Tempo estimado |
|---|---|---|
| 4.1 | Implementar event_id em todos os eventos críticos | 2h |
| 4.2 | Criar tabela events no banco com UNIQUE constraint | 30min |
| 4.3 | Implementar /api/track route para server-side events | 2h |
| 4.4 | Validar deduplication no Meta Events Manager | 1h |
| 4.5 | Criar segmento AI Referrals no GA4 | 20min |
| 4.6 | Configurar UTM padrão + planilha de tracking | 30min |
| 4.7 | Executar checklist final | 2h |

---

## 13. Rotina de Monitoramento

### Diária (5 min)
- GA4 Realtime: checar se eventos estão chegando normalmente
- Meta Events Manager: checar match rate (deve estar > 80%)

### Semanal (30 min)
- GSC: Core Web Vitals, erros de crawl, páginas indexadas
- GA4: leads, conversões, canais de aquisição
- Clarity: session recordings de páginas-chave, rage clicks

### Quinzenal (45 min)
- Meta Events Manager: quality score dos eventos, deduplication rate
- GA4: segmento AI Referrals crescendo?
- Validar se sitemap está atualizado com novos conteúdos

### Mensal (1-2h)
- GSC: queries de busca, posição média, CTR por página
- **Otimização de conteúdo existente (ganhos rápidos):**
  1. GSC → Desempenho → ativar "Posição média"
  2. Em Consultas → Filtro → Posição → definir entre 4 e 20
  3. Exportar ou copiar as queries — são páginas já perto de ranquear
  4. Para cada página identificada: trazer a palavra-chave mais para o início do texto e reforçar nos headings H2/H3
  5. Solicitar reindexação da URL no GSC (Inspecionar URL → Solicitar indexação)
  6. Retorno esperado em 2–4 semanas — menor esforço, maior impacto imediato
- **Linkagem interna estratégica:**
  - No Google, digitar `site:seudominio.com "palavra-chave-alvo"` para encontrar páginas que já citam o termo
  - Nas 3 páginas encontradas, criar link apontando para a página principal que você quer ranquear
  - Repetir mensalmente para páginas prioritárias
- SE Ranking (ou similar): ranking orgânico + visibilidade AEO
- Pesquisa manual: buscar marca/produto no ChatGPT e Perplexity — está sendo citado?
- Bing Webmaster Tools: oportunidades de keyword específicas do Bing + relatório de performance de IA (AI Performance report)
- Revisar match rate de todos os pixels (Meta, TikTok, LinkedIn)
- Validar schema markup com Rich Results Test nas páginas principais
- **GSC Guardian:** checar se houve incidentes ou instabilidades do Google no período — extensão Chrome que identifica correlação entre quedas de tráfego e core updates

---

## 14. Checklist Final — Antes de ir ao Ar

### Foundation
- [ ] GTM Web Container instalado e publicado
- [ ] GTM Server Container respondendo em `metrics.seusite.com`
- [ ] Consent Mode v2 setado como `denied` por padrão
- [ ] CMP (banner de cookies) funcionando e atualizando consent
- [ ] Tag Assistant confirma GTM carregando sem erros

### Analytics
- [ ] GA4 recebendo `page_view` em tempo real (Realtime report)
- [ ] Evento `lead` disparando com `event_id` único
- [ ] GA4 conectado ao GSC
- [ ] GA4 conectado ao BigQuery
- [ ] Data Retention configurado para 14 meses

### Search
- [ ] GSC verificado via DNS
- [ ] Sitemap submetido e sem erros
- [ ] Bing Webmaster Tools verificado
- [ ] IndexNow ativo para Bing
- [ ] **Bing Places for Business cadastrado e verificado**
- [ ] **NAP idêntico em: GMB + Bing Places + schema markup do site**
- [ ] **Imagens do GMB georreferenciadas (GeoIMGR)** — se negócio local
- [ ] `robots.txt` com AI crawlers liberados
- [ ] `llms.txt` na raiz do site
- [ ] Schema markup validado (schema.org/validator)
- [ ] Nenhum erro de schema no Google Rich Results Test

### Meta
- [ ] Pixel disparando `PageView` em todas as páginas
- [ ] CAPI enviando eventos com mesmo `event_id` do Pixel
- [ ] Match rate > 80% no Events Manager
- [ ] Advanced Matching ativo (email + phone hasheados)
- [ ] Domain verification feita no Business Settings

### Google Ads
- [ ] Conversões importadas do GA4 (não tag direta)
- [ ] Enhanced Conversions ativo

### Bing / Microsoft Ads
- [ ] UET Tag disparando em todas as páginas
- [ ] Conversion goals criados

### TikTok
- [ ] Pixel disparando PageView
- [ ] Events API enviando com event_id

### LinkedIn
- [ ] Insight Tag disparando em todas as páginas
- [ ] Conversion tracking configurado

### Deduplication
- [ ] event_id gerado com `crypto.randomUUID()` em todos os eventos críticos
- [ ] Mesmo event_id sendo enviado para Pixel E para CAPI
- [ ] Tabela events com UNIQUE constraint no event_id
- [ ] Dados pessoais sendo hasheados (SHA-256) antes de enviar

### LGPD
- [ ] Cookie banner exibindo antes de qualquer tracking
- [ ] Página /privacy publicada e linkada no banner
- [ ] Formulários com checkbox LGPD obrigatório (não pré-marcado)
- [ ] consent_at sendo registrado no banco

### AEO
- [ ] Segmento "AI Referrals" criado no GA4
- [ ] Entidade consolidada (nome idêntico em todas as plataformas)
- [ ] Ferramenta AEO configurada (SE Ranking ou similar)

---

## Apêndice — Custos de Infra Mensais

| Ferramenta | Custo/mês | Nível |
|---|---|---|
| Stape.io (sGTM hosting) | ~$25 | Obrigatório |
| CookieYes ou Cookiebot (CMP) | ~$10–15 | Obrigatório |
| SE Ranking (SEO + AEO) | ~$55 | Recomendado |
| Microsoft Clarity | Gratuito | Obrigatório |
| GA4, GTM, GSC, Bing WMT | Gratuito | Obrigatório |
| BigQuery (free tier ~10GB) | Gratuito | Recomendado |
| Hotjar (se precisar de feedback) | ~$32 | Opcional |
| **Total mínimo** | **~$90/mês** | |

---

*Playbook v1.1 — Revisar a cada 6 meses. AEO/GEO evolui rapidamente.*

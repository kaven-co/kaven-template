---
id: id-visual-implementation-guide
title: Kaven ID Visual - Guia de Implementação
status: draft
type: guide
audience: internal
owner: chris
created: 2026-04-18
priority: p0
---

# 🎨 KAVEN ID VISUAL — GUIA DE IMPLEMENTAÇÃO

**Objetivo:** Transformar o brandbook v2.0.1 em identidade visual aplicada em todos os canais.  
**Resultado esperado:** Toolkit completo pronto para uso em app, website e redes sociais.

---

## 📋 ÍNDICE

1. [Fase 0 — Pré-requisitos](#fase-0--pré-requisitos)
2. [Fase 1 — Assets Core (Semana 1)](#fase-1--assets-core-semana-1)
3. [Fase 2 — Website/Landing (Semana 1-2)](#fase-2--websitelanding-semana-1-2)
4. [Fase 3 — Produto/SaaS (Semana 2)](#fase-3--produtosaas-semana-2)
5. [Fase 4 — Redes Sociais (Semana 2-3)](#fase-4--redes-sociais-semana-2-3)
6. [Fase 5 — Materiais de Marketing (Semana 3)](#fase-5--materiais-de-marketing-semana-3)
7. [Fase 6 — Validação Final](#fase-6--validação-final)

---

## FASE 0 — PRÉ-REQUISITOS

### Checklist de Preparação

- [ ] Baixar fonts: Space Grotesk + Inter (Google Fonts)
- [ ] Criar pasta `docs/id-visual/` para assets
- [ ] Criar pasta `docs/id-visual/templates/` para templates de redes
- [ ] Criar pasta `docs/id-visual/components/` para componentes React/UI
- [ ] Access to Figma (ou ferramenta de design equivalente)
- [ ] Access to Canva (para templates rápidos de redes)

### Tools Recomendadas

| Tipo          | Ferramenta      | Uso                                    |
| ------------- | --------------- | -------------------------------------- |
| Design Core   | Figma           | Logo, icons, UI components             |
| Redes Sociais | Canva           | Templates rápidos, posts               |
| Icons         | Lucide.dev      | Iconografia (já definida no brandbook) |
| Gradientes    | meshgradient.in | Backgrounds mesh                       |
| Código        | Tokens CSS      | Implementação no app                   |

---

## FASE 1 — ASSETS CORE (Semana 1)

### 1.1 Logo — Arquivos a Criar

**Prioridade: CRÍTICA** — Sem logo não existe ID visual.

| Arquivo                        | Formato | Especificação           | Uso               |
| ------------------------------ | ------- | ----------------------- | ----------------- |
| `kaven-logo-primary-color.svg` | SVG     | KAVEN preto + Kai verde | Website, docs     |
| `kaven-logo-primary-color.png` | PNG     | 512px, 1024px, 2048px   | Email, slides     |
| `kaven-logo-white.svg`         | SVG     | KAVEN + Kai brancos     | Fundos escuros    |
| `kaven-logo-black.svg`         | SVG     | KAVEN + Kai pretos      | Impressão P&B     |
| `kaven-kai-icon.svg`           | SVG     | Kai isolado, verde      | Favicon, app icon |
| `kaven-favicon-16.png`         | PNG     | 16x16px                 | Browser tab       |
| `kaven-favicon-32.png`         | PNG     | 32x32px                 | Browser tab       |
| `kaven-apple-touch-icon.png`   | PNG     | 180x180px               | PWA home screen   |
| `kaven-android-chrome.png`     | PNG     | 512x512px               | Android PWA       |

### 1.2 Kai (Camaleão) — Estados a Criar

**Prioridade: ALTA** — Kai é o elemento central da identidade.

| Estado             | Descrição                                             | Uso Principal           |
| ------------------ | ----------------------------------------------------- | ----------------------- |
| `kai-idle.svg`     | Verde Esmeralda (#10B981), corpo em S, cauda enrolada | Logo, favicon, base     |
| `kai-success.svg`  | Laranja (#F97316), confiante, elevado                 | Completion states       |
| `kai-thinking.svg` | Gradiente pulsante (verde→ciano→verde)                | Loading states          |
| `kai-gradient.png` | Verde→Ciano→Laranja (gradiente 90deg)                 | Hero, marketing         |
| `kai-walk.gif`     | Animação 4-6 frames, esquerda→direita                 | Hero section (opcional) |

### 1.3 Cores — Tokens CSS/Design

**Prioridade: CRÍTICA** — Define a paleta em código.

```css
/* PRIMARY COLORS */
:root {
  --kaven-green: #10b981;
  --kaven-green-light: #34d399;
  --kaven-green-dark: #059669;

  --kaven-orange: #f97316;
  --kaven-orange-light: #fb923c;
  --kaven-orange-dark: #ea580c;

  --kaven-cyan: #00d9ff;

  /* NEUTRALS */
  --kaven-black: #0a0a0a;
  --kaven-white: #ffffff;
  --kaven-gray-100: #f9f9f9;
  --kaven-gray-200: #e5e5e5;
  --kaven-gray-300: #cacaca;
  --kaven-gray-400: #9a9a9a;
  --kaven-gray-500: #6a6a6a;
  --kaven-gray-600: #4a4a4a;
  --kaven-gray-700: #2a2a2a;
  --kaven-gray-800: #1a1a1a;
  --kaven-gray-900: #0a0a0a;

  /* FEEDBACK */
  --kaven-success: #10b981;
  --kaven-warning: #f59e0b;
  --kaven-error: #ef4444;
  --kaven-info: #00d9ff;
}

/* GRADIENTS */
:root {
  --kaven-gradient-main: linear-gradient(
    135deg,
    #10b981 0%,
    #00d9ff 50%,
    #f97316 100%
  );
  --kaven-gradient-transform: linear-gradient(90deg, #10b981 0%, #f97316 100%);
  --kaven-gradient-subtle: linear-gradient(180deg, #f9f9f9 0%, #ffffff 100%);
}
```

### 1.4 Tipografia — Configuração

**Prioridade: CRÍTICA** — Fonte = identidade.

| Fonte                      | Peso          | Uso                | Import             |
| -------------------------- | ------------- | ------------------ | ------------------ |
| Space Grotesk              | Bold (700)    | H1, H2, Display    | Google Fonts       |
| Space Grotesk              | Medium (500)  | H3, H4             | Google Fonts       |
| Inter                      | Regular (400) | Body text          | Google Fonts       |
| Inter                      | Medium (500)  | Subtítulos, botões | Google Fonts       |
| Inter                      | Bold (700)    | CTAs,强调          | Google Fonts       |
| Fira Code / JetBrains Mono | Regular       | Code snippets      | NPM / Google Fonts |

---

## FASE 2 — WEBSITE/LANDING (Semana 1-2)

### 2.1 Homepage — Estrutura Visual

| Seção        | Elementos Visuais                   | Especificação                              |
| ------------ | ----------------------------------- | ------------------------------------------ |
| **Header**   | Logo + Nav + CTA                    | Logo 40px, nav links Inter 16px, CTA verde |
| **Hero**     | Headline + Subheadline + Kai + CTAs | Display XL, gradiente sutil background     |
| **Features** | Grid 3 colunas, ícones 48px         | Alternância Branco/Cinza 100               |
| **Pricing**  | Cards com borda verde no destacado  | Shadow nível 1, border 2px verde           |
| **Footer**   | Logo branco + links + social icons  | Background preto (#0A0A0A)                 |

### 2.2 Implementação — Componentes React

Criar em `apps/tenant/src/components/id-visual/`:

```
id-visual/
├── colors.ts          // Export tokens CSS
├── typography.ts     // Font configurations
├── buttons/
│   ├── ButtonPrimary.tsx
│   ├── ButtonSecondary.tsx
│   └── ButtonTertiary.tsx
├── Kai/
│   ├── KaiIcon.tsx          // SVG icon
│   ├── KaiAnimated.tsx     // Animado (opcional)
│   └── index.ts
├── Logo/
│   ├── LogoHorizontal.tsx  // KAVEN | Kai
│   ├── LogoVertical.tsx    // Kai + KAVEN
│   ├── LogoIcon.tsx        // Kai only
│   └── index.ts
└── index.ts
```

### 2.3 Checklist Website

- [ ] Logo header (horizontal, cores corretas)
- [ ] Logo footer (branco, menor)
- [ ] Favicon (Kai verde)
- [ ] Hero com gradiente (Verde→Ciano→Laranja sutil)
- [ ] Kai no hero (idle ou walk animation)
- [ ] Buttons primário (verde #10B981)
- [ ] Buttons secundário (outline verde)
- [ ] Fontes carregadas (Space Grotesk + Inter)
- [ ] Cores aplicadas nos tokens
- [ ] Footer preto (#0A0A0A)
- [ ] Alternância fundo Branco/Cinza 100 nas seções

---

## FASE 3 — PRODUTO/SaaS (Semana 2)

### 3.1 Dashboard UI

| Área             | Especificação Visual                       |
| ---------------- | ------------------------------------------ |
| **Sidebar**      | Background preto (#0A0A0A), 240px width    |
| **Logo sidebar** | KAVEN + Kai brancos, 32px                  |
| **Nav items**    | Inter Medium 14px, Cinza 300               |
| **Active nav**   | Background verde, texto branco             |
| **Main content** | Background Cinza 100 (#F9F9F9)             |
| **Cards**        | Branco, border-radius 12px, shadow nível 1 |

### 3.2 Estados de UI

| Estado      | Implementação                                                |
| ----------- | ------------------------------------------------------------ |
| **Empty**   | Kai idle (olhando curioso) + "Ready to create?"              |
| **Loading** | Kai pulsando (gradiente animado) + "Building your system..." |
| **Success** | Kai laranja + "Your SaaS is ready!"                          |
| **Error**   | Toast vermelho (#EF4444)                                     |

### 3.3 Code Highlighting

```css
.code-block {
  background: #0a0a0a;
  border-radius: 8px;
  padding: 24px;
}

.code-function {
  color: #00d9ff;
} /* Ciano */
.code-variable {
  color: #10b981;
} /* Verde */
.code-string {
  color: #f97316;
} /* Laranja */
.code-keyword {
  color: #ffffff;
} /* Branco */
.code-comment {
  color: #6a6a6a;
} /* Cinza 500 */
```

### 3.4 Checklist Produto

- [ ] Tokens de cores implementados no tema
- [ ] Sidebar escura com logo branco
- [ ] Buttons em verde Kaven
- [ ] Empty state com Kai
- [ ] Loading state com Kai pulsante
- [ ] Code blocks com syntax highlighting correto
- [ ] Inter como fonte de UI
- [ ] Spacing system 4px base aplicado

---

## FASE 4 — REDES SOCIAIS (Semana 2-3)

### 4.1 LinkedIn

| Tipo                | Dimensão    | Template                                                             |
| ------------------- | ----------- | -------------------------------------------------------------------- |
| **Profile Picture** | 400x400px   | Kai verde centralizado, fundo branco, margem 40px                    |
| **Cover/Banner**    | 1584x396px  | Gradiente Verde→Ciano, texto "The System that Creates Systems"       |
| **Post Carousel**   | 1080x1080px | Slide 1 capa verde→ciano, slides internos cinza 100, slide 9 laranja |

**Carousel Template Structure:**

```
Slide 1: Capa (gradiente) → título → logo bottom-right
Slide 2-8: Ícone 64px verde → título → bullets → número bottom-right
Slide 9 (CTA): Background laranja → Kai laranja → CTA em branco
```

### 4.2 Twitter/X

| Tipo            | Dimensão   | Template                                |
| --------------- | ---------- | --------------------------------------- |
| **Profile**     | 400x400px  | Kai icon verde                          |
| **Header**      | 1500x500px | Preto + mesh gradient sutil Verde/Ciano |
| **Tweet Image** | 1200x675px | Dark tech aesthetic, overlay verde 30%  |

**Post Guidelines:**

- Comprimento: 100-250 caracteres
- Tom: Técnico mas acessível
- Imagens: Alta qualidade, overlays verdes

### 4.3 Instagram

| Tipo          | Dimensão    | Template                                              |
| ------------- | ----------- | ----------------------------------------------------- |
| **Profile**   | 320x320px   | Kai icon ou logo completo                             |
| **Feed Post** | 1080x1080px | Dark tech aesthetic, paleta Preto/Verde/Ciano/Laranja |
| **Story**     | 1080x1920px | Vertical, Kai animado (GIF curto), CTAs com swipe-up  |

### 4.4 TikTok

| Tipo        | Dimensão    | Especificação                                             |
| ----------- | ----------- | --------------------------------------------------------- |
| **Profile** | -           | Kai icon verde                                            |
| **Video**   | 1080x1920px | Vertical, 15-60s, cores vibrantes (verde, laranja, ciano) |

### 4.5 Templates Canva — Arquivos a Criar

| Template          | Link Canva | Dimensão    |
| ----------------- | ---------- | ----------- |
| LinkedIn Carousel | Criar novo | 1080x1080px |
| Twitter Header    | Criar novo | 1500x500px  |
| Instagram Post    | Criar novo | 1080x1080px |
| Instagram Story   | Criar novo | 1080x1920px |
| TikTok Video      | Criar novo | 1080x1920px |

### 4.6 Checklist Redes Sociais

**LinkedIn:**

- [ ] Profile picture (Kai verde)
- [ ] Banner (gradiente + tagline)
- [ ] Template carousel criado

**Twitter:**

- [ ] Profile picture (Kai verde)
- [ ] Header (preto + mesh)
- [ ] Post style definido

**Instagram:**

- [ ] Profile picture
- [ ] Feed aesthetic definido
- [ ] Story template criado

**TikTok:**

- [ ] Profile picture
- [ ] Video template criado

---

## FASE 5 — MATERIAIS DE MARKETING (Semana 3)

### 5.1 Email Marketing

| Material              | Especificação                                              |
| --------------------- | ---------------------------------------------------------- |
| **Assinatura**        | Logo 100px + nome + cargo + links sociais (verde no hover) |
| **Newsletter Header** | Logo centralizado 150px, background branco                 |
| **Newsletter Footer** | Background Cinza 900 (#1A1A1A), texto Cinza 300            |

### 5.2 Apresentações (Pitch Deck)

| Slide                | Template                                                |
| -------------------- | ------------------------------------------------------- |
| **Capa**             | Gradiente Verde→Ciano, logo branco, título Display L    |
| **Divisor de Seção** | Verde Esmeralda OU Laranja, texto Display M branco      |
| **Padrão**           | Header Cinza 100, título H2 verde, footer número página |

### 5.3 Assets Adicionais

| Asset                                 | Prioridade |
| ------------------------------------- | ---------- |
| [ ] Email signature template          | Alta       |
| [ ] Pitch deck template (Figma/Canva) | Alta       |
| [ ] One-pager template                | Média      |
| [ ] Business cards                    | Baixa      |
| [ ] Letterhead                        | Baixa      |

---

## FASE 6 — VALIDAÇÃO FINAL

### Checklist de Qualidade

- [ ] Logo em todas as versões (color, white, black, icon)
- [ ] Cores HEX exatamente como brandbook (verde #10B981, não azul!)
- [ ] Fontes Space Grotesk + Inter aplicadas
- [ ] Contraste WCAG AA (mínimo 4.5:1)
- [ ] Kai usado de forma técnica (não místico)
- [ ] Sem buzzwords ("disruptivo", "revolucionário")
- [ ] Gradientes corretos (verde→ciano→laranja)
- [ ] Folders organizados (`docs/id-visual/`)

### Arquivos Finalizados

```
docs/id-visual/
├── logo/
│   ├── kaven-logo-primary-color.svg
│   ├── kaven-logo-white.svg
│   ├── kaven-logo-black.svg
│   └── kaven-kai-icon.svg
├── kai/
│   ├── kai-idle.svg
│   ├── kai-success.svg
│   ├── kai-thinking.svg
│   └── kai-gradient.png
├── colors.css
├── typography.css
├── templates/
│   ├── linkedin-carousel.fig
│   ├── twitter-header.fig
│   ├── instagram-post.fig
│   └── instagram-story.fig
└── README.md
```

---

## 📦 PRÓXIMOS PASSOS

### Se quiser implementar AGORA:

1. **Start com Logo + Cores** → Isso desbloqueia tudo
2. **Depois Website** → Aplicar no frontend
3. **Depois Redes** → Templates Canva
4. **Depois Produto** → UI components

### Se quiser delegar:

- **Figma design** → Usar @ux-design-expert
- **Frontend implementation** → Usar @kaven-frontend-dev
- **Templates redes** → Usar Canva ou @kaven-lp-copywriter
- **Assets 3D Kai** → Freelancer especializado (blender/cinema4d)

---

## ⚡ ATALHOS

### Se já tiver elementos prontos:

- Já tem logo em SVG? → Pular 1.1, ir para 1.2
  -Já tem cores no CSS? → Pular 1.3, ir para 2.2
- Já tem site? → Atualizar cores + fonts + logo

### Priorização Recomendada:

```
P0 (Crítico):
  1. Logo (todos os formatos)
  2. Tokens de cores CSS
  3. Fonts (Space Grotesk + Inter)

P1 (Alto):
  4. Kai icon + estados
  5. Website header/footer
  6. Profile pictures redes

P2 (Médio):
  7. Templates carousel
  8. UI components (buttons, cards)
  9. Email signature

P3 (Baixo):
  10. Pitch deck
  11. Animations (Kai walk)
  12. Business cards
```

---

**Status deste guide:** Draft — executar e iterar  
**Próxima revisão:** Após Fase 1 completa  
**Owner:** Chris (oudelegate para @kaven-frontend-dev)

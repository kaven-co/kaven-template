---
id: id-visual-ai-implementation-guide
title: Kaven ID Visual — Guia de Implementação COM IA
status: draft
type: guide
audience: internal
owner: chris
created: 2026-04-18
priority: p0
---

# 🎨 KAVEN ID VISUAL — GUIA DE IMPLEMENTAÇÃO COM IA

**Objetivo:** Maximizar uso de IA para minimizar fricção manual na implementação da ID visual.
**Stack de IA selecionado:** Hyperframes + Nano-Banana + UI UX Pro Max + Content Brain Builder

---

## 📋 MAPA DE FERRAMENTAS POR FASE

| Fase             | Output Esperado    | Ferramenta IA               | Como usar                      |
| ---------------- | ------------------ | --------------------------- | ------------------------------ |
| **0. Prep**      | Setup completo     | UI UX Pro Max               | Gerar design system guidelines |
| **1. Core**      | Logo, cores, fonts | Nano-Banana + Manual        | Gerar assets base              |
| **2. Website**   | Landing page       | UI UX Pro Max → Hyperframes | UI → Vídeo                     |
| **3. Produto**   | Dashboard UI       | ux-design-expert            | Componentes + tokens           |
| **4. Redes**     | Posts, carousels   | Hyperframes                 | Vídeo para social media        |
| **5. Marketing** | Materiais diversos | Nano-Banana + Hyperframes   | Imagens + Vídeo                |

---

## 🗺️ WORKFLOW INTEGRADO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KAVEN ID VISUAL - PIPELINE IA                        │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────┐
     │  CONTENT BRAIN  │  ← Estratégia de marca (Content Brain Builder)
     │    BUILDER      │    Define: tom de voz, pilares, público-alvo
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │  UI UX PRO MAX  │  ← Design System Generator
     │                 │    Gera: cores, typography, estilos por indústria
     └────────┬────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────────┐   ┌─────────────────┐
│ NANO-BANANA │   │ UX-DESIGN-EXPERT│
│  (Images)   │   │   (Code/React)  │
└─────────────┘   └─────────────────┘
    │                   │
    ▼                   ▼
┌─────────────┐   ┌─────────────────┐
│ HYPERFRAMES │   │  COMPONENTES    │
│  (Vídeo)    │   │   REACT/UI      │
└─────────────┘   └─────────────────┘
    │                   │
    ▼                   ▼
┌─────────────────────────────────────────┐
│        ASSETS FINAIS                    │
│   Logo • Icons • Videos • UI Components │
└─────────────────────────────────────────┘
```

---

## FASE 0 — PRÉ-REQUISITOS + SETUP IA

### Checklist de Preparação

- [ ] Conta Google AI Studio (para Nano-Banana)
- [ ] FFmpeg + ImageMagick instalados (para transparent mode)
- [ ] Node.js >= 22 (para Hyperframes)
- [ ] Python 3.x (para UI UX Pro Max)
- [ ] Skill do Content Brain Builder instalada

### Setup do Stack IA

```bash
# 1. Nano-Banana (geração de imagens)
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2 && bun install && bun link

# 2. Hyperframes (vídeo via HTML)
npx skills add heygen-com/hyperframes

# 3. UI UX Pro Max (design intelligence)
npm install -g uipro-cli

# 4. Configurar API key
echo "GEMINI_API_KEY=your_key" > ~/.nano-banana/.env
```

### Gerar Design System Kaven via IA

```bash
# Gerar design system específico para "SaaS AI Framework"
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "SaaS AI framework developer tool" \
  --design-system -f markdown -p "Kaven" --persist
```

---

## FASE 1 — ASSETS CORE (SEMANA 1)

### 1.1 Logo — Com IA

**Abordagem híbrida (Nano-Banana + manual refinement):**

| Arquivo                        | Como gerar                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `kaven-logo-primary-color.svg` | Nano-Banana: `nano-banana "minimalist tech logo KAVEN text in bold sans-serif" -t`   |
| `kaven-kai-icon.svg`           | Nano-Banana: `nano-banana "cute chameleon mascot green color simple flat vector" -t` |
| `kaven-logo-white.svg`         | Same prompt, transparent mode → manual invert                                        |

**Prompt otimizado para Kaven:**

```
"Minimalist tech logo 'KAVEN' text in bold geometric sans-serif,
subtle chameleon tail motif, professional SaaS aesthetic,
green and orange accent colors, clean vector style"
```

### 1.2 Kai (Camaleão) — Com IA

**Nano-Banana para estados base:**

| Estado             | Prompt                                                                                                        | flags              |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| `kai-idle.svg`     | "cute chameleon character sitting, curious expression, green emerald color, simple flat vector, mascot style" | `-t` (transparent) |
| `kai-success.svg`  | "happy confident chameleon raising arms, orange sunset color, celebration pose"                               | `-t`               |
| `kai-gradient.png` | "chameleon with flowing gradient green to cyan to orange, ethereal glowing, abstract art"                     | `-s 2K`            |

**Refinamento:** Iterar com `nano-banana --continue` até满意

### 1.3 Cores — Com UI UX Pro Max

**Gerar tokens automaticamente:**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI developer framework" --design-system -f markdown \
  --domain colors -p "Kaven"
```

**Output esperado:** Paleta com greens, oranges, neutrals alinhados ao brandbook

### 1.4 Tipografia — Com UI UX Pro Max

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "tech SaaS developer tool" --domain typography -p "Kaven"
```

**Resultado:** Font pairings recomendados (Space Grotesk deve estar na lista)

---

## FASE 2 — WEBSITE/LANDING (SEMANA 1-2)

### 2.1 Homepage — Pipeline Completo

**Fase 1: UI Generation (UI UX Pro Max)**

```
Prompt: "Build a landing page for Kaven - AI development framework SaaS,
dark theme, tech aesthetic, green and orange accent colors"
```

**Fase 2: Component Building (ux-design-expert)**

```bash
@ux-design-expert
*setup
*build button
*build card
*compose hero-section
```

**Fase 3: Video Assets (Hyperframes)**

Para vídeos de produto/demos:

```html
<div
  id="stage"
  data-composition-id="kaven-demo"
  data-width="1920"
  data-height="1080"
>
  <video
    id="demo-clip"
    data-start="0"
    data-duration="10"
    src="demo.mp4"
    muted
    playsinline
  ></video>
  <img
    id="kaven-logo"
    data-start="0"
    data-duration="10"
    data-track-index="1"
    src="kaven-logo-white.svg"
    style="opacity: 0.8; transform: translate(800px, 50px);"
  />
</div>
```

**Prompt para Hyperframes (via agente):**

```
Using /hyperframes, create a 15-second product demo video for Kaven SaaS,
with fade-in logo, background video of code/tech, and subtle green→cyan gradient overlay.
```

---

## FASE 3 — PRODUTO/SaaS (SEMANA 2)

### 3.1 Dashboard UI — via ux-design-expert

```bash
@ux-design-expert
*tokenize
*setup
*build button
*build input
*build card
*build sidebar
*document
```

### 3.2 Estados de UI — via Nano-Banana

**Empty State:**

```
nano-banana "cute chameleon looking curious, empty state illustration,
green color, minimal flat style, tech startup aesthetic" -o kai-empty
```

**Loading State:**

```
nano-banana "chameleon thinking with spinning question marks,
gradient green to cyan, loading animation concept" -o kai-loading
```

**Success State:**

```
nano-banana "happy chameleon celebrating, confetti, orange color,
success celebration illustration" -o kai-success-illustration
```

---

## FASE 4 — REDES SOCIAIS (SEMANA 2-3)

### 4.1 LinkedIn — Hyperframes Carousel

**Criar carousel via Hyperframes:**

Prompt ao agente:

```
Using /hyperframes, create a 9-slide LinkedIn carousel for Kaven:
- Slide 1: Cover with gradient background (green→cyan), title "The System that Creates Systems"
- Slides 2-8: Each with icon, title, bullet points (tech terms)
- Slide 9: CTA with orange background, contact info
Use Kaven brand colors: green #10B981, cyan #00D9FF, orange #F97316
Output as MP4 or image sequence
```

### 4.2 Twitter/X — Nano-Banana + Hyperframes

**Profile Picture:**

```
nano-banana "chameleon mascot avatar, green color, minimalist,
circle background, tech startup logo style" -o twitter-profile
```

**Header:**

```
nano-banana "abstract tech background, dark theme with green and cyan
geometric shapes, code pattern overlay" -s 2K -a 16:9 -o twitter-header
```

### 4.3 Instagram — Hyperframes Stories

**Story Template via Hyperframes:**

```
Using /hyperframes, create a 9:16 Instagram story template for Kaven,
with vertical layout, swipe-up CTA placeholder, gradient background,
brand colors, template for animated text reveals
```

### 4.4 TikTok — Hyperframes

**Short videos (15-60s):**

```
Using /hyperframes, create a 30-second TikTok video for Kaven,
hook with large text, quick feature highlights, green/orange gradient transitions,
background music placeholder, vertical 9:16 format
```

---

## FASE 5 — MATERIAIS DE MARKETING (SEMANA 3)

### 5.1 Email Marketing

**Assinatura + Header via Nano-Banana:**

```
nano-banana "email signature banner, Kaven logo, minimal dark theme,
professional business style" -o email-header
```

### 5.2 Apresentações — Hyperframes

**Pitch Deck Video:**

```
Using /hyperframes, create a 60-second pitch deck video for Kaven:
- Slide 1: Cover with gradient, logo, tagline
- Slide 2: Problem statement
- Slide 3: Solution with product screenshot
- Slide 4: Features grid
- Slide 5: CTA with contact
Use brand colors throughout, smooth transitions between slides
```

### 5.3 Assets Adicionais

| Asset                    | Ferramenta    | Como                                                           |
| ------------------------ | ------------- | -------------------------------------------------------------- |
| Blog cover images        | Nano-Banana   | `nano-banana "tech blog cover abstract" -a 16:9 -o blog-cover` |
| Social media posts       | Nano-Banana   | `nano-banana "social media quote graphic" -o social-post`      |
| Presentation backgrounds | UI UX Pro Max | Gerar via design system                                        |
| Demo videos              | Hyperframes   | Via prompt ao agente                                           |

---

## FASE 6 — VALIDAÇÃO FINAL

### Checklist de Qualidade IA

- [ ] Logo gerado via Nano-Banana está alinhado ao brandbook
- [ ] Cores do design system correspondem ao brandbook (#10B981 green)
- [ ] Fonts Space Grotesk + Inter configuradas
- [ ] Vídeos Hyperframes seguem brand guidelines
- [ ] Todas as imagens têm variantestransparent (ícones)
- [ ] Diretório `docs/id-visual/` organizado com assets

---

## 📦 PRÓXIMOS PASSOS — STACK IA COMPLETO

### Antes de começar:

```bash
# Setup completo
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2 && bun install && bun link
npx skills add heygen-com/hyperframes
npm install -g uipro-cli
```

### Workflow recomendado:

```
1. Content Brain Builder → Define estratégia de marca
2. UI UX Pro Max → Gera design system + guidelines
3. Nano-Banana → Gera logo, Kai, assets visuais
4. ux-design-expert → Cria componentes React/UI
5. Hyperframes → Cria vídeos para redes/produto
```

### Priorização P0-P3 com IA:

```
P0 (Crítico):
  1. Nano-Banana: Logo (todos os formatos) + Kai icon
  2. UI UX Pro Max: Design tokens (cores, fonts)
  3. Hyperframes: Setup básico (preview, render)

P1 (Alto):
  4. Nano-Banana: Estados de UI (empty, loading, success)
  5. UI UX Pro Max: Website layout guidelines
  6. ux-design-expert: Button, card, sidebar components

P2 (Médio):
  7. Hyperframes: LinkedIn carousel template
  8. Nano-Banana: Profile pictures redes
  9. ux-design-expert: Email signature component

P3 (Baixo):
  10. Hyperframes: TikTok/Reels templates
  11. Nano-Banana: Blog covers, presentation assets
  12. UI UX Pro Max: Pitch deck design system
```

---

## 🔧 TROUBLESHOOTING

### Nano-Banana Issues

| Problema                 | Solução                         |
| ------------------------ | ------------------------------- |
| "API key not found"      | Verificar `~/.nano-banana/.env` |
| Green screen not working | Instalar FFmpeg + ImageMagick   |
| Images too large         | Usar `-s 512` ou `-s 1K`        |

### Hyperframes Issues

| Problema               | Solução                            |
| ---------------------- | ---------------------------------- |
| "Node version too old" | Upgrade para Node.js >= 22         |
| FFmpeg not found       | `brew install ffmpeg` (macOS)      |
| Preview not loading    | Verificar se porta não está em uso |

### UI UX Pro Max Issues

| Problema             | Solução                           |
| -------------------- | --------------------------------- |
| Python not found     | `brew install python3` (macOS)    |
| Script not found     | Verificar instalação correta      |
| Results not relevant | Adicionar mais contexto no prompt |

---

## 📊 CUSTOS ESTIMADOS (Gemini API)

| Operação                         | Custo estimado |
| -------------------------------- | -------------- |
| Logo (1K, transparent)           | ~$0.067        |
| Kai mascot (2K)                  | ~$0.101        |
| Social images (1K)               | ~$0.067/ea     |
| LinkedIn carousel (9 imgs)       | ~$0.60         |
| Total Fase 1                     | ~$1.50         |
| **Total implementação completa** | **~$5-10**     |

---

## 🧠 DECISÕES TOMADAS

### Stack Final:

| Categoria         | Ferramenta            | Rationale                                   |
| ----------------- | --------------------- | ------------------------------------------- |
| **Imagens**       | Nano-Banana           | Agent-native, transparente, multi-res       |
| **Vídeo**         | Hyperframes           | Agent-native, HTML→MP4, determinístico      |
| **Design System** | UI UX Pro Max         | 67 estilos, 161 industries, auto-generation |
| **Código UI**     | ux-design-expert      | Local, Atomic Design, componentes React     |
| **Estratégia**    | Content Brain Builder | Define marca antes de criar assets          |

### O que foi DESCARTADO:

- **Remotion** — Licença comercial + não é agent-native
- **Canva manual** — Fricção alta, não versionável
- **Figma manual** — Não integrado ao pipeline de código
- **DALL-E/Midjourney** — Não tem API integrada como Nano-Banana

---

**Status:** Draft — iterar após primeiro teste de pipeline  
**Próxima revisão:** Após testar geração de logo via Nano-Banana  
**Owner:** Chris

---

## 📎 ARQUIVOS RELACIONADOS

- `docs/id-visual/automation-tools.md` — Análise completa das ferramentas
- `docs/design/brandbook-v2.0.1.pt.md` — Brandbook fonte
- `docs/id-visual/` — Assets finais (a criar)

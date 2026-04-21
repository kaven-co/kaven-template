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
**Stack de IA selecionado:** Hyperframes + **Remotion** + Nano-Banana + UI UX Pro Max + Content Brain Builder + ux-design-expert (local)

**Resultado esperado:** Toolkit completo com mínimo trabalho manual — logo, cores, fonts, componentes, vídeos e templates tudo gerado via IA.

---

## 📋 MAPA DE FERRAMENTAS POR FASE

| Fase             | Output Esperado                | Ferramenta IA Principal                  | Como usar                      |
| ---------------- | ------------------------------ | ---------------------------------------- | ------------------------------ |
| **0. Prep**      | Setup completo + Design System | UI UX Pro Max                            | Gerar design system guidelines |
| **1. Core**      | Logo, Kai, cores, fonts        | Nano-Banana + UI UX Pro Max              | Gerar assets base + tokens     |
| **2. Website**   | Landing page + componentes     | ux-design-expert + UI UX Pro Max         | Componentes React + guidelines |
| **3. Produto**   | Dashboard UI + estados         | ux-design-expert                         | Tokens + componentes + estados |
| **4. Redes**     | Posts, carousels, stories      | Hyperframes + **Remotion** + Nano-Banana | Vídeo para social media        |
| **5. Marketing** | Materiais diversos             | Nano-Banana + Hyperframes + **Remotion** | Imagens + Vídeo                |
| **6. Validação** | Review final                   | Manual                                   | Checklist de qualidade         |

---

## 🗺️ WORKFLOW INTEGRADO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KAVEN ID VISUAL - PIPELINE IA                        │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────┐
     │  CONTENT BRAIN  │  ← Estratégia de marca (Content Brain Builder)
     │    BUILDER      │    Define: tom de voz, pilares, público-alvo, história
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │  UI UX PRO MAX  │  ← Design System Generator
     │                 │    Gera: cores, typography, estilos por indústria
     │  (161 rules)    │    Output: MASTER.md com brand guidelines
     └────────┬────────┘
              │
┌─────────┴─────────┐
     │                   │
     ▼                   ▼
┌─────────────┐   ┌─────────────────┐
│ NANO-BANANA │   │ UX-DESIGN-EXPERT│
│  (Images)   │   │   (Code/React)  │
│ Gemini API  │   │   AIOX local   │
└─────────────┘   └─────────────────┘
     │                   │
     ▼                   ▼
┌─────────────┐   ┌─────────────────┐
│   HYPER-    │   │  COMPONENTES    │
│   FRAMES    │   │   REACT/UI     │
│ (Vídeo)     │   │   Tailwind     │
│ HTML → MP4  │   └─────────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  REMOTION   │  ← Complementary: React-based video
│ (Vídeo)     │    Skill: npx skills add remotion-dev/skills
│ React → MP4 │
└─────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│        ASSETS FINAIS                    │
│   Logo • Icons • Videos • UI           │
│   Design System • Componentes          │
└─────────────────────────────────────────┘
```

---

## FASE 0 — PRÉ-REQUISITOS + SETUP IA

### Checklist de Preparação

- [ ] Conta Google AI Studio (para Nano-Banana — Gemini API key)
- [ ] FFmpeg + ImageMagick instalados (para transparent mode no Nano-Banana)
- [ ] Node.js >= 22 (para Hyperframes)
- [ ] Python 3.x (para UI UX Pro Max)
- [ ] Bun instalado (para Nano-Banana v2)
- [ ] Skill do Content Brain Builder instalada (opcional — para estratégia)

### Setup do Stack IA — Comandos

```bash
# 1. Nano-Banana v2 (geração de imagens via Gemini)
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2
bun install
bun link  # disponíveis globally como 'nano-banana'

# Configurar API key
mkdir -p ~/.nano-banana
echo "GEMINI_API_KEY=your_key_here" > ~/.nano-banana/.env
# Get key at: https://aistudio.google.com/app/apikey

# 2. Hyperframes (vídeo via HTML — agent-native)
npx skills add heygen-com/hyperframes

# 3. UI UX Pro Max (design intelligence)
npm install -g uipro-cli

# 4. Remotion (vídeo via React - skill oficial)
npx skills add remotion-dev/skills
# ou dentro do projeto de vídeo: npx remotion skills add

# 5. (Opcional) Content Brain Builder — para estratégia de marca
# Baixar skill em: https://www.notion.so/Content-Brain-Builder
```

### Gerar Design System Kaven via IA

```bash
# Gerar design system específico para "SaaS AI Framework" usando UI UX Pro Max
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI framework developer tool" \
  --design-system \
  -f markdown \
  -p "Kaven" \
  --persist

# Resultado: design-system/MASTER.md com:
# - Pattern recomendado
# - Estilo (cores, fontes, effects)
# - Anti-patterns a evitar
# - Pre-delivery checklist
```

---

## FASE 1 — ASSETS CORE (SEMANA 1)

### 1.1 Logo — Pipeline Nano-Banana

**Abordagem: Gerar base → Iterar → Refinar manualmente**

| Arquivo                        | Comando Nano-Banana                                                                                                       | Flags              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `kaven-logo-primary-color.svg` | `nano-banana "minimalist tech logo KAVEN text bold sans-serif, chameleon tail motif, green orange accents, clean vector"` | `-t` (transparent) |
| `kaven-logo-white.svg`         | Mesmo prompt, editar fill para branco                                                                                     | —                  |
| `kaven-logo-black.svg`         | Mesmo prompt, editar fill para preto                                                                                      | —                  |
| `kaven-kai-icon.svg`           | `nano-banana "cute chameleon mascot icon, green emerald color, simple flat vector, mascot style"`                         | `-t`               |

**Prompt otimizado para Kaven:**

```
"Minimalist tech logo 'KAVEN' in bold geometric sans-serif,
subtle chameleon tail as letter 'K', professional SaaS aesthetic,
green #10B981 and orange #F97316 accent colors, clean vector style, white background"
```

**Workflow de iteração:**

```bash
# Gerar versão inicial
nano-banana "prompt acima" -o kaven-logo-v1

# Iterar para refinamento
nano-banana "make the chameleon tail more subtle, greener shade" \
  -r kaven-logo-v1.png -o kaven-logo-v2
```

### 1.2 Kai (Camaleão) — Estados via Nano-Banana

| Estado             | Prompt                                                                                                                  | flags   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| `kai-idle.svg`     | "cute chameleon mascot sitting curious, emerald green #10B981, simple flat vector, mascot style"                        | `-t`    |
| `kai-success.svg`  | "happy confident chameleon, orange #F97316, celebration pose, arms up, simple flat vector"                              | `-t`    |
| `kai-thinking.svg` | "chameleon with question mark, gradient green to cyan, thinking expression, minimal style"                              | `-t`    |
| `kai-gradient.png` | "chameleon with flowing gradient green #10B981 to cyan #00D9FF to orange #F97316, ethereal glowing, abstract art style" | `-s 2K` |
| `kai-walk.gif`     | (Não via Nano-Banana — requer animação manual ou Hyperframes)                                                           | —       |

**Refinamento:** Usar `--continue` para iterar até满意

### 1.3 Cores — via UI UX Pro Max

**Gerar tokens automaticamente:**

```bash
# Buscar cores específicas para indústria SaaS/AI
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI developer framework" \
  --design-system \
  -f markdown \
  --domain colors \
  -p "Kaven"

# Resultado esperado:
# - Primary, secondary, accent colors
# - Neutral palette
# - Feedback colors (success, warning, error)
```

**Cross-reference com brandbook:**

- Verificar se cores geradas = brandbook (#10B981 green, #F97316 orange, #00D9FF cyan)
- Ajustar manualmente se necessário

### 1.4 Tipografia — via UI UX Pro Max

```bash
# Buscar typography pairing para tech SaaS
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "tech SaaS developer tool AI framework" \
  --domain typography \
  -p "Kaven"

# Resultado esperado:
# - Heading fonts (Space Grotesk ou similar)
# - Body fonts (Inter ou similar)
# - Monospace para código (JetBrains Mono)
```

**Verificar no Google Fonts:**

- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk
- Inter: https://fonts.google.com/specimen/Inter

---

## FASE 2 — WEBSITE/LANDING (SEMANA 1-2)

### 2.1 Homepage — Pipeline Completo

**Fase A: Design System (UI UX Pro Max)**

```bash
# Gerar guidelines completas para landing page
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI developer framework landing page" \
  --design-system \
  -f markdown \
  -p "Kaven" \
  --persist
```

**Fase B: Component Building (ux-design-expert)**

```bash
# Ativar agent local
@ux-design-expert

# Comandos sequenciais
*setup                          # Inicializar design system
*build button                  # Button component
*build input                   # Input component
*build card                    # Card component
*compose hero-section          # Hero molecule
*document                      # Gerar documentação
```

**Fase C: Website UI via UI UX Pro Max**

```
Prompt ao UI UX Pro Max:
"Build a landing page for Kaven - AI development framework SaaS,
dark theme (black #0A0A0A background), tech aesthetic,
primary color green #10B981, accent orange #F97316,
features: code generation, automation, integration,
use Space Grotesk for headings, Inter for body,
include: header with nav, hero with CTA, features grid,
pricing section, footer"
```

**Fase D: Vídeo Demo (Hyperframes) — opcional**

Para vídeos de produto/demos:

```html
<!-- Exemplo de composição Hyperframes -->
<div
  id="stage"
  data-composition-id="kaven-demo"
  data-width="1920"
  data-height="1080"
  data-start="0"
  data-duration="15"
>
  <!-- Background video -->
  <video
    id="bg-clip"
    data-start="0"
    data-duration="15"
    src="code-typing.mp4"
    muted
    playsinline
  ></video>

  <!-- Gradient overlay -->
  <div
    id="overlay"
    data-start="0"
    data-duration="15"
    style="background: linear-gradient(135deg, #10B981 0%, #00D9FF 50%, #F97316 100%); opacity: 0.3;"
  ></div>

  <!-- Logo -->
  <img
    id="kaven-logo"
    data-start="1"
    data-duration="13"
    src="kaven-logo-white.svg"
    style="opacity: 0; transform: translate(800px, 50px);"
  />

  <!-- Text -->
  <div id="headline" data-start="2" data-duration="10">
    <h1 style="font-family: Space Grotesk; color: white;">
      The System that Creates Systems
    </h1>
  </div>

  <!-- Audio (opcional) -->
  <audio
    id="bg-music"
    data-start="0"
    data-duration="15"
    src="upbeat-tech.mp3"
    data-volume="0.3"
  ></audio>
</div>
```

**Prompt simplificado para Hyperframes (via agente):**

```
Using /hyperframes, create a 15-second product demo video for Kaven SaaS,
with fade-in logo (white), background video of code/tech,
subtle green→cyan→orange gradient overlay,
headline "The System that Creates Systems" in Space Grotesk,
CTA button at end. Use brand colors.
```

### 2.2 Implementação — Estrutura de Componentes

```
apps/tenant/src/components/id-visual/
├── colors.ts          // Tokens do design system
├── typography.ts     // Font configurations
├── buttons/
│   ├── ButtonPrimary.tsx    // Green #10B981
│   ├── ButtonSecondary.tsx  // Outline green
│   └── ButtonTertiary.tsx   // Text only
├── Kai/
│   ├── KaiIcon.tsx          // SVG icon
│   ├── KaiEmpty.tsx         // Empty state
│   ├── KaiLoading.tsx       // Loading animation
│   └── index.ts
├── Logo/
│   ├── LogoHorizontal.tsx
│   ├── LogoVertical.tsx
│   └── LogoIcon.tsx
└── index.ts
```

---

## FASE 3 — PRODUTO/SaaS (SEMANA 2)

### 3.1 Dashboard UI — via ux-design-expert

```bash
@ux-design-expert

# Pipeline completo de design system
*audit ./src/ui          # Se existir código anterior
*tokenize                # Extrair tokens de cores existentes
*setup                   # Setup design system
*build button            # Componentes atômicos
*build input
*build select
*build card
*build modal
*build sidebar           # Organism: sidebar
*build header            # Organism: header
*compose dashboard-layout # Template
*document                # Gerar documentação
*a11y-check              # Validar acessibilidade
```

### 3.2 Estados de UI — via Nano-Banana

**Empty State:**

```bash
nano-banana "cute chameleon looking curious, empty state illustration,
green #10B981 color, minimal flat style, tech startup aesthetic,
white background" -o kai-empty -t
```

**Loading State:**

```bash
nano-banana "chameleon thinking with spinning elements,
gradient green #10B981 to cyan #00D9FF, loading animation concept,
minimal style, dark background" -o kai-loading
```

**Success State:**

```bash
nano-banana "happy chameleon celebrating, confetti,
orange #F97316 color, success celebration illustration,
minimal flat vector" -o kai-success
```

### 3.3 Code Highlighting — Tokens já definidos

Do brandbook, aplicar no tema:

```css
.code-block {
  background: #0a0a0a;
  border-radius: 8px;
  padding: 24px;
}

.code-function {
  color: #00d9ff;
} /* Ciano - Kaven cyan */
.code-variable {
  color: #10b981;
} /* Verde - Kaven green */
.code-string {
  color: #f97316;
} /* Laranja - Kaven orange */
.code-keyword {
  color: #ffffff;
} /* Branco */
.code-comment {
  color: #6a6a6a;
} /* Cinza 500 */
```

---

## FASE 4 — REDES SOCIAIS (SEMANA 2-3)

### 4.1 LinkedIn

#### Profile Picture (Nano-Banana)

```bash
nano-banana "chameleon mascot avatar, green #10B981 color,
minimalist, circle frame, tech startup logo style,
transparent background" -o linkedin-profile -t
```

#### Cover/Banner (Nano-Banana)

```bash
nano-banana "abstract tech background, dark theme #0A0A0A,
green #10B981 and cyan #00D9FF geometric shapes,
code pattern subtle overlay, professional" -o linkedin-banner -s 2K -a 16:9
```

#### Carousel (Hyperframes)

```
Using /hyperframes, create a 9-slide LinkedIn carousel for Kaven:

Slide 1 (Cover):
- Background: gradient green #10B981 → cyan #00D9FF
- Title: "The System that Creates Systems" (Space Grotesk, white)
- Logo: kaven-logo-white.svg bottom-right

Slides 2-8 (Content):
- Icon: 64px green #10B981 (Lucide icons)
- Title: H2, white
- Bullets: 3-4 pontos, cinza #CACACA
- Number: bottom-right corner

Slide 9 (CTA):
- Background: orange #F97316
- Text: "Let's build together" white
- Kai: kai-success illustration center

Specs: 1080x1080px, output as image sequence
```

### 4.2 Twitter/X

#### Profile (Nano-Banana)

```bash
nano-banana "chameleon icon, green #10B981, minimalist,
circle transparent background, tech startup" -o twitter-profile -t
```

#### Header (Nano-Banana)

```bash
nano-banana "dark tech background, #0A0A0A,
green #10B981 and cyan #00D9FF mesh gradient subtle,
abstract geometric shapes" -o twitter-header -s 2K -a 3:1
```

#### Tweet Images (Hyperframes)

```
Using /hyperframes, create a 1200x675px tweet image for Kaven:
- Dark background #0A0A0A
- Green accent #10B981 as border/frame
- Text area for quote/statistic
- Subtle gradient overlay
- Export as PNG
```

### 4.3 Instagram

#### Profile (Nano-Banana)

```bash
nano-banana "chameleon mascot, green #10B981,
minimalist, clean, tech aesthetic" -o instagram-profile -t
```

#### Feed Posts (Nano-Banana + Hyperframes)

```bash
# Post simples
nano-banana "quote graphic, dark background #0A0A0A,
green #10B981 accent, minimal typography,
Kaven brand" -o instagram-post-1 -a 1:1
```

#### Stories (Hyperframes)

```
Using /hyperframes, create 1080x1920 Instagram story template:
- Vertical layout
- Background: dark #0A0A0A with subtle gradient
- Swipe-up CTA placeholder
- Placeholder for animated text reveals
- Brand colors throughout
- Green #10B981 accent elements
```

### 4.4 TikTok

#### Videos (Hyperframes)

```
Using /hyperframes, create 30-second TikTok video for Kaven:
- Format: 9:16 vertical
- Hook: Large text "Build faster with AI" (Space Grotesk, white)
- Quick feature highlights: 3-4 segundos cada
- Transitions: green #10B981 → cyan #00D9FF → orange #F97316
- Background music placeholder
- CTA: "Try Kaven free" at end
- Total: 30s, output MP4
```

---

## FASE 5 — MATERIAIS DE MARKETING (SEMANA 3)

### 5.1 Email Marketing

#### Header (Nano-Banana)

```bash
nano-banana "email header banner, Kaven logo centered,
dark theme #0A0A0A background, minimal,
professional business style, 600x100" -o email-header -a 6:1
```

#### Assinatura (Nano-Banana)

```bash
nano-banana "email signature, Kaven logo small,
minimal design, dark theme" -o email-signature -a 4:1
```

### 5.2 Apresentações (Hyperframes)

#### Pitch Deck Video

```
Using /hyperframes, create 60-second pitch deck video:
Slide 1: Cover
- Gradient background (green → cyan)
- Logo white center
- Tagline: "The System that Creates Systems"

Slide 2: Problem
- Dark background
- Text: "Building software is slow"

Slide 3: Solution
- Product screenshot placeholder
- "Kaven: AI-powered development"

Slide 4: Features
- 3-column grid with icons
- Green accent borders

Slide 5: CTA
- Orange #F97316 background
- "Start building today"
- Contact info

Transitions: smooth fade, 3s per slide
Output: MP4 1920x1080
```

### 5.3 Assets Adicionais

| Asset                    | Ferramenta    | Comando                                                             |
| ------------------------ | ------------- | ------------------------------------------------------------------- |
| Blog cover images        | Nano-Banana   | `nano-banana "tech blog cover abstract dark" -a 16:9 -o blog-cover` |
| Social posts             | Nano-Banana   | `nano-banana "quote graphic tech" -a 1:1 -o social-post`            |
| Presentation backgrounds | UI UX Pro Max | Buscar via design system                                            |
| Demo videos              | Hyperframes   | Via prompt                                                          |

---

## FASE 6 — VALIDAÇÃO FINAL

### Checklist de Qualidade IA

- [ ] Logo gerado via Nano-Banana está alinhado ao brandbook
- [ ] Cores do design system = brandbook (#10B981 green, #F97316 orange, #00D9FF cyan)
- [ ] Fonts Space Grotesk + Inter configuradas
- [ ] Vídeos Hyperframes seguem brand guidelines
- [ ] Imagens transparentsgeradas corretamente (ícones)
- [ ] Components ux-design-expert follow tokens
- [ ] Diretório `docs/id-visual/` organizado

---

## 📊 CUSTOS ESTIMADOS (Gemini API)

| Operação                | Tamanho | Custo unitário | Quantidade | Total      |
| ----------------------- | ------- | -------------- | ---------- | ---------- |
| Logo (transparent)      | 1K      | $0.067         | 4          | $0.27      |
| Kai mascot states       | 1K-2K   | $0.067-$0.101  | 5          | $0.40      |
| Social images           | 1K      | $0.067         | 10         | $0.67      |
| LinkedIn carousel       | 1K      | $0.067         | 9          | $0.60      |
| Blog covers             | 2K      | $0.101         | 3          | $0.30      |
| **Total Fase 1**        | —       | —              | —          | **~$2.24** |
| **Total implementação** | —       | —              | —          | **~$5-8**  |

_Nota: Custos com Gemini 3.1 Flash. Pro é 2x mais caro._

---

## 🧠 DECISÕES TOMADAS

### Stack Final (cada ferramenta tem propósito específico):

| Categoria         | Ferramenta                    | Rationale                                                      |
| ----------------- | ----------------------------- | -------------------------------------------------------------- |
| **Imagens**       | Nano-Banana                   | Agent-native, transparent mode, multi-res, cost tracking       |
| **Vídeo**         | Hyperframes                   | Agent-native desde design, HTML→MP4 determinístico, 50+ blocks |
| **Design System** | UI UX Pro Max                 | 67 estilos, 161 industries, auto-generation, anti-patterns     |
| **Código UI**     | ux-design-expert (AIOX local) | Atomic Design, tokens, componentes React, WCAG                 |
| **Estratégia**    | Content Brain Builder         | Define marca antes de criar (opcional)                         |

### Stack Final Atualizado (incluindo Remotion!):

| Categoria         | Ferramenta                    | Rationale                                                  |
| ----------------- | ----------------------------- | ---------------------------------------------------------- |
| **Imagens**       | Nano-Banana                   | Agent-native, transparent mode, multi-res, cost tracking   |
| **Vídeo**         | Hyperframes + Remotion        | Ambos agent-native, complementares                         |
| **Design System** | UI UX Pro Max                 | 67 estilos, 161 industries, auto-generation, anti-patterns |
| **Código UI**     | ux-design-expert (AIOX local) | Atomic Design, tokens, componentes React, WCAG             |
| **Estratégia**    | Content Brain Builder         | Define marca antes de criar (opcional)                     |

### O que foi DESCARTADO e PORQUÊ:

| Ferramenta            | Razão do descarte                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~**Remotion**~~      | ~~DESCARTADO ERRADO~~ — **REINCLUÍDO**: Tem skill oficial (`npx skills add remotion-dev/skills`), free para até 3 pessoas, agente pode usar diretamente |
| **Canva manual**      | Fricção alta; não versionável; workflow isolado                                                                                                         |
| **Figma manual**      | Não integra com pipeline de código; trabalho manual                                                                                                     |
| **DALL-E/Midjourney** | Não têm CLI/API integrada como Nano-Banana; menos controle                                                                                              |
| **Midjourney**        | Sem MCP/skill para integração direta                                                                                                                    |

---

## 📦 PRÓXIMOS PASSOS — EXECUÇÃO

### Antes de começar (Setup completo):

```bash
# Clone e setup
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2 && bun install && bun link
npx skills add heygen-com/hyperframes
npm install -g uipro-cli

# Configurar API key
mkdir -p ~/.nano-banana
echo "GEMINI_API_KEY=your_key" > ~/.nano-banana/.env
```

### Workflow recomendado (ordem):

```
1. [Opcional] Content Brain Builder → Define estratégia de marca
2. UI UX Pro Max → Gera design system + guidelines (MASTER.md)
3. Nano-Banana → Gera logo, Kai, assets visuais
4. ux-design-expert → Cria componentes React/UI + tokens
5. Hyperframes → Cria vídeos para redes/produto
```

### Priorização P0-P3:

```
P0 (Crítico):
  1. Nano-Banana: Logo (todos os formatos) + Kai icon
  2. UI UX Pro Max: Design tokens (cores, fonts, styles)
  3. Hyperframes: Setup (preview, render test)

P1 (Alto):
  4. Nano-Banana: Estados de UI (empty, loading, success)
  5. ux-design-expert: Button, card, sidebar components
  6. Nano-Banana: Profile pictures redes

P2 (Médio):
  7. Hyperframes: LinkedIn carousel template
  8. UI UX Pro Max: Website layout guidelines
  9. ux-design-expert: Email signature component

P3 (Baixo):
  10. Hyperframes: TikTok/Reels templates
  11. Nano-Banana: Blog covers, presentation assets
  12. UI UX Pro Max: Pitch deck design system
```

---

## 🔧 TROUBLESHOOTING

### Nano-Banana

| Problema                 | Solução                                 |
| ------------------------ | --------------------------------------- |
| "API key not found"      | Verificar `cat ~/.nano-banana/.env`     |
| "FFmpeg not found"       | `brew install ffmpeg` (macOS)           |
| "ImageMagick not found"  | `brew install imagemagick`              |
| Images muito grandes     | Usar `-s 512` ou `-s 1K`                |
| Transparent não funciona | Verificar se `-t` flag está sendo usado |

### Hyperframes

| Problema               | Solução                                   |
| ---------------------- | ----------------------------------------- |
| "Node version too old" | `nvm use 22` ou upgrade Node.js           |
| "FFmpeg not found"     | `brew install ffmpeg`                     |
| Preview não carrega    | Verificar porta (default 3000) disponível |
| Render slow            | Usar `-s` menor para teste                |

### UI UX Pro Max

| Problema                  | Solução                               |
| ------------------------- | ------------------------------------- |
| "Python not found"        | `brew install python3`                |
| Script não encontrado     | Verificar instalação: `which python3` |
| Resultados não relevantes | Adicionar mais contexto no prompt     |

---

## 📎 ARQUIVOS RELACIONADOS

- `docs/id-visual/automation-tools.md` — Análise completa das ferramentas IA
- `docs/id-visual-implementation-guide.md` — Guia original (sem IA)
- `docs/design/brandbook-v2.0.1.pt.md` — Brandbook fonte
- `docs/id-visual/` — Assets finais (a criar)

---

**Status deste guide:** Draft — testar pipeline e iterar  
**Próxima revisão:** Após primeiro teste de geração de logo via Nano-Banana  
**Owner:** Chris

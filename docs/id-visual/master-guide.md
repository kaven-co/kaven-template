---
id: id-visual-master-guide
title: Kaven ID Visual — Master Guide com IA
status: draft
type: guide
audience: internal
owner: chris
created: 2026-04-18
priority: p0
---

# 🎨 KAVEN ID VISUAL — MASTER GUIDE

**Objetivo:** Implementar a identidade visual do Kaven com mínimo trabalho manual, máximo uso de IA.  
**Resultado esperado:** Toolkit completo — logo, cores, fonts, componentes, vídeos, templates — tudo gerado via IA.

---

## 📋 STACK DE FERRAMENTAS IA

| Categoria         | Ferramenta            | Install                                 |
| ----------------- | --------------------- | --------------------------------------- |
| **Imagens**       | Nano-Banana (Gemini)  | `git clone ... && bun link`             |
| **Vídeo**         | Hyperframes (HeyGen)  | `npx skills add heygen-com/hyperframes` |
| **Vídeo**         | Remotion (React)      | `npx skills add remotion-dev/skills`    |
| **Design System** | UI UX Pro Max         | `npm install -g uipro-cli`              |
| **Código UI**     | ux-design-expert      | `@ux-design-expert` (local)             |
| **Estratégia**    | Content Brain Builder | (opcional) Baixar skill                 |

**Por que este stack:**

- Todos são **agent-native** (funcionam com Claude Code via skill)
- Minimize fricção (sem plataformas externas manual)
- Versionável e auditável (código, não binários)
- Free ou baixo custo (vs Figma/Canva manual)

---

## 📊 MAPA DE FERRAMENTAS POR FASE

| Fase             | Output                    | Ferramentas                          | Como usar                                                     |
| ---------------- | ------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| **0. Prep**      | Setup + Design System     | UI UX Pro Max                        | `python3 ... --design-system -p Kaven`                        |
| **1. Core**      | Logo, Kai, cores, fonts   | Nano-Banana + UI UX Pro Max          | `nano-banana "prompt" -t -o logo`                             |
| **2. Website**   | Landing + componentes     | ux-design-expert + UI UX Pro Max     | `*build button`, `*setup`                                     |
| **3. Produto**   | Dashboard + estados       | ux-design-expert + Nano-Banana       | `*tokenize`, `*build sidebar`, `nano-banana ... -o kai-empty` |
| **4. Redes**     | Posts, carousels, stories | Hyperframes + Remotion + Nano-Banana | Prompt: "criar carousel LinkedIn..."                          |
| **5. Marketing** | Materiais diversos        | Todas as ferramentas                 | Conforme necessidade                                          |

---

## 🛠️ ANÁLISE COMPLETA DAS FERRAMENTAS

### 1. Nano-Banana (Geração de Imagens via Gemini)

**O que faz:** CLI de geração de imagens via Google Gemini (3.1 Flash → 3 Pro).  
**Link:** https://github.com/kingbootoshi/nano-banana-2-skill

**Features:**

- Multi-resolution: 512, 1K, 2K, 4K
- Multi-aspect: 1:1, 16:9, 9:16, 4:3, 21:9
- **Transparent mode**: `-t` (green screen → remove background)
- **Reference images**: edit, transform, style transfer
- **Cost tracking**: `~/.nano-banana/costs.json`

**Install:**

```bash
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2 && bun install && bun link
echo "GEMINI_API_KEY=xxx" > ~/.nano-banana/.env
```

**Exemplos de uso:**

```bash
# Logo com transparência
nano-banana "minimalist tech logo KAVEN, chameleon tail, green orange" -t -o kaven-logo

# Kai mascot
nano-banana "cute chameleon mascot, green emerald, flat vector" -t -o kai

# Estados de UI
nano-banana "chameleon thinking, loading, gradient green cyan" -o kai-loading
nano-banana "cute chameleon curious, empty state, tech startup" -o kai-empty
```

**Custos:** 512: $0.045 | 1K: $0.067 | 2K: $0.101 | 4K: $0.151

**Veredicto:** ✅ EXCELENTE — O Ger "piece missing" da geração de imagens.

---

### 2. Hyperframes (Vídeo via HTML — Agent-native)

**O que faz:** Framework HeyGen que transforma HTML/CSS/JS em MP4. Feito para agente.  
**Link:** https://github.com/heygen-com/hyperframes

**Features:**

- Agent-native desde o design (não é "editor com IA")
- 50+ blocks prontos (social overlays, charts, transições)
- Renderização determinística (mesmo input = mesmo output)
- Código do vídeo de lançamento liberado

**Install:**

```bash
npx skills add heygen-com/hyperframes
```

**Use via agente:**

```
Using /hyperframes, create a 15-second product demo video for Kaven,
with fade-in logo (white), green→cyan gradient overlay,
headline "The System that Creates Systems" in Space Grotesk.
```

**Veredicto:** ✅ EXCELENTE — Para vídeos curtos, demos, social media.

---

### 3. Remotion (Vídeo via React — Agent-native via Skills!)

**O que faz:** Framework React para criar vídeos programáticos.  
**Link:** https://github.com/remotion-dev/remotion + https://remotion.dev/docs/ai/skills

**Features:**

- **Skill oficial:** `npx skills add remotion-dev/skills`
- 35+ templates prontos
- Fast Refresh durante desenvolvimento
- Free para até 3 pessoas (uso comercial)
- Used by: Fireship, GitHub Unwrapped

**License:** Free (indivíduos/equipes até 3) | Company License ($250+ para 4+)

**Install:**

```bash
npx skills add remotion-dev/skills
# ou dentro do projeto: npx remotion skills add
```

**Veredicto:** ✅ EXCELENTE — Complementar ao Hyperframes (React vs HTML).

---

### 4. UI UX Pro Max (Design Intelligence)

**O que faz:** Skill de design intelligence com Design System Generator.  
**Link:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

**Features:**

- 67 UI Styles (Glassmorphism, Brutalism, Dark Mode, etc)
- 161 Color Palettes (por indústria)
- 57 Font Pairings
- 161 Reasoning Rules (por tipo de produto)
- 15 Tech Stacks (React, Next.js, Vue, etc)
- Pre-delivery checklist automático

**Install:**

```bash
npm install -g uipro-cli
```

**Use:**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI framework" --design-system -f markdown -p "Kaven" --persist
```

**Veredicto:** ✅ MUITO BOM — Para design system e guidelines.

---

### 5. ux-design-expert (AIOX Local)

**O que é:** Agent local do Kaven Framework.  
**Link:** `.aiox-core/development/agents/ux-design-expert.md`

**Persona:** "Uma" — UX/UI Designer + Design System Architect

**Metodologia:** Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

**Comandos (5 fases):**
| Fase | Comandos | O que faz |
|------|---------|-----------|
| 1. UX Research | `*research`, `*wireframe` | User research, wireframes |
| 2. Audit | `*audit`, `*consolidate` | Scan redundâncias |
| 3. Tokens | `*tokenize`, `*setup` | Extract tokens |
| 4. Build | `*build`, `*compose` | Criar componentes |
| 5. Quality | `*document`, `*a11y-check` | Docs, acessibilidade |

**Use:**

```bash
@ux-design-expert
*setup
*build button
*build card
*compose hero-section
*document
```

**Veredicto:** ✅ COMPLEMENTAR — Agent local de design systems.

---

### 6. Content Brain Builder (Estratégia de Marca)

**O que faz:** Skill que gera Content Brain da marca via entrevista.  
**Link:** https://www.notion.so/Content-Brain-Builder

**Entrega:**

- Posicionamento + mensagem central
- 4 pilares de conteúdo
- Público-alvo com dores/desejos
- Tom de voz + regras editoriais
- Arquivos: HTML + PDF + skill

**Use:** Baixar skill do Notion e seguir instruções.

**Veredicto:** ✅ COMPLEMENTAR — Para estratégia (não produção).

---

## 🚀 SETUP COMPLETO

```bash
# 1. Nano-Banana (imagens)
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
cd ~/tools/nano-banana-2 && bun install && bun link

# Configurar API key
mkdir -p ~/.nano-banana
echo "GEMINI_API_KEY=$(gcloud auth print-access-token)" > ~/.nano-banana/.env

# 2. Hyperframes (vídeo)
npx skills add heygen-com/hyperframes

# 3. Remotion (vídeo React)
npx skills add remotion-dev/skills

# 4. UI UX Pro Max (design)
npm install -g uipro-cli

# 5. Python 3.x (se necessário)
brew install python3
```

---

## 📋 WORKFLOW POR FASE

### FASE 1 — ASSETS CORE (Logo, Kai, Cores, Fonts)

**1.1 Logo via Nano-Banana:**

```bash
# Logo principal
nano-banana "minimalist tech logo KAVEN, chameleon tail,
green #10B981 orange #F97316, white background" -t -o kaven-logo

# Kai icon
nano-banana "cute chameleon mascot, green #10B981,
flat vector, simple" -t -o kai-icon
```

**1.2 Kai Estados:**

```bash
nano-banana "chameleon curious, green #10B981" -t -o kai-idle
nano-banana "chameleon celebrating, orange #F97316" -t -o kai-success
nano-banana "chameleon thinking, gradient green cyan" -t -o kai-thinking
```

**1.3 Cores via UI UX Pro Max:**

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "SaaS AI framework developer tool" --design-system -p Kaven
```

**1.4 Fonts:**

- Space Grotesk (Headings): https://fonts.google.com/specimen/Space+Grotesk
- Inter (Body): https://fonts.google.com/specimen/Inter

---

### FASE 2 — WEBSITE/LANDING

**Via ux-design-expert:**

```bash
@ux-design-expert
*setup
*build button
*build input
*build card
*compose hero-section
*document
```

**Via UI UX Pro Max:**

```
Prompt: "Build a landing page for Kaven - AI development framework SaaS,
dark theme #0A0A0A, primary color #10B981 green, accent #F97316 orange,
Space Grotesk headings, Inter body, features grid, pricing, footer"
```

---

### FASE 3 — PRODUTO/SaaS

**Dashboard via ux-design-expert:**

```bash
@ux-design-expert
*audit ./src/ui
*tokenize
*build sidebar
*build header
*compose dashboard-layout
*a11y-check
```

**Estados de UI via Nano-Banana:**

```bash
nano-banana "cute chameleon empty state, green" -o kai-empty
nano-banana "chameleon loading, green cyan gradient" -o kai-loading
nano-banana "chameleon success, orange confetti" -o kai-success
```

---

### FASE 4 — REDES SOCIAIS

**LinkedIn:**

```bash
# Profile
nano-banana "chameleon avatar green, transparent" -t -o linkedin-profile

# Banner
nano-banana "tech background dark green cyan mesh" -s 2K -a 16:9 -o linkedin-banner
```

**Carousel via Hyperframes:**

```
Using /hyperframes, create a 9-slide LinkedIn carousel:
- Slide 1: Cover green→cyan gradient, title
- Slides 2-8: Content icons + bullets
- Slide 9: CTA orange background
```

---

### FASE 5 — MARKETING

**Email Header:**

```bash
nano-banana "email header Kaven logo dark minimal" -a 6:1 -o email-header
```

**Pitch Deck via Hyperframes:**

```
Using /hyperframes, create 60-second pitch deck:
- Slide 1: Cover gradient green→cyan
- Slide 2: Problem
- Slide 3: Solution
- Slide 4: Features
- Slide 5: CTA orange
```

---

## 💰 CUSTOS ESTIMADOS (Gemini API)

| Operação          | Tamanho | Custo         | Qtd | Total |
| ----------------- | ------- | ------------- | --- | ----- | ---------- |
| Logo + variação   | 1K      | $0.067        | 4   | $0.27 |
| Kai states        | 1K-2K   | $0.067-$0.101 | 5   | $0.40 |
| Social images     | 1K      | $0.067        | 10  | $0.67 |
| LinkedIn carousel | 1K      | $0.067        | 9   | $0.60 |
| Blog covers       | 2K      | $0.101        | 3   | $0.30 |
| **Total**         |         |               |     |       | **~$2.24** |

**Total implementação completa:** ~$5-8

---

## 🧠 DECISÕES TOMADAS

| Incluído                  | Rationale                                                  |
| ------------------------- | ---------------------------------------------------------- |
| **Nano-Banana**           | Geração de imagens via IA, transparent mode, cost tracking |
| **Hyperframes**           | Vídeo via HTML, agent-native, open-source                  |
| **Remotion**              | Vídeo via React, skill oficial, free para até 3 pessoas    |
| **UI UX Pro Max**         | Design system generator, 67 estilos, 161 industries        |
| **ux-design-expert**      | Agent local, Atomic Design, componentes React              |
| **Content Brain Builder** | Opcional — define estratégia de marca                      |

| Descartado        | Reason                             |
| ----------------- | ---------------------------------- |
| Canva manual      | Fricção alta, não versionável      |
| Figma manual      | Não integra com pipeline de código |
| DALL-E/Midjourney | Sem CLI integrada como Nano-Banana |

---

## ✅ PRÓXIMOS PASSOS

### Setup (uma vez):

```bash
git clone .../nano-banana-2-skill ~/tools/nano-banana-2 && bun link
npx skills add heygen-com/hyperframes
npx skills add remotion-dev/skills
npm install -g uipro-cli
echo "GEMINI_API_KEY=xxx" > ~/.nano-banana/.env
```

### Priorização:

```
P0 (Crítico):
  1. Nano-Banana: Logo + Kai icon
  2. UI UX Pro Max: Design tokens
  3. Hyperframes/Remotion: Setup test

P1 (Alto):
  4. Nano-Banana: Estados UI (empty, loading, success)
  5. ux-design-expert: Button + Card components
  6. Nano-Banana: Profile pictures redes

P2 (Médio):
  7. Hyperframes: LinkedIn carousel
  8. UI UX Pro Max: Website guidelines
  9. ux-design-expert: Email signature

P3 (Baixo):
  10. Hyperframes: TikTok templates
  11. Nano-Banana: Blog covers
  12. UI UX Pro Max: Pitch deck
```

---

## 📎 ARQUIVOS RELACIONADOS

- `docs/id-visual/automation-tools.md` — Análise das ferramentas (este doc subsume)
- `docs/id-visual/ai-implementation-guide.md` — Guia IA (superseded)
- `docs/id-visual-implementation-guide.md` — Guia original (referência)
- `docs/design/brandbook-v2.0.1.pt.md` — Brandbook fonte
- `docs/id-visual/` — Assets finais (a criar)

---

**Status:** Draft — iterar após primeiro teste  
**Próxima revisão:** Após geração de logo via Nano-Banana  
**Owner:** Chris

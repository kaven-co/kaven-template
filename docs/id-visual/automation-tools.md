# ID Visual Kaven — Ferramentas de Automação

## Objetivo

Minimizar fricção de plataformas externas e trabalho manual na criação de assets de ID visual.
Usar modelos de IA para gerar tudo por aqui (código).

---

## Ferramentas Estudadas

| #   | Ferramenta                    | Status       |
| --- | ----------------------------- | ------------ |
| 1   | Hyperframes (HeyGen)          | ✅ Analisado |
| 2   | Remotion                      | ✅ Analisado |
| 3   | Content Brain Builder         | ✅ Analisado |
| 4   | UI UX Pro Max                 | ✅ Analisado |
| 5   | ux-design-expert (AIOX local) | ✅ Analisado |
| 6   | Nano-Banana (MCP + Skill)     | ✅ Analisado |
| 7   | —                             | ⏳ Próximo   |

---

## Análises por Ferramenta

### 1. Hyperframes — Renderização de Vídeo via HTML (Agent-native)

**Link:** https://github.com/heygen-com/hyperframes

**O que faz:**
Framework open-source da HeyGen que transforma HTML, CSS e JavaScript em MP4 renderizado. Foi desenhado para ter **agente de IA como usuário principal** — não humano em timeline. O vídeo de lançamento da própria HeyGen foi gerado usando Claude Code + HyperFrames.

**Conceito Central (do artigo do Caio Imori):**

- Vídeo deixa de ser artefato de timeline proprietária
- Viram código versionável, auditável, reproduzível
- Agente opera diretamente no código-fonte, humano só revisa resultado

**Stack técnica:**

- HTML + CSS + JavaScript → MP4
- FFmpeg para rendering
- Suporte a GSAP, transições shader, overlays sociais, charts animados

**Pontos fortes:**

- ✅ **Agent-native desde o design** — não é "editor com IA", é runtime projetado para agente
- ✅ Renderização determinística (mesmo input = mesmo output) — pré-requisito para agente operar sozinho
- ✅ 50+ blocks prontos (social overlays, charts, transições)
- ✅ Install via `npx skills add heygen-com/hyperframes` — já funciona com Claude Code, Cursor, etc
- ✅ Open-source (Apache 2.0), código do vídeo de lançamento liberado como exemplo
- ✅ Sem licença comercial complexa
- ✅ Custo marginal de iteração próximo de zero
- ✅ Menos fricção: HTML é a linguagem que agente já domina

**Limitações:**

- ❌ Curva de aprendizado dos data attributes e GSAP
- ❌ Não substitui direção visual autoral ou motion design artesanal
- ❌ Melhor para vídeos curtos, explainers, demos (não para produção cinematográfica)
- ❌ Requer Node.js >= 22 e FFmpeg instalado

**Quando usar:**

- Vídeos curtos para redes sociais em escala
- Demos de produto que atualizam junto com o produto
- Variações A/B de hooks, cortes por idioma, versões por persona

**Veredicto:** ✅ EXCELENTE — Para ID Visual do Kaven, isso é exatamente o que buscamos: mínimo trabalho manual, máximo output por agente. O fato de ser agent-native significa que posso pedir "faz um carousel de 9 slides pro LinkedIn com as cores da Kaven" e ele gera.

---

### 2. Remotion — Vídeo Programático com React (Agent-native via Skills!)

**Link:** https://github.com/remotion-dev/remotion + https://remotion.dev/docs/ai/skills

**O que faz:**
Framework para criar vídeos usando React. Você cria componentes React que renderizam como frames de vídeo, usando CSS, Canvas, SVG, WebGL, etc. Permite usar toda a lógica de programação para criar efeitos dinâmicos.

**🎯 IMPORTANTE — Tem skill oficial!**

```bash
npx skills add remotion-dev/skills
# ou
npx remotion skills add
```

A skill ensina Claude Code a escrever código Remotion correto: `useCurrentFrame()`, `interpolate()`, `spring()`, `<Composition>`, `<Sequence>`, etc.

**Conceito central:**

- Vídeo como componente React
- Herda todo o ecossistema React (componentes, hooks, Fast Refresh)
- Agent-native via skills oficiais

**License:**

- **Free** para indivíduos e equipes de até 3 pessoas
- **Company License** ($250+) para equipes 4+
- Comercial permitido na license free

**Pontos fortes:**

- ✅ **Ecossistema React maduro** (42k stars, 1.4M installs/mês)
- ✅ **Skill oficial** — `npx skills add remotion-dev/skills` — funciona com Claude Code
- ✅ Composable — componentes reutilizáveis, composição poderosa
- ✅ Fast Refresh durante desenvolvimento
- ✅ Suporte a múltiplos formatos (9:16, 16:9, etc)
- ✅ Integração com Lottie, SVGs, Three.js
- ✅ Used by: Fireship, GitHub Unwrapped, 8000+ Discord members
- ✅ 35 templates prontos
- ✅ **License free** para até 3 pessoas (uso comercial permitido)

**Limitações:**

- ❌ License obrigatória para equipes 4+ (a partir de $250/ano)
- ❌ Curva de aprendizado React (precisa saber React)
- ❌ Renderização pode ser lenta para vídeos longos
- ❌ Precisa de projeto dedicado (`npx create-video@latest`)

**Veredicto:** ✅ EXCELENTE — Minha análise anterior estava errada. Remotion TEM skill oficial e É agent-native! Plus: license free para individuals e pequenas equipes (até 3 pessoas). Pode ser usado junto com Hyperframes — ambos são complementares, não competidores.

---

### 3. Content Brain Builder — Estratégia de Conteúdo via Skill

**Link:** https://www.notion.so/Content-Brain-Builder

**O que faz:**
Skill gratuita para Claude que conduz uma entrevista estratégica completa e gera o **Content Brain** da marca — documento central que define quem você é, para quem fala, como fala e o que nunca pode fazer.

**O que entrega:**

- ✅ Posicionamento e mensagem central definidos
- ✅ 4 pilares de conteúdo mapeados
- ✅ Público-alvo com dores e desejos claros
- ✅ Arco de história estruturado (framework 3P)
- ✅ Tom de voz e regras editoriais
- ✅ Arquivos gerados: HTML visual, PDF, e skill instalável

**Conceito central:**

- Entrevista estruturada em 5 etapas (tipo de marca → análise materiais → entrevista → validação → geração)
- Gera um "Estrategista de Conteúdo" configurado no Claude que conhece sua marca completamente
- Daí pra frente, qualquer conversa no projeto já sabe quem é a marca

**Pontos fortes:**

- ✅ skill gratuita, baixa-barreira
- ✅ Processo guiado — não precisa saber estratégia de antemão
- ✅ Saída prática: HTML visual + PDF + skill propia
- ✅ Cria um "segundo cérebro" que lembra da marca em toda conversa
- ✅ Funciona tanto no plano gratuito quanto pago do Claude
- ✅ Para múltiplas marcas — basta criar projetos separados

**Limitações:**

- ❌ Depende do Claude (não funciona em outros LLMs)
- ❌ Requer 20-30 min de entrevista
- ❌ Gera estratégia, não assets visuais
- ❌ Não integra com Hyperframes/Remotion automaticamente

**Quando usar:**

- Quando precisa definir/revisar posicionamento de marca
- Para criar um "contexto" que fica em toda conversa do projeto
- Para marcas novas que ainda não têm estratégia clara
- Para documentar tom de voz e regras editoriais

**Veredicto:** ✅ COMPLEMENTAR — Não compete com Hyperframes/Remotion. É uma ferramenta de **estratégia** (não de produção). Pode ser usado junto: Content Brain define o que dizer, Hyperframes define como entregar visualmente.

---

### 4. [NOME] — [DESCRIÇÃO]

**Link:**

**O que faz:**

**Pontos fortes:**

**Limitações:**

**Veredicto:** ✅ / ❌ — [Resumão]

---

### 4. UI UX Pro Max — Design Intelligence para UI/UX

**Link:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

**O que faz:**
Skill de AI que fornece **design intelligence** para construir UI/UX profissional em múltiplas plataformas e frameworks. O lance forte é o **Design System Generator** — um motor de raciocínio que analisa requisitos do projeto e gera um design system completo e customizado em segundos.

**Feature principal (v2.0): Design System Generator**

```
+----------------------------------------------------------------------------------------+
|  TARGET: Serenity Spa - RECOMMENDED DESIGN SYSTEM                                      |
+----------------------------------------------------------------------------------------+
|  PATTERN: Hero-Centric + Social Proof                                                  |
|  STYLE: Soft UI Evolution (soft shadows, subtle depth, calming, premium)             |
|  COLORS: Primary #E8B4B8, Secondary #A8D5BA, CTA #D4AF37                              |
|  TYPOGRAPHY: Cormorant Garamond / Montserrat                                          |
|  PRE-DELIVERY CHECKLIST:                                                              |
|    [ ] No emojis as icons (use SVG: Heroicons/Lucide)                                 |
|    [ ] cursor-pointer on all clickable elements                                       |
|    [ ] Hover states with smooth transitions                                           |
+----------------------------------------------------------------------------------------+
```

**O que inclui:**

- ✅ **67 UI Styles** — Glassmorphism, Claymorphism, Minimalism, Brutalism, Neumorphism, Bento Grid, Dark Mode, AI-Native UI, etc
- ✅ **161 Color Palettes** — Paletas específicas por indústria alinhadas 1:1 com 161 tipos de produto
- ✅ **57 Font Pairings** — Combinações de tipografia curadas com Google Fonts
- ✅ **25 Chart Types** — Recomendações para dashboards e analytics
- ✅ **15 Tech Stacks** — React, Next.js, Vue, Svelte, SwiftUI, Flutter, HTML+Tailwind, shadcn/ui, etc
- ✅ **99 UX Guidelines** — Best practices, anti-patterns, accessibility rules
- ✅ **161 Reasoning Rules** — Regras específicas por indústria (SaaS, fintech, healthcare, e-commerce, etc)

**Stack técnica:**

- Python 3.x para o search script
- CLI para instalação: `npm install -g uipro-cli`
- Funciona com: Claude Code, Cursor, Windsurf, Codex, Gemini CLI, etc

**Pontos fortes:**

- ✅ **Design System Generator automático** — Analisa descrição do projeto e gera design system completo
- ✅ Cobertura absurda (67 estilos, 161 palettes, 57 fonts, 161 industries)
- ✅ Multi-stack (15 opções diferentes)
- ✅ Anti-patterns por indústria (ex: "não usar gradients roxo/rosa de AI" para banking)
- ✅ Pre-delivery checklist automático (WCAG, responsividade, etc)
- ✅ Persistência de design system (MASTER.md + pages overrides)

**Limitações:**

- ❌ Requer Python 3.x instalado
- ❌ Mais focado em UI generation do que em vídeo/animation
- ❌ Não é "agent-native" como Hyperframes — mais tradutcional (prompt → output)
- ❌ Gera código, não vídeos

**Quando usar:**

- Quando precisa gerar landing pages, dashboards, mobile apps rapidamente
- Para qualquer projeto que precise de design system customizado
- Quando quer guidelines específicas por indústria (ex: "make a fintech app" → regras de banking)

**Veredicto:** ✅ MUITO BOM — Complementa Hyperframes na parte de UI estática. Hyperframes = vídeo, UI UX Pro Max = UI components/páginas. Pode usar junto: UI UX Pro Max gera o design system e componentes, Hyperframes animifica em vídeo.

---

### 5. ux-design-expert (AIOX Local) — Agente de Design Nativo

**Link:** `.aiox-core/development/agents/ux-design-expert.md`

**O que é:**
Agent local do AIOX (presente no kaven-framework) que funciona como **UX/UI Designer & Design System Architect**. É um agente completo com 19 comandos organizados em 5 fases, combinando a empatia de Sally (UX) com o sistema de Brad Frost (Design Systems).

**Persona:** "Uma" — Empathizer (zodiac ♋ Cancer)

**Metodologia central:** Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

**Commands por fase:**

| Fase                             | Comandos                                                                                    | O que faz                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Phase 1: UX Research**         | `*research`, `*wireframe`, `*generate-ui-prompt`, `*create-front-end-spec`                  | User research, wireframes, front-end specs             |
| **Phase 2: Design System Audit** | `*audit`, `*consolidate`, `*shock-report`                                                   | Scannear redundâncias, clusterização, relatório visual |
| **Phase 3: Design Tokens**       | `*tokenize`, `*setup`, `*migrate`, `*upgrade-tailwind`, `*export-dtcg`, `*bootstrap-shadcn` | Extração de tokens, setup de sistema, migração         |
| **Phase 4: Component Building**  | `*build`, `*compose`, `*extend`                                                             | Criar atoms, molecules, variants                       |
| **Phase 5: Quality**             | `*document`, `*a11y-check`, `*calculate-roi`                                                | Documentação, acessibilidade WCAG, ROI                 |

**Dependências (22 tasks, 9 templates, 4 checklists):**

- Tasks: ux-user-research, audit-codebase, extract-tokens, build-component, etc
- Templates: front-end-spec-tmpl.yaml, tokens-schema-tmpl.yaml, component-react-tmpl.tsx
- Checklists: accessibility-wcag-checklist, component-quality-checklist

**Pontos fortes:**

- ✅ **100% local** — Não depende de tools externas, roda no próprio AIOX
- ✅ **Workflow completo** — 从 UX research até component building
- ✅ **Atomic Design** — Metodologia estruturada e escalável
- ✅ **Integração nativa** — Funciona com outros agents do AIOX (@architect, @dev)
- ✅ **19 comandos** — Cobertura ampla (research, audit, tokens, build, quality)
- ✅ **Brownfield + Greenfield** — Funciona em projetos novos e existentes
- ✅ **ROI calculation** — Calcula economia de redundâncias

**Limitações:**

- ❌ Não gera assets visuais prontos (videos, images)
- ❌ Mais focado em design systems do que em conteúdo de marketing
- ❌ Requer conhecimento de Atomic Design
- ❌ Output é código (componentes), não design visual (Figma)

**Quando usar:**

- Para criar design system do zero (greenfield)
- Para auditar codebase existente e extrair tokens (brownfield)
- Para construir componentes React/Tailwind
- Para calcular ROI de consolidação de patterns
- Para integrar com fluxo AIOX (usar junto com @architect, @dev)

**Veredicto:** ✅ COMPLEMENTAR — É o agent de **design systems local** do AIOX. Não compete com UI UX Pro Max (que é skill externa) — são complementares. UX Design Expert = código + componentes, UI UX Pro Max = design intelligence + geração de UI. Hyperframes = vídeo.

---

### 6. Nano-Banana — Geração de Imagens via Gemini (MCP + Skill)

**Links:**

- MCP: https://github.com/ConechoAI/Nano-Banana-MCP
- Skill v2: https://github.com/kingbootoshi/nano-banana-2-skill

**O que é:**
CLI de geração de imagens alimentado por **Google Gemini** (2.5 Flash → 3 Pro). Existem duas versões:

- **Nano-Banana MCP** — Server MCP para Claude Code/Cursor
- **Nano-Banana 2 Skill** — Skill + CLI standalone com mais features

**Features principais:**

| Feature              | Descrição                                               |
| -------------------- | ------------------------------------------------------- |
| **Multi-model**      | Gemini 3.1 Flash (default), Gemini 3 Pro                |
| **Multi-resolution** | 512, 1K, 2K, 4K                                         |
| **Aspect ratios**    | 1:1, 16:9, 9:16, 4:3, 21:9, etc                         |
| **Reference images** | Edit, transform, style transfer                         |
| **Transparent mode** | Green screen → remove background (FFmpeg + ImageMagick) |
| **Cost tracking**    | Logs gastos em `~/.nano-banana/costs.json`              |

**Installation:**

```bash
# Via MCP (para Claude Code/Cursor)
npx nano-banana-mcp

# Via Skill (versão 2 mais completa)
git clone https://github.com/kingbootoshi/nano-banana-2-skill ~/tools/nano-banana-2
bun install && bun link
```

**Exemplos de uso:**

```bash
# Basic (1K)
nano-banana "minimal dashboard UI with dark theme"

# 2K widescreen
nano-banana "cinematic landscape" -s 2K -a 16:9

# Com referência
nano-banana "change background to white" -r dark-ui.png

# Transparent (ícones, logos)
nano-banana "minimalist tech logo" -t -o logo
```

**Custos (Gemini 3.1 Flash):**

- 512: ~$0.045
- 1K: ~$0.067
- 2K: ~$0.101
- 4K: ~$0.151

**Pontos fortes:**

- ✅ **Geração de imagens nativa** — Não precisa de ferramenta externa
- ✅ **Transparent mode** — Gera ícones/logos com fundo transparente
- ✅ **Reference images** — Edit e style transfer via prompt
- ✅ **Cost tracking** —控制 custos
- ✅ **Multi-res e aspect ratios** — Flexibilidade total
- ✅ **MCP + Skill** — Funciona em múltiplos clientes (Claude Code, Cursor, etc)
- ✅ Integração com video (Remotion/Hyperframes)

**Limitações:**

- ❌ Requer API key do Google Gemini (custos variáveis)
- ❌ Precisa de FFmpeg + ImageMagick para modo transparente
- ❌ Gera imagens estáticas, não vídeo
- ❌ Dependente de API externa (não local)

**Quando usar:**

- Para gerar assets visuais (ícones, logos, backgrounds, UI mockups)
- Para criar imagens com transparência (ícones, sprites)
- Para editar/transformar imagens existentes via prompt
- Para integração com video pipeline (Remotion, Hyperframes)
- Para landing pages, marketing, product mockups

**Veredicto:** ✅ EXCELENTE — Este é o "pe missing" — geração de imagens via IA integrada ao fluxo. Funciona junto com: Hyperframes (vídeo), UI UX Pro Max (design system), Nano-Banana (imagens). A trifecta de assets visuais.

---

### 7. [NOME] — [DESCRIÇÃO]

**Link:**

**O que faz:**

**Pontos fortes:**

**Limitações:**

**Veredicto:** ✅ / ❌ — [Resumão]

---

## Comparativo: Hyperframes vs Remotion vs Tradicional

| Critério              | After Effects / Premiere      | Remotion                | Hyperframes                  |
| --------------------- | ----------------------------- | ----------------------- | ---------------------------- |
| **Usuário alvo**      | Editor humano em timeline     | Desenvolvedor em React  | Agente de IA operando código |
| **Entrada**           | Interface visual proprietária | Componentes React       | HTML, CSS e JavaScript       |
| **Versionamento**     | Limitado a arquivos binários  | Git funciona bem        | Git funciona nativamente     |
| **Reprodutibilidade** | Baixa, depende do ambiente    | Alta, com React no meio | Alta, stack web pura         |
| **Licença**           | Proprietária                  | Special (comercial)     | Open-source (Apache 2.0)     |
| **Agent-native**      | ❌                            | ❌                      | ✅ Sim, desde o design       |

---

## Decisão (Provisória)

**Líder:** Hyperframes ✅

**Rationale:**

- Agent-native = exatamente o que buscamos
- Sem licença comercial pra worried
- HTML = linguagem que agente já domina = menos fricção
- open-source + código do lançamento como exemplo

**Próximos passos:**

1. Instalar a skill (`npx skills add heygen-com/hyperframes`)
2. Testar com um vídeo simples (ex: carousel LinkedIn com cores Kaven)
3. Documentar templates específicos pro Kaven

---

## Histórico

- **2026-04-18:** Documento criado, Hyperframes + Remotion analisados

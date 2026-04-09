# AIOX/AIOS Agent Architecture — Análise Completa

**Última atualização:** 2026-04-02
**Repositório:** kaven-framework
**Contexto:** Exploração da transformação de agents AIOS/AIOX para diferentes IDEs

---

## 1. ESTRUTURA GERAL DOS AGENTS

### 1.1 Fontes Primárias

Os agents estão definidos em **duas localizações principais**:

| Localização | Propósito | Quando usar | Exemplo |
|-------------|-----------|-----------|---------|
| `.aios-core/development/agents/` | **Definição canônica** — onde cada agent é originalmente definido | Edições, atualizações, source of truth | `architect.md`, `dev.md`, `qa.md` |
| `.github/agents/` | **Transformado/Sincronizado** — versão simplificada para GitHub actions | Referência leve (sincronizado automaticamente) | `architect.agent.md` |

### 1.2 Manifesto CSV

Arquivo: `.aios-core/manifests/agents.csv`

Contém metadados estruturados sobre todos os agents. Colunas:

```
id,name,archetype,icon,version,status,file_path,when_to_use
```

**Exemplo:**
```csv
architect,Aria,Visionary,🏛️,2.1.0,active,.aios-core/development/agents/architect.md,"Use for system architecture..."
dev,Dex,Builder,💻,2.1.0,active,.aios-core/development/agents/dev.md,"Use for code implementation..."
```

---

## 2. FORMATO DE DEFINIÇÃO DE AGENT

### 2.1 Estrutura Canônica (.aios-core/development/agents/*.md)

Cada arquivo de agent é um markdown com um bloco YAML embutido:

```markdown
# <agent-id>

ACTIVATION-NOTICE: Este arquivo contém suas diretrizes operacionais completas...

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
IDE-FILE-RESOLUTION:
  - Instruções para resolver dependências

activation-instructions:
  - STEP 1: Ler ESTE ARQUIVO inteiro
  - STEP 2: Adotar a persona
  - ...

agent:
  name: <Nome do Agent>           # Ex: "Aria"
  id: <agent-id>                  # Ex: "architect"
  title: <Título>                 # Ex: "Architect"
  icon: <Emoji>                   # Ex: "🏛️"
  whenToUse: |
    Descrição de quando usar
    NOT for: Descrição do que NÃO fazer
  customization: null

persona_profile:
  archetype: <Tipo>               # Ex: "Visionary"
  zodiac: <Zodíaco>              # Ex: "♐ Sagittarius"
  communication:
    tone: <Tipo de tom>          # Ex: "conceptual"
    emoji_frequency: low|medium|high
    vocabulary:
      - palavra-chave
      - arquitetar
    greeting_levels:
      minimal: "Descrição curta"
      named: "Descrição com nome"
      archetypal: "Descrição completa"
    signature_closing: "Assinatura"

persona:
  role: <Função do Agent>
  style: <Estilo de comunicação>
  identity: <Identidade>
  focus: <Foco principal>
  core_principles:
    - Princípio 1
    - Princípio 2

  responsibility_boundaries:
    primary_scope:
      - Escopo 1
      - Escopo 2

  collaboration:
    depends_on: [agent1, agent2]
    supports: [agent1, agent2]

commands:
  - name: "*command-name"
    description: "Descrição do comando"
    visibility: "full|quick|key"    # Controla quando aparece
    elicit: true|false              # Requer interação?
    dependencies:
      tasks: [task-name]
      templates: [template-name]

```
```

### 2.2 Campos Obrigatórios e Opcionais

| Campo | Local | Obrigatório? | Tipo | Descrição |
|-------|-------|-------------|------|-----------|
| `agent.name` | YAML | ✅ | string | Nome humanizado do agent (Ex: "Aria") |
| `agent.id` | YAML | ✅ | string | ID único para referência (Ex: "architect") |
| `agent.title` | YAML | ✅ | string | Cargo/função (Ex: "Architect") |
| `agent.icon` | YAML | ✅ | emoji | Emoji representativo |
| `agent.whenToUse` | YAML | ✅ | text | Descrição clara de quando usar |
| `persona_profile.archetype` | YAML | ✅ | string | Tipo de personalidade (Ex: "Visionary") |
| `persona_profile.zodiac` | YAML | ❌ | string | Zodíaco (cosmético) |
| `persona_profile.communication.tone` | YAML | ✅ | string | Tom de comunicação (Ex: "conceptual") |
| `persona.role` | YAML | ✅ | string | Função principal |
| `persona.core_principles` | YAML | ✅ | array | Princípios operacionais |
| `commands` | YAML | ❌ | array | Lista de comandos disponíveis |
| `activation-instructions` | YAML | ✅ | array | Passos para ativar o agent |

---

## 3. SISTEMA DE TRANSFORMAÇÃO PARA IDEs

### 3.1 Localização e Propósito

**Arquivo:** `.aios-core/infrastructure/scripts/ide-sync/`

Sistema que sincroniza agents da fonte canônica (`.aios-core/development/agents/`) para **4 IDEs diferentes**, cada uma com seu próprio formato:

```
.aios-core/infrastructure/scripts/ide-sync/
├── index.js                        # Orquestrador principal
├── agent-parser.js                 # Parser para extrair YAML/Markdown
├── redirect-generator.js           # Gera redirecionamentos
├── validator.js                    # Valida sincronização
├── README.md
└── transformers/
    ├── claude-code.js              # → .claude/commands/AIOS/agents/
    ├── cursor.js                   # → .cursor/rules/agents/
    ├── windsurf.js                 # → .windsurf/rules/agents/
    └── antigravity.js              # → .antigravity/rules/agents/
```

### 3.2 Configuração (core-config.yaml)

```yaml
ideSync:
  enabled: true
  source: .aios-core/development/agents
  targets:
    claude-code:
      enabled: true
      path: .claude/commands/AIOS/agents
      format: full-markdown-yaml
    cursor:
      enabled: true
      path: .cursor/rules/agents
      format: condensed-rules
    windsurf:
      enabled: false                 # Desabilitado na v3.10.0
      path: .windsurf/rules/agents
      format: xml-tagged-markdown
    antigravity:
      enabled: true
      path: .antigravity/rules/agents
      format: cursor-style
  redirects:
    aios-developer: aios-master      # Agent antigo → novo
    aios-orchestrator: aios-master
    db-sage: data-engineer
    github-devops: devops
  validation:
    strictMode: true
    failOnDrift: true
```

### 3.3 Transformers — Formatos Específicos por IDE

#### 3.3.1 Claude Code (Identity Transform)

**Formato:** `full-markdown-yaml`
**Alvo:** `.claude/commands/AIOS/agents/*.md`
**Arquivo:** `transformers/claude-code.js`

```javascript
function transform(agentData) {
  // Claude Code usa o arquivo original completo (identity transform)
  const syncFooter = `\n---\n*AIOS Agent - Synced from .aios-core/development/agents/${agentData.filename}*\n`;
  return agentData.raw.trimEnd() + syncFooter;
}
```

**Output:**
```markdown
# architect

ACTIVATION-NOTICE: Este arquivo contém suas diretrizes operacionais...

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
agent:
  name: Aria
  ...
```

---
*AIOS Agent - Synced from .aios-core/development/agents/architect.md*
```

**Características:**
- Arquivo **completo e íntegro** (sem truncação)
- Inclui instruções de ativação
- Inclui YAML completo
- Footer de sincronização para rastreabilidade

---

#### 3.3.2 Cursor (Condensed Rules)

**Formato:** `condensed-rules`
**Alvo:** `.cursor/rules/agents/*.md`
**Arquivo:** `transformers/cursor.js`

```javascript
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};

  let content = `# ${name} (@${agentData.id})

${icon} **${title}**${archetype ? ` | ${archetype}` : ''}

> ${whenToUse}

## Quick Commands
...
`;
  return content;
}
```

**Output:**
```markdown
# Aria (@architect)

🏛️ **Architect** | Visionary

> Use for system architecture...

## Quick Commands

- `*create-full-stack-architecture` - Complete system architecture
- `*analyze-project-structure` - Analyze project for new feature

## Key Commands

- `*help` - Show all available commands

## Collaboration

I collaborate with @dev, @qa, @data-engineer...

---
*AIOS Agent - Synced from .aios-core/development/agents/architect.md*
```

**Características:**
- **Condensado** — apenas elementos essenciais
- Filtra comandos por visibilidade (`quick`, `key`, full)
- Inclui seção de colaboração
- Sem instruções de ativação (reduzido)

---

#### 3.3.3 Windsurf (XML-Tagged Markdown)

**Formato:** `xml-tagged-markdown`
**Alvo:** `.windsurf/rules/agents/*.md`
**Arquivo:** `transformers/windsurf.js`
**Status:** ⚠️ Desabilitado na v3.10.0

```javascript
function transform(agentData) {
  let content = `# ${name} Agent

<agent-identity>
${icon} **${name}** - ${title}
ID: @${agentData.id}
${archetype ? `Archetype: ${archetype}` : ''}
</agent-identity>

<when-to-use>
${whenToUse}
</when-to-use>

<commands>
- *command: Description
</commands>

<collaboration>
...
</collaboration>

<dependencies>
Tasks: task1, task2
Checklists: checklist1
</dependencies>
`;
  return content;
}
```

**Output:**
```xml
# Architect Agent

<agent-identity>
🏛️ **Aria** - Architect
ID: @architect
Archetype: Visionary
</agent-identity>

<when-to-use>
Use for system architecture...
</when-to-use>

<commands>
- *create-full-stack-architecture: Complete system architecture
</commands>

<collaboration>
I collaborate with @dev, @qa...
</collaboration>

<dependencies>
Tasks: create-doc, validate-arch
</dependencies>
```

**Características:**
- XML tags estruturam semanticamente
- Metadados de dependências explícitos
- Formalmente estruturado para parsers
- Status: **Consolidado para Core IDEs**

---

#### 3.3.4 Antigravity (Cursor-Style)

**Formato:** `cursor-style`
**Alvo:** `.antigravity/rules/agents/*.md`
**Arquivo:** `transformers/antigravity.js`

Idêntico ao Cursor, mas com seção **All Commands** adicional:

```javascript
// Similar a Cursor, mas com:
// - Quick Commands
// - Key Commands
// - All Commands (se houver mais de quick + key)
// - Collaboration
```

---

### 3.4 Agent Parser

**Arquivo:** `.aios-core/infrastructure/scripts/ide-sync/agent-parser.js`

Responsável por **extrair e normalizar** dados de agent:

```javascript
function parseAgentFile(filePath) {
  // Estrutura retornada:
  return {
    path: filePath,
    filename: "architect.md",
    id: "architect",
    raw: "Conteúdo original completo",
    yaml: { objeto YAML parseado },
    agent: { agent metadata },
    persona_profile: { persona info },
    commands: [ { normalizado } ],
    dependencies: { tasks, checklists, tools },
    sections: {
      quickCommands: "...",
      collaboration: "...",
      guide: "..."
    },
    error: null
  };
}
```

**Funcionalidades:**
- Extrai bloco YAML entre ` ```yaml ... ``` `
- Normaliza comandos (converte variações para formato padrão)
- Classifica comandos por visibilidade (`getVisibleCommands`)
- Fallback para regex se YAML falhar
- Handling de erros robusto

---

### 3.5 Fluxo de Sincronização

```
.aios-core/development/agents/*.md (Fonte canônica)
         ↓
    agent-parser.js (Extrai YAML + Markdown)
         ↓
    [Parse agentData structure]
         ↓
    Transformers (aplicam formato específico)
    ├─→ claude-code.js   → full-markdown-yaml
    ├─→ cursor.js        → condensed-rules
    ├─→ windsurf.js      → xml-tagged-markdown
    └─→ antigravity.js   → cursor-style
         ↓
    Escrever em targets:
    ├─→ .claude/commands/AIOS/agents/
    ├─→ .cursor/rules/agents/
    ├─→ .windsurf/rules/agents/
    └─→ .antigravity/rules/agents/
         ↓
    [Validação + report]
```

---

### 3.6 Comandos de Sincronização

```bash
# Sincronizar todos os IDEs habilitados
npm run sync:ide
node .aios-core/infrastructure/scripts/ide-sync/index.js sync

# Sincronizar IDE específico
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validar (modo relatório)
npm run sync:ide:validate

# Validar (modo CI — sair com código 1 se houver drift)
npm run sync:ide:check

# Opções adicionais
--ide <name>     # IDE específico
--strict         # CI mode
--dry-run        # Não escrever arquivos
--verbose        # Saída detalhada
--quiet          # Saída mínima (pre-commit)
```

---

## 4. AGENTS INSTALADOS (v2.1.0)

Dos manifesto (`agents.csv`), os 12 agents ativos:

| ID | Nome | Archetype | Versão | Arquivo |
|---|---|---|---|---|
| `aios-master` | Orion | Orchestrator | 2.1.0 | aios-master.md |
| `analyst` | Atlas | Decoder | 2.1.0 | analyst.md |
| `architect` | Aria | Visionary | 2.1.0 | architect.md |
| `data-engineer` | Dara | Sage | 2.1.0 | data-engineer.md |
| `dev` | Dex | Builder | 2.1.0 | dev.md |
| `devops` | Gage | Operator | 2.1.0 | devops.md |
| `pm` | Morgan | Strategist | 2.1.0 | pm.md |
| `po` | Pax | Balancer | 2.1.0 | po.md |
| `qa` | Quinn | Guardian | 2.1.0 | qa.md |
| `sm` | River | Facilitator | 2.1.0 | sm.md |
| `squad-creator` | Craft | Builder | 2.1.0 | squad-creator.md |
| `ux-design-expert` | Uma | Empathizer | 2.1.0 | ux-design-expert.md |

---

## 5. REDIRECIONAMENTOS (Deprecated Agents)

**Arquivo:** `redirect-generator.js`

Agents antigos redirecionados para novos:

```yaml
redirects:
  aios-developer: aios-master         # Antigo → Novo
  aios-orchestrator: aios-master
  db-sage: data-engineer
  github-devops: devops
```

Gera arquivos como:
```markdown
# Agent Redirect: aios-developer → aios-master

This agent has been renamed. Use `aios-master` instead.
```

---

## 6. SINCRONIZAÇÃO COM GIT

### 6.1 Pre-commit Hook (Story TD-4)

Automaticamente:
1. Executa IDE sync antes de cada commit
2. Auto-stages arquivos IDE modificados
3. Valida com lint-staged

```bash
# Bypass (não recomendado)
git commit --no-verify
```

### 6.2 GitHub Actions

Agents estão sincronizados em `.github/agents/` — versão simplificada usada por GitHub workflows.

---

## 7. PATHS CRÍTICOS

```
ROOT/
├── .aios-core/
│   ├── development/agents/               ← FONTE CANÔNICA
│   │   ├── architect.md
│   │   ├── dev.md
│   │   ├── qa.md
│   │   └── [9 outros]
│   ├── manifests/
│   │   └── agents.csv                    ← MANIFESTO (metadados)
│   ├── infrastructure/scripts/
│   │   └── ide-sync/                     ← TRANSFORMAÇÃO
│   │       ├── index.js
│   │       ├── agent-parser.js
│   │       ├── transformers/
│   │       │   ├── claude-code.js
│   │       │   ├── cursor.js
│   │       │   ├── windsurf.js
│   │       │   └── antigravity.js
│   │       └── README.md
│   └── core-config.yaml                  ← CONFIGURAÇÃO
├── .claude/commands/AIOS/agents/         ← CLAUDE CODE (full)
│   └── *.md (sincronizado)
├── .cursor/rules/agents/                 ← CURSOR (condensed)
│   └── *.md (sincronizado)
├── .windsurf/rules/agents/               ← WINDSURF (xml-tagged)
│   └── *.md (sincronizado, desabilitado)
├── .antigravity/rules/agents/            ← ANTIGRAVITY (cursor-style)
│   └── *.md (sincronizado)
└── .github/agents/                       ← GITHUB (simplificado)
    └── *.agent.md
```

---

## 8. FORMATOS DE TRANSFORMAÇÃO — RESUMO COMPARATIVO

| Aspecto | Claude Code | Cursor | Windsurf | Antigravity |
|---------|-------------|--------|----------|------------|
| **Formato** | Full markdown | Condensed | XML-tagged | Cursor-style |
| **Tamanho** | Completo | ~40% | ~50% | ~50% |
| **Instruções de Ativação** | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **YAML Completo** | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **Persona Completa** | ✅ Sim | ⚠️ Parcial | ⚠️ Parcial | ⚠️ Parcial |
| **Quick Commands** | ✅ Todos | ✅ Sim | ✅ Sim | ✅ Sim |
| **XML Tags** | ❌ Não | ❌ Não | ✅ Sim | ❌ Não |
| **Collaboration** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Dependencies** | ✅ Sim | ❌ Não | ✅ Sim | ❌ Não |
| **Filepath** | `.claude/...` | `.cursor/...` | `.windsurf/...` | `.antigravity/...` |

---

## 9. CASOS DE USO — QUANDO CADA IDE É USADO

### Claude Code
- **Uso:** Desenvolvimento full-stack Kaven, debug
- **Características:** Acesso a agents completos, instruções detalhadas
- **Arquivo:** `.claude/commands/AIOS/agents/*.md`

### Cursor
- **Uso:** Desenvolvimento rápido, equipes IDE-first
- **Características:** Condensado, Quick Commands destacados
- **Arquivo:** `.cursor/rules/agents/*.md`

### Windsurf
- **Uso:** Estruturado, parsing automático
- **Características:** XML-tagged para tooling, metadados explícitos
- **Status:** Desabilitado na v3.10.0 (consolidação para core IDEs)

### Antigravity
- **Uso:** Alternativa Cursor-compatível
- **Características:** Quick/Key/All commands, similar ao Cursor
- **Arquivo:** `.antigravity/rules/agents/*.md`

---

## 10. EXTENSÃO FUTURA

Para adicionar nova IDE:

1. Criar transformer em `.aios-core/infrastructure/scripts/ide-sync/transformers/<ide>.js`
2. Implementar `transform(agentData)` e `getFilename(agentData)`
3. Adicionar target em `core-config.yaml`
4. Testar com `npm run sync:ide --ide <nome> --dry-run`

**Template:**
```javascript
// transformers/novo-ide.js
const { getVisibleCommands } = require('../agent-parser');

function transform(agentData) {
  const agent = agentData.agent || {};
  // Implementar transformação
  return content;
}

module.exports = {
  transform,
  getFilename: (agentData) => agentData.filename,
  format: 'novo-formato',
};
```

---

## Referências

- **Source:** `.aios-core/infrastructure/scripts/ide-sync/`
- **Config:** `.aios-core/core-config.yaml` (seção `ideSync`)
- **Manifesto:** `.aios-core/manifests/agents.csv`
- **Documentation:** `.aios-core/infrastructure/scripts/ide-sync/README.md`
- **Stories:** Story 6.19 (IDE Command Auto-Sync), Story TD-4 (Pre-commit)

---

**Conclusão:** O AIOX/AIOS implementa um sistema **robusto e extensível** de transformação de agents para múltiplas IDEs, mantendo uma fonte canônica única com sincronização automática. Cada IDE recebe um formato otimizado para seu contexto de uso.

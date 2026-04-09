# GEMINI.md — Kaven Framework

> Carregado em sessões Gemini CLI abertas neste projeto.
> Source of truth: `.claude/CLAUDE.md` · `.aiox-core/constitution.md`
> Versão: 1.1.0 | Atualizado: 2026-04-04

---

## 1. Idioma

PT-BR em toda interação, comentários e logs. EN em código-fonte, commits, nomes de arquivo, comandos.

---

## 2. Agent System — kaven-squad

Este projeto usa o **kaven-squad** (AIOX v5.0.3).

### Ativação de Agents (Gemini CLI)

Agents são instalados como skills em `.gemini/rules/kaven-squad/agents/` (se o sync estiver configurado).
Também podem ser ativados diretamente lendo o arquivo do agent e assumindo a persona:

```
# Orquestrador — use para rotear qualquer request ao specialist correto
Leia: squads/kaven-squad/agents/kai.md  →  assuma persona Kai até *exit

# Meta-agent estratégico (decisões cross-squad, councils)
Leia: squads/kaven-squad/agents/kaven-squad-lead.md  →  assuma persona Steave até *exit
```

### Specialists disponíveis

| Ativação | Arquivo | Função |
|----------|---------|--------|
| `/kaven-architect` | `squads/kaven-squad/agents/kaven-architect.md` | Arquitetura, design de sistema |
| `/kaven-api-dev` | `squads/kaven-squad/agents/kaven-api-dev.md` | Fastify API, rotas, services |
| `/kaven-frontend-dev` | `squads/kaven-squad/agents/kaven-frontend-dev.md` | Next.js, React, UI |
| `/kaven-db-engineer` | `squads/kaven-squad/agents/kaven-db-engineer.md` | Prisma, PostgreSQL, migrations |
| `/kaven-qa` | `squads/kaven-squad/agents/kaven-qa.md` | Testes, quality gates |
| `/kaven-devops` | `squads/kaven-squad/agents/kaven-devops.md` | CI/CD, Docker, infra |
| `/kaven-docs` | `squads/kaven-squad/agents/kaven-docs.md` | Documentação técnica (Lumen) — discovery-first, zero hardcoded state |
| `/kaven-lp-copywriter` | `squads/kaven-squad/agents/kaven-lp-copywriter.md` | LP copy, marketing |

### Contexto de referência (carregar quando relevante)

```
squads/kaven-squad/data/kaven-kb.md              ← Knowledge base central
squads/kaven-squad/data/kaven-schema-reference.md ← Schema Prisma
squads/kaven-squad/data/kaven-patterns.md        ← Padrões arquiteturais
squads/kaven-squad/data/kaven-middleware-stack.md ← Middleware chain
```

---

## 3. Gemini CLI — Configuração de Hooks (opcional)

Para injeção automática de contexto AIOX, configure `.gemini/settings.json`:

```json
{
  "hooks": {
    "BeforeAgent": [{
      "matcher": "*",
      "hooks": [{
        "name": "kaven-context",
        "type": "command",
        "command": "node .aiox-core/hooks/gemini/before-agent.js"
      }]
    }]
  }
}
```

> **Nota:** O sistema completo de sync de agents para Gemini (`.gemini/rules/kaven-squad/`) requer
> adicionar `gemini` em `ide.selected` no `.aiox-core/core-config.yaml` e rodar `npm run sync:ide`.

---

## 4. Stack Técnico

- Backend: Fastify 5.6 · Prisma 5.22 · PostgreSQL 17 · Redis 7 · BullMQ
- Frontend: Next.js 16 · React 19 · TailwindCSS 4 · Radix UI
- Multi-tenancy: RLS middleware, `tenantId` obrigatório
- Tests: ~2100 (Vitest)

---

## 5. Regras Operacionais

### NEVER
- Trabalhar direto na `main`
- Declarar "concluído" sem evidência (`git diff --stat`, logs)
- Deletar/remover conteúdo sem confirmar
- Deixar `catch` vazio — sempre logue erros

### ALWAYS
- Ler schema completo antes de propor mudanças no banco
- Commitar antes de mover para próxima task
- Toda implementação complexa → delegar ao agent correto (Kai roteia)

---

## 6. Precedência de Regras

```
1. .claude/CLAUDE.md (local)       ← máxima prioridade
2. GEMINI.md (este arquivo)
3. .aiox-core/constitution.md
4. ~/.gemini/GEMINI.md (global)
```

---

*Kaven Framework v1.0.0-rc1 · kaven-squad v1.0.0 · AIOX v5.0.3*

# GEMINI.md — Kaven Framework

> Carregado em sessões Gemini CLI abertas neste projeto.
> Source of truth: `.claude/CLAUDE.md` · `.aiox-core/constitution.md`
> Versão: 1.2.0 | Atualizado: 2026-04-12

---

## 1. Idioma e Comunicação

PT-BR em toda interação, comentários e logs. EN em código-fonte, commits, nomes de arquivo, comandos.

---

## 2. Orquestração MCP (Hub-and-Spoke)

Este projeto utiliza uma infraestrutura de MCPs **centralizada via Docker**.

### ❗ Regra de Ouro: Centralização
Toda interação com MCPs (Serena, Codebase Memory, Google Workspace) deve ser feita exclusivamente através do **Hub Central (Gateway)** na porta **8080**.

- **Manual de Operação:** `docs/aiox/MCP_ORCHESTRATION_GUIDE.md`
- **Hub:** `http://localhost:8080/mcp`
- **Prefixo CLI:** `mcp_docker-gateway_`

**NUNCA** tente instalar ou rodar servidores MCP como serviços do host (systemd). Use sempre os containers homologados no `mcp-central`.

---

## 3. Agent System — kaven-squad

Este projeto usa o **kaven-squad** (AIOX v5.0.3).

### Ativação de Agents (Gemini CLI)
Agents podem ser ativados diretamente lendo o arquivo e assumindo a persona:
- **Kai (Orquestrador):** `squads/kaven-squad/agents/kai.md`
- **Steave (Estratégico):** `squads/kaven-squad/agents/kaven-squad-lead.md`

### Specialists Disponíveis
| Ativação | Arquivo | Função |
|----------|---------|--------|
| `/kaven-architect` | `squads/kaven-squad/agents/kaven-architect.md` | Arquitetura |
| `/kaven-api-dev` | `squads/kaven-squad/agents/kaven-api-dev.md` | Fastify API |
| `/kaven-frontend-dev` | `squads/kaven-squad/agents/kaven-frontend-dev.md` | Next.js / UI |
| `/kaven-qa` | `squads/kaven-squad/agents/kaven-qa.md` | Testes / Quality |

---

## 4. Stack Técnico
- Backend: Fastify 5.6 · Prisma 5.22 · PostgreSQL 17
- Frontend: Next.js 16 · React 19 · TailwindCSS 4
- **Inteligência:** Serena (LSP) + Codebase Memory (Graph) via Docker.

---

## 5. Regras Operacionais

### NEVER
- Trabalhar direto na `main`.
- Declarar "concluído" sem evidência (`git diff --stat`, logs).
- **Instalar MCPs no host SO.**

### ALWAYS
- Ler schema completo antes de mudanças no banco.
- Commitar antes de mover para próxima task.
- **Consultar o `docs/aiox/MCP_ORCHESTRATION_GUIDE.md` antes de usar ferramentas de análise.**

---

## 6. Precedência de Regras
1. `.claude/CLAUDE.md` (local)
2. `GEMINI.md` (este arquivo)
3. `.aiox-core/constitution.md`
4. `~/.gemini/GEMINI.md` (global)

---
*Kaven Framework v1.0.0-rc1 · kaven-squad v1.0.0 · AIOX v5.0.3*

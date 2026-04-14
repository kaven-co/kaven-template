# 🧠 MCP Core & AIOX — Manual do Orquestrador (Unified)

> **Versão:** 2.1.0 (Realidade Técnica)
> **Última Atualização:** 2026-04-12
> **Status:** ✅ VALIDADO E OPERACIONAL

Este documento define os nomes REAIS das ferramentas MCP após a centralização no Docker. Toda IA deve usar estes nomes exatos.

---

## 🏗️ 1. Ponto de Entrada Único
O Gemini CLI acessa todos os Spokes através do prefixo `mcp_docker-gateway_`.

---

## 🛠️ 2. Mapeamento Real de Ferramentas

### 🔬 Camada A: Inteligência de Código (Serena LSP)
**Status:** ✅ ONLINE (Docker) | **Porta:** 9121

| Nome Documentado (Ideal) | Comando REAL para a CLI |
|--------------------------|--------------------------|
| `lsp_get_symbols_overview` | `mcp_docker-gateway_get_symbols_overview` |
| `lsp_find_symbol` | `mcp_docker-gateway_find_symbol` |
| `lsp_find_references` | `mcp_docker-gateway_find_referencing_symbols` |
| `lsp_rename_symbol` | `mcp_docker-gateway_rename_symbol` |

### 📊 Camada B: Memória de Grafo (Codebase Memory)
**Status:** ✅ ONLINE (Host-bridge) | **Porta:** 8400

| Nome Documentado (Ideal) | Comando REAL para a CLI |
|--------------------------|--------------------------|
| `db_architecture` | `mcp_codebase-memory-mcp_get_architecture` |
| `db_query` | `mcp_codebase-memory-mcp_query_graph` |
| `db_search` | `mcp_codebase-memory-mcp_search_graph` |

### ☁️ Camada C: Gestão (Google Workspace)
**Status:** ✅ ONLINE (Remote) | **Porta:** 8000

| Nome Documentado (Ideal) | Comando REAL para a CLI |
|--------------------------|--------------------------|
| `g_drive_search` | `mcp_google-workspace_search_drive_files` |
| `g_drive_read` | `mcp_google-workspace_get_drive_file_content` |

---

## ⚠️ NOTA TÉCNICA IMPORTANTE (Anti-Erro)
O separador oficial da CLI é o **HÍFEN** (`-`) e não o underscore (`_`).
- ❌ Errado: `mcp_docker_gateway_...`
- ✅ Correto: `mcp_docker-gateway_...`

## 🔄 3. Fluxo de Trabalho AIOX
1. **Research:** Use `mcp_docker-gateway_get_symbols_overview` para mapear arquivos.
2. **Strategy:** Use `mcp_codebase-memory-mcp_get_architecture` para medir impacto.
3. **Execution:** Use as ferramentas NATIVAS (`read_file`, `write_file`) para alterar código.

---
*Manual atualizado para refletir a sintaxe exata exigida pelo Gemini CLI.*

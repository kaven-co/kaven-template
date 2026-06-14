# Relatório de Diagnóstico e Solução: Infraestrutura MCP

> **Data:** 2026-06-09
> **Status:** RESOLVIDO
> **Agente:** Steave (Modo PRO)

## 1. Problema Raiz Identificado

A infraestrutura MCP apresentava dois pontos de falha críticos que impediam a operação estável de qualquer CLI (Gemini, Claude, etc.):

1.  **"Cegueira" do Agente de Código (Serena):** O container do Serena LSP era iniciado com um mapeamento de volume estático para um único projeto. Isso o tornava "cego" para qualquer outro projeto, quebrando a capacidade de análise de código em diferentes contextos.
2.  **Timeout de Handshake (MCP Gateway):** O `mcp-gateway` tentava compilar e iniciar múltiplos "spokes" pesados (como `redis` e `playwright`) em cada boot. O tempo de inicialização excedia 3 minutos, fazendo com que o cliente CLI (Gemini) desistisse da conexão (timeout) antes mesmo de listar as ferramentas, gerando o erro `method "tools/call" is invalid during session initialization`.

---

## 2. Estratégia de Investigação (Modo PRO)

A abordagem foi sistêmica, focando na causa-raiz em vez de soluções paliativas:

1.  **Análise de Topologia:** Comparei a estrutura de diretórios do host (`/home/bychrisr/projects/`) com a visão interna do container Serena (`/workspaces/projects/`) para confirmar o descompasso.
2.  **Inspeção de Configuração Docker:** Analisei o `docker-compose.yml` do `mcp-central` para entender como os volumes e comandos eram definidos. Isso revelou o comando de boot lento do Gateway e o volume estático do Serena.
3.  **Análise de Logs:** Os logs do `mcp-gateway` confirmaram o tempo de boot excessivo. Os logs do `serena` mostravam que ele subia corretamente, mas não encontrava projetos para indexar.
4.  **Cadeia de Autenticação:** A investigação do `settings.json` vs. logs do Gateway mostrou que o `Authorization` header era um "fantasma" — o Gateway o ignorava, mas a inconsistência de estado durante os restarts contribuía para a falha de handshake.

---

## 3. Solução Implementada (Regra Sistêmica)

### 3.1. Visão Elástica (Serena)

-   **Ação:** O `docker-compose.yml` foi alterado para mapear a **raiz global de projetos** do host para o container.
-   **De:** `- /home/bychrisr/projects/work/kaven/kaven-framework:/workspaces/projects/kaven-framework:ro`
-   **Para:** `- /home/bychrisr/projects/:/workspaces/projects/:ro`
-   **Resultado:** O Serena agora tem visão total de **todos** os projetos e subpastas (`work`, `learning`, `personal`), tornando a solução escalável e eliminando a necessidade de edições futuras no Docker para novos projetos.

### 3.2. Sincronização Inteligente (Agente)

-   **Ação:** Uma nova regra foi injetada no `~/.gemini/GEMINI.md` (global) e reforçada no `GEMINI.md` local.
-   **Protocolo:**
    1.  O agente detecta o caminho do projeto atual no host.
    2.  Ele traduz esse caminho para a sintaxe do container (`/workspaces/projects/...`).
    3.  Dispara o comando `activate_project` no Serena, sincronizando o contexto do LSP com o chat.
-   **Resultado:** A ativação do projeto agora é dinâmica e automática, independente da profundidade da pasta.

### 3.3. Otimização do Gateway

-   **Ação:** O comando de inicialização do `mcp-gateway` no `docker-compose.yml` foi otimizado.
-   **De:** `--servers=exa,context7,sequentialthinking,redis,playwright`
-   **Para:** `--servers=exa,context7,sequentialthinking`
-   **Resultado:** O tempo de boot do Gateway foi reduzido de **+3 minutos** para **<5 segundos**, garantindo que ele esteja pronto antes que o cliente CLI atinja o timeout.

---

## 4. Conclusão para Outras CLIs

Este caso de estudo serve como um **playbook mandatório** para qualquer integração de CLI com a infraestrutura MCP:

-   **Ponto de Falha 1 (Visão de Código):** Se uma CLI não conseguir analisar o código, a primeira verificação é o mapeamento de volume do container do agente de código (Serena, etc.). A solução "Visão Elástica" (mapear a pasta pai) é a mais robusta.
-   **Ponto de Falha 2 (Handshake):** Se a CLI falhar ao listar ferramentas, investigue o tempo de boot do Gateway e o log de inicialização do cliente. Otimize os `servers` carregados no boot para o mínimo essencial.
-   **Ponto de Falha 3 (Estado de Sessão):** Após qualquer alteração na infraestrutura (restart de containers, mudança de config), **sempre reinicie o cliente CLI** para forçar uma nova sessão e evitar erros de estado inconsistente.

Este documento agora serve como a "source of truth" para o diagnóstico e manutenção da nossa arquitetura MCP.

## 5. Decisão de Simplificação Arquitetural (2026-06-10)

Após testes intensivos, foi decidido migrar da arquitetura "Hub-and-Spoke" (mcp-gateway) para **MCPs Independentes**.

### Motivação:
- **Complexidade de Handshake:** O Gateway central introduzia latência e erros de inicialização de sessão no Gemini CLI.
- **Gestão de Segredos:** A injeção de API Keys via Docker Gateway mostrou-se instável.
- **Depuração:** Serviços independentes facilitam o isolamento de erros.

### Mudanças:
1. **Descontinuação do mcp-gateway:** O container central será removido.
2. **Remoção do Sequential Thinking:** Ferramenta considerada redundante para o fluxo atual.
3. **Serviços Diretos:** Exa, Tavily e Firecrawl serão expostos via containers dedicados ou comandos diretos, com portas únicas.
4. **Foco no Serena:** O Serena LSP permanece como serviço central de análise de código na porta 9121.

Esta mudança visa estabilidade máxima e menor overhead de manutenção.

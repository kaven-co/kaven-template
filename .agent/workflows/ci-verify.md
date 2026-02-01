---
description: Quality gates do projeto. Usa comandos configurados em quality.env.
---

Este workflow executa os quality gates configurados para este projeto.

1. Carregue configuração
   // turbo
   ```bash
   source .agent/config/quality.env
   echo "Lint: $AG_LINT_CMD"
   echo "Type: $AG_TYPECHECK_CMD"
   echo "Test: $AG_TEST_CMD"
   ```

2. Execute lint
   ```bash
   source .agent/config/quality.env && $AG_LINT_CMD
   ```

3. Execute typecheck
   ```bash
   source .agent/config/quality.env && $AG_TYPECHECK_CMD
   ```

4. Execute testes
   ```bash
   source .agent/config/quality.env && $AG_TEST_CMD
   ```

5. Gere evidência
   // turbo
   ```bash
   git diff --stat
   ```

6. Se falhou, use /g-retry-loop
   Não ignore erros. Corrija antes de prosseguir.

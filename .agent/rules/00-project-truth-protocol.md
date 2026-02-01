---
description: Protocolo de evidência específico do projeto. Complementa o global.
---

# Project Truth Protocol

Este projeto requer:

1. **Quality gates** antes de qualquer commit:
   ```bash
   source .agent/config/quality.env
   $AG_LINT_CMD && $AG_TYPECHECK_CMD && $AG_TEST_CMD
   ```

2. **Evidence bundle** para features completas:
   ```bash
   ./.agent/scripts/evidence-bundle.sh
   ```

3. **Diff stats** em toda conclusão de tarefa:
   ```bash
   git diff --stat
   ```

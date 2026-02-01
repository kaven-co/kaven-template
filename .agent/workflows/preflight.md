---
description: Pré-voo específico do projeto. Inclui verificações locais além do global.
---

Este workflow complementa `/g-preflight` com checks específicos do projeto.

1. Execute preflight global primeiro
   Use `/g-preflight` para análise geral.

2. Verifique configurações do projeto
   // turbo
   ```bash
   cat .agent/config/quality.env
   ```

3. Verifique dependências
   // turbo
   ```bash
   pnpm outdated 2>/dev/null | head -10 || npm outdated 2>/dev/null | head -10
   ```

4. Verifique .env configurado
   // turbo
   ```bash
   test -f .env && echo ".env existe" || echo "⚠️ .env não existe - copie de .env.example"
   ```

5. Prossiga com implementação
   Após checks, inicie o desenvolvimento.

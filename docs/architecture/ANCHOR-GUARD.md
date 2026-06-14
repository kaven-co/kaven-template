# 🛡️ Anchor Guard & Quality Gates

Este documento descreve o sistema de proteção de integridade estrutural e qualidade do Kaven Framework, implementado via **Husky** e **Kaven CLI**.

---

## 🏛️ Anchor Guard (Proteção de Módulos)

O **Anchor Guard** é uma medida de segurança que impede a remoção acidental de comentários estruturais (âncoras) no código-fonte. Essas âncoras são essenciais para que o `kaven-cli` possa realizar injeções de código, atualizações de módulos e merges automáticos via 3-way merge.

### Como Funciona
O hook de `pre-commit` executa o comando `kaven module doctor`.
- **Exit Code 1:** Erro crítico. Âncoras obrigatórias (ex: `// [KAVEN_MODULE_IMPORTS]`) foram removidas ou corrompidas. O commit é abortado.
- **Exit Code 2:** Aviso/Warning. Pendências não-bloqueantes (ex: falta de env vars locais). O commit prossegue.

### Reparo Automático
Se o commit falhar por falta de âncoras, você pode tentar restaurá-las usando:
```bash
kaven module doctor --fix
```

---

## 🧪 Quality Gates (Commit Estrito)

O projeto adota uma política de **Verificação Obrigatória**. É impossível commitar código que não passe nos testes ou linting, a menos que você desabilite os hooks globalmente (o que é rastreado).

### Pipeline de Pre-commit
1. **Linting & Typecheck:** Garante que o código segue os padrões e não possui erros de tipo.
2. **Unit & Integration Tests:** Executa a suite de testes local.
3. **Security Check:** Valida vulnerabilidades conhecidas e exposição de segredos.

### Bloqueio de `--no-verify`
O hook `prepare-commit-msg` verifica se o `pre-commit` foi executado com sucesso através de uma assinatura em `.git/PRE_COMMIT_RUN`. 
- Se você tentar usar `git commit --no-verify`, o commit será **recusado** pelo segundo hook, garantindo que ninguém pule os Quality Gates.

---

## 🔧 Configuração e Debug

Os scripts de proteção residem em:
- `.husky/pre-commit`
- `.husky/prepare-commit-msg`

Se precisar rodar os gates manualmente:
```bash
pnpm run quality
```

> **Nota:** Para que os testes rodem corretamente no hook, certifique-se de que os containers do Docker (Postgres/Redis) estão ativos.

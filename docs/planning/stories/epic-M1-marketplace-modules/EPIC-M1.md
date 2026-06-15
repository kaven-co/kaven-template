---
epic_id: EPIC-M1
title: Marketplace Modules — Tier Enforcement & Real Module Builds
status: planned
created: 2026-06-14
owner: "@dev"
priority: P1
---

# EPIC-M1 — Marketplace Modules: Tier Enforcement & Real Module Builds

## Contexto

O D1.11 marcou 4 módulos como "públicos" no marketplace (payments, auth-social, storage, analytics),
mas na realidade apenas `payments` tem código real e artefato S3. Os outros 3 são shells — `module.json`
com `"files": []` e `"injections": []`. Em produção, um usuário que tentasse instalar qualquer
um deles receberia um tarball vazio ou erro.

Adicionalmente, o pricing foi migrado para o modelo recorrente (Starter $49 / Builder $99 / Pro $199)
em 2026-04-17, mas os `module.json` ainda referenciam nomenclatura antiga (`"tier": "pro"` sem mapeamento
correto para os novos tiers). Não existe enforcement de tier no CLI — qualquer usuário pode instalar
qualquer módulo independente do plano.

## Decisão de Tier (aprovada pelo fundador 2026-06-14)

**Opção A selecionada:**
- `Starter` ($49) → core only (auth, tenants, RBAC, email, files, notifications)
- `Builder` ($99) → core + payments + auth-social + storage + email-templates + analytics
- `Pro` ($199) → tudo do Builder + i18n + blog + ai-studio + advanced-rbac + acesso antecipado

## Stories deste Epic

| Story | Título | Prioridade | Esforço |
|-------|--------|------------|---------|
| M1.1 | Reconciliar tier mapping nos module.json | P0 | 2h |
| M1.2 | Construir módulo `auth-social` completo | P1 | 6h |
| M1.3 | Construir módulo `storage` completo | P1 | 6h |
| M1.4 | Construir módulo `analytics` completo | P1 | 8h |
| M1.5 | Construir módulo `email-templates` completo | P1 | 5h |
| M1.6 | CLI: gate de tier antes de `kaven module install` | P0 | 4h |
| M1.7 | Publicar 4 módulos completos no S3 + releases | P1 | 4h |

## Dependências

- M1.1 deve ser feita antes de qualquer outra (baseline dos tiers)
- M1.6 (CLI gate) pode ser feita em paralelo com M1.2–M1.5
- M1.7 depende de M1.2–M1.5 (código real) + M1.1 (tiers corretos)

## Fora de escopo (v1.1 — EPIC-M2 futuro)

- `@kaven/runtime` SDK (policy check em runtime)
- Módulos Pro (i18n, blog, ai-studio, advanced-rbac)
- Anti-clone machine ID enforcement
- Community Marketplace (70/30 split)

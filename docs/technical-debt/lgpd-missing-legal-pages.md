# Technical Debt: Missing Legal Pages in Tenant App

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields). Páginas /terms e /privacy criadas no tenant app.
**Category:** LGPD/Privacy

## Description

O app `apps/tenant` não possui páginas `/terms` (Termos de Uso) e `/privacy` (Política de Privacidade). Tenants que usam o Kaven Framework como base para seus produtos SaaS não têm templates legais prontos — precisam criar essas páginas do zero ou ficam sem elas, o que é uma violação direta da LGPD Art. 9 (dever de informação ao titular).

## Estado Atual

| Página    | Rota       | Status      |
| --------- | ---------- | ----------- |
| Termos    | `/terms`   | Inexistente |
| Privacidade | `/privacy` | Inexistente |

## Impacto

- **Compliance:** LGPD Art. 9 — controlador deve informar ao titular sobre o tratamento de dados
- **Compliance:** LGPD Art. 18, I — titular tem direito à confirmação da existência de tratamento (link na policy)
- **Risco do produto:** Produtos construídos sobre o Kaven são lançados sem páginas legais obrigatórias
- **UX:** Impossível linkar termos e política no signup (campo `privacyPolicyVersion` não tem URL para apontar)
- **SEO/Legal:** Sem páginas indexáveis de termos e privacidade

## Design Proposto

### Estrutura das Páginas

```
apps/tenant/src/app/
├── terms/
│   └── page.tsx          # Página de Termos de Uso
└── privacy/
    └── page.tsx          # Política de Privacidade
```

### Características Necessárias

- Conteúdo padrão customizável por tenant (via variáveis de configuração ou CMS)
- Data de última atualização dinâmica (lida do config ou banco)
- Versão da política no heading (para linkar com `privacyPolicyVersion`)
- Layout legal: navegação por âncoras para seções obrigatórias
- Link cruzado entre `/terms` e `/privacy`
- Seções obrigatórias LGPD na política: quais dados, por quê, com quem compartilha, por quanto tempo, direitos do titular, DPO/contato

## Esforço Estimado

6-10 horas — estrutura das páginas + conteúdo padrão LGPD-compliant + customização por tenant + testes

## Ações Necessárias

1. Criar `apps/tenant/src/app/terms/page.tsx` com template de Termos de Uso
2. Criar `apps/tenant/src/app/privacy/page.tsx` com template de Política de Privacidade
3. Adicionar seções obrigatórias LGPD na política (controlador, DPO, finalidades, bases legais, direitos do titular)
4. Implementar customização por tenant (nome da empresa, contato, DPO)
5. Adicionar links para essas páginas no rodapé do tenant app e no formulário de signup
6. Adicionar ao `sitemap.xml` do tenant

## Referências

- LGPD Art. 9 — Direito à informação sobre o tratamento
- LGPD Art. 41 — Encarregado (DPO) — dado de contato obrigatório na política
- LGPD Art. 18 — Direitos do titular (deve estar listado na política)
- `docs/compliance/gdpr.md`

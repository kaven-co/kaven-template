# Technical Debt — Índice

Registro centralizado de débitos técnicos do Kaven Framework, organizados por prioridade.

---

## P0 CRITICAL — LGPD/Privacy (Compliance Blocker)

Todos os itens abaixo bloqueiam conformidade com a LGPD. Devem ser resolvidos antes do próximo lançamento público.

| # | Débito | Arquivo | Esforço | Artigo LGPD |
|---|--------|---------|---------|-------------|
| 1 | Endpoints de direitos do titular ausentes (gdpr-erase, export, consent) | [lgpd-user-rights-endpoints.md](lgpd-user-rights-endpoints.md) | 16-24h | Art. 18 |
| 2 | Aceite de termos não rastreado no model `User` | [lgpd-terms-acceptance-tracking.md](lgpd-terms-acceptance-tracking.md) | 4-6h | Art. 7, 8 |
| 3 | Campo `gdpr_delete_requested` ausente no schema Prisma | [lgpd-gdpr-delete-field.md](lgpd-gdpr-delete-field.md) | 2-4h | Art. 15, 18 |
| 4 | Sistema de consentimento desconectado para usuários da plataforma | [lgpd-consent-system-gap.md](lgpd-consent-system-gap.md) | 12-16h | Art. 7, 8, 9 |
| 5 | `SecurityAuditLog` sem política de retenção (`retentionUntil` ausente) | [lgpd-security-audit-retention.md](lgpd-security-audit-retention.md) | 2-3h | Art. 15, 16 |
| 6 | `DataExportLog` sem isolamento por tenant (`tenantId` ausente) | [lgpd-data-export-tenant-isolation.md](lgpd-data-export-tenant-isolation.md) | 3-5h | Art. 37 |
| 7 | Páginas legais `/terms` e `/privacy` ausentes no tenant app | [lgpd-missing-legal-pages.md](lgpd-missing-legal-pages.md) | 6-10h | Art. 9, 41 |

**Total estimado P0 LGPD:** 45-68 horas

---

## Medium — GDPR Endpoints (pre-launch)

| # | Débito | Arquivo | Sprint |
|---|--------|---------|--------|
| 1 | GDPR compliance endpoints nunca implementados (testes existem como `.todo`) | [gdpr-endpoints-debt.md](gdpr-endpoints-debt.md) | Sprint 1 |

> **Nota:** Este item foi parcialmente absorvido pelo P0 #1 acima (`lgpd-user-rights-endpoints.md`). Manter como referência histórica do commit original.

---

## Como Usar Este Índice

- **P0 CRITICAL:** Bloqueia compliance legal. Prioridade máxima — resolver antes do lançamento.
- **Medium:** Importante mas não bloqueia imediatamente.
- Cada arquivo de débito contém: descrição, evidências, impacto, esforço estimado, ações e referências legais.
- Ao resolver um débito, marcar no arquivo como `Status: RESOLVED` e anotar a data e o PR.

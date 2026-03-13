# Sprint 1 - Risk Register

**Sprint:** Sprint 1 (2026-02-03 - 2026-02-17)
**Goal:** Implementar suite completa de testes de segurança

## Risk Assessment Matrix

| Risk ID  | Risk Name                              | Likelihood (1-10) | Impact (1-10) | Score | Status    |
| -------- | -------------------------------------- | ----------------- | ------------- | ----- | --------- |
| RISK-001 | Test suite takes longer than estimated | 6                 | 5             | 30    | ACTIVE    |
| RISK-002 | False positives in security tests      | 3                 | 3             | 9     | MONITORED |
| RISK-003 | CI integration complexity              | 4                 | 6             | 24    | ACTIVE    |

## Top 3 Risks (Detailed)

### RISK-001: Test suite takes longer than estimated

**Category:** Schedule Risk  
**Likelihood:** 6/10 (MEDIUM)  
**Impact:** 5/10 (MEDIUM)  
**Risk Score:** 30 (HIGH PRIORITY)

**Description:**
A implementação de testes de segurança para 33 models IDOR + todos endpoints CSRF + SQL Injection + XSS pode ultrapassar as 32h estimadas, especialmente considerando:

- Complexidade de setup de fixtures para tenant isolation
- Descoberta de edge cases durante implementação
- Debugging de false positives/negatives

**Mitigation Plan (Proactive):**

1. ✅ Priorizar IDOR tests first (highest risk)
2. ✅ Implementar helpers reusáveis logo no início (reduz tempo de testes subsequentes)
3. ✅ Deixar XSS tests para last (menor risco de segurança)
4. [ ] Time-box cada categoria: IDOR (12h), CSRF (8h), SQL (6h), XSS (6h)
5. [ ] Checkpoint a cada 8h para validar progresso vs. estimativa

**Contingency Plan (Reactive):**
Se ultrapassar 24h sem completar IDOR tests:

1. Reduzir escopo de IDOR para top 15 models mais críticos:
   - Grant, GrantRequest, Policy, Capability
   - Invoice, Payment, Subscription, Order
   - User, Tenant, Organization
   - SecurityAuditLog, ImpersonationSession
   - Project, Task, Space
2. Criar backlog item para IDOR tests dos 18 models restantes (Sprint 2)
3. Manter 100% coverage nos 15 models críticos

**Monitoring:**

- Daily check: Hours spent vs. tests completed
- Alert threshold: > 16h spent with < 50% IDOR tests done

---

### RISK-002: False positives in security tests

**Category:** Quality Risk  
**Likelihood:** 3/10 (LOW)  
**Impact:** 3/10 (LOW)  
**Risk Score:** 9 (LOW PRIORITY)

**Description:**
Security tests podem gerar false positives (falhar quando não deveria) ou false negatives (passar quando há vulnerabilidade), causando:

- Perda de confiança na test suite
- Tempo desperdiçado debugando testes ao invés de código
- Vulnerabilidades reais não detectadas

**Mitigation Plan (Proactive):**

1. ✅ Peer review tests com Security Engineer (via code-reviewer skill)
2. [ ] Validar cada categoria isoladamente antes de integrar no CI
3. [ ] Usar payloads conhecidos de OWASP Top 10
4. [ ] Documentar expected behavior de cada teste
5. [ ] Criar test cases para edge cases conhecidos

**Contingency Plan (Reactive):**
Se false positives detectados:

1. Criar flag `--strict` para rodar apenas testes validados
2. Mover testes experimentais para `apps/api/tests/security/experimental/`
3. Adicionar `.skip()` em testes com false positives até fix
4. Documentar known issues em `docs/testing/security.md`

**Monitoring:**

- Track test flakiness (tests que passam/falham intermitentemente)
- Review test failures: real bug vs. test bug?

---

### RISK-003: CI integration complexity

**Category:** Technical Risk  
**Likelihood:** 4/10 (MEDIUM)  
**Impact:** 6/10 (MEDIUM)  
**Risk Score:** 24 (MEDIUM PRIORITY)

**Description:**
Integração de security tests no GitHub Actions pode falhar devido a:

- Database setup em CI (Postgres container)
- Environment variables não configuradas
- Timeout de testes (security tests podem ser lentos)
- Coverage report generation failures

**Mitigation Plan (Proactive):**

1. [ ] Testar integração CI localmente usando `act` (GitHub Actions local runner)
2. [ ] Validar database setup com `docker compose up -d` antes de rodar testes
3. [ ] Configurar timeout generoso (30min) para security tests
4. [ ] Usar cache de dependencies (pnpm) para acelerar CI
5. [ ] Adicionar retry logic para testes flaky

**Contingency Plan (Reactive):**
Se CI falhar após 3 tentativas de fix:

1. Mover security tests para workflow separado (`.github/workflows/security.yml`)
2. Rodar em paralelo com CI principal (não bloqueia PR)
3. Adicionar status check opcional (warning, não blocker)
4. Escalar para DevOps se problema persistir > 4h

**Monitoring:**

- CI build time (target: < 15min total)
- Security test execution time (target: < 5min)
- Failure rate (target: < 5%)

## Risk Monitoring Schedule

**Daily:**

- Check RISK-001: Hours spent vs. progress
- Review CI failures (RISK-003)

**Mid-Sprint (2026-02-10):**

- Reassess all risks
- Update mitigation plans if needed
- Escalate if any risk score > 40

**End-Sprint (2026-02-17):**

- Document lessons learned
- Update risk likelihood based on actual outcomes
- Feed insights into Sprint 2 planning

## Escalation Path

1. **Developer** (0-4h): Try to resolve independently
2. **Tech Lead** (4-8h): Escalate via GitHub issue
3. **Product Owner** (8h+): Scope reduction decision

## Risk Status Definitions

- **ACTIVE:** Risk is current and requires active mitigation
- **MONITORED:** Risk is low but being watched
- **CLOSED:** Risk no longer applicable
- **REALIZED:** Risk has materialized (move to issues)

---

**Last Updated:** 2026-02-03
**Next Review:** 2026-02-10 (mid-sprint checkpoint)

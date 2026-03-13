# Sprint 1 Plan

**Sprint Duration:** 2026-02-03 - 2026-02-17 (2 semanas)

**Sprint Goal:** Implementar suite completa de testes de segurança cobrindo IDOR, CSRF, SQL Injection e XSS, garantindo que o framework Kaven não possua vulnerabilidades críticas exploráveis em produção.

## Team Capacity

- **Total Hours Available:** 80h (1 dev × 80h × 1.0 = 80h)
- **Total Hours Committed:** 32h
- **Utilization:** 40% (dentro do target de 70-100% - sprint inicial com única story crítica)

## Stories (1)

1. **STORY-001:** Implement Security Test Suite (IDOR, CSRF, SQL Injection, XSS)
   - **Assignee:** @dev (QA Engineer role)
   - **Effort:** 32h
   - **Priority:** P0
   - **Status:** NOT_STARTED

## Dependencies

- Nenhuma dependência externa
- Story é independente e pode ser iniciada imediatamente

## Risks

### 1. Test suite takes longer than estimated

- **Likelihood:** 6/10
- **Impact:** 5/10
- **Mitigation:** Priorizar IDOR tests first (highest risk), deixar XSS para last. Implementar helpers reusáveis logo no início para acelerar desenvolvimento dos testes.
- **Contingency:** Se ultrapassar 24h, reduzir escopo de IDOR tests para top 15 models mais críticos (Grant, Invoice, Payment, Subscription, User, etc.)

### 2. False positives in security tests

- **Likelihood:** 3/10
- **Impact:** 3/10
- **Mitigation:** Peer review tests com Security Engineer. Validar cada categoria de teste isoladamente antes de integrar no CI.
- **Contingency:** Criar flag `--strict` para rodar apenas testes validados, deixar testes experimentais em suite separada.

### 3. CI integration complexity

- **Likelihood:** 4/10
- **Impact:** 6/10
- **Mitigation:** Testar integração CI localmente usando `act` (GitHub Actions local runner) antes de commitar.
- **Contingency:** Se CI falhar, mover security tests para workflow separado que roda em paralelo (não bloqueia PR principal).

## Success Metrics

- [x] Sprint goal defined (1 sentence)
- [ ] All P0 stories completed (STORY-001)
- [ ] Sprint goal achieved (security test suite funcionando)
- [ ] No critical bugs introduced
- [ ] 100% security test coverage nos 4 vetores (IDOR, CSRF, SQL Injection, XSS)

## Communication Plan

**Daily Updates:**

- Self-standup via commit messages
- Progress tracking via story YAML updates

**Blockers:**

- Documentar em STORY-001 YAML
- Escalar via GitHub issue se blocker > 4h

**PR Reviews:**

- Auto-review via code-reviewer skill
- Request external review se mudanças em CI/CD

**Emergencies:**

- Rollback imediato se security tests quebrarem build
- Hotfix branch se vulnerabilidade descoberta durante testes

## Daily Standup

**Format:**

- What did I complete yesterday? (via git log)
- What am I working on today? (via task.md)
- Any blockers? (via STORY-001 YAML)

**Timebox:** 15 minutes (self-review)

## Sprint Review

**Date:** 2026-02-17
**Time:** End of day

**Agenda:**

1. Demo security test suite running
2. Show coverage report (100% target)
3. Walk through CI integration
4. Review documentation (docs/testing/security.md)

## Sprint Retrospective

**Date:** 2026-02-17
**Time:** After sprint review

**Focus:**

- What went well? (security helpers reusability)
- What didn't go well? (time estimates accuracy)
- What can we improve? (test data fixtures management)

## Quality Gates

- [ ] Sprint capacity < 100% (not overcommitted) ✅ 40%
- [ ] Sprint capacity > 70% (not undercommitted) ⚠️ 40% (acceptable for initial sprint)
- [ ] No unresolved blockers ✅
- [ ] All team members have tool access ✅
- [ ] Risk mitigation plans for top 3 risks ✅

## Metrics Tracked

- **Sprint Velocity:** 32h (baseline for future sprints)
- **Capacity Utilization:** 40% (initial sprint, single critical story)
- **Story Completion Rate:** 1/1 (target: 100%)
- **Blocker Count:** 0 (target)
- **PR Review Time:** < 24h (self-review + automated checks)

## Implementation Phases

### Phase 1: Setup & Foundation (2h)

- [ ] Create test directory structure
- [ ] Setup security helpers
- [ ] Create test fixtures
- [ ] Configure Jest for security tests

### Phase 2: IDOR Tests (12h)

- [ ] Implement testIDOR helper
- [ ] Test top 15 critical models
- [ ] Validate tenant isolation
- [ ] Document IDOR patterns

### Phase 3: CSRF Tests (8h)

- [ ] Implement testCSRF helper
- [ ] Test all POST/PUT/DELETE endpoints
- [ ] Validate token generation
- [ ] Document CSRF protection

### Phase 4: SQL Injection Tests (6h)

- [ ] Implement testSQLInjection helper
- [ ] Test search queries
- [ ] Test filter queries
- [ ] Test sort queries

### Phase 5: XSS Tests (6h)

- [ ] Implement testXSS helper
- [ ] Test user inputs
- [ ] Validate HTML sanitization
- [ ] Document XSS prevention

### Phase 6: CI Integration & Documentation (4h)

- [ ] Add test:security script
- [ ] Update GitHub Actions workflow
- [ ] Create docs/testing/security.md
- [ ] Generate coverage report

## Next Steps

1. ✅ Create sprint branch (`feat/sprint-1`)
2. [ ] Start STORY-001 implementation
3. [ ] Follow story-implementation.md workflow
4. [ ] Run quality gates before PR
5. [ ] Merge to main after approval

---

**Status:** Sprint iniciado - Branch `feat/sprint-1` criado
**Next Workflow:** `story-implementation.md` (begin working on STORY-001)

# KAVEN AGENT CORE - Rules Catalog

Version: 1.0.0  
Last Updated: January 24, 2026

---

## Core Rules

Located in `.agent/rules/`

### 00-truth-protocol.md
**Principle:** "No evidence = not done"  
**Enforcement:** All completion claims require Evidence Bundle  
**Applies to:** All workflows, all tasks

### 01-quality-gates.md
**Principle:** Lint + typecheck + test ALWAYS  
**Enforcement:** Pre-commit hooks, pre-push hooks, CI/CD  
**Gates:**
- ESLint (zero warnings)
- TypeScript compiler (zero errors)
- Vitest (all tests pass)
- Build (successful compilation)

### 02-no-gambiarra.md
**Principle:** No workarounds, no hacks  
**Anti-patterns detected:**
- `includes(block)` for idempotency (use markers)
- Silent failures (emit errors)
- Uncommitted changes
- Unvalidated inputs
**Enforcement:** Code review, automated checks

### 03-doc-safe-update.md
**Principle:** Preserve documentation structure  
**Checks:**
- Line count baseline (`wc -l`)
- Heading preservation
- No removal of critical sections
**Applies to:** README updates, doc generation

---

## Kaven-Specific Rules

### 10-kaven-sources-of-truth.md
**Purpose:** Define canonical documentation sources  
**Sources:**
- MASTER PLAN (this document)
- Prisma schema
- API specs (44 endpoints)
- UI specs (TSX components)

### 20-space-context-contract.md
**Purpose:** Multi-tenant fail-secure isolation  
**Requirements:**
- All queries filtered by `tenantId`
- No cross-tenant data leakage
- Space-level isolation enforced
**Enforcement:** Database middleware, API guards

### 21-entitlements-gating-contract.md
**Purpose:** Server-side feature gating  
**Requirements:**
- Check entitlements before execution
- Block operations if limit exceeded
- Return clear error messages
**Enforcement:** Middleware, service layer

---

## Workflow-Specific Rules

### 90-workflow-standards.md
**Requirements for all workflows:**
1. Emit telemetry events
2. Generate evidence bundle
3. Include rollback strategy
4. Validate with quality gates

---

## Security Rules

### snyk_rules.md
**Purpose:** Security scanning triggers  
**Triggers:**
- Dependency changes (`package.json`, `pnpm-lock.yaml`)
- Dockerfile modifications
- Secrets detection
**Actions:**
- Run Snyk scan
- Block on critical vulnerabilities
- Generate security report

---

## Rule Enforcement

Rules are enforced through:

1. **Git Hooks**
   - Pre-commit: Quality gates
   - Pre-push: Signed commits + gates

2. **CI/CD Pipelines**
   - GitHub Actions workflows
   - Quality gate checks
   - Evidence validation

3. **Code Review**
   - PR templates with checklists
   - Evidence bundle required
   - Manual verification

4. **Automated Scripts**
   - `.agent/scripts/validate-evidence.sh`
   - `.agent/scripts/quality-gate.sh`

---

## Adding Custom Rules

Template:

```markdown
# Rule Name

## Principle
One-sentence principle

## Why This Rule Exists
Problem it solves

## Enforcement
How it's enforced

## Violations
What happens when violated

## Examples
Good and bad examples
```

Save in `.agent/rules/XX-rule-name.md`

---

## References

- Philosophy: `.agent/docs/PHILOSOPHY.md`
- Scripts: `.agent/scripts/`
- MASTER PLAN: Section 1 (Philosophy & Anti-Patterns)

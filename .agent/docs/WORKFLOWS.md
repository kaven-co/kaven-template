# KAVEN AGENT CORE - Workflows Catalog

Version: 1.0.0  
Last Updated: January 24, 2026

---

## Available Workflows

Workflows are located in `.agent/workflows/` and can be triggered via `/workflow-name` in Claude.

### Core Workflows

#### `/preflight`
**Purpose:** Pre-flight checks before major tasks  
**When to use:** Before starting implementation, refactoring, or major changes  
**Output:** Scope definition, file identification, quality gate selection

#### `/ci-verify`
**Purpose:** Full quality package (lint + typecheck + test)  
**When to use:** Before PR, before merge  
**Output:** Quality gate results + evidence bundle

#### `/retry-loop`
**Purpose:** Error recovery workflow  
**When to use:** When a command/operation fails  
**Steps:** Reproduce → instrument → hypothesize → test → fix

#### `/verify-claim`
**Purpose:** Validate completion claims  
**When to use:** Agent says "done" but you want proof  
**Output:** Evidence bundle validation

#### `/document`
**Purpose:** Generate Nextra/MDX documentation  
**When to use:** After implementing features  
**Output:** Documentation in `apps/docs/content/`

#### `/doc-safe-update`
**Purpose:** Safe documentation editing  
**When to use:** Updating existing docs without breaking structure  
**Safeguards:** Baseline check, heading preservation

---

## Kaven-Specific Workflows

Located in `.agent/workflows/kaven/`

#### `/cli-modules`
**Purpose:** CLI module system changes  
**When to use:** Adding/removing/updating CLI modules

#### `/cli-auth-marketplace`
**Purpose:** Auth + marketplace implementation  
**When to use:** Working on CLI authentication or marketplace features

#### `/spaces-entitlements`
**Purpose:** Multi-tenant spaces and entitlements  
**When to use:** Working on tenant isolation or feature gating

#### `/readme-update`
**Purpose:** Update Kaven README files  
**When to use:** After adding features or changing architecture

---

## Workflow Standards

All workflows MUST:

1. **Emit telemetry events**
   ```bash
   source .agent/scripts/telemetry.sh
   emit_cli_command_start "workflow-name"
   # ... work ...
   emit_cli_command_end "workflow-name" "true" "$duration"
   ```

2. **Generate evidence bundle**
   ```bash
   ./.agent/scripts/evidence-bundle.sh workflow-name phase-1
   ```

3. **Include rollback strategy**
   - Backup before modifications
   - Restore on failure

4. **Validate with quality gates**
   - Lint + typecheck + test
   - Exit with error if gates fail

---

## Creating Custom Workflows

Template:

```markdown
# Workflow Name

## Trigger
/custom-workflow

## Purpose
Brief description

## Steps
1. Pre-flight checks
2. Implementation
3. Quality gates
4. Evidence generation
5. Documentation

## Success Criteria
- [ ] Gates passed
- [ ] Evidence bundle generated
- [ ] Docs updated

## Rollback
How to undo if something fails
```

---

## References

- Scripts: `.agent/scripts/`
- Rules: `.agent/docs/RULES.md`
- Evidence System: MASTER PLAN Section 4

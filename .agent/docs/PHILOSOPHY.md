# KAVEN AGENT CORE - Philosophy

Version: 1.0.0  
Last Updated: January 24, 2026

---

## Truth Protocol

> **"Without evidence, it doesn't exist."**

Every claim of completion MUST be backed by:
- `git diff --stat` showing actual changes
- Commands executed with their outputs
- Test results (lint + typecheck + test passing)
- Baseline preservation proof (for docs)

## Core Principles

### 1. Everything Governing the Agent is Code

The `.agent/` directory is versioned in git. This means:
- Rules are code
- Workflows are code
- Configuration is code
- Scripts are code

**Why:** Reproducibility, auditability, and version control.

### 2. Secure by Default

Destructive actions require:
- Explicit confirmation
- Comprehensive logging
- Rollback capabilities

**Example:**  
Module removal creates backup before deletion.

### 3. Determinism for Critical Paths

Database migrations, deployments, secrets management, and permissions MUST use scripts, not manual steps.

**Why:** Eliminates human error, ensures consistency.

### 4. Quality is Gate, Not Suggestion

Lint, typecheck, and tests are **mandatory** before:
- Commits (pre-commit hook)
- Pushes (pre-push hook)
- PRs (CI/CD)

**No exceptions.**

### 5. `.agent/` is Attack Surface

Treat `.agent/` directory as executable code:
- Review changes carefully
- Validate scripts before execution
- Never blindly trust content

### 6. Avoid Skill Bloat

Too many skills = increased cost + irrelevant activation risk

**Guideline:** Use specialized skills only when necessary.

## Telemetry-First Philosophy

> "If you can't measure it, you can't improve it."

Every operation emits telemetry:
- Event type + timestamp
- Duration (start → end)
- Success/failure + error details
- Cost estimation
- Context (user, repo, branch, commit)

**Privacy:** User IDs are hashed (SHA-256) for privacy.

**Opt-out:** Set `KAVEN_TELEMETRY=0` to disable.

## Anti-Patterns (What NOT to Do)

### ❌ Report "implemented ✅" without proof
**Problem:** Gemini says "I added the feature" but `git diff` is empty.  
**Fix:** Evidence Bundle MANDATORY before claim.

### ❌ Summarize docs instead of preserving them
**Problem:** Gemini "updates" README by reducing 800 lines to 200.  
**Fix:** Baseline check (`wc -l`) + heading preservation.

### ❌ Fix without understanding context
**Problem:** Gemini "fixes" error by commenting out failing line.  
**Fix:** `/debug-triage` workflow (reproduce → instrument → hypothesize → test → fix).

### ❌ Add code without tests
**Problem:** Gemini implements feature but skips test creation.  
**Fix:** Quality gates block merge without tests.

### ❌ Fake idempotency
**Problem:** Gemini uses `includes(block)` which breaks on reformat.  
**Fix:** Markers per module (`// [KAVEN_MODULE:name BEGIN]`).

### ❌ Silent failures on removal
**Problem:** Gemini "removes" module but returns false silently.  
**Fix:** Loud warnings + exit codes + `module doctor`.

---

## References

- MASTER PLAN: Section 1 (Philosophy & Anti-Patterns)
- Evidence Bundle System: `.agent/docs/WORKFLOWS.md`
- Quality Gates: `.agent/docs/RULES.md`

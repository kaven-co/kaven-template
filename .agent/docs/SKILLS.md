# KAVEN AGENT CORE - Skills Catalog

Version: 1.0.0  
Last Updated: January 24, 2026

---

## What Are Skills?

Skills are specialized knowledge packages that Claude can activate when needed. They provide:
- Domain-specific expertise
- Tool integrations
- Workflow templates
- Best practices

**Location:** `.agent/skills/`

---

## Available Skills

### kaven-domain-guard
**Purpose:** Enforce Kaven domain specifications  
**When activated:** Working on Kaven-specific features  
**Knowledge:**
- Multi-tenancy patterns
- Spaces & entitlements
- Plans & products system
- Payment integrations
**Activation:** Automatically when editing Kaven code

### security-audit-lite
**Purpose:** Basic security checklist  
**When activated:** Security reviews, PR reviews  
**Checks:**
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Secret exposure
**Activation:** `/security-audit` or before production deploy

---

## Skill Structure

Each skill is a directory with:
```
skill-name/
└── SKILL.md        # Skill definition
```

**SKILL.md format:**
```markdown
# Skill Name

## Description
What this skill does

## When to Activate
Trigger conditions

## Knowledge
Specialized knowledge included

## Tools
Tools this skill provides

## Examples
Usage examples
```

---

## Creating Custom Skills

1. Create directory: `.agent/skills/my-skill/`
2. Add `SKILL.md` with:
   - Clear description
   - Activation triggers
   - Knowledge domain
   - Tool integrations (if any)
3. Keep skills focused (avoid bloat)
4. Document activation patterns

---

## Skill Best Practices

✅ **DO:**
- Keep skills focused on one domain
- Document activation triggers clearly
- Update skills as knowledge evolves
- Test skills in isolation

❌ **DON'T:**
- Create overlapping skills
- Include too much generic knowledge
- Activate multiple skills simultaneously
- Forget to update documentation

---

## References

- Philosophy: `.agent/docs/PHILOSOPHY.md` (Section: Avoid Skill Bloat)
- Workflows: `.agent/docs/WORKFLOWS.md`

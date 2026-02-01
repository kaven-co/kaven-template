# Agent Core - Troubleshooting

**Version:** 1.0.0  
**Last Updated:** January 29, 2026

---

## Common Issues

### 1. Git Signing Not Working

**Symptom:**
```
error: gpg failed to sign the data
```

**Solutions:**

1. Check SSH key exists:
```bash
ls ~/.ssh/id_ed25519.pub
# or
ls ~/.ssh/id_rsa.pub
```

2. Verify git config:
```bash
git config --local commit.gpgsign
git config --local gpg.format
git config --local user.signingkey
```

3. Recreate allowed_signers:
```bash
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

4. Run setup script:
```bash
./.agent/scripts/setup-git-signing.sh
```

---

### 2. Pre-commit Hook Not Running

**Symptom:**
Commits succeed without quality gates running

**Solutions:**

1. Reinstall hooks:
```bash
./.agent/scripts/install-hooks.sh
```

2. Check hook permissions:
```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

3. Verify symlinks:
```bash
ls -la .git/hooks/pre-commit
# Should point to ../../.agent/scripts/pre-commit.sh
```

---

### 3. Telemetry Issues

**Symptom:**
```
Permission denied: ~/.agent-core/project-name/telemetry.log
```

**Solutions:**

1. Fix permissions:
```bash
PROJECT_NAME=$(basename $(pwd))
chmod 755 ~/.agent-core/$PROJECT_NAME
chmod 644 ~/.agent-core/$PROJECT_NAME/telemetry.log
```

2. Recreate telemetry directory:
```bash
PROJECT_NAME=$(basename $(pwd))
rm -rf ~/.agent-core/$PROJECT_NAME
mkdir -p ~/.agent-core/$PROJECT_NAME
touch ~/.agent-core/$PROJECT_NAME/telemetry.log
```

3. Disable telemetry (temporary):
```bash
export AGENT_CORE_TELEMETRY=0
```

4. View telemetry:
```bash
tail -f ~/.agent-core/$(basename $PWD)/telemetry.log
```

---

### 4. Quality Gates Failing

**Symptom:**
```
AG_LINT_CMD not found
```

**Solutions:**

1. Check config exists:
```bash
cat .agent/config/quality.env
```

2. Source config before running:
```bash
source .agent/config/quality.env
echo $AG_LINT_CMD
```

3. Verify commands work:
```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

### 5. Evidence Bundle Errors

**Symptom:**
```
Error: Evidence directory not found
```

**Solutions:**

1. Create directories:
```bash
mkdir -p .agent/artifacts/evidence
mkdir -p .agent/artifacts/reports
mkdir -p .agent/artifacts/logs
```

2. Run bootstrap:
```bash
./.agent/scripts/bootstrap.sh
```

---

### 6. Branch Name Rejected

**Symptom:**
```
Error: Invalid branch name
```

**Solutions:**

Valid branch patterns:
- `feat/feature-name`
- `fix/bug-description`
- `docs/update-readme`
- `chore/cleanup`
- `refactor/module-name`
- `test/add-tests`

Create correct branch:
```bash
git checkout -b feat/my-feature
```

---

### 7. Unsigned Commits Error

**Symptom:**
```
Error: Found unsigned commit(s)
```

**Solutions:**

1. Re-sign last commit:
```bash
git commit --amend --no-edit -S
```

2. Re-sign multiple commits:
```bash
git rebase -i origin/main --exec 'git commit --amend --no-edit -S'
```

3. Check signing is enabled:
```bash
git config --local commit.gpgsign
# Should return: true
```

---

### 8. BASH_SOURCE Error (Zsh)

**Symptom:**
```
BASH_SOURCE[0]: parameter not set
```

**Solution:**
Scripts are compatible with both Bash and Zsh. If you see this error:

1. Ensure you're using latest scripts
2. Run scripts with bash explicitly:
```bash
bash ./.agent/scripts/telemetry.sh
```

---

## Getting Help

1. Check this troubleshooting guide
2. Review `.agent/docs/DEV_SETUP.md`
3. Check skill: `.agent/skills/lessons-learned/SKILL.md`
4. Search existing issues on GitHub

---

## Debug Mode

Enable verbose output:
```bash
export DEBUG=1
./.agent/scripts/bootstrap.sh
```

Check all configs:
```bash
git config --local --list | grep -E "(gpg|sign)"
```

Test telemetry:
```bash
./.agent/scripts/telemetry.sh test.event true 0 '{}'
cat ~/.agent-core/$(basename $PWD)/telemetry.log | tail -1
```

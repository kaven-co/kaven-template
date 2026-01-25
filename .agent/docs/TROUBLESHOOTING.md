# KAVEN AGENT CORE - Troubleshooting

Version: 1.0.0  
Last Updated: January 24, 2026

---

## Common Issues & Solutions

### 🔒 Git Signing Issues

#### Problem: "Unsigned commit"
```
❌ Error: Found 1 unsigned commit(s)
```

**Solution:**
```bash
# Configure SSH signing
git config --local gpg.format ssh
git config --local commit.gpgsign true
git config --local user.signingkey ~/.ssh/id_ed25519.pub

# If you don't have an SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub as "Signing Key"
cat ~/.ssh/id_ed25519.pub
```

#### Problem: "Signing key not found"
```
❌ Error: Signing key not found at ~/.ssh/id_ed25519.pub
```

**Solution:**
```bash
# Check available keys
ls -la ~/.ssh/

# Use different key
git config --local user.signingkey ~/.ssh/id_rsa.pub

# Or generate new one
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### Problem: "No signature could be verified"
```
error: no signature found
```

**Cause:** `allowed_signers` file missing

**Solution:**
```bash
# Create allowed_signers file
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers

# Configure Git to use it
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers

# Verify
cat ~/.ssh/allowed_signers
```

#### Problem: "Bad signature"
```
error: gpg.ssh.allowedSignersFile needs to be configured
```

**Solution:**
```bash
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

#### Problem: "Wrong email in signature"

**Cause:** Signature email doesn't match allowed_signers

**Solution:**
```bash
# Check current email
git config user.email

# Update allowed_signers with correct email
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers
```

#### Problem: Re-sign old commits

**Solution:**
```bash
# Re-sign last commit
git commit --amend --no-edit -S

# Re-sign all commits since origin/main
git rebase -i origin/main --exec 'git commit --amend --no-edit -S'
```

**For complete Git signing setup, see:** [DEV_SETUP.md](DEV_SETUP.md)

---

### 🧪 Quality Gate Failures

#### Problem: Lint fails
```
❌ Lint failed
```

**Solution:**
```bash
# Run lint to see errors
pnpm run lint

# Auto-fix if possible
pnpm run lint:fix

# If no lint:fix script exists
pnpm eslint 'src/**/*.{ts,tsx}' --fix
```

#### Problem: Typecheck fails
```
❌ Typecheck failed (3 errors)
```

**Solution:**
```bash
# See detailed errors
pnpm run typecheck

# Common fixes:
# 1. Add missing types
# 2. Fix type mismatches
# 3. Add @ts-expect-error for third-party issues (last resort)
```

#### Problem: Tests fail
```
❌ Tests failed (2 tests)
```

**Solution:**
```bash
# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test src/module.test.ts

# Update snapshots if needed
pnpm test -u
```

---

### 📦 Evidence Bundle Issues

#### Problem: "Evidence bundle failed"
```
❌ Quality gates failed. Evidence bundle contains failure details.
```

**Solution:**
1. Fix the failing quality gate first
2. Re-run evidence bundle generation:
   ```bash
   ./.agent/scripts/evidence-bundle.sh manual test
   ```
3. Validate the bundle:
   ```bash
   ./.agent/scripts/validate-evidence.sh .agent/artifacts/evidence/latest.json
   ```

#### Problem: "jq: command not found"
```
/bin/sh: 1: jq: not found
```

**Solution:**
```bash
# Install jq
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Verify
jq --version
```

---

### 🚀 Git Hook Issues

#### Problem: "Pre-commit hook failed"
```
❌ Error: Git user not configured
```

**Solution:**
```bash
git config --local user.name "Your Name"
git config --local user.email "your@email.com"
```

#### Problem: "Hook not executable"
```
permission denied: .git/hooks/pre-commit
```

**Solution:**
```bash
# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

# Or re-install hooks
./.agent/scripts/install-hooks.sh
```

#### Problem: "Hook symlink broken"
```
cannot execute: No such file or directory
```

**Solution:**
```bash
# Remove broken symlinks
rm .git/hooks/pre-commit
rm .git/hooks/pre-push

# Reinstall hooks
./.agent/scripts/install-hooks.sh
```

---

### 📊 Telemetry Issues

#### Problem: Telemetry file permission denied
```
❌ Permission denied: ~/.kaven/telemetry.log
```

**Solution:**
```bash
# Fix permissions
chmod 600 ~/.kaven/telemetry.log

# Or recreate directory
rm -rf ~/.kaven
mkdir -p ~/.kaven
touch ~/.kaven/telemetry.log
chmod 600 ~/.kaven/telemetry.log
```

#### Problem: Want to disable telemetry
```
How do I turn off telemetry?
```

**Solution:**
```bash
# Add to ~/.zshrc or ~/.bashrc
export KAVEN_TELEMETRY=0

# Or set temporarily
KAVEN_TELEMETRY=0 pnpm dev
```

---

### 🔀 PR Creation Issues

#### Problem: "gh: command not found"
```
❌ Error: GitHub CLI (gh) is not installed
```

**Solution:**
```bash
# Install GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Other
# https://cli.github.com

# Authenticate
gh auth login
```

#### Problem: "Invalid branch name"
```
❌ Error: Invalid branch name: my-feature
```

**Solution:**
```bash
# Branch must follow pattern: type/name
# Valid types: feat, fix, docs, chore, refactor, test

# Rename branch
git branch -m feat/my-feature

# Or create correct branch
git checkout -b feat/my-feature
```

---

### 🏗️ Bootstrap Issues

#### Problem: Bootstrap fails halfway
```
❌ Bootstrap completed with errors
```

**Solution:**
1. Check which step failed
2. Fix the specific issue
3. Re-run bootstrap:
   ```bash
   ./.agent/scripts/bootstrap.sh
   ```

#### Problem: "pnpm: command not found"
```
⚠️  No package manager found
```

**Solution:**
```bash
# Install pnpm
npm install -g pnpm

# Or use npm instead
# (bootstrap will detect npm automatically)
```

---

## Getting Help

If none of these solutions work:

1. **Check logs:**
   ```bash
   cat .agent/artifacts/logs/latest.log
   ```

2. **Check telemetry:**
   ```bash
   tail -f ~/.kaven/telemetry.log
   ```

3. **Validate agent setup:**
   ```bash
   ./.agent/scripts/validate_agent.sh
   ```

4. **Generate evidence for debugging:**
   ```bash
   ./.agent/scripts/evidence-bundle.sh debug troubleshooting
   ```

5. **Ask in Claude:**
   - Describe the issue
   - Attach evidence bundle
   - Include error messages

---

## Reset Everything

If all else fails, nuclear option:

```bash
# WARNING: This will reset everything!

# 1. Remove all artifacts
rm -rf .agent/artifacts/*

# 2. Remove git hooks
rm .git/hooks/pre-commit
rm .git/hooks/pre-push

# 3. Re-bootstrap
./.agent/scripts/bootstrap.sh

# 4. Verify
./.agent/scripts/validate_agent.sh
```

---

## References

- Scripts: `.agent/scripts/`
- Documentation: `.agent/docs/`
- MASTER PLAN: Full implementation guide

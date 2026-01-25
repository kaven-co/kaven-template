# 🔧 KAVEN CLI - DEVELOPER SETUP GUIDE

**Version:** 1.0.0  
**Last Updated:** January 24, 2026  
**Target:** New developers setting up local environment

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Quick Start (TL;DR)](#quick-start-tldr)
3. [Level 1: Minimum Required Setup](#level-1-minimum-required-setup)
4. [Level 2: Recommended Setup](#level-2-recommended-setup)
5. [Level 3: Advanced Configuration](#level-3-advanced-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

Before starting, ensure you have:

- ✅ **Git** 2.34+ installed (`git --version`)
- ✅ **Node.js** 20+ installed (`node --version`)
- ✅ **pnpm** 9+ installed (`pnpm --version`)
- ✅ **SSH key** generated (`ls ~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`)
- ✅ **GitHub account** with SSH key added (https://github.com/settings/keys)
- ✅ **Write access** to KavenCompany/kaven-cli repository

**If you don't have an SSH key:**

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or RSA key (alternative)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/ssh/new
cat ~/.ssh/id_ed25519.pub
```

---

## QUICK START (TL;DR)

**For experienced developers who want to get started immediately:**

```bash
# 1. Clone repo
git clone git@github.com:KavenCompany/kaven-cli.git
cd kaven-cli

# 2. Run setup script (does everything)
./.agent/scripts/setup-git-signing.sh

# 3. Bootstrap project
pnpm run bootstrap

# 4. Verify setup
git log --show-signature -1
pnpm run quality

# 5. Start coding!
git checkout -b feat/your-feature
```

**Done!** If everything passed, skip to [Verification](#verification).

If you encounter issues or want to understand what's happening, continue to Level 1.

---

## LEVEL 1: MINIMUM REQUIRED SETUP

**Who needs this:** Everyone (mandatory)

**Time required:** ~2 minutes

**What it does:** Enables commit signing and validation

### Step 1: Configure Git User

```bash
# Set your name and email (if not already set)
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# Verify
git config --global user.name
git config --global user.email
```

### Step 2: Enable SSH Commit Signing

```bash
# Navigate to project root
cd ~/projects/kaven-cli

# Configure signing (local to this repo)
git config --local commit.gpgsign true
git config --local gpg.format ssh
git config --local user.signingkey ~/.ssh/id_ed25519.pub  # Or id_rsa.pub
```

**Note:** We use `--local` instead of `--global` to keep settings per-project.

**Why SSH instead of GPG?**
- ✅ Simpler (reuses existing SSH key)
- ✅ No GPG agent setup needed
- ✅ Works out-of-the-box on all platforms
- ✅ GitHub natively supports SSH signing

### Step 3: Create Allowed Signers File

Git needs a "trust list" to validate SSH signatures. This tells Git: "Trust this key for this email."

```bash
# Auto-generate allowed_signers file
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers

# Configure Git to use it
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

**What this does:**
- Creates `~/.ssh/allowed_signers` with format: `email key-type key-data`
- Tells Git to trust signatures from this key

### Step 4: Test Signing

```bash
# Create a test commit
echo "# Test" >> README.md
git add README.md
git commit -S -m "test: verify signing"

# Verify signature
git log --show-signature -1

# Expected output:
# Good "ssh" signature for your_email@example.com with ED25519 key SHA256:...
```

**If you see "Good signature"** ✅ → You're done with Level 1!

**If you see errors** ❌ → See [Troubleshooting](#troubleshooting)

---

## LEVEL 2: RECOMMENDED SETUP

**Who needs this:** Developers with password-protected SSH keys

**Time required:** ~3 minutes

**What it does:** 
- Prevents repeated password prompts
- Ensures TTY is available for Git operations
- Works across both Bash and Zsh

### Step 1: Create Common Shell Config

Create a shared config file that works in both Bash and Zsh:

```bash
# Create ~/.common_shell_configs
cat > ~/.common_shell_configs <<'EOF'
# KAVEN Git Signing Configuration
# This file is sourced by both ~/.bashrc and ~/.zshrc

# Export GPG_TTY for Git signing
export GPG_TTY=$(tty)

# Auto-start ssh-agent if not running
if [ -z "$SSH_AUTH_SOCK" ]; then
   eval $(ssh-agent -s) > /dev/null
   ssh-add ~/.ssh/id_ed25519 2>/dev/null || ssh-add ~/.ssh/id_rsa 2>/dev/null
fi
EOF
```

### Step 2: Source from Shell Configs

Add to **both** `~/.bashrc` and `~/.zshrc`:

```bash
# Add to ~/.bashrc
echo "" >> ~/.bashrc
echo "# KAVEN Common Shell Configs" >> ~/.bashrc
echo "source ~/.common_shell_configs" >> ~/.bashrc

# Add to ~/.zshrc
echo "" >> ~/.zshrc
echo "# KAVEN Common Shell Configs" >> ~/.zshrc
echo "source ~/.common_shell_configs" >> ~/.zshrc
```

### Step 3: Reload Shell

```bash
# For Zsh users
source ~/.zshrc

# For Bash users
source ~/.bashrc
```

### Step 4: Verify ssh-agent

```bash
# Check if ssh-agent is running
ssh-add -l

# Expected output:
# 256 SHA256:... your_email@example.com (ED25519)

# If no identities, add manually:
ssh-add ~/.ssh/id_ed25519
```

**Benefits:**
- ✅ Password asked only once per session
- ✅ Works across terminal tabs
- ✅ Compatible with Bash and Zsh
- ✅ GPG_TTY set correctly for Git

---

## LEVEL 3: ADVANCED CONFIGURATION

**Who needs this:** Developers with complex setups

**Time required:** ~5 minutes

### Multiple SSH Keys

If you have different keys for different repos:

```bash
# Add all keys to allowed_signers
cat > ~/.ssh/allowed_signers <<EOF
your_email@example.com $(cat ~/.ssh/id_ed25519.pub)
work_email@company.com $(cat ~/.ssh/id_rsa_work.pub)
EOF

# Configure per-repo signing key
cd ~/projects/kaven-cli
git config --local user.signingkey ~/.ssh/id_ed25519.pub

cd ~/projects/work-repo
git config --local user.signingkey ~/.ssh/id_rsa_work.pub
```

### Global SSH Signing

If you want SSH signing for **all** Git repos (not just Kaven):

```bash
# Configure globally
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers

# Verify
git config --global --list | grep -E "(gpg|sign)"
```

**Warning:** This affects ALL repos on your machine.

### Custom Signing Key Per Commit

Override signing key for a single commit:

```bash
# Use different key for this commit only
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_other" git commit -S -m "fix: urgent patch"
```

### Disable Signing for Specific Repo

```bash
# In a repo where you don't want signing
git config --local commit.gpgsign false
```

---

## VERIFICATION

### ✅ Full System Check

Run this comprehensive verification:

```bash
cd ~/projects/kaven-cli

# 1. Check Git config
echo "🔍 Checking Git configuration..."
git config --local commit.gpgsign
git config --local gpg.format
git config --local user.signingkey
git config --local gpg.ssh.allowedSignersFile

# Expected:
# true
# ssh
# /home/user/.ssh/id_ed25519.pub
# /home/user/.ssh/allowed_signers

# 2. Check allowed_signers file
echo "🔍 Checking allowed_signers..."
cat ~/.ssh/allowed_signers

# Expected:
# your_email@example.com ssh-ed25519 AAAA...

# 3. Check last commit signature
echo "🔍 Checking last commit signature..."
git log --show-signature -1

# Expected:
# Good "ssh" signature for your_email@example.com...

# 4. Run quality gates
echo "🔍 Running quality gates..."
pnpm run quality

# Expected:
# ✅ Lint passed
# ✅ Typecheck passed
# ✅ Tests passed

# 5. Test pre-commit hook
echo "🔍 Testing pre-commit hook..."
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify hooks"

# Expected:
# 🔒 Running pre-commit checks...
# ✅ Pre-commit checks passed

# 6. Clean up test commit
git reset --soft HEAD~1
git restore --staged README.md
git restore README.md
```

**If all checks pass** ✅ → You're fully set up!

**If any check fails** ❌ → See [Troubleshooting](#troubleshooting)

---

## TROUBLESHOOTING

### Issue 1: "No signature could be verified"

**Symptom:**
```
error: no signature found
```

**Cause:** `allowed_signers` file missing or misconfigured

**Fix:**
```bash
# Recreate allowed_signers
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers

# Reconfigure Git
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers

# Verify
cat ~/.ssh/allowed_signers
```

### Issue 2: "Could not read from remote repository"

**Symptom:**
```
Permission denied (publickey)
```

**Cause:** SSH key not added to GitHub

**Fix:**
```bash
# 1. Copy your public key
cat ~/.ssh/id_ed25519.pub

# 2. Add to GitHub: https://github.com/settings/ssh/new

# 3. Test connection
ssh -T git@github.com

# Expected:
# Hi username! You've successfully authenticated...
```

### Issue 3: "Bad signature"

**Symptom:**
```
error: gpg.ssh.allowedSignersFile needs to be configured
```

**Cause:** Git doesn't know where to find allowed_signers

**Fix:**
```bash
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

### Issue 4: Pre-commit hook not running

**Symptom:**
Commits succeed without quality gates running

**Cause:** Git hooks not installed

**Fix:**
```bash
# Reinstall hooks
./.agent/scripts/install-hooks.sh

# Verify symlinks
ls -la .git/hooks/pre-commit
ls -la .git/hooks/pre-push

# Expected:
# lrwxrwxrwx ... .git/hooks/pre-commit -> ../../.agent/scripts/pre-commit.sh
```

### Issue 5: "unsigned commit" error on push

**Symptom:**
```
❌ Error: Found 1 unsigned commit(s)
```

**Cause:** Commit created before signing was configured

**Fix:**
```bash
# Re-sign the commit
git commit --amend --no-edit -S

# Or re-sign all commits since main
git rebase -i origin/main --exec 'git commit --amend --no-edit -S'
```

### Issue 6: "Wrong SSH key used"

**Symptom:**
Signature shows different email than expected

**Cause:** Multiple SSH keys, wrong one being used

**Fix:**
```bash
# 1. Check which key Git is using
git config --local user.signingkey

# 2. Update to correct key
git config --local user.signingkey ~/.ssh/id_ed25519.pub

# 3. Re-sign last commit
git commit --amend --no-edit -S
```

### Issue 7: ssh-agent password prompt on every commit

**Symptom:**
SSH key password asked repeatedly

**Cause:** ssh-agent not running or key not added

**Fix:**
```bash
# Start ssh-agent
eval $(ssh-agent -s)

# Add key permanently
ssh-add ~/.ssh/id_ed25519

# Or follow Level 2 setup for automatic agent
```

### Issue 8: "BASH_SOURCE: parameter not set" (Zsh users)

**Symptom:**
```
.agent/scripts/telemetry.sh:166: BASH_SOURCE[0]: parameter not set
```

**Cause:** Script using Bash-specific variable in Zsh

**Fix:**
Already fixed in telemetry.sh v1.1.0+. If you still see this:

```bash
# Update to latest scripts
git pull origin main
./.agent/scripts/bootstrap.sh
```

---

## ADDITIONAL RESOURCES

- 📘 [Git Signing Documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- 📘 [KAVEN AGENT CORE Philosophy](/.agent/docs/PHILOSOPHY.md)
- 📘 [Git Hooks Guide](/.agent/docs/WORKFLOWS.md)
- 📘 [Quality Gates Reference](/.agent/docs/RULES.md)

---

## SUPPORT

If you encounter issues not covered here:

1. Check [TROUBLESHOOTING.md](/.agent/docs/TROUBLESHOOTING.md)
2. Search existing GitHub Issues
3. Ask in #dev-support Discord channel
4. Create new issue with `setup` label

---

**Remember:** This setup is **one-time per machine**. Once configured, you won't need to repeat it.

**Happy coding!** 🚀

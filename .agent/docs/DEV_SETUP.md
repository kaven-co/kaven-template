# Agent Core - Developer Setup Guide

**Version:** 1.0.0  
**Last Updated:** January 29, 2026

---

## Prerequisites

- Git 2.34+
- Node.js 20+
- pnpm 9+
- SSH key generated

## Quick Start

```bash
cd /your/project
./.agent/scripts/setup-git-signing.sh
./.agent/scripts/bootstrap.sh
```

## Step 1: Configure Git User

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

## Step 2: Enable SSH Signing

```bash
git config --local commit.gpgsign true
git config --local gpg.format ssh
git config --local user.signingkey ~/.ssh/id_ed25519.pub
```

## Step 3: Create Allowed Signers

```bash
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers
git config --local gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

## Step 4: Verify

```bash
git log --show-signature -1
```

Expected: "Good ssh signature"

## Troubleshooting

See: `.agent/docs/TROUBLESHOOTING.md`

Quick fixes:
```bash
# Re-run signing setup
./.agent/scripts/setup-git-signing.sh

# Reinstall hooks
./.agent/scripts/install-hooks.sh

# Re-sign last commit
git commit --amend --no-edit -S
```

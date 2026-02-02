# Agent Core AGENT CORE - GitHub Actions Security Guide

**Version:** 1.0.0  
**Last Updated:** January 24, 2026

---

## 🔒 SECURITY PRINCIPLES

### 1. Explicit Permissions (Least Privilege)

**Always set explicit `permissions:` block** in every workflow.

**Default (INSECURE):**
```yaml
# ❌ BAD: Inherits repository permissions (often read-write)
jobs:
  build:
    runs-on: ubuntu-latest
```

**Secure (RECOMMENDED):**
```yaml
# ✅ GOOD: Explicit minimal permissions
permissions:
  contents: read        # Read repo contents only
  pull-requests: write  # Comment on PRs (if needed)

jobs:
  build:
    runs-on: ubuntu-latest
```

### 2. Don't Persist Credentials

```yaml
# ✅ GOOD: Don't persist GITHUB_TOKEN in checkout
- uses: actions/checkout@v4
  with:
    persist-credentials: false
```

### 3. Pin Action Versions

```yaml
# ❌ BAD: Can change unexpectedly
- uses: actions/checkout@v4

# ✅ GOOD: Pin to specific SHA
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

### 4. Validate Inputs

```yaml
# ✅ GOOD: Validate user inputs in workflow_dispatch
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release'
        required: true
        type: string

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Validate version format
        run: |
          if ! [[ "${{ inputs.version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Invalid version format"
            exit 1
          fi
```

---

## 📋 REQUIRED PERMISSIONS BY WORKFLOW TYPE

### CI/CD (Quality Gates)

```yaml
permissions:
  contents: read        # Read code
  pull-requests: write  # Comment on PRs (optional)
```

### Deploy to Staging/Production

```yaml
permissions:
  contents: read        # Read code
  deployments: write    # Create deployments
  statuses: write       # Update commit status
```

### Release Creation

```yaml
permissions:
  contents: write       # Create releases
  pull-requests: write  # Comment on PRs
```

### Dependabot Auto-Merge

```yaml
permissions:
  contents: write       # Merge PR
  pull-requests: write  # Approve PR
```

---

## 🛡️ SECURE WORKFLOW TEMPLATES

### Template 1: CI/CD (Basic)

```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

permissions:
  contents: read
  pull-requests: write

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test
      - run: pnpm run build
```

### Template 2: Deploy to Vercel

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

permissions:
  contents: read
  deployments: write
  statuses: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://agent-core.site
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

### Template 3: Release Creation

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version (e.g., 1.2.3)'
        required: true

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
          fetch-depth: 0  # Full history for changelog
      
      - name: Validate version
        run: |
          if ! [[ "${{ inputs.version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Invalid version format"
            exit 1
          fi
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ inputs.version }}
          generate_release_notes: true
```

---

## 🔍 SECURITY CHECKLIST

Before merging any workflow, verify:

- [ ] `permissions:` block present and minimal
- [ ] `persist-credentials: false` in checkout
- [ ] Actions pinned to specific versions (or SHA)
- [ ] No secrets in logs (use `::add-mask::`)
- [ ] Input validation for `workflow_dispatch`
- [ ] No untrusted code execution (e.g., `${{ github.event.issue.title }}`)
- [ ] Secrets stored in GitHub Secrets (not hardcoded)
- [ ] GITHUB_TOKEN permissions documented

---

## 🚨 COMMON VULNERABILITIES

### 1. Script Injection

**❌ VULNERABLE:**
```yaml
- name: Greet user
  run: echo "Hello ${{ github.event.issue.title }}"
```

**✅ SECURE:**
```yaml
- name: Greet user
  env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "Hello $TITLE"
```

### 2. Excessive Permissions

**❌ VULNERABLE:**
```yaml
permissions: write-all  # DON'T DO THIS!
```

**✅ SECURE:**
```yaml
permissions:
  contents: read
  pull-requests: write
```

### 3. Unvalidated Inputs

**❌ VULNERABLE:**
```yaml
- run: npm install ${{ github.event.inputs.package }}
```

**✅ SECURE:**
```yaml
- name: Validate package name
  run: |
    if ! [[ "${{ github.event.inputs.package }}" =~ ^[a-z0-9-]+$ ]]; then
      echo "Invalid package name"
      exit 1
    fi
- run: npm install ${{ github.event.inputs.package }}
```

---

## 📚 REFERENCES

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)

---

## 🔧 AUTOMATED SECURITY SCANNING

Add to your repository:

**.github/workflows/security.yml:**
```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

jobs:
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3
```

---

**Always follow the principle of least privilege!** 🔒

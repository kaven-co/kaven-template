# 🚀 Kaven Template

**Universal template for all KavenCompany repositories**

This template includes:
- ✅ KAVEN AGENT CORE (complete)
- ✅ Git hooks (pre-commit, pre-push)
- ✅ Quality gates (lint, typecheck, test)
- ✅ Evidence bundle system
- ✅ Telemetry system
- ✅ GitHub Actions CI/CD
- ✅ Commit signing setup
- ✅ Complete documentation

---

## 🎯 Quick Start

### 1. Use This Template

Click "Use this template" → "Create a new repository"

### 2. Clone & Bootstrap

```bash
git clone git@github.com:KavenCompany/your-new-repo.git
cd your-new-repo
pnpm run bootstrap
```

### 3. Setup Git Signing

```bash
# Automatic
./.agent/scripts/setup-git-signing.sh

# Or manual
# See: .agent/docs/DEV_SETUP.md
```

### 4. Customize

Edit:
- `package.json` - name, description
- `README.md` - project-specific content
- `src/` - your code

### 5. Start Coding

```bash
git checkout -b feat/your-feature
# ... code ...
git add .
git commit -m "feat: your feature"
git push
```

---

## 📋 Included Files

### `.agent/` - KAVEN AGENT CORE
- `scripts/` - 10 automation scripts
- `docs/` - 7 documentation files
- `config/` - Environment configs
- `rules/` - Quality rules
- `workflows/` - Reusable workflows
- `skills/` - Agent skills

### `.github/`
- `workflows/ci.yml` - CI/CD pipeline
- `pull_request_template.md` - PR template

### Root Configs
- `.gitignore` - Comprehensive ignore rules
- `.eslintrc.js` - ESLint config
- `tsconfig.json` - TypeScript config
- `vitest.config.ts` - Vitest config
- `package.json` - NPM package config

---

## 🔧 Customization by Repo Type

### CLI Tool
```json
{
  "name": "kaven-cli",
  "bin": { "kaven": "./dist/index.js" }
}
```

### Framework/Library
```json
{
  "name": "kaven-framework",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### Backend API
```json
{
  "name": "kaven-marketplace",
  "main": "./dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  }
}
```

### Website (Next.js)
```json
{
  "name": "kaven-site",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 📚 Documentation

- **Setup Guide:** `.agent/docs/DEV_SETUP.md`
- **Philosophy:** `.agent/docs/PHILOSOPHY.md`
- **Workflows:** `.agent/docs/WORKFLOWS.md`
- **Troubleshooting:** `.agent/docs/TROUBLESHOOTING.md`
- **Security:** `.agent/docs/GITHUB_ACTIONS_SECURITY.md`

---

## 🔒 Security

- Commit signing mandatory
- Quality gates enforced
- GitHub Actions with minimal permissions
- No secrets in code

---

## 🆘 Support

- **Issues:** https://github.com/KavenCompany/kaven-template/issues
- **Docs:** https://docs.kaven.site
- **Email:** support@kaven.site

---

**Version:** 1.0.0  
**Last Updated:** January 25, 2026  
**License:** Apache-2.0

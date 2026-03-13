# Kaven Platform — Plano de Deploy Produção

> **Criado:** 2026-02-24 | **Meta:** Launch March 31, 2026
> **Readiness Score:** 5.4/10 (Code 9/10, Infra 3/10, Docs 2/10)
> **Resumo:** Código pronto, infraestrutura não.

---

## Estado Atual

```
kaven init my-saas    ← CLI pronto, mas template incompleto
    ↓
kaven auth login      ← Marketplace API não deployed
    ↓
kaven module install  ← S3 configurado, API não acessível
    ↓
pnpm dev              ← Funciona local, sem email/payments em prod
    ↓
User signup + email   ← SES pendente verificação DNS
    ↓
PROVA FINAL           ← Tudo acima precisa funcionar
```

---

## Blocker #0: kaven-template Quebrado

**O template atual é genérico** — não tem estrutura de framework.

`kaven init` espera encontrar:
- `.env.example` com placeholders → **NÃO EXISTE**
- `prisma/schema.prisma` → **NÃO EXISTE**
- `apps/api/package.json` → **NÃO EXISTE**

**Decisão necessária:** O template deve ser um clone limpo do kaven-framework (sem histórico git, com placeholders) ou o CLI deve clonar o kaven-framework diretamente?

**Opções:**
1. Template = cópia limpa do framework com `{{PLACEHOLDERS}}`
2. CLI clona `kaven-co/kaven-framework` direto (mais simples, menos flexível)
3. Template minimalista + CLI faz scaffold incremental

**Recomendação:** Opção 1 — template é snapshot do framework com placeholders.

---

## Fase 1: Infraestrutura Base (Pré-DNS)

> Pode começar AGORA, não depende de DNS.

### 1.1 PostgreSQL (Produção)

| Item | Detalhe |
|------|---------|
| **Serviço** | Neon (free tier → scale) ou Railway |
| **Versão** | PostgreSQL 15+ |
| **Databases** | 2: `kaven_marketplace`, `kaven_framework` |
| **Connection pooling** | Neon tem built-in |
| **Backup** | Neon: automático 7 dias |
| **Custo** | $0 (free) → $25/mês (Pro) |

**Ação:**
- [ ] Criar projeto Neon
- [ ] Criar database `kaven_marketplace`
- [ ] Criar database `kaven_framework`
- [ ] Salvar connection strings
- [ ] Testar conexão local: `psql $DATABASE_URL`

### 1.2 Redis (Produção)

| Item | Detalhe |
|------|---------|
| **Serviço** | Upstash (serverless Redis) |
| **Versão** | Redis 7+ compatible |
| **Uso** | Rate limiting, sessions, cache |
| **Custo** | $0 (free: 10K commands/dia) → $10/mês |

**Ação:**
- [ ] Criar database Upstash
- [ ] Pegar `REDIS_URL` (formato: `redis://default:xxx@xxx.upstash.io:port`)
- [ ] Testar conexão: `redis-cli -u $REDIS_URL ping`

### 1.3 GitHub OAuth App

| Item | Detalhe |
|------|---------|
| **URL** | https://github.com/settings/developers |
| **App Name** | Kaven CLI |
| **Homepage** | https://kaven.site |
| **Callback** | `https://marketplace.kaven.site/auth/github/callback` |

**Ação:**
- [ ] Criar OAuth App no GitHub
- [ ] Copiar `GITHUB_CLIENT_ID`
- [ ] Copiar `GITHUB_CLIENT_SECRET`
- [ ] Configurar callback URL

### 1.4 Paddle (Produção)

| Item | Detalhe |
|------|---------|
| **Dashboard** | https://vendors.paddle.com |
| **Tiers** | Starter ($99), Complete ($279), Pro ($549) |
| **Webhook** | `https://marketplace.kaven.site/webhooks/paddle` |

**Ação:**
- [ ] Criar 3 produtos + preços no Paddle
- [ ] Copiar `PADDLE_PRICE_STARTER`, `PADDLE_PRICE_COMPLETE`, `PADDLE_PRICE_PRO`
- [ ] Copiar `PADDLE_API_KEY` e `PADDLE_WEBHOOK_SECRET`
- [ ] Mudar `PADDLE_ENVIRONMENT` para `production`
- [ ] Configurar webhook URL

### 1.5 Gerar Secrets

```bash
# JWT Secrets (um para marketplace, outro para framework)
openssl rand -base64 32  # → JWT_SECRET (marketplace)
openssl rand -base64 32  # → JWT_SECRET (framework)
openssl rand -base64 32  # → REFRESH_TOKEN_SECRET (framework)

# Ed25519 Signing Keypair (para módulos)
node -e "
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
console.log('SIGNING_PRIVATE_KEY=' + privateKey.export({type:'pkcs8',format:'pem'}).toString('base64'));
console.log('SIGNING_PUBLIC_KEY=' + publicKey.export({type:'spki',format:'pem'}).toString('base64'));
"
```

**Ação:**
- [ ] Gerar todos os secrets acima
- [ ] Salvar em password manager (1Password/Bitwarden)

---

## Fase 2: Deploy Marketplace API (Pós-DNS ou Paralelo)

> O marketplace é o coração — CLI e site dependem dele.

### 2.1 Escolher Hosting

| Opção | Prós | Contras | Custo |
|-------|------|---------|-------|
| **Railway** | Deploy fácil, PostgreSQL built-in | Vendor lock-in leve | $5-20/mês |
| **Render** | Free tier, auto-deploy | Cold starts no free | $0-25/mês |
| **Fly.io** | Global edge, Dockerfile | Mais complexo | $5-15/mês |
| **Vercel** | Só frontend (não serve Fastify) | ❌ Não funciona | — |

**Recomendação:** Railway (simplicidade + Fastify support + auto-deploy do GitHub)

### 2.2 Deploy Steps (Railway)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Linkar repo
railway link --repo kaven-co/kaven-marketplace

# 5. Configurar env vars (ver seção 2.3)
railway variables set NODE_ENV=production
railway variables set PORT=3001
# ... (todos os env vars)

# 6. Deploy
railway up

# 7. Configurar custom domain
railway domain add marketplace.kaven.site
```

### 2.3 Environment Variables — Marketplace

```bash
# Runtime
NODE_ENV=production
PORT=3001
APP_URL=https://marketplace.kaven.site
FRONTEND_URL=https://kaven.site

# Database (Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/kaven_marketplace?sslmode=require

# Redis (Upstash)
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=xxx

# JWT
JWT_SECRET=<gerado na fase 1.5>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# GitHub OAuth
GITHUB_CLIENT_ID=<fase 1.3>
GITHUB_CLIENT_SECRET=<fase 1.3>
GITHUB_CALLBACK_URL=https://marketplace.kaven.site/auth/github/callback

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<IAM user kaven-platform-api>
AWS_SECRET_ACCESS_KEY=<IAM user kaven-platform-api>
S3_BUCKET_NAME=kaven-marketplace-artifacts

# Paddle
PADDLE_ENVIRONMENT=production
PADDLE_API_KEY=<fase 1.4>
PADDLE_WEBHOOK_SECRET=<fase 1.4>
PADDLE_PRICE_STARTER=<fase 1.4>
PADDLE_PRICE_COMPLETE=<fase 1.4>
PADDLE_PRICE_PRO=<fase 1.4>

# CORS
CORS_ORIGINS=https://kaven.site,https://marketplace.kaven.site,http://localhost:3000

# Security
S3_ALLOWED_DOMAINS=s3.amazonaws.com,s3.us-east-1.amazonaws.com
DOCS_ENABLED=true
```

### 2.4 Prisma Migration

```bash
# No Railway, adicionar build command:
npx prisma generate && npx prisma migrate deploy && tsc

# Ou rodar manualmente:
DATABASE_URL=<production> npx prisma migrate deploy
DATABASE_URL=<production> npx prisma db seed  # se tiver seed
```

### 2.5 Validação

```bash
# Health check
curl https://marketplace.kaven.site/health

# Listar módulos (deve retornar [])
curl https://marketplace.kaven.site/modules

# Swagger docs
open https://marketplace.kaven.site/docs
```

---

## Fase 3: DNS & Subdomains (Pós-Propagação DKIM)

> Depende da propagação DNS dos records SES.

### 3.1 Records no Cloudflare

| Tipo | Nome | Valor | Proxy |
|------|------|-------|-------|
| CNAME | `marketplace` | `<railway-domain>.railway.app` | ✅ Proxied |
| CNAME | `admin` | `cname.vercel-dns.com` | ❌ DNS only |
| CNAME | `tenant` | `cname.vercel-dns.com` | ❌ DNS only |
| A | `@` | Vercel IP (76.76.21.21) | ❌ DNS only |

**Os records SES (DKIM/SPF/DMARC) já foram publicados — aguardando propagação.**

### 3.2 Verificar SES

```bash
# Após DNS propagar, verificar no AWS Console:
# SES → Identities → kaven.site → Status: Verified ✅

# Ou via CLI:
aws ses get-identity-verification-attributes \
  --identities kaven.site \
  --query 'VerificationAttributes.*.VerificationStatus'
```

### 3.3 SES Sandbox Exit

- [ ] Abrir ticket: AWS Console → SES → Account Dashboard → Request Production Access
- [ ] Use case: "SaaS platform sending transactional emails (welcome, password reset, notifications)"
- [ ] Volume: "1,000 emails/day initially, scaling to 10,000/day"
- [ ] Tempo de aprovação: 24-48h

---

## Fase 4: Corrigir kaven-template

> Sem isso, `kaven init` não funciona corretamente.

### 4.1 Opção Recomendada

Transformar kaven-template num snapshot limpo do framework:

```bash
# 1. Copiar framework para template
cp -r kaven-framework/ kaven-template-new/

# 2. Limpar
cd kaven-template-new
rm -rf .git node_modules .next dist
rm -rf .aios-core squads lp docs/planning docs/sessions

# 3. Criar .env.example com placeholders
# 4. Limpar dados sensíveis
# 5. Adicionar {{PLACEHOLDERS}} onde o CLI espera

# 6. Push para kaven-co/kaven-template
```

### 4.2 Arquivos Necessários no Template

```
kaven-template/
├── .env.example          ← COM {{DATABASE_URL}}, {{PROJECT_NAME}}
├── package.json          ← COM {{PROJECT_NAME}}
├── prisma/
│   └── schema.prisma     ← COM {{DEFAULT_LOCALE}}, {{DEFAULT_CURRENCY}}
├── apps/
│   ├── api/
│   │   ├── package.json  ← COM {{PROJECT_NAME}}
│   │   └── src/          ← Framework API source
│   ├── admin/            ← Admin Next.js app
│   └── tenant/           ← Tenant Next.js app
├── packages/
│   ├── ui/               ← @kaven/ui-base
│   ├── shared/           ← @kaven/shared
│   └── database/         ← @kaven/database
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### 4.3 Placeholders no .env.example

```bash
# Project
PROJECT_NAME={{PROJECT_NAME}}

# Database
DATABASE_URL={{DATABASE_URL}}

# Auth
JWT_SECRET=change-me-in-production
REFRESH_TOKEN_SECRET=change-me-in-production

# Email (choose one)
# Option 1: AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=
AWS_SES_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Option 2: SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Redis
REDIS_URL=redis://localhost:6379

# Locale
DEFAULT_LOCALE={{DEFAULT_LOCALE}}
DEFAULT_CURRENCY={{DEFAULT_CURRENCY}}
```

---

## Fase 5: Publicar Primeiro Módulo

> Para que `kaven module install` funcione, precisa ter módulos no marketplace.

### 5.1 Criar Módulo "payments"

```bash
# No kaven-framework, extrair módulo payments
mkdir -p modules/payments
# Copiar: prisma schema, routes, services, tests
# Criar module.json com metadata

# Publicar
cd modules/payments
kaven module publish --dry-run  # validar
kaven module publish            # upload para S3
```

### 5.2 Seed do Marketplace

```bash
# Seed com módulos base
DATABASE_URL=<production> node scripts/seed-modules.js
# Criar registros: payments, auth-social, storage, analytics
```

---

## Fase 6: E2E Smoke Test

> A prova final. Se isso funciona, lançamos.

```bash
# 1. Instalar CLI
npm install -g kaven-cli@0.3.0-alpha.1

# 2. Bootstrap projeto
kaven init kaven-site-test
cd kaven-site-test

# 3. Verificar saúde
kaven doctor

# 4. Autenticar
kaven auth login
# → Abre browser → GitHub OAuth → JWT salvo

# 5. Navegar marketplace
kaven marketplace browse
# → Deve listar módulos

# 6. Instalar módulo
kaven module install payments
# → Download → Verify signature → Extract → Merge schema

# 7. Rodar
cp .env.example .env  # Configurar values reais
pnpm install
pnpm db:migrate
pnpm dev

# 8. Testar
# → Abrir http://localhost:3001 (tenant)
# → Signup → Receber email → Verificar
# → Abrir http://localhost:3000 (admin)
# → Login → Ver tenant criado

# 9. Se tudo passar: 🎉 LAUNCH READY
```

---

## Checklist Consolidado

### Fase 1: Infraestrutura (pode começar agora)
- [ ] Criar PostgreSQL (Neon) — 2 databases
- [ ] Criar Redis (Upstash)
- [ ] Criar GitHub OAuth App
- [ ] Configurar Paddle produção (3 tiers + webhook)
- [ ] Gerar todos os secrets (JWT, Ed25519)

### Fase 2: Deploy Marketplace
- [ ] Escolher hosting (Railway recomendado)
- [ ] Deploy marketplace API
- [ ] Configurar todos env vars
- [ ] Rodar Prisma migrations
- [ ] Validar health check + Swagger docs

### Fase 3: DNS & Email
- [ ] Aguardar propagação DNS (DKIM/SPF/DMARC)
- [ ] Verificar SES identity
- [ ] Abrir ticket SES sandbox exit
- [ ] Configurar subdomains (marketplace, admin, tenant)
- [ ] Linkar SES → SNS event destination

### Fase 4: Template
- [ ] Criar kaven-template como snapshot do framework
- [ ] Adicionar .env.example com placeholders
- [ ] Testar `kaven init` com template novo
- [ ] Push para GitHub

### Fase 5: Conteúdo
- [ ] Publicar módulo "payments" no marketplace
- [ ] Seed marketplace com módulos base
- [ ] Testar `kaven module install payments`

### Fase 6: Validação
- [ ] E2E smoke test completo
- [ ] Teste de signup + email
- [ ] Teste de pagamento (Paddle sandbox → produção)
- [ ] Security audit básico

---

## Estimativa de Custo Mensal

| Serviço | Custo |
|---------|-------|
| Neon PostgreSQL (Pro) | $25 |
| Upstash Redis | $10 |
| Railway (Marketplace API) | $20 |
| AWS S3 | $5 |
| AWS SES | $5 |
| Cloudflare (DNS) | $0 |
| Vercel (3 apps) | $0 (hobby) → $60 (pro) |
| **Total mínimo** | **~$65/mês** |
| **Total com Vercel Pro** | **~$125/mês** |

---

*Plano gerado em 2026-02-24. Última atualização: 2026-02-24.*

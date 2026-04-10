# Kaven — Mapa Completo de Infraestrutura

> **Última atualização:** 2026-04-09
> **Status geral:** LIVE com blocker (GCP billing off → Marketplace 503)

---

## Visão Geral — Todos os Repos

| Repo | Propósito | Versão | Status |
|------|-----------|--------|--------|
| `kaven-framework` | Produto principal — Fastify API + Next.js Admin/Tenant/Docs | v1.0.0-rc1 | ✅ LIVE |
| `kaven-marketplace` | Backend de módulos — auth, downloads, licenças, webhooks | v0.3.0 | 🔴 DOWN (GCP billing off) |
| `kaven-cli` | CLI — `kaven init`, `module`, `auth`, `marketplace` | v0.4.0-alpha.1 | ✅ npm published |
| `kaven-ui-base` | Design System standalone — 97 componentes React+Tailwind | v0.1.0-alpha.1 | ✅ npm published |
| `kaven-template` | Template GitHub para bootstrap de novos projetos | v1.0.0 | ✅ Completo |
| `kaven-site` | Site de marketing + portal (dogfooding via CLI) | — | ⚠️ Sprint S1 não implementada |

---

## kaven-framework — Apps e Deploy

### Apps internas (monorepo)

| App | Tecnologia | URL de Produção | Hosting | Status |
|-----|-----------|-----------------|---------|--------|
| `apps/api` | Fastify 5.x + TypeScript | `https://kaven-api-364441521455.us-east1.run.app` | Cloud Run (GCP) | ✅ LIVE |
| `apps/admin` | Next.js 15 App Router | `https://admin.kaven.site` | Vercel | ✅ LIVE |
| `apps/tenant` | Next.js 15 App Router | `https://tenant.kaven.site` | Vercel | ✅ LIVE |
| `apps/docs` | Nextra (MDX) | `https://docs.kaven.site` | Vercel | ✅ LIVE |

### Variáveis críticas (Vercel)

```
# apps/admin e apps/tenant
NEXT_PUBLIC_API_URL=https://kaven-api-364441521455.us-east1.run.app

# BLOCKER PENDENTE (owner):
# Vercel tenant → API_URL ainda não atualizado para a URL do Cloud Run
```

---

## kaven-marketplace — Deploy

| Item | Detalhe |
|------|---------|
| **Hosting** | Google Cloud Run |
| **GCP Project** | `kaven-prod` (conta `kaventhecreator@gmail.com`) |
| **Service** | `kaven-marketplace` |
| **Region** | `us-east1` |
| **URL interna** | `https://kaven-marketplace-1096722897164.us-east1.run.app` |
| **URL pública** | `https://marketplace.kaven.site` |
| **Revision ativa** | `kaven-marketplace-00001-l9l` |
| **Runtime** | Node.js 20, buildpacks (sem Docker) |
| **Start** | `prisma migrate deploy && node dist/server.js` |
| **Memory** | 512Mi | **CPU** | 1 |
| **Instâncias** | min 1, max 3 |
| **Status atual** | ✅ LIVE — `marketplace.kaven.site` health 200, TLS ativo, domain mapping provisionado (2026-04-10) |

> Projeto antigo: `kaven-488720` (conta pessoal `brainoschris@gmail.com`) — pode ser deletado.

### Deploy command (marketplace)

```bash
cd /home/bychrisr/projects/work/kaven/kaven-marketplace && \
yes | gcloud run deploy kaven-marketplace \
  --source . \
  --region us-east1 \
  --allow-unauthenticated \
  --env-vars-file /tmp/kaven-marketplace-env.yaml \
  --min-instances 1 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --project kaven-488720
```

> ⚠️ `PORT` é reservado pelo Cloud Run — não setar manualmente.

---

## kaven-cli e kaven-ui-base — npm

| Pacote | Nome npm | Versão | Tag | Registry |
|--------|----------|--------|-----|----------|
| kaven-cli | `kaven-cli` | `0.4.0-alpha.1` | `alpha` | npmjs.com |
| kaven-ui-base | `kaven-ui-base` | `0.1.0-alpha.1` | `alpha` | npmjs.com |

**Pendente:** bump de versão + `npm publish` pós-PR #41 do kaven-cli.

---

## Banco de Dados — Neon PostgreSQL

| DB | Uso | Endpoint (pooler) | Região | Account |
|----|-----|-------------------|--------|---------|
| `kaven_framework` | Framework (framework app) | `ep-weathered-hall-aezhhmu3-pooler.c-2.us-east-2.aws.neon.tech` | us-east-2 | `kaventheadmin@proton.me` |
| `kaven_marketplace` | Marketplace API | `ep-small-dream-ai5s5ood-pooler.c-4.us-east-1.aws.neon.tech` | us-east-1 | `kaventheadmin@proton.me` |

- **Neon Project (framework):** `green-scene-81691540`
- **Branch (framework):** `br-late-math-aeqxqkkd` (production default)
- **Compute:** 0.25–2 CU, auto-suspend após 5min de inatividade
- **Migrations:** 37/37 aplicadas (verificado 2026-03-25)

---

## Cache — Upstash Redis

| Item | Detalhe |
|------|---------|
| **Host** | `evolving-cow-17329.upstash.io` |
| **Port** | `6379` (TLS) |
| **Uso** | Rate limiting, sessions, cache da Marketplace API |
| **Plan** | Free tier (10K commands/dia) |

---

## Object Storage — AWS S3

| Item | Detalhe |
|------|---------|
| **Account ID** | `356942037325` |
| **Bucket** | `kaven-marketplace-artifacts` |
| **Região** | `us-east-1` |
| **Uso** | Artefatos de módulos (upload via `kaven module publish`) |
| **IAM User** | `kaven-platform-api` |

---

## Email — Resend

| Item | Detalhe |
|------|---------|
| **Provedor** | Resend.com |
| **Plan** | Free (100 emails/dia) |
| **Domínio** | `kaven.site` (DKIM/SPF/DMARC verificados no Cloudflare) |
| **From** | `noreply@kaven.site` |

> Resend substituiu AWS SES (aprovado, mas mais complexo de configurar).

---

## DNS — Cloudflare

| Item | Detalhe |
|------|---------|
| **Domínio** | `kaven.site` |
| **Zone ID** | `f56c57fd1fea36e1609da92b7268ba79` |

### Records ativos

| Tipo | Subdomínio | Destino | Proxy |
|------|-----------|---------|-------|
| CNAME | `marketplace` | Cloud Run URL | ✅ Proxied |
| CNAME | `admin` | `cname.vercel-dns.com` | ❌ DNS only |
| CNAME | `tenant` | `cname.vercel-dns.com` | ❌ DNS only |
| A | `@` (root) | `76.76.21.21` (Vercel) | ❌ DNS only |

---

## GCP — Accounts e Projetos

| Item | Detalhe |
|------|---------|
| **Conta atual** | Conta pessoal do Chris |
| **Projeto** | `kaven-488720` |
| **Serviços ativos** | Cloud Run (marketplace + API do framework) |
| **Status billing** | 🔴 DESABILITADO — causa do Marketplace 503 |
| **Migração planejada** | Mover para conta centralizada (ex: `ops@kaven.co`) |

### Para migrar para nova conta GCP

```bash
# 1. Criar nova conta Google (ex: ops@kaven.co) e novo projeto
gcloud projects create kaven-prod --name="Kaven Production"

# 2. Habilitar APIs necessárias
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  --project=kaven-prod

# 3. Habilitar billing na nova conta
# https://console.cloud.google.com/billing?project=kaven-prod

# 4. Push das imagens para o novo Artifact Registry
gcloud auth configure-docker us-east1-docker.pkg.dev
docker pull gcr.io/kaven-488720/kaven-marketplace:latest
docker tag gcr.io/kaven-488720/kaven-marketplace:latest \
  us-east1-docker.pkg.dev/kaven-prod/kaven/kaven-marketplace:latest
docker push us-east1-docker.pkg.dev/kaven-prod/kaven/kaven-marketplace:latest

# 5. Redeploy no novo projeto (mesmos env vars)
gcloud run deploy kaven-marketplace \
  --image=us-east1-docker.pkg.dev/kaven-prod/kaven/kaven-marketplace:latest \
  --region=us-east1 \
  --allow-unauthenticated \
  --env-vars-file /tmp/kaven-marketplace-env.yaml \
  --min-instances 1 --max-instances 3 \
  --memory 512Mi --cpu 1 \
  --project kaven-prod

# 6. Atualizar DNS no Cloudflare
# marketplace.kaven.site → nova URL *.run.app do kaven-prod
```

---

## GitHub — Organização

| Item | Detalhe |
|------|---------|
| **Org** | `kaven-co` |
| **Repos públicos** | kaven-framework, kaven-marketplace, kaven-cli, kaven-ui-base, kaven-template |
| **GitHub OAuth App** | "Kaven CLI" — callback `https://marketplace.kaven.site/auth/github/callback` |

---

## Accounts Centralizadas — Resumo

| Serviço | Account / Identificador |
|---------|------------------------|
| GCP (centralizado) | `kaventhecreator@gmail.com` → projeto `kaven-prod` |
| GCP (antigo — pessoal) | `brainoschris@gmail.com` → `kaven-488720` (pode deletar após confirmação) |
| Neon | `kaventheadmin@proton.me` |
| AWS | `356942037325` |
| Cloudflare | Zone `f56c57fd1fea36e1609da92b7268ba79` |
| GitHub | Org `kaven-co` |
| npm | Org/user `kaven-co` |
| Resend | (domínio: kaven.site) |
| Upstash | (evolving-cow-17329) |

---

## Blockers Ativos (2026-04-09)

| # | Blocker | Owner | Impacto |
|---|---------|-------|---------|
| P0 | GCP billing off em `kaven-488720` | Chris | Marketplace 503, D1.10 bloqueado |
| P0 | Vercel tenant: `API_URL` não atualizado | Chris | tenant.kaven.site sem API |
| P1 | kaven-cli npm publish (pós-PR#41) | Squad | CLI desatualizado no npm |
| P1 | kaven-site Sprint S1 não implementada | Squad | Bloqueado até D1.12 |

---

*Documento gerado em 2026-04-09 — fonte: deploy-notes, reference_neon_infra, CLAUDE.md, memória de sessões anteriores.*

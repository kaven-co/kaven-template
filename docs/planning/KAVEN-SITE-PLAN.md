# Kaven Site — Plano de Execução Completo

> Status: Planejamento | Criado: 2026-04-16 | Última atualização: 2026-04-16
> Objetivo: Migrar kaven-site para ser o produto comercial em produção.
> Detalhe máximo para quebra futura em epics/sprints/stories.

---

## Índice

1. [Contexto e Paradigma](#1-contexto-e-paradigma)
2. [O Mecanismo Central: Loop de Correção](#2-o-mecanismo-central-loop-de-correção)
3. [Efeitos Colaterais Resolvidos Automaticamente](#3-efeitos-colaterais-resolvidos-automaticamente)
4. [Infra de Produção Existente](#4-infra-de-produção-existente)
5. [Diagrama de Arquitetura Target](#5-diagrama-de-arquitetura-target)
6. [Fases de Execução](#6-fases-de-execução)
   - [Fase 0 — Prep e Mapeamento](#fase-0--prep-e-mapeamento)
   - [Fase 1 — kaven init (o bootstrap)](#fase-1--kaven-init-o-bootstrap)
   - [Fase 2 — Validação de Backend (prova de fogo)](#fase-2--validação-de-backend-prova-de-fogo)
   - [Fase 3 — Loop de Fixes (iterativo)](#fase-3--loop-de-fixes-iterativo)
   - [Fase 4 — Landing Page ⛔ PARAR AQUI](#fase-4--landing-page--parar-aqui)
7. [Restrições e Decisões Técnicas](#7-restrições-e-decisões-técnicas)
8. [Rollback Plan](#8-rollback-plan)
9. [Critérios de Sucesso](#9-critérios-de-sucesso)
10. [Glossário](#10-glossário)

---

## 1. Contexto e Paradigma

### Estado Atual (errado)

```
admin.kaven.site  ─────────────────────┐
tenant.kaven.site ──────────────────── kaven-framework (em produção como produto)
kaven-api.run.app ─────────────────────┘
         │
         └─ Problema: o framework É o produto. Não existe produto comercial real.
```

**Consequências do estado errado:**
- CLI bypassa autenticação porque não existe produto real para autenticar
- D1.12 (smoke test E2E) nunca foi concluído — fase 5 manual bloqueada
- `kaven upgrade` nunca foi validado end-to-end
- Nenhum cliente real pode comprar ou usar o produto
- O "dogfooding" que é o argumento de venda não existe na prática

### Estado Target (correto)

```
kaven-framework ──── código-fonte (dev local + template via CLI)
      │
      ▼
kaven-site_ ────── `kaven init` ──────── kaven-site (produto comercial em produção)
                         │
                         ▼
            admin.kaven.site  ──── painel admin
            tenant.kaven.site ──── painel do cliente
            api.kaven.site    ──── API REST (ou mantém Cloud Run URL mapeada)
```

**O que muda:**
- `kaven-framework` volta a ser o que deveria ser: código-fonte, referência, template
- `kaven-site_` é recriado do zero via `kaven init` (exatamente como um cliente faria)
- Toda a infra de produção (Neon, Upstash, Cloud Run, Vercel) passa a servir o kaven-site
- Clientes reais compram, fazem auth, criam tenants — tudo no kaven-site

---

## 2. O Mecanismo Central: Loop de Correção

Este é o core do plano — o que faz tudo fazer sentido:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOOP DE CORREÇÃO CONTÍNUA                        │
│                                                                     │
│  Problema encontrado no kaven-site (front ou back)                  │
│            │                                                        │
│            ▼                                                        │
│  Corrigir no kaven-framework (repo de desenvolvimento)              │
│            │                                                        │
│            ▼                                                        │
│  Lançar update (nova versão no marketplace)                         │
│            │                                                        │
│            ▼                                                        │
│  No kaven-site: `kaven upgrade` via CLI                             │
│            │                                                        │
│            ▼                                                        │
│  Fix propagado em produção ✅                                        │
│            │                                                        │
│            ▼                                                        │
│  Clientes que comprarem já recebem versão corrigida ✅               │
└─────────────────────────────────────────────────────────────────────┘
```

**Por que isso importa:**
- Valida `kaven upgrade` end-to-end (nunca testado antes)
- Cada fix no framework beneficia clientes automaticamente
- O próprio processo de construção do kaven-site é o produto sendo testado
- Prova real de dogfooding: o criador usa as mesmas ferramentas que vende

---

## 3. Efeitos Colaterais Resolvidos Automaticamente

| Problema Atual | Como a Migração Resolve |
|---|---|
| CLI bypass de auth | kaven-site live = CLI autentica normalmente |
| D1.12 smoke test pendente (fase 5) | Fase 1 + 2 do plano = exatamente o D1.12 |
| `kaven upgrade` nunca testado E2E | Fase 3 valida a cada fix no loop |
| Framework como "produto" | kaven-site assume esse papel |
| Dogfooding inexistente na prática | kaven-site criado com `kaven init` = dogfooding real |
| Fluxo de compra sem validação real | Fase 2b (Stripe R$1) prova o pipeline completo |

---

## 4. Infra de Produção Existente

Toda esta infra já está configurada e deve ser **migrada/reutilizada** — não recriada:

| Serviço | Detalhes | Ação na Migração |
|---|---|---|
| **Neon PostgreSQL** | `ep-late-leaf-aivgdi2v-pooler.us-east-1.aws.neon.tech` (kaven_framework) | Reutilizar — apontar kaven-site para o mesmo banco |
| **Upstash Redis** | `evolving-cow-17329.upstash.io:6379` (TLS) | Reutilizar — mesma instância |
| **Cloud Run GCP** | `https://kaven-api-364441521455.us-east1.run.app` (projeto kaven-prod) | Substituir imagem — deploy da API do kaven-site |
| **Vercel** | Projetos admin + tenant apontando para framework | Reconfigurar — apontar para kaven-site_ |
| **Stripe** | STRIPE_SECRET_KEY configurado no Vercel | Reutilizar — mesma key |
| **S3** | Bucket `kaven-marketplace-artifacts` | Sem mudança — artefatos de módulos |
| **Resend** | Email transacional | Reutilizar — mesma configuração |
| **Cloudflare** | Zone `f56c57fd1fea36e1609da92b7268ba79` (kaven.site) | Sem mudança — DNS aponta para os mesmos destinos |

**Caminhos locais relevantes:**
- Repo kaven-site: `/home/bychrisr/projects/work/kaven/kaven-site_`
- Repo framework: `/home/bychrisr/projects/work/kaven/kaven-framework`
- CLI: `kaven` v0.4.2-alpha.0

---

## 5. Diagrama de Arquitetura Target

```
┌──────────────────────────────────────────────────────────────────┐
│                         PRODUÇÃO TARGET                          │
│                                                                  │
│  kaven-site_ repo                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  apps/                                                     │  │
│  │    admin/    ──── Vercel ──── admin.kaven.site             │  │
│  │    tenant/   ──── Vercel ──── tenant.kaven.site / *.site   │  │
│  │    api/      ──── Cloud Run (kaven-prod) ─────────────────►│  │
│  │  packages/                                                 │  │
│  │    database/ ──── Neon PostgreSQL (kaven_framework)        │  │
│  │    ui/       ──── @kaven/ui-base (workspace)               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Serviços externos:                                              │
│  ┌─────────────┐  ┌──────────┐  ┌───────┐  ┌──────────────┐   │
│  │ Upstash     │  │  Stripe  │  │Resend │  │  Cloudflare  │   │
│  │ Redis       │  │ (pagto.) │  │(email)│  │     DNS      │   │
│  └─────────────┘  └──────────┘  └───────┘  └──────────────┘   │
│                                                                  │
│  Marketplace (independente, já no ar):                           │
│  marketplace.kaven.site ──── Cloud Run ──── kaven-marketplace    │
│  S3: kaven-marketplace-artifacts                                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    FLUXO CLI (CLIENTE)                           │
│                                                                  │
│  $ kaven init meu-saas                                           │
│       │                                                          │
│       ▼ (usa kaven-template como base)                           │
│  Projeto bootstrapado localmente                                 │
│       │                                                          │
│       ▼                                                          │
│  $ kaven marketplace browse   (lista módulos do marketplace)     │
│  $ kaven module install payments                                 │
│       │                                                          │
│       ▼                                                          │
│  Módulo injetado no projeto local                                │
│       │                                                          │
│       ▼                                                          │
│  $ kaven upgrade   (quando nova versão disponível)               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Fases de Execução

### FASE 0 — Prep e Mapeamento

> **Princípio:** Nada é deletado sem estar mapeado. Nenhuma mudança sem evidência de que o estado atual está documentado.

**Objetivo:** Mapear completamente o estado atual de produção antes de qualquer mudança.

**Critério de conclusão:** Documento de auditoria completo. Nenhum env, secret ou config pode estar sem documentação antes de avançar para Fase 1.

---

#### 0.1 — Auditoria de Envs: Vercel

**Tarefas:**
- [ ] Listar todos os envs do projeto Vercel `admin` (via `vercel env ls` ou dashboard)
- [ ] Listar todos os envs do projeto Vercel `tenant` (via `vercel env ls` ou dashboard)
- [ ] Documentar: nome da var, valor (se não-secreto) ou referência (se secreto), ambiente (production/preview/development)
- [ ] Identificar quais são específicos do framework e quais serão necessários no kaven-site
- [ ] Atenção especial: `API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `STRIPE_*`

**Output esperado:** Tabela completa de envs Vercel (admin + tenant)

---

#### 0.2 — Auditoria de Envs: Cloud Run

**Tarefas:**
- [ ] Listar todos os envs do Cloud Run service `kaven-marketplace` (via `gcloud run services describe`)
- [ ] Listar todos os envs da API do framework se estiver rodando em Cloud Run
- [ ] Documentar: nome, valor/referência, se é secret do Secret Manager ou env direto
- [ ] Identificar: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `STRIPE_*`, `RESEND_*`, `GITHUB_*`, `META_*`, `GA4_*`

**Output esperado:** Tabela completa de envs Cloud Run

---

#### 0.3 — Auditoria de Secrets

**Tarefas:**
- [ ] Mapear JWT secrets: marketplace + framework (valores ou referências seguras)
- [ ] Mapear Ed25519 keypair: `ED25519_PRIVATE_KEY` + `ED25519_PUBLIC_KEY`
- [ ] Confirmar Stripe keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Confirmar GitHub OAuth App: Client ID + Client Secret, callback URLs atuais
- [ ] Confirmar Resend API key
- [ ] Confirmar Neon connection strings (pooler + direct)
- [ ] Confirmar Upstash Redis URL + token

**Output esperado:** Checklist de todos os secrets confirmados. Não anotar valores — apenas confirmar existência e localização (Vercel env, Cloud Run env, Secret Manager, `.env.local`).

---

#### 0.4 — Auditoria DNS (Cloudflare)

**Tarefas:**
- [ ] Listar todos os registros DNS da zone `kaven.site`
- [ ] Documentar: subdomínio, tipo (A/CNAME/TXT), destino atual
- [ ] Subdomínios esperados: `admin`, `tenant`, `marketplace`, `api` (se existir), `www`, raiz
- [ ] Identificar registros de verificação (SPF, DKIM, DMARC para Resend)
- [ ] Confirmar quais precisam ser atualizados após deploy do kaven-site

**Output esperado:** Tabela DNS completa + mapa de mudanças necessárias

---

#### 0.5 — Auditoria GitHub OAuth App

**Tarefas:**
- [ ] Verificar callback URLs configuradas atualmente
- [ ] Documentar: Homepage URL, Authorization callback URL
- [ ] Identificar se precisa criar uma nova OAuth App para o kaven-site ou reutilizar a mesma
- [ ] Decisão: mesmas credenciais = atualizar callback URLs; novas credenciais = criar novo App

**Output esperado:** Decisão documentada + lista de mudanças necessárias

---

#### 0.6 — Limpeza do repo kaven-site_

**Tarefas:**
- [ ] Verificar estado atual do branch `feat/sprint-s1-landing` no kaven-site_
- [ ] Fazer backup local do Sprint S1 (referência para copy/design futuro na Fase 4)
- [ ] Decidir estratégia: novo branch limpo a partir de `main` vazia, ou resetar `main` para vazio
- [ ] **NÃO deletar** o branch S1 — apenas trabalhar em branch separado para o novo init

**ATENÇÃO:** O conteúdo do Sprint S1 (hero, pricing, features, stats) pode servir como referência de copy na Fase 4. Não destruir antes de ter backup confirmado.

**Output esperado:** Branch limpo no kaven-site_ pronto para receber o `kaven init`

---

#### 0.7 — Validação do kaven init local

**Tarefas:**
- [ ] Rodar `kaven init kaven-site-test` em `/tmp/` (ambiente limpo)
- [ ] Verificar que todos os arquivos são gerados corretamente
- [ ] Verificar que a estrutura de diretórios está completa: `apps/api`, `apps/admin`, `apps/tenant`, `packages/database`, `packages/ui`
- [ ] Verificar `.env.example` gerado: todos os placeholders necessários presentes
- [ ] Verificar que `pnpm install` roda sem erros
- [ ] Verificar que `pnpm build` roda sem erros (pode ter warnings aceitáveis)
- [ ] Se encontrar problemas: corrigir no kaven-template antes de prosseguir

**Output esperado:** `kaven init` validado 100% funcional localmente. Evidência: `pnpm build` passou.

---

### FASE 1 — kaven init (o bootstrap)

> **Objetivo:** Criar o kaven-site exatamente como um cliente faria — usando `kaven init`.

**Critério de conclusão:** kaven-site respondendo em produção nos domínios corretos. `curl https://admin.kaven.site` retorna 200.

---

#### 1.1 — Verificar módulos disponíveis no marketplace

**REGRA CRÍTICA:** Não assumir lista de módulos. Verificar o que existe de fato.

**Tarefas:**
- [ ] Rodar `kaven marketplace browse` e documentar output real
- [ ] Confirmar via `curl https://marketplace.kaven.site/categories` quais categorias existem
- [ ] Confirmar via API quais módulos têm status `isPublic: true` e têm release com artefato real
- [ ] Módulos conhecidos (confirmar status): `payments@1.0.1`, `auth-social`, `storage`, `analytics`
- [ ] Identificar quais módulos têm artefato S3 real vs. placeholder (download quebraria)
- [ ] Documentar lista final: "instalar" vs "pular por agora"

**Output esperado:** Lista definitiva de módulos a instalar no kaven-site.

---

#### 1.2 — kaven init no repo kaven-site_

**Tarefas:**
- [ ] No branch limpo do kaven-site_: rodar `kaven init kaven-site`
- [ ] Verificar output do CLI: sem erros, sem warnings críticos
- [ ] Instalar módulos confirmados na etapa 1.1 (apenas os com artefato real)
- [ ] Rodar `pnpm install` após init
- [ ] Verificar que a estrutura gerada está correta

**Output esperado:** Projeto inicializado. Evidência: estrutura de diretórios + `pnpm install` limpo.

---

#### 1.3 — Configurar envs de produção

**Tarefas:**
- [ ] Criar `.env` local com todos os valores reais de produção (baseado na auditoria da Fase 0)
- [ ] Configurar envs no Vercel (projeto admin): copiar da auditoria + atualizar para kaven-site
- [ ] Configurar envs no Vercel (projeto tenant): idem
- [ ] Preparar envs para o Cloud Run (API): copiar da auditoria + ajustar
- [ ] Garantir que `DATABASE_URL` aponta para o Neon kaven_framework existente
- [ ] Garantir que `REDIS_URL` aponta para o Upstash existente
- [ ] Garantir que `STRIPE_*` está configurado
- [ ] Garantir que `GITHUB_*` OAuth está configurado (com callback URLs corretas)
- [ ] Garantir que `RESEND_*` está configurado
- [ ] Garantir que `JWT_SECRET` está configurado (pode reutilizar o mesmo do framework)

**Output esperado:** Todos os envs configurados. Checklist marcado.

---

#### 1.4 — Deploy da API (Cloud Run)

> **ATENÇÃO:** Este passo substitui a instância atual em produção. Execute com rollback plan pronto (ver Seção 8).

**Tarefas:**
- [ ] Confirmar que o rollback plan está documentado e testável
- [ ] Build da imagem Docker da API do kaven-site
- [ ] Push para Google Container Registry (projeto kaven-prod)
- [ ] Deploy no Cloud Run: substituir a imagem existente
- [ ] Rodar `prisma migrate deploy` se necessário (verificar estado das migrations)
- [ ] Teste de saúde: `curl https://kaven-api-364441521455.us-east1.run.app/health` → 200
- [ ] Teste básico de auth endpoint: `POST /api/auth/login` com credenciais de teste

**Rollback trigger:** Se health check falhar por mais de 5 minutos → executar rollback imediato.

**Output esperado:** API do kaven-site respondendo em produção. Evidência: health check 200.

---

#### 1.5 — Deploy do Admin e Tenant (Vercel)

> **ATENÇÃO:** Este passo substitui as instâncias atuais em produção.

**Tarefas:**
- [ ] Push do kaven-site_ para GitHub (em branch de deploy)
- [ ] Configurar projetos Vercel para apontar para o novo repo/branch
- [ ] Trigger de deploy: admin
- [ ] Trigger de deploy: tenant
- [ ] Aguardar build completar (ambos)
- [ ] Verificar: `curl https://admin.kaven.site` → 200
- [ ] Verificar: `curl https://tenant.kaven.site` → 200
- [ ] Testar abertura no browser: página carrega sem erros críticos de JavaScript

**Output esperado:** Admin e Tenant respondendo em produção. Evidência: curl 200 + browser sem erros críticos.

---

### FASE 2 — Validação de Backend (prova de fogo)

> **Objetivo:** Validar que o backend funciona para os fluxos críticos de negócio.
> **Princípio:** Frontend pode estar imperfeito. O foco é o backend.

**Critério de conclusão da Fase 2:** Signup, auth social (Google + GitHub), pagamento e acesso ao tenant funcionando sem erros de backend. Erros de UI documentados mas não bloqueiam.

---

#### Sub-fase 2a — Auth Social (investigação + fix)

> **Contexto:** O módulo `auth-social` está listado no marketplace mas pode não ter release real. A implementação de Google/GitHub OAuth no framework pode estar incompleta.

**2a.1 — Investigação do estado atual**

- [ ] Verificar no kaven-framework: `apps/api/src/modules/auth/` — existe implementação de Google OAuth?
- [ ] Verificar no kaven-framework: existe rota `GET /api/auth/google/callback`?
- [ ] Verificar no kaven-framework: existe rota `GET /api/auth/github/callback`?
- [ ] Verificar no Admin/Tenant: existe botão "Login com Google" / "Login com GitHub"?
- [ ] Testar fluxo: clicar "Login com Google" → o que acontece? (erro 404? redirect para Google? sem botão?)
- [ ] Documentar estado real: funcionando / parcialmente implementado / não implementado

**2a.2 — Se quebrado ou não implementado: fix**

- [ ] Corrigir no kaven-framework (não no kaven-site diretamente)
- [ ] Testar localmente no framework
- [ ] Criar PR no kaven-framework → merge → release nova versão no marketplace
- [ ] No kaven-site_: `kaven upgrade` → verificar que o fix foi aplicado
- [ ] Testar novamente em produção

**2a.3 — Validação final Auth Social**

- [ ] Fluxo Google: botão → redirect Google → callback → sessão criada → usuário logado ✅
- [ ] Fluxo GitHub: botão → redirect GitHub → callback → sessão criada → usuário logado ✅
- [ ] Verificar banco: registro de usuário criado com `githubId` ou `googleId`
- [ ] Verificar tenant: usuário tem acesso ao tenant page após auth social

---

#### Sub-fase 2b — Stripe Prova de Fogo

> **Contexto:** Chris criou produto de R$1,00 no dashboard Stripe para testes. O objetivo é validar o pipeline completo, não o plano em si.

**2b.1 — Setup do produto de teste**

- [ ] Confirmar com Chris: Price ID do produto R$1,00 no Stripe
- [ ] Adicionar no frontend como "Plano de Teste" (temporário, não visível publicamente)
- [ ] Configurar no kaven-site: price ID mapeado para um plano
- [ ] Deploy da mudança

**2b.2 — Teste do fluxo de pagamento**

- [ ] Com usuário de teste logado: selecionar "Plano de Teste"
- [ ] Verificar redirect para checkout Stripe: URL correta, produto correto
- [ ] Usar cartão de teste Stripe: `4242 4242 4242 4242` (qualquer CVC/data futura)
- [ ] Completar pagamento
- [ ] Verificar redirect de volta para o site (success URL)
- [ ] Verificar webhook: Stripe → API → banco

**2b.3 — Verificação do webhook**

- [ ] No dashboard Stripe: webhook foi enviado? Status 200?
- [ ] No banco de dados: `Subscription` criada? Status correto?
- [ ] No tenant page: usuário vê sua assinatura ativa?
- [ ] Se webhook falhar: verificar `STRIPE_WEBHOOK_SECRET`, endpoint configurado no Stripe Dashboard

**2b.4 — Documentar erros encontrados**

- [ ] Listar todos os erros de UI (não bloqueiam, documentar para Fase 3)
- [ ] Listar todos os erros de backend (bloqueiam — entrar no loop de correção)
- [ ] Categorizar: P0 (bloqueia fluxo) / P1 (UI quebrada) / P2 (cosmético)

**2b.5 — Limpeza pós-teste**

- [ ] Após validação completa: remover produto R$1,00 do frontend
- [ ] Cancelar subscription de teste no Stripe (se necessário)
- [ ] Confirmar que nenhum dado de teste ficou poluindo o banco de produção

---

#### Sub-fase 2c — Signup + Tenant Mínimo

**2c.1 — Signup email/password**

- [ ] Testar signup com email real (ou email de teste)
- [ ] Verificar email transacional (Resend): confirmação enviada?
- [ ] Clicar no link de confirmação: funciona?
- [ ] Email de boas-vindas: chegou?
- [ ] Após confirmação: usuário consegue fazer login?

**2c.2 — Acesso mínimo ao tenant**

- [ ] Após login: usuário é redirecionado para onde? (tenant page? onboarding?)
- [ ] Verificar criação de tenant: `Tenant` criado no banco?
- [ ] Verificar `stripeCustomerId`: Stripe customer criado após signup? (TD-15)
- [ ] Tenant page: carrega sem erros críticos?
- [ ] Navegação básica: menu, rotas principais funcionam?

**2c.3 — Multi-tenancy básico**

- [ ] Criar segundo tenant com usuário diferente
- [ ] Verificar isolamento: usuário A não vê dados do usuário B
- [ ] Verificar `tenantId` nas queries (via logs da API)

---

### FASE 3 — Loop de Fixes (iterativo)

> **Objetivo:** Usar o loop framework → release → upgrade para corrigir todos os problemas encontrados na Fase 2.
> **Este é o loop que valida `kaven upgrade` end-to-end.**

**Critério de conclusão:** Fluxos críticos (signup → payment → tenant access) funcionando sem erros de backend. Frontend pode ter imperfeições cosméticas.

---

#### 3.1 — Triagem e Priorização

- [ ] Compilar lista completa de problemas da Fase 2
- [ ] Categorizar cada problema:
  - **P0:** Bloqueia fluxo crítico de negócio (signup, login, pagamento, acesso ao tenant)
  - **P1:** UI quebrada mas fluxo funciona
  - **P2:** Cosmético / melhorias
- [ ] Ordenar P0 por impacto
- [ ] Criar lista de trabalho ordenada

---

#### 3.2 — Loop de Correção (P0 primeiro)

Para cada problema P0:

```
1. Identificar root cause no kaven-framework
2. Fix no kaven-framework (não no kaven-site)
3. Teste local no framework: `pnpm test` → verde
4. PR no kaven-framework → review → merge
5. Release nova versão no marketplace:
   - Atualizar version no package.json
   - `kaven module publish` (ou processo manual)
6. No kaven-site_: `kaven upgrade`
7. Deploy: API (Cloud Run) + Frontend (Vercel)
8. Validar fix em produção
9. Documentar: problema, root cause, fix, versão lançada
10. Próximo item da lista
```

**Rastreamento de iterações:**

| Iteração | Problema | Root Cause | Fix | Versão | Validado |
|---|---|---|---|---|---|
| 1 | (a preencher) | | | | |
| 2 | (a preencher) | | | | |
| ... | | | | | |

---

#### 3.3 — Loop P1 (após P0 resolvidos)

- Mesmo processo do 3.2 para problemas P1
- P1 não bloqueiam progressão para Fase 4 — podem ser resolvidos em paralelo

---

#### 3.4 — Critério de saída da Fase 3

- [ ] Todos os P0 resolvidos e validados em produção
- [ ] `kaven upgrade` testado pelo menos 3 vezes end-to-end
- [ ] Lista de P1 documentada (podem continuar sendo resolvidos na Fase 4)
- [ ] P2 documentados no backlog

---

### FASE 4 — Landing Page ⛔ PARAR AQUI

> **REGRA ABSOLUTA: NÃO construir a landing page sem avisar Chris primeiro.**
> Este gatilho deve ser explícito — não continuar automaticamente.

---

#### 4.0 — Alerta obrigatório para Chris

Quando a Fase 3 estiver concluída, o agente/executor DEVE:

```
🛑 PARADA OBRIGATÓRIA — FASE 4: LANDING PAGE

Fases 0-3 concluídas. kaven-site está em produção com:
✅ Auth social funcionando
✅ Stripe pagamento validado
✅ Signup + tenant mínimo ok
✅ kaven upgrade validado N vezes

Próximo passo: Landing Page.
Esta fase requer convocação dos Councils antes de qualquer código.

Aguardando autorização de Chris para prosseguir.
```

---

#### 4.1 — Convocação dos Councils

**Growth Council (copy e posicionamento):**
- Convocar: Godin, Hormozi, Schwartz, Graham
- Comando: `*consult-growth`
- Perguntas para o conselho:
  1. "Qual a promessa central que move um dev full-stack a comprar agora vs. depois?"
  2. "Como posicionar o Kaven contra 'só uso um boilerplate do GitHub grátis'?"
  3. "Qual o CTA principal da landing page?"
  4. "Como estruturar a proposta de valor em 3 bullets que convertem?"

**Design Council:**
- Convocar: Brad Frost, Don Norman, Julie Zhuo, Tay Dantas
- Comando: `*consult-design`
- Perguntas para o conselho:
  1. "Como comunicar complexidade técnica de forma visualmente simples?"
  2. "Qual a hierarquia visual ideal para uma landing de produto técnico?"
  3. "Como o dogfooding deve aparecer visualmente na landing?"

---

#### 4.2 — Copy do zero

> **REGRA:** Não reaproveitar nada do Sprint S1. Reescrever do zero baseado no output dos Councils.

**Estrutura da landing (a ser validada pelos Councils, não imposta aqui):**

Possíveis seções (sujeitas a revisão):
1. Hero: promessa + CTA primário
2. Problema (os 3-6 meses de infra)
3. Solução (como o Kaven resolve)
4. Demonstração (dogfooding — o site que você está vendo foi criado com Kaven)
5. Módulos (marketplace)
6. Pricing (3 planos)
7. Social proof (quando disponível)
8. CTA final

**Contexto para o conselho:**
- Público-alvo: devs full-stack querendo lançar SaaS sem montar infra do zero
- Problema central: 3-6 meses de infra comprimidos para dias
- Planos: Starter $99 / Complete $279 / Pro $549 (preços de lançamento)
- Diferencial único: dogfooding real (este site foi criado com `kaven init`)
- Prova: CLI funcional, marketplace com módulos reais

---

#### 4.3 — Implementação da landing

> Só executar após aprovação explícita de Chris E output dos Councils.

- [ ] Receber copy aprovado
- [ ] Receber diretrizes de design
- [ ] Implementar no kaven-site_ (`apps/marketing` ou similar — a definir)
- [ ] Revisão de copy: chris aprova antes de deploy
- [ ] Deploy

---

#### 4.4 — Tracking (pós-landing)

> Não implementar antes da landing estar aprovada.

- [ ] Google Tag Manager (GTM) setup
- [ ] GA4 via GTM
- [ ] Meta Pixel via GTM
- [ ] Testar events: page_view, CTA click, checkout_start, purchase
- [ ] O backend attribution (PR #91, EPIC-2.5) já existe — conectar frontend → backend

---

## 7. Restrições e Decisões Técnicas

### Fora do escopo imediato (não construir agora)

| Item | Motivo |
|---|---|
| Portal completo do cliente (ver licença, gerenciar assinatura via UI) | P2 — não bloqueia venda |
| Download de módulos pelo browser | CLI é o canal primário |
| GTM/GA4/Pixel | Vem após landing page aprovada |
| Documentação pública gated | Fase posterior |
| Blog | Fase posterior |

### Decisões de pagamento

- **MVP:** Stripe diretamente (produto R$1,00 de teste primeiro — Fase 2b)
- **Após testes:** Criar produtos reais no Stripe para cada plano
- **Paddle:** Descartado (decisão anterior — não reabrir)
- **Planos:** Starter $99 / Complete $279 / Pro $549 (preços de lançamento)
  - Starter: 1 projeto, 10 tenants
  - Complete: 1 projeto, tenants ilimitados
  - Pro: 5 projetos, acesso ao marketplace

### Decisões de arquitetura

- `kaven-site_` usa o mesmo Neon DB do framework (não criar banco novo)
- A API do kaven-site substitui a API do framework no Cloud Run (mesma URL, nova imagem)
- O Vercel reutiliza os mesmos projetos — apenas aponta para novo repo/branch
- Não criar novas instâncias Redis — usar Upstash existente

### Restrição de budget

- Zero budget adicional até primeira venda
- Todos os serviços usam free tiers ou infra já paga
- Custo atual: ~$45/mês (sem Vercel Pro) — manter

---

## 8. Rollback Plan

> **Obrigatório completar ANTES do deploy da Fase 1.4 e 1.5.**

### Snapshot pré-deploy

- [ ] Exportar configuração completa do Cloud Run: `gcloud run services describe kaven-marketplace --format=yaml > rollback/cloud-run-state.yaml`
- [ ] Exportar envs do Vercel admin: `vercel env pull .env.vercel-admin.backup`
- [ ] Exportar envs do Vercel tenant: `vercel env pull .env.vercel-tenant.backup`
- [ ] Anotar revision atual do Cloud Run: `gcloud run revisions list`
- [ ] Confirmar que os arquivos de backup estão salvos localmente (não no repo)

### Procedimento de rollback (< 30 minutos)

**Cloud Run (API):**
```bash
# Reverter para revision anterior
gcloud run services update-traffic kaven-marketplace \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-east1 \
  --project=kaven-prod
```

**Vercel (Admin + Tenant):**
- Dashboard Vercel → projeto → Deployments → selecionar deployment anterior → "Promote to Production"
- Ou: reconfigurar o projeto para apontar de volta para o repo `kaven-framework`

### Trigger de rollback

Executar rollback imediato se qualquer um destes ocorrer:
- Health check da API falhar por mais de 5 minutos
- `curl https://admin.kaven.site` retornar 5xx por mais de 5 minutos
- Erro crítico no banco de dados (migrations conflitantes)
- Stripe webhooks parando de responder

---

## 9. Critérios de Sucesso

### Fase 0 (Prep)
- [ ] Documento de auditoria completo para todos os serviços
- [ ] `kaven init` validado localmente com `pnpm build` passando

### Fase 1 (Bootstrap)
- [ ] `curl https://kaven-api-364441521455.us-east1.run.app/health` → 200
- [ ] `curl https://admin.kaven.site` → 200
- [ ] `curl https://tenant.kaven.site` → 200

### Fase 2 (Validação Backend)
- [ ] Signup com email: usuário criado no banco, email enviado
- [ ] Login com Google: sessão criada, tenant acessível
- [ ] Login com GitHub: sessão criada, tenant acessível
- [ ] Pagamento R$1,00 (Stripe): webhook recebido, subscription no banco
- [ ] Tenant page: carrega com dados do usuário corretos

### Fase 3 (Loop de Fixes)
- [ ] Zero erros P0 em produção
- [ ] `kaven upgrade` executado e validado pelo menos 3 vezes
- [ ] Versão do kaven-site atualizada para além da versão base do init

### Fase 4 (Landing Page)
- [ ] Chris convocado e aprovou prosseguir
- [ ] Councils consultados, copy aprovado
- [ ] Landing deployada com tracking configurado
- [ ] Primeiro evento registrado no GA4

---

## 10. Glossário

| Termo | Definição |
|---|---|
| **kaven-framework** | Repositório principal de desenvolvimento do Kaven. Código-fonte. Não é o produto em produção. |
| **kaven-site** | O produto comercial em produção. Criado com `kaven init` a partir do kaven-framework. |
| **kaven-site_** | Clone local do repositório `kaven-co/kaven-site` em `/home/bychrisr/projects/work/kaven/kaven-site_`. |
| **kaven-template** | Template usado pelo `kaven init` para gerar novos projetos. |
| **kaven-marketplace** | Backend independente que gerencia módulos, licenças e downloads. Já está no ar em `marketplace.kaven.site`. |
| **kaven upgrade** | Comando CLI que atualiza os módulos instalados em um projeto kaven para a versão mais recente. |
| **dogfooding** | Usar o próprio produto para construir o produto. O kaven-site é criado com `kaven init` — exatamente como um cliente faria. |
| **loop de correção** | O ciclo: problema no kaven-site → fix no kaven-framework → release → `kaven upgrade` → fix em produção. |
| **D1.12** | Story do Epic D1 (Deploy): smoke test E2E end-to-end. A Fase 1+2 deste plano é exatamente o D1.12. |
| **kaven-prod** | Projeto GCP (kaventhecreator@gmail.com) onde o Cloud Run está hospedado. |
| **P0/P1/P2** | Prioridades de bugs: P0=bloqueia fluxo, P1=UI quebrada mas funciona, P2=cosmético. |
| **Growth Council** | Conjunto de minds (Godin, Hormozi, Schwartz, Graham) convocados via `*consult-growth` para decisões de copy e posicionamento. |
| **Design Council** | Conjunto de minds (Brad Frost, Norman, Zhuo, Tay Dantas) convocados via `*consult-design` para decisões de design. |
| **Sprint S1** | Primeiro sprint do kaven-site, entregue em branch no repo. Contém hero, pricing, features, stats. Não deve ser reutilizado diretamente na Fase 4. |
| **EPIC-2.5** | Epic de attribution: backend já implementado (Meta CAPI + GA4 MP em `attribution.service.ts`). Frontend tracking pendente para Fase 4. |

---

*Criado: 2026-04-16 | Autor: planejamento colaborativo Chris + Claude Code*
*Próximo passo: quebrar em epics/sprints/stories no Linear (team KAV)*

# Kaven Site — Epic e Sprint Única (Backlog Detalhado)

> Status: pronto para execução  
> Base: `docs/planning/KAVEN-SITE-PLAN.md`  
> Objetivo: quebrar o fluxo completo em 1 epic + 1 sprint com histórias detalhadas e rastreáveis.

---

## EPIC-007 — Kaven Site Production Migration (Single-Flow)

- **Objetivo de negócio:** colocar o `kaven-site_` como produto comercial real em produção, validando fluxo crítico ponta-a-ponta (signup -> auth social -> payment -> tenant access) e consolidando o loop de correção (`framework -> release -> kaven upgrade -> produção`).
- **Prioridade:** `P0`
- **Escopo:** fases 0 a 3 completas, fase 4 com parada obrigatória (sem implementação de landing sem autorização explícita).
- **Fora do escopo nesta sprint:** blog, GTM/GA4/Pixel, portal completo de cliente, melhorias cosméticas P2.
- **Dependências globais:**
  - Infra atual em produção ativa (Neon, Upstash, Cloud Run, Vercel, Stripe, Cloudflare, Resend).
  - Acesso operacional aos provedores (Vercel/GCP/Stripe/Cloudflare/GitHub OAuth).
  - `kaven` CLI funcional e permissionada.
- **Definition of Done do Epic:**
  - Zero bugs `P0` em produção.
  - `kaven upgrade` validado >= 3 vezes end-to-end.
  - Fluxos críticos validados com evidência objetiva.
  - Gate de parada da Fase 4 executado e registrado.

---

## Sprint K1 — Migração e Validação de Produção (Fluxo Único)

- **Tipo:** sprint única orientada a fluxo crítico
- **Ordem de execução:** sequencial com checkpoints formais
- **Códigos das stories:** `K1.1` até `K1.13`
- **Regra de bloqueio:** nenhum deploy sem rollback plan pronto e audit trail de evidências

---

## Story K1.1 — Auditoria Consolidada de Envs e Secrets (Vercel + Cloud Run)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)`
- **Depende de:** nenhuma
- **Bloqueia:** K1.6, K1.7, K1.8, K1.9

### Objetivo
Inventariar 100% dos envs e secrets de produção para impedir migração cega.

### Acceptance Criteria
- [ ] Tabela de envs do Vercel `admin` e `tenant` com nome/escopo/ambiente/fonte.
- [ ] Tabela de envs do Cloud Run dos serviços impactados com origem (env/secret manager).
- [ ] Mapeamento de variáveis críticas (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `STRIPE_*`, `GITHUB_*`, `RESEND_*`).
- [ ] Segredos confirmados por localização, sem registrar valor sensível.
- [ ] Checklist de rotação de segredos críticos definido.

### Evidências obrigatórias
- Export/print dos inventários com timestamp.
- Checklist de confirmação assinado por executor + reviewer.

### Risco principal
Config faltante causar falha silenciosa só após deploy.

---

## Story K1.2 — Auditoria DNS + OAuth App + Mapa de Mudanças

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)` com apoio de `@kaven-architect (Atlas)`
- **Depende de:** K1.1
- **Bloqueia:** K1.7, K1.8, K1.9

### Objetivo
Fechar mapa de roteamento externo e autenticação social antes da troca de produção.

### Acceptance Criteria
- [ ] Inventário completo de DNS da zona `kaven.site` (subdomínio/tipo/destino).
- [ ] Identificação dos registros que mudam na migração e dos que permanecem.
- [ ] Callback URLs atuais de OAuth GitHub documentadas.
- [ ] Decisão formal: reutilizar OAuth App atual ou criar novo.
- [ ] Plano de cutover de callback URLs sem janela de inconsistência.

### Evidências obrigatórias
- Snapshot de DNS.
- Registro da decisão de OAuth com impacto e rollback.

### Risco principal
Login social quebrar por callback inconsistente.

---

## Story K1.3 — Hardening do Repo kaven-site_ + Estratégia de Branch

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)`
- **Depende de:** nenhuma
- **Bloqueia:** K1.5

### Objetivo
Preparar branch limpo para bootstrap sem perder referência do Sprint S1.

### Acceptance Criteria
- [ ] Estado do branch `feat/sprint-s1-landing` verificado e preservado.
- [ ] Backup de referência do S1 confirmado.
- [ ] Estratégia de branch para migração definida e documentada.
- [ ] Branch de trabalho limpo pronto para `kaven init`.

### Evidências obrigatórias
- Hash/branch de backup documentado.
- Branch de execução criado e validado.

### Risco principal
Perda de material de referência de copy/design.

---

## Story K1.4 — Investigação Real de Módulos Marketplace (Artefato vs Placeholder)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-api-dev (Bolt)` + `@kaven-product-intel (Trace)`
- **Depende de:** nenhuma
- **Bloqueia:** K1.5

### Objetivo
Determinar com evidência quais módulos podem ser instalados de fato no bootstrap.

### Acceptance Criteria
- [ ] Output real de `kaven marketplace browse` documentado.
- [ ] Verificação via API dos módulos públicos com release válido.
- [ ] Classificação final: `instalar agora` vs `pular por agora`.
- [ ] Evidência de existência de artefato para cada módulo elegível.

### Evidências obrigatórias
- Captura de output CLI/API.
- Lista final de módulos aprovada.

### Risco principal
Bootstrap falhar por módulo público sem artefato funcional.

---

## Story K1.5 — Validação do kaven init em Sandbox Limpo (/tmp)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-qa (Shield)` com apoio de `@kaven-module-creator (Forge)`
- **Depende de:** K1.4
- **Bloqueia:** K1.6

### Objetivo
Provar que o bootstrap padrão do cliente funciona antes de tocar repo de produção.

### Acceptance Criteria
- [ ] `kaven init` executa sem erro em `/tmp`.
- [ ] Estrutura obrigatória presente (`apps/*`, `packages/*`).
- [ ] `pnpm install` concluído sem falha.
- [ ] `pnpm build` concluído (warnings permitidos, erro não).
- [ ] Falhas encontradas viram correção no framework/template antes de avançar.

### Evidências obrigatórias
- Log de execução de `init/install/build`.
- Lista de ajustes necessários (se houver) e status.

### Risco principal
Carregar erro de bootstrap para produção e quebrar toda a migração.

---

## Story K1.6 — Bootstrap no kaven-site_ via kaven init + Instalação Controlada

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-module-creator (Forge)` + `@kaven-api-dev (Bolt)`
- **Depende de:** K1.3, K1.4, K1.5
- **Bloqueia:** K1.7

### Objetivo
Inicializar o produto real no repositório alvo exatamente como cliente faria.

### Acceptance Criteria
- [ ] `kaven init` executado no branch limpo do `kaven-site_`.
- [ ] Módulos elegíveis instalados conforme K1.4.
- [ ] `pnpm install` concluído no repo alvo.
- [ ] Estrutura final validada contra baseline esperada.

### Evidências obrigatórias
- Estrutura de diretórios gerada.
- Registro dos módulos instalados e versões.

### Risco principal
Divergir do fluxo real de cliente e invalidar dogfooding.

---

## Story K1.7 — Configuração de Envs de Produção (Admin, Tenant, API)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)` com revisão de `@kaven-architect (Atlas)`
- **Depende de:** K1.1, K1.2, K1.6
- **Bloqueia:** K1.8, K1.9

### Objetivo
Aplicar configuração de produção correta no novo produto sem vazamento de segredos.

### Acceptance Criteria
- [ ] Envs do Vercel `admin` configurados e revisados.
- [ ] Envs do Vercel `tenant` configurados e revisados.
- [ ] Envs da API no Cloud Run preparados e revisados.
- [ ] Variáveis críticas confirmadas (`DATABASE_URL`, `REDIS_URL`, `STRIPE_*`, `GITHUB_*`, `RESEND_*`, `JWT_SECRET`).
- [ ] Checklist de segurança de env (4-eyes) executado.

### Evidências obrigatórias
- Diff de variáveis por ambiente (sem segredos em claro).
- Aprovação de revisor registrada.

### Risco principal
Erro de ambiente derrubar auth, billing ou sessão.

---

## Story K1.8 — Rollback Readiness (<30 min) com Drill

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)` + `@kaven-qa (Shield)`
- **Depende de:** K1.1, K1.2
- **Bloqueia:** K1.9

### Objetivo
Garantir reversão rápida e previsível antes de qualquer corte em produção.

### Acceptance Criteria
- [ ] Snapshot de estado atual (Cloud Run + Vercel env backups) realizado.
- [ ] Revision anterior da API mapeada.
- [ ] Deploys anteriores de admin/tenant mapeados.
- [ ] Runbook de rollback validado em drill.
- [ ] Critérios de trigger de rollback operacionalizados.

### Evidências obrigatórias
- Arquivos de snapshot e checklist do drill.
- Tempo de execução real do drill registrado.

### Risco principal
Incidente sem rollback executável dentro da janela alvo.

---

## Story K1.9 — Deploy API (Cloud Run) + Smoke de Saúde

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-devops (Deploy)` com validação de `@kaven-qa (Shield)`
- **Depende de:** K1.7, K1.8
- **Bloqueia:** K1.10

### Objetivo
Substituir API atual pela API do kaven-site com segurança e validação imediata.

### Acceptance Criteria
- [ ] Imagem da API buildada com digest imutável e deployada no Cloud Run.
- [ ] `prisma migrate deploy` executado apenas se necessário e validado.
- [ ] Health endpoint retorna 200 em 3 tentativas consecutivas.
- [ ] Teste mínimo de auth endpoint sem erro 5xx.
- [ ] Se falha >5 min, rollback disparado automaticamente.

### Evidências obrigatórias
- URL e revision ativa pós deploy.
- Logs de health/auth e decisão Go/No-Go.

### Risco principal
Downtime da API e quebra dos fluxos críticos.

---

## Story K1.10 — Deploy Admin e Tenant (Vercel) + Smoke Frontend

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-frontend-dev (Pixel)` + `@kaven-devops (Deploy)`
- **Depende de:** K1.9
- **Bloqueia:** K1.11

### Objetivo
Publicar frontends conectados ao backend novo e validar disponibilidade real.

### Acceptance Criteria
- [ ] Projetos Vercel apontados para branch/repo corretos do `kaven-site_`.
- [ ] Deploy `admin` finalizado com sucesso.
- [ ] Deploy `tenant` finalizado com sucesso.
- [ ] `curl https://admin.kaven.site` retorna 200.
- [ ] `curl https://tenant.kaven.site` retorna 200.
- [ ] Navegação inicial em browser sem erro crítico de JS.

### Evidências obrigatórias
- URLs de deploy e status de build.
- Resultado de curl + verificação em browser.

### Risco principal
Frontend no ar com integração quebrada com API nova.

---

## Story K1.11 — Prova de Fogo Backend I (Auth Social + Signup + Tenant)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-api-dev (Bolt)` + `@kaven-qa (Shield)`
- **Depende de:** K1.10
- **Bloqueia:** K1.12

### Objetivo
Validar os fluxos de identidade e onboarding mínimo com foco em backend.

### Acceptance Criteria
- [ ] Fluxo Google OAuth completo (redirect -> callback -> sessão -> tenant access).
- [ ] Fluxo GitHub OAuth completo (redirect -> callback -> sessão -> tenant access).
- [ ] Signup email/password cria usuário e confirmações mínimas de email.
- [ ] Tenant mínimo criado e acessível após login.
- [ ] Verificação de isolamento básico entre tenants A/B.
- [ ] Achados classificados em `P0/P1/P2`.

### Evidências obrigatórias
- Logs de callback/sessão.
- Evidência de criação de usuário/tenant no banco.
- Relatório de bug triage inicial.

### Risco principal
Fluxo de aquisição e ativação quebrado, inviabilizando vendas.

---

## Story K1.12 — Prova de Fogo Backend II (Stripe R$1 + Webhook + Subscription)

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-api-dev (Bolt)` + `@kaven-qa (Shield)` + `@kaven-devops (Deploy)`
- **Depende de:** K1.11
- **Bloqueia:** K1.13

### Objetivo
Validar pipeline completo de pagamento real com confirmação persistida no sistema.

### Acceptance Criteria
- [ ] Price ID de teste confirmado e mapeado corretamente.
- [ ] Checkout Stripe abre com produto correto.
- [ ] Pagamento de teste conclui e retorna para success URL.
- [ ] Webhook Stripe chega e responde 200.
- [ ] Subscription criada/atualizada no banco com status coerente.
- [ ] Limpeza pós teste executada (remoção de plano de teste e cancelamento se aplicável).

### Evidências obrigatórias
- Evento no dashboard Stripe com status 200.
- Registro da subscription no banco e reflexo no tenant.

### Risco principal
Falha em webhook/assinatura impedir confirmação de receita.

---

## Story K1.13 — Loop de Correção P0 + Validação de 3 Upgrades + Gate Fase 4

- **Prioridade:** `P0`
- **Owner sugerido:** `@kaven-architect (Atlas)` orquestrando `@kaven-api-dev (Bolt)`, `@kaven-frontend-dev (Pixel)`, `@kaven-qa (Shield)`
- **Depende de:** K1.11, K1.12
- **Bloqueia:** início da fase de landing

### Objetivo
Fechar estabilidade operacional via loop framework->upgrade e aplicar gate formal de parada.

### Acceptance Criteria
- [ ] Todos os bugs `P0` identificados na prova de fogo resolvidos.
- [ ] Cada correção foi aplicada no `kaven-framework` (não direto no `kaven-site_`).
- [ ] Releases publicados e `kaven upgrade` executado/validado >= 3 vezes.
- [ ] Validação em produção registrada por iteração (problema, causa raiz, fix, versão, evidência).
- [ ] Lista `P1` documentada e `P2` enviada para backlog.
- [ ] Mensagem formal de parada da Fase 4 emitida para autorização explícita do Chris.

### Evidências obrigatórias
- Tabela de iterações do loop com versões.
- Checklist final `zero P0`.
- Registro de parada obrigatória da fase 4.

### Risco principal
Resolver sintomas locais sem validar upgrade end-to-end e reincidir em produção.

---

## Matriz de Dependências (Resumo)

- `K1.1` -> `K1.7`, `K1.8`, `K1.9`
- `K1.2` -> `K1.7`, `K1.8`, `K1.9`
- `K1.3` -> `K1.6`
- `K1.4` -> `K1.5`, `K1.6`
- `K1.5` -> `K1.6`
- `K1.6` -> `K1.7`
- `K1.7` + `K1.8` -> `K1.9`
- `K1.9` -> `K1.10`
- `K1.10` -> `K1.11`
- `K1.11` -> `K1.12`
- `K1.11` + `K1.12` -> `K1.13`

---

## Gates Operacionais da Sprint

- **Gate A (pré-deploy):** K1.1, K1.2, K1.5, K1.8 completos.
- **Gate B (API):** K1.9 com health 200 estável.
- **Gate C (front):** K1.10 com domínios 200 + browser ok.
- **Gate D (negócio):** K1.11 + K1.12 com auth/signup/payment validados.
- **Gate E (estabilidade):** K1.13 com zero P0 + >=3 upgrades + parada fase 4.

---

## Conversão para Linear (sugestão rápida)

Para cada `K1.x`, criar issue com:
- Título: `[K1.x] ...`
- Labels: `epic:EPIC-007`, `sprint:K1`, `priority:P0|P1|P2`, `area:infra|api|frontend|qa|security`
- Campos: owner sugerido, dependências e critérios de aceite exatamente como acima.


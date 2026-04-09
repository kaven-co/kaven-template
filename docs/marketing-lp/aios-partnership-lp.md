# AIOS Partnership — Landing Page Copy
**Narrativa:** Leandro Aguiari
**Potencialização:** Tiago Finch / Eugene Schwartz (estrutura e awareness)
**Data:** 2026-02-18
**Avatar:** Alan Nicolas, Pedro Valério, Tiago Finch — founders técnicos, sofisticados, awareness Level 4-5
**Tom:** Founder falando com founder. Direto. Sem marketing vazio.

---

## BRIEFING DE COPY

**Awareness level do avatar:** 4-5 (Most-Aware)
- Conhecem o AIOS profundamente
- Entendem o problema de infraestrutura SaaS (já viram ou viveram)
- Estão prontos para uma proposta concreta, não educação básica

**Sofisticação do mercado (Schwartz):** Alta — não usar claims genéricos como "rápido" ou "seguro". Mostrar o mecanismo específico.

**Estrutura (Finch):** Dor → Solução → Mecanismo → Prova → Oferta → CTA
*Nunca inverter. O avatar precisa se reconhecer na dor antes de aceitar a solução.*

---

# PRIMEIRA DOBRA

## Headline

> # O layer que faltava no AIOS.

**Alternativas testadas:**
- "AIOS orquestra. Kaven sustenta. Você constrói." *(mais completa, levemente longa)*
- "Enquanto você construía o cérebro, eu construía o corpo." *(narrativa, impactante)*
- "O layer enterprise que o AIOS não tem — ainda." *(direto ao gap)*

**Recomendação Aguiari:** Use a principal. "O layer que faltava" cria curiosidade imediata sem precisar de contexto.

## Sub-headline

> AIOS orquestra o que construir. Kaven garante que funciona quando escalar.
> Você só precisa dirigir.

## Vídeo

`[EMBED: aios-partnership-demo.mp4]`
*Autoplay muted. Legenda automática. Botão de ativar som.*
*Duração: ~70 segundos. Ver roteiro completo em `aios-partnership-video-script.md`.*

---

# ABAIXO DA DOBRA

---

## SEÇÃO 1 — O Problema Real

> **AIOS constrói rápido.**
>
> Você tem orquestração de agentes. Squads especializados. Automação que transforma semanas em horas.
>
> Mas quando o produto sai do forno e vai para o mundo real —
> quando precisa de 1.000 tenants simultâneos, auditoria de compliance, gestão de pagamentos, rate limiting por plano, multi-gateway, design system consistente —
>
> **quem cuida disso?**

> O AIOS resolve velocidade.
> O que está em aberto é robustez.
>
> Não é crítica — é uma lacuna estrutural de qualquer ferramenta focada em orquestração.
>
> **Eu a vi. E construí a resposta.**

**Nota Aguiari:** Esta seção não critica o AIOS. Ela posiciona o Kaven como complemento necessário, não competidor. A leitura tem que ser "faz sentido, isso é real" — não defensiva.

---

## SEÇÃO 2 — O Kaven

> **v1.0.0-rc1 — Feature-complete SaaS boilerplate**
>
> Construído para ser a fundação que você nunca mais vai reconstruir.

### O que está pronto

| Componente | Status | Detalhe |
|------------|--------|---------|
| **Multi-tenancy nativo** | ✅ | tenantId em 100% das queries, RLS middleware cobrindo 30+ models |
| **Segurança** | ✅ | IDOR protegido em 33 modelos, CSRF/SQLi/XSS test suite completo |
| **Auth** | ✅ | Roles, permissões, GDPR/LGPD compliance, soft delete global |
| **Pagamentos** | ✅ | Stripe (checkout + webhooks, 5 eventos), Paddle (licenças), PIX via PagueBit |
| **Email** | ✅ | AWS SES com rate limiting, templates, SNS webhooks, bounce handling |
| **Design System** | ✅ | 76+ componentes base, Fluent UI adapter, Shadcn adapter |
| **API** | ✅ | Fastify (~30k req/s), TypeScript, plugin ecosystem nativo |
| **Frontend** | ✅ | Next.js App Router, Admin Panel + Tenant App, Server Components |
| **Banco de dados** | ✅ | Prisma + PostgreSQL, 42+ composite indexes, schema documentado |
| **CI/CD** | ✅ | Pre-commit (GPG, ESLint, secrets scan), Pre-push (lint, typecheck, policy gates) |
| **Observabilidade** | ✅ | Métricas, alertas, dashboard de telemetria |
| **Feature flags** | ✅ | 40+ capabilities com enforcement via `requireFeature()` middleware |

### Números que importam

```
✓ 985 testes passando (0 falhas)
✓ 42 composite indexes para performance analytics
✓ 33 modelos com proteção IDOR
✓ 100% tech debt resolvido (42/42 items)
✓ v1.0.0-rc1 tag publicada
✓ 7 sprints completos, 46 stories entregues
```

---

## SEÇÃO 3 — AIOS + Kaven: O Stack Completo

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   AIOS = CÉREBRO                                    │
│   AI orchestration, system design, speed            │
│   Squads, agents, workflows automatizados           │
│                                                     │
│   +                                                 │
│                                                     │
│   KAVEN = CORPO                                     │
│   Infrastructure, security, compliance, GTM         │
│   Multi-tenancy, auth, payments, design system      │
│                                                     │
│   ─────────────────────────────────────────────     │
│                                                     │
│   RESULTADO:                                        │
│   Do briefing ao SaaS enterprise                    │
│   em horas, não meses.                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Analogia (para clareza imediata):**
> AIOS constrói o carro de Fórmula 1.
> Kaven fornece a pista, o pit stop, a regulamentação e os patrocinadores.
> O founder só precisa dirigir.

### O que cada um resolve

| | **AIOS** | **Kaven** |
|-|---------|---------|
| Orquestração de agentes | ✅ | — |
| Automação de workflows | ✅ | — |
| Velocidade de desenvolvimento | ✅ | — |
| Multi-tenancy enterprise | — | ✅ |
| Segurança e compliance | — | ✅ |
| Pagamentos multi-gateway | — | ✅ |
| Design System production-ready | — | ✅ |
| CI/CD e quality gates | — | ✅ |
| Auth e RBAC completo | — | ✅ |
| **Stack SaaS completo** | — | **✅ juntos** |

---

## SEÇÃO 4 — Para os founders que faturam R$1M+/mês

> Se você está nos eventos do AIOS, você já sabe o custo de cada semana sem o produto certo.
>
> Para um negócio de R$1M/mês, cada semana de dev perdida em infraestrutura que já existe equivale a R$250k que poderiam estar sendo investidos em produto real.
>
> O Kaven elimina esse custo.
>
> Não é um template. É a fundação que você não vai reconstruir em 18 meses porque "cresceu demais".

---

## SEÇÃO 5 — O Modelo (como funcionaria a integração)

### Três camadas

**kaven-lite (Free / Open Source)**
- Template mínimo funcional integrado ao AIOS CLI
- `aios new project --template kaven-lite`
- Scaffolding de projeto com fundação SaaS básica
- Para projetos greenfield da comunidade

**Kaven Pro (Paid)**
- Framework completo (tudo da tabela acima)
- Para produtos em escala
- Projetos que precisam de enterprise-grade desde o início

**Kaven Enterprise (Custom)**
- Para founders dos eventos AIOS
- Stack completo + onboarding assistido
- Customização por vertical (fintech, edtech, marketplace, etc.)

---

## SEÇÃO 6 — Sobre o founder

> Construí o Kaven porque precisava dele.
>
> Reconstruí auth três vezes antes de decidir documentar tudo e não deixar nenhum outro dev fazer o mesmo.
>
> Comecei a usar o AIOS para acelerar meu próprio desenvolvimento. Fiquei tão obcecado que fiz a documentação de tudo e construí o site.
>
> Foi aí que vi o gap — e percebi que tinha a peça que faltava.
>
> Sou neurodivergente (Autista + TDAH + AH/SD). Igual vocês.
> Penso em sistemas, não em hacks.
> Construo para durar, não para impressionar.

---

## CTA FINAL

> **Vocês têm a comunidade. Eu tenho a fundação.**
>
> Juntos, completamos o stack.

`[BOTÃO: Quero conversar]` → Link para DM / formulário de contato

---

## NOTAS TÉCNICAS DE IMPLEMENTAÇÃO DA LP

- **Stack:** HTML/CSS estático ou Next.js — rápido de publicar
- **Domínio:** Pode ser subdomínio de kaven, ou página standalone
- **Analytics:** Meta Pixel + Google Tag Manager desde o dia 1 (coleta de audiência)
- **Vídeo:** Upload no YouTube (unlisted) ou Vimeo para embed
- **Mobile first:** A maioria dos founders vai ver pelo celular via DM ou story
- **Tempo de carregamento:** < 2s. Nenhum founder espera LP carregar.

---

## CHECKLIST FINAL DE COPY (Schwartz)

- [ ] Avatar se reconhece na dor da Seção 1?
- [ ] A copy fala com Level 4-5 awareness (não explica o que é SaaS)?
- [ ] Cada número na tabela é verificável?
- [ ] A analogia da F1 está presente e clara?
- [ ] O modelo de negócio está explicado sem jargão?
- [ ] O CTA convida, não pede?
- [ ] A seção "Sobre o founder" é pessoal e autêntica, não CV?

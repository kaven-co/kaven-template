# Síntese — Tráfego Pago / Media Buyer (Live 12/02)

Este documento descreve uma **arquitetura operacional de workflows** para vários squads (OPS, Vendas, Marketing, CS, Produto e Administração), com papéis bem definidos, **handoffs explícitos** e **Quality Gates** (critérios de qualidade) para evitar retrabalho e “bagunça de processos”. fileciteturn0file0

---

## 1) Princípios centrais do sistema

### OPS como “arquiteto da casa”
A ideia-chave é separar **quem desenha o processo** (OPS) de quem **executa** (os squads). A metáfora usada é direta:
- **OPS = arquiteto** (desenha a planta, define regras e estrutura).
- **Outros squads = construtores** (executam seguindo a planta).
- Sem OPS, cada squad cria suas próprias regras → vira “spaghetti process”. fileciteturn0file0

### Fluxo unidirecional + rastreabilidade
O sistema enfatiza:
- **status e fluxo unidirecional** (evita loops invisíveis),
- **inputs/outputs por etapa**,
- **responsável claro por etapa**,
- documentação de “caminhos errados possíveis” e **veto conditions** (condições que bloqueiam avanço). fileciteturn0file0

### Quality Gates (>70%)
Em vários workflows há um modelo de **Quality Gate**:
- Cada gate avalia se o pacote está “bom o suficiente” (score **>70%**).
- Se falhar, volta para o ponto específico de falha (não “volta tudo”). fileciteturn0file0

---

## 2) Workflow macro de OPS: “Build Process” (construção de processos)

### Objetivo
Criar (ou corrigir) processos com:
- etapas claras,
- estrutura no ClickUp,
- automações,
- e checklists de qualidade.

### Papéis (núcleo OPS)
- **Process Mapper**: mapeia o processo atual “do fim pro começo”, identifica etapas, gargalos, quem faz o quê, e registra variações/erros comuns.
- **Architect**: desenha a arquitetura no ClickUp (pastas/listas, campos, status, templates e views por executor).
- **Automation Architect**: define executores, SLAs, handoffs, escalations e implementa automações (ClickUp/N8N/webhooks/APIs).
- **QA**: cria gates/checklists e valida “com pessoa leiga”, aprovando ou reprovando. fileciteturn0file0

### Sequência de tasks (com entradas/saídas)
1. **Discovery Process** → _Output_: processo atual mapeado  
2. **Create Process** → _Output_: desenho do processo novo (fluxograma)  
3. **Design Architecture** → _Output_: estrutura no ClickUp (pastas/listas/campos/status)  
4. **Design Executors** → _Output_: matriz de responsabilidades  
5. **Create Task Definitions** → _Output_: definições documentadas (inputs/outputs, aceite, dependências, blockers, exemplos de “done”)  
6. **Design Workflow** → _Output_: automações configuradas e testadas (triggers, movimentos automáticos, notificações, integrações e fallback)  
7. **Design QA Gates** → _Output_: critérios de qualidade + checklists  
8. **Execute Checklist (QA)** → _Output_: aprovado (entrega) ou lista de correções com indicação de onde voltar. fileciteturn0file0

---

## 3) Workflow de Vendas: Sales Pipeline

### Etapas (input → output)
- **Lead Scoring**: lead bruto → lead com score (0–100) e prioridade  
- **Lead Qualification (BANT)**: lead com score → qualificado (ou descartado)  
- **First Contact**: qualificado → agendamento ou nurture  
- **Discovery Call**: lead agendado → necessidades + fit confirmados  
- **Proposal**: necessidades → proposta enviada  
- **Negotiation**: objeções → objeções tratadas  
- **Close Deal**: lead pronto → contrato assinado ou perdido (com motivo)  
- **Pipeline Analysis / Forecast / Report**: dados → gargalos, previsão e relatório periódico fileciteturn0file0

### Papéis típicos
- **SDR** (entrada/qualificação/agenda),
- **Closer** (call/proposta/negociação/fechamento),
- **Analista de Vendas** (análise, forecast, reports),
- **AI Head de Vendas** (metas, distribuição de leads, desbloqueio e cobrança de resultado). fileciteturn0file0

### Quality gates
Há gates como “Lead bom?”, “Qualificado?”, “Fechou?”, e quando perde, o motivo é registrado (lost) para aprendizado e melhoria do funil. fileciteturn0file0

---

## 4) Workflow de Marketing: Research → Produção → Campanhas → Reports

### Pesquisa (inputs e outputs)
- **Competitor Analysis / Trend Hunting**: encontra insights e oportunidades de timing.
- **Swipe File**: organiza criativos winners e alimenta COPY e Media Buyer. fileciteturn0file0

### Execução
- **Tráfego Pago**: setup → optimize → scale winners (com regras de aprovação para aumentar budget).
- **Email (ActiveCampaign)**: segmentação → sequência → análise de métricas.
- **SEO/Conteúdo**: keyword research → pauta → publish → report.
- **Social Media**: criar conteúdo → agendar → engajar comunidade. fileciteturn0file0

### Mecanismo de controle
O fluxo usa gates como:
- “Tem insights?”
- “Material pronto?”
- “Tudo publicado?”
- “Meta atingida?” (se não, otimiza ou encerra). fileciteturn0file0

---

## 5) Workflow de Customer Success: Customer Journey + Suporte em paralelo

### Onboarding
- **Welcome Client** → boas-vindas e próximos passos
- **Setup Account** → configuração e materiais
- **First Value** → primeira vitória documentada
- **Handoff** → contexto documentado + CS assume fileciteturn0file0

### Suporte (sempre paralelo)
- **Ticket Triage** (N1/N2/N3 + prioridade)
- **Resolve (N1)** ou **Escalate (N2/N3)** com contexto
- **Report** (SLA, satisfação, problemas recorrentes → Produto) fileciteturn0file0

### Retenção
- **Health Check** (health score e riscos)
- **Engagement** (contato proativo)
- **Upsell Detection** (oportunidades → Vendas/SDR)
- **Churn Prevention** (ação de recuperação + motivo documentado) fileciteturn0file0

---

## 6) Workflow de Produto: Product Creation + Feedback Loop

### Núcleo
- **Product Manager**: discovery → roadmap → spec (requisitos e critérios de aceite) → coordena lançamento com MKT/Vendas.
- **Content Creator**: research → create → review.
- **QA Produto/CS**: quality check → test → feedback loop (organiza e prioriza para o PM). fileciteturn0file0

### Gates típicos
- “Spec aprovada?” → se não, refina.
- “Conteúdo pronto?”
- “Aprovado?” → se não, volta para creator.
- Pós-lançamento: feedback loop contínuo. fileciteturn0file0

---

## 7) Workflow de Administração: Admin Operations (triagem + aprovação)

### Modelo
Pedidos de qualquer squad entram e são triados (Head Admin) em:
- **Financeiro**, **RH/People**, **Jurídico**, **Facilities**, **Compliance**.

Depois:
1) executa task,  
2) verifica se precisa de aprovação (Head/CEO),  
3) entrega e notifica o squad solicitante. fileciteturn0file0

---

## 8) Ferramentas recorrentes no ecossistema

- **ClickUp** (gestão e automações nativas)
- **Notion** (docs/wiki/templates)
- **Slack** (comunicação)
- **Loom** (alinhamento e gravação de processos)
- **Figma/Miro** (fluxos/diagramas)
- **CRM (HubSpot/Pipedrive)** + **Sheets**
- **N8N / Webhooks / APIs** (integrações)
- Outras conforme o squad (Intercom/Zendesk, Ahrefs/Semrush, Meta Ads, etc.) fileciteturn0file0

---

## Observações rápidas (o “ponto frágil” típico) 🧪
O documento usa “**>70%**” como critério universal, mas não define a **régua do score**. Em implementação real, isso tende a quebrar se não existir:
- uma rubrica objetiva (ex.: checklist com pesos),
- definição de “quem pontua” e quando,
- e o que significa “70% bom” por workflow (processo ≠ campanha ≠ onboarding).

Isso é o tipo de detalhe que transforma um sistema bonito em um sistema realmente executável. fileciteturn0file0

# CS4.2 — Protocol de Council via Steave

> **Epic:** 5 (Cross-Squad) | **Sprint:** CS4 | **Agent:** @kaven-squad-lead (Steave)
> **Priority:** P2
> **Depends on:** None

---

## Contexto

O `AIOX-KAVEN-INTEGRATION.md` (GAP-6) identifica que os **5 councils do kaven-squad** (Design, Architecture, Quality, Product, Growth) existem como workflows YAML, mas **não há protocolo formal de invocação via Steave integrado à constitution do AIOX**.

O que existe hoje:
- Councils definidos como tarefas no kaven-squad (ex: `*consult-design`, `*consult-growth`)
- Minds dos councils em `squads/mmos-squad/minds/` (Seth Godin, Alex Hormozi, Brad Frost, etc.)
- Steave como meta-orchestrator do kaven-squad com 9 comandos
- Constitution do AIOX v5 com 5 princípios inegociáveis

O que falta:
- **Protocolo documentado** que define exatamente como Steave convoca um council
- **Briefing preparatório**: como Kai prepara contexto Kaven-aware antes do council
- **Output format**: como o resultado do council é sintetizado para `@pm` / `@architect`
- **Integração com constitution AIOX**: councils são Quality Gates? Advisory? Como se relacionam com Art. IV (No Invention) e Art. V (Quality First)?
- **Gatilhos automáticos**: em que situações um council deve ser convocado sem pedido explícito?

Esta story cria o `kaven-squad-lead-council-protocol.md` — o protocolo formal de invocação dos councils via Steave, integrado com o fluxo AIOX + kaven-squad.

## User Story

**As a** kaven-squad lead (Steave),
**I want to** have a documented and executable protocol for convening any of the 5 councils,
**So that** strategic decisions on Kaven projects are informed by the right council with proper Kaven context.

---

## Acceptance Criteria

- [ ] Arquivo `squads/kaven-squad/tasks/kaven-squad-lead-council-protocol.md` existe com protocolo completo
- [ ] Protocolo define o fluxo de 5 steps: pedido → briefing Kai → convocação Steave → execução council → síntese
- [ ] Tabela de roteamento: qual council para qual tipo de decisão (ex: "mudar pricing" → Growth Council)
- [ ] Briefing template: estrutura que Kai usa para preparar contexto Kaven-aware antes do council
- [ ] Output template: formato de síntese que Steave entrega para `@pm` / `@architect`
- [ ] Relação com constitution AIOX documentada: councils são Advisory Layer, não substituem os 5 princípios
- [ ] Gatilhos automáticos definidos: 5+ situações em que Steave DEVE convocar council sem pedido explícito
- [ ] Cada council tem: nome, minds, expertise, quando usar, quando NÃO usar, exemplo de pergunta
- [ ] Protocolo inclui regra de "council não executivo": resultado do council é recomendação, decisão final é de @pm ou @architect
- [ ] Protocolo define nível de confiança no output: `HIGH (3+ minds concordam)`, `MEDIUM (2 concordam)`, `LOW (divergência total — escalar para Steave *think)`

---

## Technical Notes

### Estrutura do Protocolo

```markdown
# kaven-squad-lead-council-protocol.md

## Visão Geral
Protocolo formal para invocação dos 5 councils do kaven-squad via Steave.
Os councils são a camada advisory estratégica — fornecem recomendações informadas
por múltiplas perspectivas. As decisões finais pertencem ao @pm (produto) e
@architect (técnica), sempre dentro dos 5 princípios da Constitution AIOX.

## Os 5 Councils

| Council | Owner | Minds | Quando Usar |
|---------|-------|-------|-------------|
| Design | @kaven-frontend-dev (Pixel) | Brad Frost, Don Norman, Julie Zhuo, Michael Bierut | UX/UI decisions, component architecture, user flows |
| Architecture | @kaven-architect (Atlas) | Kelsey Hathaway (infra), Kent Beck (design patterns), Guillermo Rauch (Next.js) | Tech stack decisions, scalability, DB schema major changes |
| Quality | @kaven-qa (Shield) | Kent Beck (TDD), Daniel Kahneman (decision quality) | Test strategy, QA gates, risk assessment |
| Product | @kaven-squad-lead (Steave via @pm context) | Marty Cagan, Jeff Patton | Feature prioritization, MVP scope, user research synthesis |
| Growth | @kaven-squad-lead (Steave via @kaven-product-intel context) | Seth Godin, Alex Hormozi, Eugene Schwartz, Paul Graham, Leandro Aguiari | Pricing, go-to-market, retention, copywriting |

## Fluxo de Invocação

### Step 1: Recebimento do Pedido
Steave recebe pedido de consulta. Pode vir de:
- Usuário direto: `*consult growth "Devemos adicionar PIX ao billing?"`
- Agent interno: `@pm → Steave: precisamos de input sobre pricing antes do sprint`
- Gatilho automático: Steave detecta decisão de alto impacto no contexto

### Step 2: Briefing Preparatório (via Kai)
Kai prepara briefing com:
- Contexto do projeto: stack, tier pricing, tenants ativos, MRR se disponível
- Decisão específica: o que está sendo deliberado
- Constraints Kaven: quais features/models afetados, impacto em schema
- Urgência: blocker de sprint? decisão de longo prazo?

Formato do briefing (template):
\`\`\`yaml
briefing:
  question: "<decisão a tomar>"
  kaven_context:
    project_stage: "greenfield | active | scaling"
    affected_features: [<lista>]
    affected_models: [<lista>]
    constraints: [<lista>]
  business_context:
    pricing_tier: "<tier alvo>"
    market: "<BR | US | global>"
    urgency: "blocker | sprint-decision | strategic"
\`\`\`

### Step 3: Convocação do Council
Steave seleciona o council com base na natureza da decisão.
Passa o briefing como contexto inicial.
Cada mind do council responde do seu ponto de vista característico.

### Step 4: Execução do Council
Formato de debate: `steel_man` por padrão (cada mind defende o melhor caso para sua posição).
Para decisões complexas: `oxford` (posições opostas, então síntese).

Critério de convergência:
- HIGH: 3+ minds apontam para mesma direção
- MEDIUM: 2 concordam, 1 diverge
- LOW: divergência total — Steave aciona `*think` (Leadership: Musk/Jobs/Altman)

### Step 5: Síntese para @pm / @architect
Steave entrega síntese em formato acionável:

\`\`\`markdown
## Council Output — <Council Name>
**Decisão deliberada:** <pergunta>
**Recomendação:** <ação concreta>
**Nível de confiança:** HIGH | MEDIUM | LOW
**Rationale:** <2-3 frases>
**Risks identificados:** <lista>
**Próximo passo sugerido:** <ação específica para @pm ou @architect>
\`\`\`

## Relação com Constitution AIOX

Os councils operam como **Advisory Layer** — camada de enriquecimento de contexto.
Eles não substituem nem sobrepõem a Constitution:

- Art. I (Clarity First): briefing do council deve esclarecer, não confundir
- Art. II (Minimal Footprint): council não recomenda features fora do escopo da pergunta
- Art. III (Reversibility): council pondera reversibilidade nas recomendações
- Art. IV (No Invention): council não inventa fatos do projeto — Kai fornece o briefing real
- Art. V (Quality First): recomendação de council não bypassa quality gates

## Gatilhos Automáticos

Steave DEVE convocar council automaticamente (sem pedido) quando detectar:

1. **Mudança de pricing tier** → Growth Council
2. **Nova feature impacta UX de tenant** → Design Council (mínimo 1 consulta antes do sprint)
3. **Migração de schema que afeta 5+ models** → Architecture Council
4. **Sprint com 0 testes planejados** → Quality Council
5. **Decision sobre qual módulo monetizar** → Product Council + Growth Council (ambos)
```

### Localização dos Arquivos

```
squads/kaven-squad/
├── tasks/
│   ├── kaven-squad-lead-council-protocol.md   # este arquivo
│   └── ...
├── agents/
│   └── kaven-squad-lead.md    # Steave — referenciar o protocolo
```

### Integração com Steave Agent

O arquivo `squads/kaven-squad/agents/kaven-squad-lead.md` (Steave) deve ser atualizado para referenciar o protocolo:

```markdown
## Council Invocation
Para convocar qualquer council, seguir o protocolo em:
`squads/kaven-squad/tasks/kaven-squad-lead-council-protocol.md`

Comando direto: `*consult <council-name> "<pergunta>"`
```

### Arquivos Afetados

| Acao | Arquivo |
|------|---------|
| ADD | `squads/kaven-squad/tasks/kaven-squad-lead-council-protocol.md` |
| MODIFY | `squads/kaven-squad/agents/kaven-squad-lead.md` (referenciar protocolo) |

---

## Definition of Done

- [ ] `kaven-squad-lead-council-protocol.md` existe com protocolo completo (todos os 5 steps)
- [ ] Tabela de roteamento com todos os 5 councils e critérios de quando usar/não usar
- [ ] Briefing template definido (YAML)
- [ ] Output template definido (Markdown)
- [ ] Relação com constitution AIOX documentada
- [ ] 5+ gatilhos automáticos definidos
- [ ] `squads/kaven-squad/agents/kaven-squad-lead.md` referencia o protocolo
- [ ] PR mergeado na main do kaven-framework (squad directory)

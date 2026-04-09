# AIOS Partnership — Roteiro do Vídeo
**Narrativa:** Leandro Aguiari
**Potencialização:** Tiago Finch
**Data:** 2026-02-18
**Duração alvo:** 60–75 segundos
**Estilo:** Screen recording DYE (Do It Yourself) + voz
**Destino:** Embed na LP, acima da dobra técnica

---

## BRIEFING

**Objetivo:** Provar em 60 segundos que o Kaven resolve o gap do AIOS, usando demonstração real, não slides.

**Avatar do espectador:** Alan Nicolas, Pedro Valério — founders técnicos com tempo escasso. Cada segundo tem custo.

**Princípio de produção (Alan Nicolas):** *"Mostre o sistema real ou não mostre nada."*
**Princípio de funil (Tiago Finch):** *"Dor → Solução → Oportunidade. Nunca inverta."*

---

## ROTEIRO COMPLETO

---

### ABERTURA — [0:00 – 0:05]

**Visual:** Tela preta. Cursor piscando. Silêncio.

**Voz (Aguiari):**
> "AIOS constrói rápido.
> Mas quando termina...
> o que fica?"

**Nota (Finch):** Os primeiros 5 segundos definem se o espectador fica. Tela preta + cursor + pergunta direta é anticonvencional. Faz parar.

---

### DOR — [0:05 – 0:15]

**Visual:** Screen recording do processo AIOS gerando um projeto. Mostra o workflow terminando. Cursor piscando em branco — o "e agora?".

**Voz:**
> "Você tem orquestração de agentes.
> Velocidade absurda.
> Automação.
>
> Mas quando o produto vai para produção...
> quem cuida de multi-tenancy?
> De compliance? De segurança?
> Das 985 edge cases que quebram SaaS real?"

**Nota (Finch):** "985 edge cases" é o número real de testes. Não é retórica — é prova. Faz soar diferente de qualquer outra claim de segurança.

---

### SOLUÇÃO — [0:15 – 0:50]

**Visual:** Transição para terminal Kaven.

**Voz:**
> "O que eu construí é o que vem depois disso."

**[cut: `npm test` rodando no terminal]**
```
✓ 985 tests passing
✓ 0 failures
```

**Voz:**
> "985 testes passando."

**[cut: schema.prisma com tenantId em destaque]**

**Voz:**
> "Multi-tenancy nativo. tenantId em todas as queries. 33 modelos protegidos contra IDOR."

**[cut: dashboard Kaven — Admin Panel rodando]**

**Voz:**
> "Auth, pagamentos Stripe, AWS SES, design system, observabilidade.
> Fastify API. Next.js Admin Panel. Tenant App."

**[cut: split screen — AIOS workflow de um lado, Kaven stack do outro]**

**Voz:**
> "AIOS orquestra o que construir.
> Kaven garante que funciona quando escalar.
> Você só precisa dirigir."

**Nota (Finch):** O split screen é o momento de maior impacto visual. Não apresse. Deixe 2-3 segundos aqui.

---

### PITCH — [0:50 – 1:10]

**Visual:** Zoom out para o founder (câmera) ou continua screen recording — depende do estilo que for produzir.

**Voz (Aguiari — tom pessoal, direto):**
> "Se eu consigo fazer isso sozinho agora...
>
> imagina na infraestrutura de vocês.
>
> Vocês têm a comunidade.
> Eu tenho a fundação.
>
> Não vou me alongar — o tempo de vocês custa caro.
> Mas desça aqui embaixo e veja como funcionaria o modelo."

**[Visual: Seta animada apontando para baixo → direcionando para o conteúdo da LP]**

---

## NOTAS DE PRODUÇÃO

| Elemento | Decisão |
|----------|---------|
| **Narração** | Voz do próprio founder. Não TTS, não locutor. |
| **Qualidade de vídeo** | Screen recording 1080p. Não precisa ser estúdio. |
| **Música** | Nenhuma. Ou som de teclado baixo no fundo. |
| **Legendas** | Sim — founders assistem com som desligado frequentemente. |
| **Duração real** | Gravar em 60-75s. Se passar de 80s, cortar da seção Dor. |
| **Abertura da LP** | Vídeo autoplay sem som (muted) com botão de ativar som. |

---

## VARIANTE CURTA (30s — para Reels/TikTok se necessário)

```
[0:00-0:03] Cursor piscando. "AIOS constrói. Mas o que fica?"
[0:03-0:12] npm test: 985 passing. "985 testes. Multi-tenancy. Stripe. Tudo pronto."
[0:12-0:20] Split screen AIOS + Kaven. "AIOS orquestra. Kaven sustenta."
[0:20-0:30] "Imagina isso no ecossistema de vocês. Desce aqui. 👇"
```

---

## FRASE DE FECHAMENTO (usar também no thumbnail/capa do vídeo)

> **"AIOS orquestra. Kaven sustenta. Você só precisa dirigir."**

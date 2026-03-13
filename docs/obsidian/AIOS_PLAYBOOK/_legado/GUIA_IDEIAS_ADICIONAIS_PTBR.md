---
title: GUIA_IDEIAS_ADICIONAIS_PTBR
version: 1.0.0
type: ideas
domain: aios
audience: [iniciante,avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-12
tags: [aios, playbook, quick-guide, squads-personais]
---

# AIOS - Ideias de Guias Adicionais (PT-BR)

Sugestoes de guias praticos para completar seu kit operacional.

## 1) Guia de Onboarding de Squad (novo membro)

Objetivo: colocar alguem produtivo em 1 dia.

Blocos:
- contexto do produto
- mapa de agentes AIOS que o time usa
- comandos base por funcao (dev, qa, po, devops)
- fluxo minimo para primeira story

## 2) Guia de Hotfix em Producao

Objetivo: corrigir rapido sem quebrar estabilidade.

Blocos:
- triagem e escopo minimo
- implementacao isolada
- gate QA focado em regressao critica
- release emergencial via devops

## 3) Guia de Release Semanal

Objetivo: padronizar preparacao e publicacao.

Blocos:
- congelamento de escopo
- checklist de pre-push
- validacao QA final
- PR/release/changelog

## 4) Guia de Incidente e Pos-mortem

Objetivo: responder incidente e aprender.

Blocos:
- deteccao e mitigacao
- owner e comunicacao
- rollback/plano de contencao
- pos-mortem com acoes rastreaveis

## 5) Guia de Handoff entre Agentes

Objetivo: evitar perda de contexto entre etapas.

Blocos:
- entrada obrigatoria por agente
- saida obrigatoria por agente
- criterio de pronto para proximo agente
- comando de transicao recomendado

## 6) Guia de Debito Tecnico Operacional

Objetivo: transformar debito em plano executavel.

Blocos:
- captura padronizada (`@dev *backlog-debt`)
- priorizacao (`@po *backlog-prioritize`)
- janela de execucao por sprint
- criterio de fechamento

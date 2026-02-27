# Introdução

## Visão Geral

O Design System Kaven foi atualizado para:

1. Seguir a identidade visual oficial do Brandbook v2.0.1.
2. Adotar Atomic Design (Brad Frost): Átomos → Moléculas → Organismos → Templates → Páginas.
3. Escalar customização com matriz completa de tamanhos e densidade.

## Atomic Design no projeto

- **Átomos**: componentes básicos e sem dependências compostas.
- **Moléculas**: combinações funcionais de átomos.
- **Organismos**: seções complexas e blocos de interface.
- **Templates**: estruturas de página sem dados finais.
- **Páginas**: composições reais para preview e validação.

## Regras de dependência

- Átomo não importa molécula/organismo/template.
- Molécula importa apenas átomos.
- Organismo importa átomos e moléculas.
- Template importa organismos, moléculas e átomos.
- Página importa templates.

## Source of Truth

- Componentes: `packages/ui/src/*`
- Tokens: `packages/ui/src/tokens/*` e `packages/shared/src/theme/*`
- Brand assets (logo/Kai): `packages/ui/src/brand/*`

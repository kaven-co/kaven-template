# Best Practices

## Acessibilidade

- Nunca remover foco sem substituição visual.
- Ícones clicáveis com `aria-label`.
- Inputs com label explícita.
- Navegação por teclado em menus, dialog e tabelas.

## Performance

- Evitar `use client` sem necessidade.
- Reutilizar componentes de `@kaven/ui` para reduzir drift.
- Usar `next/image` em assets de interface quando viável.

## Brand guardrails

- Kai representa adaptabilidade técnica (não místico).
- Verde é cor primária oficial.
- Não usar paleta antiga como padrão.

## Policy checks

Pipeline bloqueia:

- classes Tailwind dinâmicas inválidas
- botões ícone sem nome acessível
- hex fora da paleta sem justificativa

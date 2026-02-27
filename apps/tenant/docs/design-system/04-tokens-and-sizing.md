# Tokens e Sizing

## Escala global de tamanhos

`2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

## Matriz base

- Control heights: 24, 28, 32, 36, 40, 48, 56
- Icon sizes: 12, 14, 16, 18, 20, 24, 32
- Radius: 4, 6, 8, 12, 16, 20, full
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Contrato mínimo de props

```ts
size?: '2xs'|'xs'|'sm'|'md'|'lg'|'xl'|'2xl'
density?: 'compact'|'comfortable'|'spacious'
variant?: string
tone?: 'default'|'brand'|'success'|'warning'|'error'|'info'
fullWidth?: boolean
```

## Densidade

- `compact`: interfaces densas (tabelas, painéis técnicos)
- `comfortable`: padrão
- `spacious`: interfaces de onboarding/marketing

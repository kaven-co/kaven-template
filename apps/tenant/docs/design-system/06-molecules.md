# Moléculas

## Componentes

- FormField
- SearchInput
- IconButtonWithTooltip
- CardHeaderAction
- PaginationControl

## Princípios

- Toda molécula é composição de átomos.
- Não usar HTML solto quando houver átomo equivalente.
- Reutilizar contrato de sizing (`size`, `tone`, `density`) sempre que possível.

## Exemplo

```tsx
<FormField
  id="email"
  label="Email"
  placeholder="name@domain.com"
  size="md"
  tone="brand"
/>
```

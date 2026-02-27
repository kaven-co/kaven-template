---
status: deprecated
replacement: ../05-atoms.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# TextField - Design System Minimals

## 📝 Visão Geral

Componente de input para formulários com suporte a validação e estados.

## Uso Básico

```tsx
<TextField label="Nome" placeholder="Digite seu nome" value={value} onChange={handleChange} />
```

## Variantes

### Standard

```tsx
<TextField variant="standard" label="Email" />
```

### Outlined

```tsx
<TextField variant="outlined" label="Senha" type="password" />
```

## Estados

### Error

```tsx
<TextField label="Email" error helperText="Email inválido" />
```

### Disabled

```tsx
<TextField label="Campo" disabled />
```

## Estilos

- **Radius**: md (8px)
- **Border**: 1px solid grey.300
- **Focus**: Ring primary com alpha 0.24
- **Height**: 48px (padrão)

## Best Practices

### ✅ Fazer

- Sempre usar label
- Fornecer helperText para erros
- Usar placeholder descritivo

### ❌ Não Fazer

- Label e placeholder idênticos
- Inputs muito largos sem max-width
- Omitir feedback de validação

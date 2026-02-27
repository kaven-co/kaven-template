---
status: deprecated
replacement: ../08-templates.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# Card - Design System Minimals

## 🎴 Visão Geral

Container para agrupar conteúdo relacionado com elevação e padding consistentes.

## Uso Básico

```tsx
<Card>
  <h3>Título</h3>
  <p>Conteúdo do card</p>
</Card>
```

## Estilos Padrão

- **Radius**: xl (16px)
- **Shadow**: z12
- **Padding**: 24px
- **Background**: Branco
- **Border**: 1px solid grey.200

## Variantes

### Card com Header

```tsx
<Card>
  <CardHeader title="Título" subtitle="Subtítulo" />
  <CardContent>Conteúdo principal</CardContent>
</Card>
```

### Card com Actions

```tsx
<Card>
  <CardContent>Conteúdo</CardContent>
  <CardActions>
    <Button>Cancelar</Button>
    <Button variant="contained">Salvar</Button>
  </CardActions>
</Card>
```

## Best Practices

### ✅ Fazer

- Usar padding 24px
- Agrupar conteúdo relacionado
- Manter hierarquia clara

### ❌ Não Fazer

- Cards muito grandes (dividir em seções)
- Padding inconsistente
- Muitos cards aninhados

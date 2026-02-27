---
status: deprecated
replacement: ../07-organisms.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# Table - Design System Minimals

## 📊 Visão Geral

Componente para exibir dados tabulares com suporte a ordenação e paginação.

## Uso Básico

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Nome</TableHeaderCell>
      <TableHeaderCell>Email</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Estilos

- **Border**: 1px solid grey.300
- **Hover**: Background grey.50
- **Header**: Background grey.100
- **Padding**: 16px

## Com Ordenação

```tsx
<TableHeaderCell sortable sortDirection={sortDirection} onSort={handleSort}>
  Nome
</TableHeaderCell>
```

## Best Practices

### ✅ Fazer

- Usar TableHead e TableBody
- Fornecer key único para TableRow
- Implementar paginação para muitos dados

### ❌ Não Fazer

- Tabelas muito largas sem scroll
- Muitas colunas (considerar card grid)
- Células sem padding

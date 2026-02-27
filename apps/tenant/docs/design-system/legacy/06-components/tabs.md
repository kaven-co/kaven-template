---
status: deprecated
replacement: ../08-templates.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# Tabs - Design System Minimals

## 📑 Visão Geral

Componente de navegação por abas para organizar conteúdo relacionado.

## Uso Básico

```tsx
<Tabs value={activeTab} onChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
    <TabsTrigger value="tab3">Aba 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo da Aba 1</TabsContent>
  <TabsContent value="tab2">Conteúdo da Aba 2</TabsContent>
  <TabsContent value="tab3">Conteúdo da Aba 3</TabsContent>
</Tabs>
```

## Estilos

- **Radius**: md (8px)
- **Active indicator**: Primary color
- **Padding**: 12px 16px

## Variantes

### Horizontal (Padrão)

```tsx
<Tabs orientation="horizontal">{/* ... */}</Tabs>
```

### Vertical

```tsx
<Tabs orientation="vertical">{/* ... */}</Tabs>
```

## Best Practices

### ✅ Fazer

- Limitar a 5-7 abas
- Labels curtos e descritivos
- Indicar aba ativa claramente

### ❌ Não Fazer

- Muitas abas (usar dropdown)
- Labels muito longos
- Abas aninhadas

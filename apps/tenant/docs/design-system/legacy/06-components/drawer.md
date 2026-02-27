---
status: deprecated
replacement: ../08-templates.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# Drawer - Design System Minimals

## 🗂️ Visão Geral

Sidebar de navegação lateral colapsável.

## Uso Básico

```tsx
<Drawer>
  <DrawerHeader>
    <Logo />
  </DrawerHeader>
  <DrawerContent>
    <Navigation />
  </DrawerContent>
</Drawer>
```

## Estilos

- **Width**: 280px (expandido), 72px (colapsado)
- **Shadow**: z24
- **Background**: Dark (#1C252E)
- **Border**: 1px solid grey.200

## Colapsável

```tsx
const { isCollapsed, toggle } = useSidebar();

<Drawer collapsed={isCollapsed}>
  <IconButton onClick={toggle}>{isCollapsed ? <ChevronRight /> : <ChevronLeft />}</IconButton>
  {/* ... */}
</Drawer>;
```

## Best Practices

### ✅ Fazer

- Usar width 280px expandido
- Implementar collapse para 72px
- Tooltips quando colapsado
- Persistir estado (localStorage)

### ❌ Não Fazer

- Drawer muito largo (\u003e300px)
- Sem animação de transição
- Omitir tooltips no modo colapsado

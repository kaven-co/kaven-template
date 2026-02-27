# Kaven Design System - Brandbook v2.0.1 + Atomic Design

## 📚 Índice da Documentação

Documentação oficial do Design System Kaven alinhada ao Brandbook v2.0.1 e à metodologia de Design Atômico de Brad Frost.

### Fundamentos

1. [Introdução](./01-introduction.md) - Princípios, escopo e modelo atômico
2. [Cores](./02-colors.md) - Paleta oficial v2.0.1 (verde + ciano + laranja)
3. [Tipografia](./03-typography.md) - Space Grotesk (display) + Inter (body/UI)
4. [Tokens e Sizing](./04-tokens-and-sizing.md) - Escala 2xs → 2xl, densidade e contratos

### Atomic Design

5. [Átomos](./05-atoms.md) - Button, Input, Label, Icon, Badge, Avatar, Spinner, Typography
6. [Moléculas](./06-molecules.md) - FormField, SearchInput, IconButtonWithTooltip, CardHeaderAction, PaginationControl
7. [Organismos](./07-organisms.md) - AppHeader, SidebarNav, DataTable, SettingsPanel, PricingGrid
8. [Templates](./08-templates.md) - DashboardTemplate, AuthTemplate, SettingsTemplate, MarketingTemplate
9. [Páginas](./09-pages.md) - Composição de templates e exemplos de layout

### Qualidade

10. [Best Practices](./10-best-practices.md) - A11y, performance, brand guardrails e policy checks

### Legacy (read-only)

- [Arquivo legado consolidado](./legacy/) - Conteúdo histórico preservado com status `deprecated` e ponte para os documentos oficiais 01-10.

---

## 🎯 Objetivo

Garantir consistência visual, técnica e de experiência entre admin, tenant e docs, com componentes reutilizáveis e altamente customizáveis.

## 🚀 Quick Start

```tsx
import { Button, Card, FormField } from '@kaven/ui';

export function MyComponent() {
  return (
    <Card elevation="flat" padding="md" radiusPreset="default">
      <FormField
        id="project-name"
        label="Nome do projeto"
        placeholder="Kaven SaaS"
        size="md"
        tone="brand"
      />
      <Button variant="solid" tone="brand" size="md" className="mt-4">
        Criar
      </Button>
    </Card>
  );
}
```

## ✅ Regras Rápidas

- Use sempre tokens semânticos (evite hardcode de cor em JSX).
- Use API de tamanho/densidade padrão (`size`, `density`, `tone`, `variant`).
- Todo botão só com ícone deve ter `aria-label` ou `sr-only`.
- Kai é símbolo técnico de adaptabilidade, não mascote místico.
- A taxonomia oficial é estritamente `01` a `10`; tudo fora desse fluxo fica apenas em `legacy/`.

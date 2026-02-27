---
status: deprecated
replacement: ../10-best-practices.md
---

> Legacy note: conteúdo mantido apenas para referência histórica. Use o arquivo indicado em `replacement` como fonte oficial.

# Utilities - Design System Minimals

## 🛠️ Visão Geral

Funções utilitárias para formatação, mock data e configurações.

## Format Utilities

### formatDate

```typescript
import { formatDate } from '@/lib/utils/format';

formatDate(new Date()); // "22 Dez 2024"
formatDate(new Date(), 'dd/MM/yyyy'); // "22/12/2024"
```

### formatCurrency

```typescript
import { formatCurrency } from '@/lib/utils/format';

formatCurrency(1234.56); // "R$ 1.234,56"
formatCurrency(1234.56, 'USD'); // "$1,234.56"
```

### formatNumber

```typescript
import { formatNumber } from '@/lib/utils/format';

formatNumber(1234567); // "1.234.567"
formatNumber(0.1234, { style: 'percent' }); // "12,34%"
```

## Mock Generators

### generateUser

```typescript
import { generateUser } from '@/lib/mock';

const user = generateUser();
// { id, name, email, avatar, role, status, ... }
```

### generateUsers

```typescript
import { generateUsers } from '@/lib/mock';

const users = generateUsers(10); // Array de 10 usuários
```

## Config

### API Configuration

```typescript
import { apiConfig } from '@/lib/config';

const baseURL = apiConfig.baseURL;
const timeout = apiConfig.timeout;
```

## Best Practices

### ✅ Fazer

- Usar formatters para consistência
- Gerar mock data para desenvolvimento
- Centralizar configurações

### ❌ Não Fazer

- Formatar manualmente
- Hardcoded mock data
- Configurações espalhadas

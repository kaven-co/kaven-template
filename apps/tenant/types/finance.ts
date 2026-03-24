// Finance module types

export type FinancialEntryStatus = 'SCHEDULED' | 'PENDING' | 'CONFIRMED' | 'RECONCILED';
export type EntryType = 'revenue' | 'expense' | 'investment' | 'financial_movement';
export type AccountType = 'revenue' | 'fixed_expense' | 'variable_expense' | 'investment' | 'financial_movement';
export type BankAccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'credit_card';
export type CostCenterType = 'cost' | 'profit';
export type BudgetScenario = 'base' | 'conservative' | 'optimistic';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype?: string;
  parentId?: string | null;
  appearsInDFC: boolean;
  appearsInDRE: boolean;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  children?: ChartOfAccount[];
}

export interface BankAccount {
  id: string;
  name: string;
  bankCode?: string;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  type: BankAccountType;
  currency: string;
  initialBalance: string;
  initialDate: string;
  isActive: boolean;
  creditLimit?: string;
  closingDay?: number;
  dueDay?: number;
  confirmedBalance?: number;
  projectedBalance?: number;
}

export interface FinancialEntryLine {
  id: string;
  chartOfAccountId: string;
  bankAccountId?: string;
  costCenterId?: string;
  statementId?: string;
  amount: string;
  description?: string;
  chartOfAccount?: { id: string; name: string; code: string; type: string };
  bankAccount?: { id: string; name: string; type: string };
  costCenter?: { id: string; name: string; type: string };
}

export interface FinancialEntry {
  id: string;
  dateDFC: string;
  dateDRE: string;
  type: EntryType;
  description?: string;
  totalAmount: string;
  currency: string;
  status: FinancialEntryStatus;
  dueDate?: string;
  paidAt?: string;
  paidAmount?: string;
  transferPairId?: string;
  notes?: string;
  attachmentUrl?: string;
  tags: string[];
  clientId?: string;
  projectId?: string;
  installmentNumber?: number;
  createdAt: string;
  lines: FinancialEntryLine[];
  client?: { id: string; fullName: string };
  createdBy?: { id: string; name: string };
  project?: { id: string; name: string };
}

export interface Budget {
  id: string;
  year: number;
  name: string;
  scenario: BudgetScenario;
  isActive: boolean;
  _count?: { lines: number };
  lines?: BudgetLine[];
}

export interface BudgetLine {
  id: string;
  chartOfAccountId: string;
  month: number;
  amount: string;
  chartOfAccount?: { id: string; name: string; code: string; type: string };
}

export interface BudgetComparison {
  chartOfAccount: { id: string; name: string; code: string; type: string };
  month: number;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
}

export interface DREReport {
  period: { year: number; month: number | null };
  accounts: Array<{
    id: string;
    name: string;
    code: string;
    type: string;
    total: number;
  }>;
  summary: {
    revenue: number;
    fixedExpenses: number;
    variableExpenses: number;
    totalExpenses: number;
    grossProfit: number;
    ebitda: number;
    netResult: number;
    grossMargin: number;
    ebitdaMargin: number;
    netMargin: number;
  };
}

export interface DFCReport {
  year: number;
  months: Array<{
    month: number;
    revenue: number;
    expenses: number;
    investments: number;
    netCashFlow: number;
    cumulativeBalance: number;
  }>;
}

export interface KPIValue {
  id: string;
  name: string;
  slug: string;
  unit: string;
  value: number | null;
  status: 'good' | 'warning' | 'critical';
  thresholdGood: number | null;
  thresholdWarning: number | null;
}

export interface FinancialSummary {
  cashBalance: number;
  projectedBalance: number;
  runway: number;
  revenueMonth: number;
  expensesMonth: number;
  netResult: number;
  upcomingDue: Array<{
    id: string;
    description: string;
    type: string;
    totalAmount: string;
    dueDate: string;
    status: string;
  }>;
}

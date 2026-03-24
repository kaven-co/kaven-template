// AI Automation module types

export type TelemetryProvider = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'CUSTOM';
export type RuleStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ARCHIVED' | 'ERROR';
export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface AgentTelemetry {
  id: string;
  provider: TelemetryProvider;
  model: string;
  agentId?: string;
  module?: string;
  traceId?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  firstTokenMs?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AgentAction {
  id: string;
  agentId: string;
  actionType: string;
  module: string;
  entityType?: string;
  entityId?: string;
  inputSummary?: string;
  outputSummary?: string;
  success: boolean;
  error?: string;
  durationMs?: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  status: RuleStatus;
  isEnabled: boolean;
  priority: number;
  maxExecutions?: number;
  cooldownMs?: number;
  conditions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  trigger?: {
    id: string;
    name: string;
    eventType: string;
    module: string;
  };
  steps?: AutomationRuleStep[];
  _count?: {
    runs: number;
  };
}

export interface AutomationRuleStep {
  id: string;
  order: number;
  config?: Record<string, unknown>;
  retryOnFail: boolean;
  maxRetries: number;
  timeoutMs: number;
  action?: {
    id: string;
    name: string;
    executionType: string;
  };
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
  rule?: {
    id: string;
    name: string;
  };
}

export interface CostBudget {
  id: string;
  module?: string;
  period: BudgetPeriod;
  budgetUsd: number;
  spentUsd: number;
  alertThreshold: number;
  periodStart: string;
  periodEnd: string;
  isActive: boolean;
  createdAt: string;
}

export interface TelemetryStats {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  byModel: Array<{
    model: string;
    calls: number;
    totalCostUsd: number;
    totalTokens: number;
    avgLatencyMs: number;
  }>;
  byModule: Array<{
    module: string;
    calls: number;
    totalCostUsd: number;
    totalTokens: number;
  }>;
  byProvider: Array<{
    provider: string;
    calls: number;
    totalCostUsd: number;
    totalTokens: number;
  }>;
}

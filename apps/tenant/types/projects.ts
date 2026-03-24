// Projects & PM module types

export type ProjectType = 'FIXED_SCOPE' | 'TIME_AND_MATERIAL' | 'RETAINER' | 'MILESTONE_BASED';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type BudgetType = 'FIXED' | 'HOURLY' | 'MONTHLY_RETAINER' | 'MILESTONE';
export type ProjectMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER' | 'EXTERNAL';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  description?: string;
  code?: string;
  type: ProjectType;
  status: ProjectStatus;
  color?: string;
  budgetType?: BudgetType;
  budgetAmount?: number;
  hourlyRate?: number;
  currency: string;
  hoursEstimated?: number;
  hoursLogged: number;
  costIncurred: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  contactId?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; avatar?: string };
  manager?: { id: string; name: string; avatar?: string };
  contact?: { id: string; fullName: string; email?: string };
  _count?: {
    tasks: number;
    members: number;
    milestones: number;
    timeEntries?: number;
    expenses?: number;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: ProjectMemberRole;
  hourlyRate?: number;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  parentId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  assigneeId?: string;
  blockedByIds: string[];
  blocksIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string; avatar?: string };
  createdBy?: { id: string; name: string };
  milestone?: { id: string; title: string };
  subtasks?: Task[];
  _count?: { comments: number; attachments: number; timeEntries: number };
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  createdAt: string;
  author?: { id: string; name: string; avatar?: string };
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  position: number;
  triggerInvoice: boolean;
  invoiceAmount?: number;
  invoicePercentage?: number;
  totalTasks: number;
  completedTasks: number;
  tasks?: Task[];
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  minutes: number;
  isRunning: boolean;
  isBillable: boolean;
  hourlyRate?: number;
  amount?: number;
  notes?: string;
  createdAt: string;
  project?: { id: string; name: string; code?: string };
  task?: { id: string; title: string };
  user?: { id: string; name: string; avatar?: string };
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  category: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  receipt?: string;
  isBillable: boolean;
  createdBy?: { id: string; name: string };
}

// Kanban column definition
export const TASK_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100' },
  { id: 'TODO', label: 'To Do', color: 'bg-blue-100' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-100' },
  { id: 'DONE', label: 'Done', color: 'bg-green-100' },
];

// Governance module types

export interface OKRCycle {
  id: string;
  name: string;
  description?: string;
  type: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'CUSTOM';
  status: 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'CLOSED';
  startDate: string;
  endDate: string;
  createdBy?: { id: string; name: string; avatar?: string };
  _count?: { objectives: number };
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  cycleId: string;
  parentId?: string | null;
  title: string;
  description?: string;
  level: 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'INDIVIDUAL';
  status: OKRStatus;
  privacy: 'PUBLIC' | 'TEAM' | 'PRIVATE';
  progress: number;
  ownerId: string;
  owner?: { id: string; name: string; avatar?: string };
  cycle?: { id: string; name: string; status: string };
  parent?: { id: string; title: string; level?: string };
  children?: { id: string; title: string; level: string; status: string; progress: number }[];
  keyResults?: KeyResult[];
  initiatives?: Initiative[];
  _count?: { keyResults: number; children: number; initiatives: number };
  createdAt: string;
  updatedAt: string;
}

export type OKRStatus = 'DRAFT' | 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'COMPLETED' | 'CANCELLED';

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  type: 'NUMERIC' | 'PERCENT' | 'BINARY' | 'CURRENCY';
  dataSource: 'MANUAL' | 'FINANCE' | 'SALES' | 'PROJECTS' | 'PEOPLE';
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit?: string;
  progress: number;
  status: OKRStatus;
  ownerId: string;
  owner?: { id: string; name: string; avatar?: string };
  objective?: { id: string; title: string };
  checkIns?: CheckIn[];
  _count?: { checkIns: number; initiatives: number };
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  keyResultId: string;
  value: number;
  previousValue: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
  blockers?: string;
  createdBy?: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export interface Initiative {
  id: string;
  keyResultId: string;
  objectiveId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerId: string;
  dueDate?: string;
  completedAt?: string;
  owner?: { id: string; name: string; avatar?: string };
  keyResult?: { id: string; title: string };
  objective?: { id: string; title: string };
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: 'ONE_ON_ONE' | 'TEAM' | 'ALL_HANDS' | 'BOARD' | 'COMMITTEE' | 'STANDUP';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  locationUrl?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  durationMin?: number;
  boardId?: string;
  organizerId: string;
  organizer?: { id: string; name: string; avatar?: string };
  board?: { id: string; name: string };
  attendees?: MeetingAttendee[];
  agendaItems?: AgendaItem[];
  decisions?: Decision[];
  actionItems?: ActionItem[];
  minutes?: MeetingMinutes;
  _count?: { agendaItems: number; decisions: number; actionItems: number; attendees: number };
  createdAt: string;
  updatedAt: string;
}

export interface MeetingAttendee {
  id: string;
  userId: string;
  isRequired: boolean;
  attended: boolean;
  user?: { id: string; name: string; avatar?: string; email?: string };
}

export interface AgendaItem {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  type: 'INFO' | 'DISCUSSION' | 'VOTE' | 'REPORT' | 'ACTION';
  position: number;
  durationMin?: number;
  presenterId?: string;
  notes?: string;
  presenter?: { id: string; name: string; avatar?: string };
}

export interface Decision {
  id: string;
  meetingId?: string;
  title: string;
  context?: string;
  description: string;
  type: 'OPERATIONAL' | 'STRATEGIC' | 'FINANCIAL' | 'POLICY' | 'TECHNICAL';
  outcome?: 'APPROVED' | 'REJECTED' | 'DEFERRED' | 'WITHDRAWN';
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  impact?: string;
  participants: string[];
  decidedAt: string;
  createdBy?: { id: string; name: string; avatar?: string };
  meeting?: { id: string; title: string; scheduledAt?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  meetingId?: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigneeId: string;
  dueDate?: string;
  completedAt?: string;
  assignee?: { id: string; name: string; avatar?: string };
  createdBy?: { id: string; name: string; avatar?: string };
  meeting?: { id: string; title: string };
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  content: string;
  summary?: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  type: 'BOARD' | 'COMMITTEE' | 'ADVISORY' | 'INVESTOR';
  quorumMin: number;
  isActive: boolean;
  members?: BoardMember[];
  _count?: { members: number; meetings: number };
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: 'CHAIR' | 'VICE_CHAIR' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'OBSERVER';
  joinedAt: string;
  leftAt?: string;
  user?: { id: string; name: string; avatar?: string; email?: string };
}

export interface StrategicPillar {
  id: string;
  title: string;
  description?: string;
  horizon: 'SHORT_TERM' | 'MID_TERM' | 'LONG_TERM';
  color?: string;
  position: number;
  isActive: boolean;
  ownerId: string;
  owner?: { id: string; name: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

export interface MissionStatement {
  id?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  purpose?: string;
  updatedBy?: { id: string; name: string; avatar?: string };
  createdAt?: string;
  updatedAt?: string;
}

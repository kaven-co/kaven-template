// People + HR module types

export type EmploymentType = 'CLT' | 'PJ' | 'ESTAGIO' | 'TEMPORARIO' | 'AUTONOMO' | 'SOCIO';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED' | 'PROBATION';
export type HiringJobStatus = 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED_HIRED' | 'CLOSED_CANCELLED';
export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'ASSESSMENT' | 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewStageType = 'PHONE_SCREEN' | 'TECHNICAL' | 'CULTURAL_FIT' | 'MANAGER' | 'DIRECTOR' | 'PANEL' | 'REFERENCE_CHECK' | 'CUSTOM';
export type InterviewStageStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PerformanceReviewStatus = 'DRAFT' | 'SELF_REVIEW_PENDING' | 'MANAGER_REVIEW_PENDING' | 'CALIBRATION' | 'PUBLISHED' | 'ACKNOWLEDGED';
export type PerformanceScore = 'BELOW_EXPECTATIONS' | 'NEEDS_IMPROVEMENT' | 'MEETS_EXPECTATIONS' | 'EXCEEDS_EXPECTATIONS' | 'OUTSTANDING';

export interface Employee {
  id: string;
  tenantId: string;
  userId: string;
  fullName: string;
  birthDate?: string;
  gender?: string;
  personalEmail?: string;
  phone?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  terminationDate?: string;
  jobTitle: string;
  jobLevel?: string;
  departmentId: string;
  managerId?: string;
  salary: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; name: string; code?: string };
  manager?: { id: string; fullName: string; jobTitle?: string };
  user?: { id: string; email: string; avatar?: string; name?: string };
  directReports?: { id: string; fullName: string; jobTitle: string }[];
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  parentId?: string;
  headId?: string;
  budget?: number;
  headcount: number;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string };
  children?: { id: string; name: string; code?: string }[];
  _count?: { employees: number };
}

export interface HiringJob {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  departmentId: string;
  hiringManagerId: string;
  status: HiringJobStatus;
  location?: string;
  isRemote: boolean;
  employmentType: EmploymentType;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  targetHireDate?: string;
  headcountTarget: number;
  headcountFilled: number;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  department?: { id: string; name: string };
  hiringManager?: { id: string; fullName: string };
  applications?: Application[];
  _count?: { applications: number };
}

export interface Applicant {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  source?: string;
  createdAt: string;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  tenantId: string;
  jobId: string;
  applicantId: string;
  employeeId?: string;
  status: ApplicationStatus;
  recruiterNote?: string;
  offerSalary?: number;
  offerStartDate?: string;
  rejectionReason?: string;
  appliedAt: string;
  hiredAt?: string;
  createdAt: string;
  applicant?: { id: string; fullName: string; email: string };
  job?: { id: string; title: string };
  stages?: InterviewStage[];
}

export interface InterviewStage {
  id: string;
  applicationId: string;
  type: InterviewStageType;
  title: string;
  order: number;
  status: InterviewStageStatus;
  interviewerIds: string[];
  scheduledAt?: string;
  completedAt?: string;
  duration?: number;
  feedback?: string;
  score?: number;
  recommendation?: string;
  meetingUrl?: string;
}

export interface ReviewCycle {
  id: string;
  tenantId: string;
  title: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  selfReviewDue: string;
  managerReviewDue: string;
  status: string;
  _count?: { reviews: number };
}

export interface PerformanceReview {
  id: string;
  tenantId: string;
  revieweeId: string;
  reviewerId: string;
  cycleId?: string;
  status: PerformanceReviewStatus;
  periodStart: string;
  periodEnd: string;
  reviewType: string;
  selfScore?: PerformanceScore;
  selfComments?: string;
  managerScore?: PerformanceScore;
  managerComments?: string;
  finalScore?: PerformanceScore;
  nineBoxPerformance?: number;
  nineBoxPotential?: number;
  publishedAt?: string;
  reviewee?: { id: string; fullName: string; jobTitle: string };
  reviewer?: { id: string; fullName: string };
  cycle?: { id: string; title: string };
}

export interface OneOnOne {
  id: string;
  tenantId: string;
  employeeId: string;
  managerId: string;
  scheduledAt: string;
  completedAt?: string;
  duration?: number;
  agenda?: string;
  employeeNotes?: string;
  managerNotes?: string;
  sharedNotes?: string;
  actionItems?: Record<string, unknown>[];
  isCancelled: boolean;
  cancelReason?: string;
  employee?: { id: string; fullName: string; jobTitle?: string };
  manager?: { id: string; fullName: string };
}

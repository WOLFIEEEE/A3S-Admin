export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  sheetId?: string;
  status:
    | 'planning'
    | 'active'
    | 'on_hold'
    | 'completed'
    | 'cancelled'
    | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Accessibility Specific
  wcagLevel: 'A' | 'AA' | 'AAA';
  projectType:
    | 'a3s_program'
    | 'audit'
    | 'remediation'
    | 'monitoring'
    | 'training'
    | 'consultation'
    | 'full_compliance';
  projectPlatform:
    | 'website'
    | 'mobile_app'
    | 'desktop_app'
    | 'web_app'
    | 'api'
    | 'other';
  techStack:
    | 'wordpress'
    | 'shopify'
    | 'drupal'
    | 'wix'
    | 'squarespace'
    | 'webflow'
    | 'tylertech'
    | 'other'
    | string; // Allow custom tech stacks
  complianceRequirements: string[];
  websiteUrl?: string;
  testingMethodology: string[];
  testingSchedule?: string;
  bugSeverityWorkflow?: string;

  // Timeline
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;

  // Budget & Billing
  budget?: number;
  billingType: 'fixed' | 'hourly' | 'milestone';
  hourlyRate?: number;

  // Progress Tracking
  progressPercentage: number;
  milestonesCompleted: number;
  totalMilestones: number;

  // Deliverables
  deliverables: string[];
  acceptanceCriteria: string[];

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  notes?: string;
}

export interface ProjectDeveloper {
  id: string;
  projectId: string;
  developerId: string;
  role:
    | 'project_lead'
    | 'senior_developer'
    | 'developer'
    | 'qa_engineer'
    | 'accessibility_specialist';
  responsibilities: string[];
  assignedAt: Date;
  assignedBy: string;
  isActive: boolean;
  hourlyRate?: number;
  maxHoursPerWeek?: number;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  deliverables: string[];
  acceptanceCriteria: string[];
  order: number;
  wcagCriteria?: string[];
}

export interface ProjectTimeEntry {
  id: string;
  projectId: string;
  developerId: string;
  date: Date;
  hours: number;
  description: string;
  category:
    | 'development'
    | 'testing'
    | 'review'
    | 'meeting'
    | 'documentation'
    | 'research';
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type:
    | 'audit_report'
    | 'remediation_plan'
    | 'test_results'
    | 'compliance_certificate'
    | 'meeting_notes'
    | 'vpat'
    | 'other';
  filePath: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: string;
  isLatest: boolean;
  tags: string[];
  fileSize: number;
  mimeType: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action:
    | 'created'
    | 'updated'
    | 'milestone_completed'
    | 'developer_assigned'
    | 'status_changed'
    | 'document_uploaded'
    | 'time_logged';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'mid' | 'senior' | 'lead' | 'architect';
  skills: string[];
  hourlyRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Input Types
export type CreateProjectInput = Omit<
  Project,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'progressPercentage'
  | 'milestonesCompleted'
  | 'totalMilestones'
  | 'actualHours'
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateProjectDeveloperInput = Omit<
  ProjectDeveloper,
  'id' | 'assignedAt'
>;
export type CreateProjectMilestoneInput = Omit<
  ProjectMilestone,
  'id' | 'completedDate' | 'status'
>;
export type CreateProjectTimeEntryInput = Omit<
  ProjectTimeEntry,
  'id' | 'approved' | 'approvedBy' | 'approvedAt'
>;
export type CreateProjectDocumentInput = Omit<
  ProjectDocument,
  'id' | 'uploadedAt' | 'version' | 'isLatest'
>;

// Union Types
export type ProjectStatus = Project['status'];
export type ProjectPriority = Project['priority'];
export type ProjectType = Project['projectType'];
export type WCAGLevel = Project['wcagLevel'];
export type BillingType = Project['billingType'];
export type DeveloperRole = ProjectDeveloper['role'];
export type DeveloperLevel = Developer['role'];
export type MilestoneStatus = ProjectMilestone['status'];
export type TimeEntryCategory = ProjectTimeEntry['category'];
export type DocumentType = ProjectDocument['type'];
export type ActivityAction = ProjectActivity['action'];

// Utility Types
export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalHours: number;
  totalBudget: number;
  averageProgress: number;
}

export interface ProjectMetrics {
  hoursLogged: number;
  hoursRemaining: number;
  budgetUsed: number;
  budgetRemaining: number;
  milestonesOnTrack: number;
  milestonesOverdue: number;
  teamMembers: number;
  documentsCount: number;
}

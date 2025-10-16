import { AccessibilityIssue } from './accessibility';
import { Project } from './project';

// Report types
export type ReportStatus =
  | 'draft'
  | 'generated'
  | 'edited'
  | 'sent'
  | 'archived';
export type ReportType =
  | 'executive_summary'
  | 'technical_report'
  | 'compliance_report'
  | 'monthly_progress'
  | 'custom';

// Base report interface
export interface Report {
  id: string;
  projectId: string;
  title: string;
  reportType: ReportType;
  aiGeneratedContent?: string | null;
  editedContent?: string | null;
  status: ReportStatus;
  sentAt?: Date | null;
  sentTo?: string[] | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  pdfPath?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Report with relations
export interface ReportWithRelations extends Report {
  project?: Project;
  issues?: AccessibilityIssue[];
  comments?: ReportComment[];
}

// Report issue junction
export interface ReportIssue {
  id: string;
  reportId: string;
  issueId: string;
  includedAt: Date;
}

// Report comment
export interface ReportComment {
  id: string;
  reportId: string;
  comment: string;
  commentType: string;
  authorId?: string | null;
  authorName?: string | null;
  isInternal: boolean;
  createdAt: Date;
}

// Create report input
export interface CreateReportInput {
  projectId: string;
  title: string;
  reportType: ReportType;
  issueIds: string[];
  aiGeneratedContent?: string;
  editedContent?: string;
  createdBy?: string;
}

// Update report input
export interface UpdateReportInput {
  title?: string;
  reportType?: ReportType;
  aiGeneratedContent?: string;
  editedContent?: string;
  status?: ReportStatus;
  emailSubject?: string;
  emailBody?: string;
}

// Report generation request
export interface ReportGenerationRequest {
  projectId: string;
  issueIds: string[];
  reportType: ReportType;
  customPrompt?: string;
  systemPrompt?: string;
  includeRecommendations?: boolean;
  includeTechnicalDetails?: boolean;
  includeBusinessImpact?: boolean;
}

// AI report generation response
export interface AIReportResponse {
  content: string;
  summary: string;
  recommendations: string[];
  technicalDetails?: string;
  businessImpact?: string;
  estimatedReadingTime: number;
}

// System prompt configuration for AI generation
export interface SystemPromptConfig {
  tone: 'professional' | 'friendly' | 'technical' | 'executive';
  focus:
    | 'compliance'
    | 'user_experience'
    | 'technical_details'
    | 'business_impact';
  includeRecommendations: boolean;
  includePriority: boolean;
  includeTimeline: boolean;
  customInstructions?: string;
}

// Email configuration for sending reports
export interface EmailConfig {
  recipients: string[];
  ccRecipients?: string[];
  bccRecipients?: string[];
  subject: string;
  senderName?: string;
  companyName?: string;
  customMessage?: string;
  emailBody?: string; // Editable email body with AI content
}

// Email sending request
export interface SendReportRequest {
  reportId: string;
  recipients: string[];
  subject: string;
  body: string;
  ccRecipients?: string[];
  bccRecipients?: string[];
}

// Report statistics
export interface ReportStats {
  totalReports: number;
  reportsByStatus: Record<ReportStatus, number>;
  reportsByType: Record<ReportType, number>;
  recentReports: Report[];
  monthlyReportCount: number;
}

// Report filters
export interface ReportFilters {
  projectId?: string;
  reportType?: ReportType[];
  status?: ReportStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  createdBy?: string;
  searchTerm?: string;
}

// Report template
export interface ReportTemplate {
  id: string;
  name: string;
  reportType: ReportType;
  description: string;
  promptTemplate: string;
  sections: ReportSection[];
  isDefault: boolean;
}

// Report section
export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  type:
    | 'text'
    | 'issues_list'
    | 'summary'
    | 'recommendations'
    | 'technical_details';
}

// Monthly report schedule
export interface MonthlyReportSchedule {
  id: string;
  projectId: string;
  reportType: ReportType;
  recipients: string[];
  dayOfMonth: number; // 1-31
  isActive: boolean;
  lastSent?: Date | null;
  nextScheduled: Date;
  createdAt: Date;
  updatedAt: Date;
}

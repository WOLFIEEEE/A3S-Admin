// Accessibility Issue Types and Interfaces
export interface AccessibilityIssue {
  id: string;
  projectId: string;
  urlId: string | null;
  issueTitle: string;
  issueDescription: string | null;
  issueType:
    | 'automated_tools'
    | 'screen_reader'
    | 'keyboard_navigation'
    | 'color_contrast'
    | 'text_spacing'
    | 'browser_zoom'
    | 'other';
  severity: '1_critical' | '2_high' | '3_medium' | '4_low';
  conformanceLevel: 'level_a' | 'level_aa' | 'level_aaa';
  failedWcagCriteria: string[];
  devStatus:
    | 'not_started'
    | 'in_progress'
    | 'done'
    | 'blocked'
    | '3rd_party'
    | 'wont_fix';
  qaStatus:
    | 'not_started'
    | 'in_progress'
    | 'fixed'
    | 'verified'
    | 'failed'
    | '3rd_party';
  duplicateOfId: string | null;
  issueNumber: number;
  pageUrl: string | null;
  elementScreenshot: string | null;
  recommendedFix: string | null;
  actualBehavior: string | null;
  expectedBehavior: string | null;
  browserInfo: string | null;
  deviceInfo: string | null;
  assistiveTechInfo: string | null;
  businessImpact: string | null;
  legalRisk: string | null;
  effortEstimate: string | null;
  assignedTo: string | null;
  reportedBy: string | null;
  verifiedBy: string | null;
  clientVisible: boolean;
  internalNotes: string | null;
  clientNotes: string | null;
  resolutionNotes: string | null;
  devComments: string | null;
  qaComments: string | null;
  retestingRequired: boolean;
  testingMonth: string | null;
  testingYear: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewAccessibilityIssue {
  projectId: string;
  urlId?: string | null;
  issueTitle: string;
  issueDescription?: string | null;
  issueType:
    | 'automated_tools'
    | 'screen_reader'
    | 'keyboard_navigation'
    | 'color_contrast'
    | 'text_spacing'
    | 'browser_zoom'
    | 'other';
  severity: '1_critical' | '2_high' | '3_medium' | '4_low';
  conformanceLevel: 'level_a' | 'level_aa' | 'level_aaa';
  failedWcagCriteria?: string[];
  devStatus?:
    | 'not_started'
    | 'in_progress'
    | 'done'
    | 'blocked'
    | '3rd_party'
    | 'wont_fix';
  qaStatus?:
    | 'not_started'
    | 'in_progress'
    | 'fixed'
    | 'verified'
    | 'failed'
    | '3rd_party';
  duplicateOfId?: string | null;
  pageUrl?: string | null;
  elementScreenshot?: string | null;
  recommendedFix?: string | null;
  actualBehavior?: string | null;
  expectedBehavior?: string | null;
  browserInfo?: string | null;
  deviceInfo?: string | null;
  assistiveTechInfo?: string | null;
  businessImpact?: string | null;
  legalRisk?: string | null;
  effortEstimate?: string | null;
  assignedTo?: string | null;
  reportedBy?: string | null;
  verifiedBy?: string | null;
  clientVisible?: boolean;
  internalNotes?: string | null;
  clientNotes?: string | null;
  resolutionNotes?: string | null;
  devComments?: string | null;
  qaComments?: string | null;
  retestingRequired?: boolean;
  testingMonth?: string | null;
  testingYear?: number | null;
}

export interface TestUrl {
  id: string;
  projectId: string;
  url: string;
  urlTitle: string | null;
  urlDescription: string | null;
  category:
    | 'homepage'
    | 'navigation'
    | 'content'
    | 'form'
    | 'interactive'
    | 'media'
    | 'other';
  priority: number;
  isActive: boolean;
  lastTested: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTestUrl {
  projectId: string;
  url: string;
  urlTitle?: string | null;
  urlDescription?: string | null;
  category:
    | 'homepage'
    | 'navigation'
    | 'content'
    | 'form'
    | 'interactive'
    | 'media'
    | 'other';
  priority?: number;
  isActive?: boolean;
  lastTested?: Date | null;
}

export interface IssueComment {
  id: string;
  issueId: string;
  commentText: string;
  commentType: 'general' | 'technical_note' | 'resolution';
  authorId: string;
  authorName: string;
  authorRole: 'developer' | 'accessibility_auditor' | 'project_manager';
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewIssueComment {
  issueId: string;
  commentText: string;
  commentType: 'general' | 'technical_note' | 'resolution';
  authorId: string;
  authorName: string;
  authorRole: 'developer' | 'accessibility_auditor' | 'project_manager';
  isInternal?: boolean;
}

// Extended interfaces with relations
export interface AccessibilityIssueWithRelations extends AccessibilityIssue {
  project?: {
    id: string;
    name: string;
    clientId: string;
  };
  testUrl?: TestUrl;
  comments?: IssueComment[];
  duplicateOf?: AccessibilityIssue;
  duplicates?: AccessibilityIssue[];
}

export interface IssuesFilters {
  projectId?: string;
  issueType?: string[];
  severity?: string[];
  devStatus?: string[];
  qaStatus?: string[];
  conformanceLevel?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'severity' | 'issueTitle';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IssueStats {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  byStatus: {
    notStarted: number;
    inProgress: number;
    done: number;
    blocked: number;
    thirdParty: number;
    wontFix: number;
  };
  byQaStatus: {
    notStarted: number;
    inProgress: number;
    fixed: number;
    verified: number;
    failed: number;
    thirdParty: number;
  };
}

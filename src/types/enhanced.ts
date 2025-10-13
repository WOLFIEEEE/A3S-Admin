// Enhanced types with additional computed properties
import { Client, Project, Ticket } from './index';

export interface ClientWithStats extends Client {
  projectCount: number;
  activeProjectCount: number;
}

export interface ProjectWithStats extends Project {
  client?: {
    id: string;
    name: string;
    company: string;
    email: string;
  };
  issueCount: number;
  criticalIssueCount: number;
}

export interface TicketWithProject extends Ticket {
  project?: {
    id: string;
    name: string;
    clientId: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Dashboard types
export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalTickets: number;
  totalIssues: number;
  criticalIssues: number;
  activeProjects: number;
  completedProjects: number;
  pendingTickets: number;
  resolvedTickets: number;
}

// Navigation types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

// File upload types
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  status?: string;
  type?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// User preferences
export interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

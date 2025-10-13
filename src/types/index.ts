// Re-export all types for easy importing
export * from './client';
export * from './project';
export * from './ticket';

// Form input types
export interface CreateClientInput {
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: string;
  billingAmount: number;
  billingFrequency: 'monthly' | 'quarterly' | 'yearly';
  billingStartDate: Date;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'task' | 'accessibility' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  estimatedHours?: number;
  tags?: string;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'mid' | 'senior' | 'lead';
  skills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Common utility types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  filename?: string;
  error?: string;
}

// Navigation types
export interface NavItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  shortcut?: string[];
  items?: NavItem[];
}

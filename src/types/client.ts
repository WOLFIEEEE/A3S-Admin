export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  address: string | null;

  // Client Type
  clientType: 'a3s' | 'p15r';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;

  // Business Details
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null;
  industry: string | null;
  website: string | null;
  currentAccessibilityLevel: 'none' | 'basic' | 'partial' | 'compliant' | null;
  complianceDeadline: Date | null;

  // Service Requirements
  servicesNeeded: string[] | null;
  wcagLevel: 'A' | 'AA' | 'AAA' | null;
  priorityAreas: string[] | null;
  timeline:
    | 'immediate'
    | '1-3_months'
    | '3-6_months'
    | '6-12_months'
    | 'ongoing'
    | null;

  // Communication & Preferences
  communicationPreference: 'email' | 'phone' | 'slack' | 'teams' | null;
  reportingFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | null;
  pointOfContact: string | null;
  timeZone: string | null;

  // Policy Status
  policyStatus:
    | 'none'
    | 'has_policy'
    | 'needs_review'
    | 'needs_creation'
    | 'in_progress'
    | 'completed'
    | null;
  policyNotes: string | null;

  // Documents & Policies
  hasAccessibilityPolicy: boolean | null;
  accessibilityPolicyUrl: string | null;
  requiresLegalDocumentation: boolean | null;
  complianceDocuments: string[] | null;
  existingAudits: boolean | null;
  previousAuditResults: string | null;
}

export interface ClientFile {
  id: string;
  clientId: string;
  filename: string;
  originalName: string;
  category: 'contract' | 'credential' | 'asset' | 'document';
  filePath: string;
  fileSize: number;
  mimeType: string;
  isEncrypted: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  accessLevel: 'public' | 'restricted' | 'confidential';
  metadata?: Record<string, any>;
}

export interface ClientBilling {
  id: string;
  clientId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date;
}

export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientInput = Partial<CreateClientInput>;

export type CreateClientFileInput = Omit<ClientFile, 'id' | 'uploadedAt'>;
export type ClientFileCategory = ClientFile['category'];
export type ClientStatus = Client['status'];
export type ClientBillingStatus = ClientBilling['status'];

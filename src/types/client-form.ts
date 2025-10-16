// Client form types and interfaces
export interface CreateClientInput {
  // Contact Information
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: string;

  // Business Details
  companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  industry?: string;
  website?: string;
  currentAccessibilityLevel?: 'none' | 'basic' | 'partial' | 'compliant';
  complianceDeadline?: Date;
  wcagLevel: 'A' | 'AA' | 'AAA';

  // Billing & Pricing (optional - handled automatically)
  billingAmount?: number;
  billingFrequency?:
    | 'daily'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'half-yearly'
    | 'yearly';
  billingStartDate?: Date;

  // Documents & Policies
  hasAccessibilityPolicy?: boolean;
  accessibilityPolicyUrl?: string;
  requiresLegalDocumentation?: boolean;
  complianceDocuments?: string[];
  existingAudits?: boolean;
  previousAuditResults?: string;

  // Communication & Preferences
  communicationPreference?: 'email' | 'phone' | 'slack' | 'teams';
  reportingFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  pointOfContact?: string;
  timeZone: string;
  preferredMeetingTimes?: string[];
  communicationSettings?: string[];

  // Policy Status
  policyStatus?:
    | 'none'
    | 'has_policy'
    | 'needs_review'
    | 'needs_creation'
    | 'in_progress'
    | 'completed';
  policyNotes?: string;

  // Review & Finalize
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  notes?: string;
  agreedToTerms: boolean;
}

export interface ClientFormData extends CreateClientInput {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ClientFormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isValid?: boolean;
  isComplete?: boolean;
}

export interface ClientFormState {
  currentStep: number;
  steps: ClientFormStep[];
  data: Partial<ClientFormData>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

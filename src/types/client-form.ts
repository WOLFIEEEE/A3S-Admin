// Client form types and interfaces
export interface CreateClientInput {
  clientType: 'a3s' | 'p15r';
  name: string;
  email: string;
  company: string;
  timeZone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  agreedToTerms: boolean;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  primaryContact?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  secondaryContact?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  technicalContact?: string;
  technicalContactEmail?: string;
  technicalContactPhone?: string;
  billingContact?: string;
  billingContactEmail?: string;
  billingContactPhone?: string;
  accessibilityGoals?: string;
  currentAccessibilityLevel?: string;
  targetAccessibilityLevel?: string;
  complianceRequirements?: string;
  previousAuditResults?: string;
  notes?: string;
  // Required billing fields
  billingAmount: number;
  billingFrequency: 'monthly' | 'quarterly' | 'yearly';
  billingStartDate: Date;
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

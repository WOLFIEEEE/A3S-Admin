'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconUser,
  IconBuilding,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconFileText
} from '@tabler/icons-react';
import { CreateClientInput } from '@/types/client-form';
import { Client } from '@/types/client';
import { toast } from 'sonner';

const clientFormSchema = z.object({
  // Contact Information
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),

  // Business Details
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  currentAccessibilityLevel: z
    .enum(['none', 'basic', 'partial', 'compliant'])
    .optional(),
  complianceDeadline: z.date().optional(),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),

  // Documents & Policies
  hasAccessibilityPolicy: z.boolean().optional(),
  accessibilityPolicyUrl: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  requiresLegalDocumentation: z.boolean().optional(),
  complianceDocuments: z.array(z.string()).optional(),
  existingAudits: z.boolean().optional(),
  previousAuditResults: z.string().optional(),

  // Communication & Preferences
  communicationPreference: z
    .enum(['email', 'phone', 'slack', 'teams'])
    .optional(),
  reportingFrequency: z
    .enum(['weekly', 'bi-weekly', 'monthly', 'quarterly'])
    .optional(),
  pointOfContact: z.string().optional(),
  timeZone: z.string().min(1, 'Time zone is required'),
  preferredMeetingTimes: z.array(z.string()).optional(),
  communicationSettings: z.array(z.string()).optional(),

  // Policy Status
  policyStatus: z
    .enum([
      'none',
      'has_policy',
      'needs_review',
      'needs_creation',
      'in_progress',
      'completed'
    ])
    .optional(),
  policyNotes: z.string().optional(),

  // Review & Finalize
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  notes: z.string().optional(),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions')
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const steps = [
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Primary contact details and company information',
    icon: IconUser,
    fields: ['name', 'email', 'company', 'phone', 'address'],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'business',
    title: 'Business Details',
    description: 'Company size, industry, and accessibility requirements',
    icon: IconBuilding,
    fields: [
      'companySize',
      'industry',
      'website',
      'currentAccessibilityLevel',
      'complianceDeadline',
      'wcagLevel'
    ],
    isRequired: true,
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'documents',
    title: 'Documents & Policies',
    description: 'Accessibility policies and compliance documentation',
    icon: IconFileText,
    fields: [
      'policyStatus',
      'policyNotes',
      'hasAccessibilityPolicy',
      'accessibilityPolicyUrl',
      'requiresLegalDocumentation',
      'complianceDocuments',
      'existingAudits',
      'previousAuditResults'
    ],
    isRequired: false,
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'preferences',
    title: 'Communication Preferences',
    description: 'Communication preferences and project settings',
    icon: IconMail,
    fields: [
      'communicationPreference',
      'reportingFrequency',
      'pointOfContact',
      'timeZone',
      'preferredMeetingTimes',
      'communicationSettings'
    ],
    isRequired: false,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'review',
    title: 'Review & Finalize',
    description: 'Review all information and finalize client setup',
    icon: IconCheck,
    fields: ['status', 'notes', 'agreedToTerms'],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  }
];

export default function ClientFormSimple({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>(
    {}
  );

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      // Contact Information
      name: initialData?.name || '',
      email: initialData?.email || '',
      company: initialData?.company || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',

      // Business Details
      companySize: undefined,
      industry: '',
      website: '',
      currentAccessibilityLevel: undefined,
      complianceDeadline: undefined,
      wcagLevel: 'AA',

      // Documents & Policies
      hasAccessibilityPolicy: false,
      accessibilityPolicyUrl: '',
      requiresLegalDocumentation: false,
      complianceDocuments: [],
      existingAudits: false,
      previousAuditResults: '',

      // Communication & Preferences
      communicationPreference: 'email',
      reportingFrequency: 'monthly',
      pointOfContact: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredMeetingTimes: [],
      communicationSettings: [],

      // Policy Status
      policyStatus: 'none',
      policyNotes: '',

      // Review & Finalize
      status: initialData?.status || 'pending',
      notes: initialData?.notes || '',
      agreedToTerms: false
    }
  });

  const handleSubmit = async (data: ClientFormValues) => {
    try {
      setIsSubmitting(true);
      // Add default billing values since they're removed from the form
      const submitData = {
        ...data,
        billingAmount: 0,
        billingFrequency: 'monthly' as const,
        billingStartDate: new Date()
      };
      await onSubmit(submitData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = async (stepIndex: number) => {
    const stepFields = steps[stepIndex].fields;
    const isValid = await form.trigger(stepFields as any);

    setStepValidation((prev) => ({
      ...prev,
      [stepIndex]: isValid
    }));

    if (isValid) {
      setCompletedSteps((prev) => new Set([...Array.from(prev), stepIndex]));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(stepIndex);
        return newSet;
      });
    }

    return isValid;
  };

  const goToStep = async (stepIndex: number) => {
    // Allow going to any step, but validate current step first if moving forward
    if (stepIndex > currentStep) {
      const currentStepValid = await validateStep(currentStep);
      if (!currentStepValid && steps[currentStep].isRequired) {
        toast.error(
          `Please complete all required fields in "${steps[currentStep].title}" before proceeding.`
        );
        return;
      }
    }

    setCurrentStep(stepIndex);
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      await goToStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
    }
  };

  const handleNext = async () => {
    await nextStep();
  };

  // Calculate progress based on current step
  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    switch (currentStepData.id) {
      case 'contact':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-foreground text-lg font-semibold'>
                Contact Information
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Provide primary contact details and company information. This
                will be used for all communications, contracts, and billing.
                Please ensure accuracy.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john@company.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='company'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corporation' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='+1 (555) 123-4567' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='123 Main Street, Suite 100, City, State 12345'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'business':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-foreground text-lg font-semibold'>
                Business Details
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Tell us about your company size, industry, and accessibility
                requirements.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <FormField
                control={form.control}
                name='companySize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select company size' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1-10'>1-10 employees</SelectItem>
                        <SelectItem value='11-50'>11-50 employees</SelectItem>
                        <SelectItem value='51-200'>51-200 employees</SelectItem>
                        <SelectItem value='201-1000'>
                          201-1000 employees
                        </SelectItem>
                        <SelectItem value='1000+'>1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='industry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Healthcare, Education, Finance'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://www.company.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='currentAccessibilityLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Accessibility Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select current level' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>
                          No accessibility measures
                        </SelectItem>
                        <SelectItem value='basic'>
                          Basic accessibility
                        </SelectItem>
                        <SelectItem value='partial'>
                          Partial compliance
                        </SelectItem>
                        <SelectItem value='compliant'>
                          Fully compliant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='wcagLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target WCAG Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select WCAG level' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='A'>WCAG 2.2 Level A</SelectItem>
                        <SelectItem value='AA'>WCAG 2.2 Level AA</SelectItem>
                        <SelectItem value='AAA'>WCAG 2.2 Level AAA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-foreground text-lg font-semibold'>
                Documents & Policies
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Information about existing accessibility policies and compliance
                documentation.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6'>
              <FormField
                control={form.control}
                name='policyStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessibility Policy Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select policy status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>No policy exists</SelectItem>
                        <SelectItem value='has_policy'>
                          Has existing policy
                        </SelectItem>
                        <SelectItem value='needs_review'>
                          Policy needs review
                        </SelectItem>
                        <SelectItem value='needs_creation'>
                          Need to create policy
                        </SelectItem>
                        <SelectItem value='in_progress'>
                          Policy in progress
                        </SelectItem>
                        <SelectItem value='completed'>
                          Policy completed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='hasAccessibilityPolicy'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Has Accessibility Policy Document</FormLabel>
                        <FormDescription>
                          Check if your organization has a formal accessibility
                          policy document.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='accessibilityPolicyUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessibility Policy URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://www.company.com/accessibility-policy'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to your public accessibility policy (if available)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='requiresLegalDocumentation'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Requires Legal Documentation</FormLabel>
                        <FormDescription>
                          Check if you need formal legal compliance
                          documentation.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='existingAudits'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Has Previous Accessibility Audits</FormLabel>
                        <FormDescription>
                          Check if you have conducted accessibility audits
                          before.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='previousAuditResults'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Audit Results</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe any previous accessibility audit results or findings...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about previous accessibility assessments
                      (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='policyNotes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Additional notes about accessibility policies or requirements...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-foreground text-lg font-semibold'>
                Communication Preferences
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Set your preferred communication methods and project settings.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <FormField
                control={form.control}
                name='communicationPreference'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Communication Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select communication method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='email'>Email</SelectItem>
                        <SelectItem value='phone'>Phone</SelectItem>
                        <SelectItem value='slack'>Slack</SelectItem>
                        <SelectItem value='teams'>Microsoft Teams</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How would you prefer to receive project communications?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='reportingFrequency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress Report Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select reporting frequency' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='weekly'>Weekly</SelectItem>
                        <SelectItem value='bi-weekly'>Bi-weekly</SelectItem>
                        <SelectItem value='monthly'>Monthly</SelectItem>
                        <SelectItem value='quarterly'>Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often would you like to receive progress reports?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='pointOfContact'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Point of Contact</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter primary contact name'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Who should we contact for project updates and decisions?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='timeZone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your timezone' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[200px]'>
                        <SelectItem value='America/New_York'>
                          Eastern Time (ET) - New York
                        </SelectItem>
                        <SelectItem value='America/Chicago'>
                          Central Time (CT) - Chicago
                        </SelectItem>
                        <SelectItem value='America/Denver'>
                          Mountain Time (MT) - Denver
                        </SelectItem>
                        <SelectItem value='America/Los_Angeles'>
                          Pacific Time (PT) - Los Angeles
                        </SelectItem>
                        <SelectItem value='America/Phoenix'>
                          Arizona Time (MST) - Phoenix
                        </SelectItem>
                        <SelectItem value='America/Anchorage'>
                          Alaska Time (AKST) - Anchorage
                        </SelectItem>
                        <SelectItem value='Pacific/Honolulu'>
                          Hawaii Time (HST) - Honolulu
                        </SelectItem>
                        <SelectItem value='Europe/London'>
                          Greenwich Mean Time (GMT) - London
                        </SelectItem>
                        <SelectItem value='Europe/Paris'>
                          Central European Time (CET) - Paris
                        </SelectItem>
                        <SelectItem value='Europe/Berlin'>
                          Central European Time (CET) - Berlin
                        </SelectItem>
                        <SelectItem value='Asia/Tokyo'>
                          Japan Standard Time (JST) - Tokyo
                        </SelectItem>
                        <SelectItem value='Asia/Shanghai'>
                          China Standard Time (CST) - Shanghai
                        </SelectItem>
                        <SelectItem value='Asia/Kolkata'>
                          India Standard Time (IST) - Mumbai
                        </SelectItem>
                        <SelectItem value='Australia/Sydney'>
                          Australian Eastern Time (AEST) - Sydney
                        </SelectItem>
                        <SelectItem value='Australia/Melbourne'>
                          Australian Eastern Time (AEST) - Melbourne
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your local time zone for scheduling meetings and calls
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='preferredMeetingTimes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Meeting Times</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='e.g., Weekdays 9 AM - 5 PM, Tuesday/Thursday afternoons preferred'
                        className='min-h-[80px]'
                        value={field.value?.join('\n') || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split('\n').filter(Boolean)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      When are you typically available for meetings and calls?
                      (Optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='communicationSettings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Preferences & Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='e.g., Prefer email for non-urgent matters, phone for urgent issues, CC manager on important updates'
                        className='min-h-[100px]'
                        value={field.value?.join('\n') || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split('\n').filter(Boolean)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Any specific communication preferences or requirements?
                      (Optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-foreground text-lg font-semibold'>
                Review & Finalize
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Review your information and finalize the client setup.
              </p>
            </div>

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='pending'>Pending</SelectItem>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                        <SelectItem value='suspended'>Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Any additional notes or special requirements...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='agreedToTerms'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>
                        I agree to the terms and conditions *
                      </FormLabel>
                      <FormDescription>
                        You must agree to our terms of service to proceed.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Modern Progress Header */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20'>
        <div className='bg-grid-pattern absolute inset-0 opacity-5'></div>
        <div className='relative p-8'>
          {/* Header */}
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
                {initialData ? 'Edit Client' : 'New Client Setup'}
              </h1>
              <p className='text-muted-foreground mt-2'>
                Complete the setup process to get started
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-right'>
                <div className='text-muted-foreground text-sm font-medium'>
                  Progress
                </div>
                <div className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
                  {Math.round(progress)}%
                </div>
              </div>
              <div className='relative h-16 w-16'>
                <svg
                  className='h-16 w-16 -rotate-90 transform'
                  viewBox='0 0 64 64'
                >
                  <circle
                    cx='32'
                    cy='32'
                    r='28'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                    className='text-gray-200 dark:text-gray-700'
                  />
                  <circle
                    cx='32'
                    cy='32'
                    r='28'
                    stroke='url(#gradient)'
                    strokeWidth='4'
                    fill='none'
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className='transition-all duration-500 ease-out'
                    strokeLinecap='round'
                  />
                  <defs>
                    <linearGradient
                      id='gradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='0%'
                    >
                      <stop offset='0%' stopColor='#3b82f6' />
                      <stop offset='100%' stopColor='#8b5cf6' />
                    </linearGradient>
                  </defs>
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-muted-foreground text-xs font-semibold'>
                    {currentStep + 1}/{steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Step Navigation */}
          <div className='relative'>
            <div className='flex items-center justify-between'>
              {steps.map((step, _index) => {
                const Icon = step.icon;
                const isActive = _index === currentStep;
                const isCompleted = completedSteps.has(_index);
                const hasError = stepValidation[_index] === false;

                return (
                  <div key={step.id} className='flex flex-1 items-center'>
                    <div className='flex flex-col items-center space-y-3'>
                      {/* Step Circle */}
                      <button
                        type='button'
                        onClick={() => goToStep(_index)}
                        className={`group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                          isActive
                            ? 'scale-110 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                            : isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                              : hasError
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                                : 'border-2 border-gray-200 bg-white text-gray-400 hover:scale-105 hover:border-blue-300 hover:text-blue-500 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        {isCompleted ? (
                          <IconCheck className='h-6 w-6' />
                        ) : (
                          <Icon className='h-6 w-6' />
                        )}

                        {/* Pulse animation for active step */}
                        {isActive && (
                          <div className='absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75'></div>
                        )}
                      </button>

                      {/* Step Info */}
                      <div className='max-w-[120px] min-w-0 text-center'>
                        <div
                          className={`text-sm font-semibold transition-colors ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : hasError
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className='text-muted-foreground mt-1 text-xs'>
                          {step.estimatedTime}
                        </div>
                        {step.isRequired && (
                          <div className='mt-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400'>
                            Required
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connection Line */}
                    {_index < steps.length - 1 && (
                      <div className='relative mx-4 h-0.5 flex-1 bg-gray-200 dark:bg-gray-700'>
                        <div
                          className={`absolute inset-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
                            isCompleted ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Description */}
          <div className='mt-8 text-center'>
            <div className='inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80'>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500'></div>
                <span className='text-muted-foreground text-sm font-medium'>
                  {steps[currentStep].description}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <Card className='flex-1'>
        <CardContent className='p-8'>
          <Form
            form={form}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className='flex items-center justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={currentStep === 0 ? onCancel : prevStep}
                disabled={isSubmitting}
              >
                <IconChevronLeft className='mr-2 h-4 w-4' />
                {currentStep === 0 ? 'Cancel' : 'Previous'}
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type='submit'
                  disabled={isSubmitting || isLoading}
                  className='min-w-[120px]'
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className='border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
                      {initialData ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <IconCheck className='mr-2 h-4 w-4' />
                      {initialData ? 'Update Client' : 'Create Client'}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                  <IconChevronRight className='ml-2 h-4 w-4' />
                </Button>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconUser,
  IconBuilding,
  IconCurrencyDollar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconAccessible,
  IconMail,
  IconKey,
  IconFileText,
  IconShield,
  IconLock,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import { CreateClientInput } from '@/types/client-form';
import { Client } from '@/types/client';
import { toast } from 'sonner';

const clientFormSchema = z.object({
  // Client Type (First Step)
  clientType: z.enum(['a3s', 'p15r']),

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

  // Billing & Pricing
  billingAmount: z.number().min(0, 'Billing amount must be positive'),
  billingFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
  billingStartDate: z.date(),

  // Service Requirements
  servicesNeeded: z.array(z.string()).optional(),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional(),
  priorityAreas: z.array(z.string()).optional(),
  timeline: z
    .enum(['immediate', '1-3_months', '3-6_months', '6-12_months', 'ongoing'])
    .optional(),

  // Credentials & Access
  websiteCredentials: z
    .object({
      adminUrl: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      notes: z.string().optional()
    })
    .optional(),
  ftpCredentials: z
    .object({
      host: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      port: z.string().optional()
    })
    .optional(),
  apiCredentials: z
    .object({
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      endpoint: z.string().optional()
    })
    .optional(),

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
    fields: ['clientType', 'name', 'email', 'company', 'phone', 'address'],
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
      'complianceDeadline'
    ],
    isRequired: true,
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'services',
    title: 'Service Requirements',
    description: 'Accessibility services and compliance needs',
    icon: IconAccessible,
    fields: ['servicesNeeded', 'wcagLevel', 'priorityAreas', 'timeline'],
    isRequired: true,
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'credentials',
    title: 'Credentials & Access',
    description: 'Website, FTP, and API access credentials (encrypted storage)',
    icon: IconKey,
    fields: ['websiteCredentials', 'ftpCredentials', 'apiCredentials'],
    isRequired: false,
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'documents',
    title: 'Documents & Policies',
    description:
      'Accessibility policies, compliance documents, and audit history',
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
    estimatedTime: '2-4 minutes'
  },
  {
    id: 'preferences',
    title: 'Communication & Preferences',
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
    estimatedTime: '1-2 minutes'
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

export default function ClientFormEnhanced({
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
      // Client Type
      clientType: initialData?.clientType || 'a3s',

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

      // Service Requirements
      servicesNeeded: [],
      wcagLevel: 'AA',
      priorityAreas: [],
      timeline: undefined,

      // Credentials & Access
      websiteCredentials: {
        adminUrl: '',
        username: '',
        password: '',
        notes: ''
      },
      ftpCredentials: {
        host: '',
        username: '',
        password: '',
        port: ''
      },
      apiCredentials: {
        apiKey: '',
        apiSecret: '',
        endpoint: ''
      },

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
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
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
    // Skip Service Requirements step for A3S clients
    if (steps[stepIndex]?.id === 'services' && clientType === 'a3s') {
      if (stepIndex > currentStep) {
        // Skip to next step
        await goToStep(stepIndex + 1);
      } else {
        // Skip to previous step
        await goToStep(stepIndex - 1);
      }
      return;
    }

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
      let nextStepIndex = currentStep + 1;

      // Skip Service Requirements step for A3S clients
      if (steps[nextStepIndex]?.id === 'services' && clientType === 'a3s') {
        nextStepIndex = nextStepIndex + 1;
      }

      await goToStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      let prevStepIndex = currentStep - 1;

      // Skip Service Requirements step for A3S clients
      if (steps[prevStepIndex]?.id === 'services' && clientType === 'a3s') {
        prevStepIndex = prevStepIndex - 1;
      }

      setCurrentStep(prevStepIndex);
    }
  };

  const handleNext = async () => {
    await nextStep();
  };

  // Watch clientType changes to update progress calculation
  const clientType = form.watch('clientType');

  // Calculate progress excluding Service Requirements step for A3S clients
  const getEffectiveSteps = () => {
    if (clientType === 'a3s') {
      return steps.filter((step) => step.id !== 'services');
    }
    return steps;
  };

  const effectiveSteps = getEffectiveSteps();
  const progress = ((currentStep + 1) / effectiveSteps.length) * 100;

  return (
    <div className='w-full space-y-6'>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <CardTitle>
                {initialData ? 'Edit Client' : 'Create New Client'}
              </CardTitle>
              <CardDescription>
                {initialData
                  ? 'Update client information and billing details.'
                  : 'Add a new client to the A3S platform with comprehensive details.'}
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='text-muted-foreground flex justify-between text-sm'>
              <span>
                Step {currentStep + 1} of {effectiveSteps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Step Navigation */}
          <div className='mt-6 flex items-center justify-between overflow-x-auto pb-4'>
            {steps.map((step, index) => {
              // Skip Service Requirements step for A3S clients
              if (step.id === 'services' && clientType === 'a3s') {
                return null;
              }

              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const hasError = stepValidation[index] === false;
              const isClickable = true; // Allow clicking any step

              return (
                <div key={step.id} className='flex min-w-0 items-center'>
                  <div className='flex flex-col items-center'>
                    <button
                      type='button'
                      onClick={() => goToStep(index)}
                      disabled={isLoading || isSubmitting}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                          : hasError
                            ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                            : isActive
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : isClickable
                                ? 'cursor-pointer border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500'
                                : 'cursor-not-allowed border-gray-200 text-gray-300'
                      } ${isClickable ? 'hover:scale-105' : ''}`}
                      title={`${step.title} - ${step.estimatedTime}`}
                    >
                      {isCompleted ? (
                        <IconCheck className='h-5 w-5' />
                      ) : hasError ? (
                        <span className='text-sm font-bold'>!</span>
                      ) : (
                        <Icon className='h-5 w-5' />
                      )}
                    </button>
                    <div className='mt-2 text-center'>
                      <div
                        className={`text-xs font-medium ${
                          isActive
                            ? 'text-blue-600'
                            : isCompleted
                              ? 'text-green-600'
                              : hasError
                                ? 'text-red-600'
                                : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className='mt-1 text-xs text-gray-400'>
                        {step.estimatedTime}
                      </div>
                      {step.isRequired && (
                        <div className='mt-1 text-xs text-red-500'>
                          Required
                        </div>
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-8 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Info */}
          <div className='mt-4 text-center'>
            <h3 className='text-lg font-semibold'>
              {steps[currentStep].title}
            </h3>
            <p className='text-muted-foreground text-sm'>
              {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card className='flex-1'>
        <CardContent className='p-8'>
          <Form form={form} onSubmit={handleSubmit} className='space-y-8'>
            {/* Step 1: Contact Information */}
            {currentStep === 0 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                    Primary Contact Information
                  </h4>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    This information will be used for all official
                    communications, contracts, and billing. Please ensure
                    accuracy.
                  </p>
                </div>

                {/* Client Type Selection */}
                <div className='max-w-md'>
                  <FormField
                    control={form.control}
                    name='clientType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select client type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='a3s'>
                              <div className='flex items-center gap-2'>
                                <IconShield className='h-4 w-4' />
                                <span>A3S Client</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='p15r'>
                              <div className='flex items-center gap-2'>
                                <IconAccessible className='h-4 w-4' />
                                <span>P15R Client</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          A3S clients receive comprehensive accessibility
                          services. P15R clients focus on specific compliance
                          requirements.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder='John Doe' {...field} />
                        </FormControl>
                        <FormDescription>
                          Full name of the main point of contact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='john@company.com'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Primary email for all A3S communications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='company'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization Name *</FormLabel>
                        <FormControl>
                          <Input placeholder='Acme Corporation' {...field} />
                        </FormControl>
                        <FormDescription>
                          Legal business name as it appears on contracts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder='+1 (555) 123-4567' {...field} />
                        </FormControl>
                        <FormDescription>
                          Direct line for urgent accessibility matters
                        </FormDescription>
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
                          placeholder='123 Main Street&#10;Suite 100&#10;City, State 12345&#10;Country'
                          className='resize-none'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Complete mailing address for contracts, legal documents,
                        and billing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 1 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    Business & Industry Information
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Help us understand your business context to provide tailored
                    accessibility solutions and compliance strategies.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='companySize'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select company size' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='1-10'>1-10 employees</SelectItem>
                            <SelectItem value='11-50'>
                              11-50 employees
                            </SelectItem>
                            <SelectItem value='51-200'>
                              51-200 employees
                            </SelectItem>
                            <SelectItem value='201-1000'>
                              201-1000 employees
                            </SelectItem>
                            <SelectItem value='1000+'>
                              1000+ employees
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Helps determine compliance scope and resource
                          allocation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='industry'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry/Sector</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Government, Healthcare, Education, E-commerce'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Industry-specific compliance requirements may apply
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='website'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Website URL</FormLabel>
                        <FormControl>
                          <Input
                            type='url'
                            placeholder='https://www.company.com'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Main website that will undergo accessibility
                          assessment
                        </FormDescription>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select current level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='none'>
                              No accessibility measures in place
                            </SelectItem>
                            <SelectItem value='basic'>
                              Basic accessibility features implemented
                            </SelectItem>
                            <SelectItem value='partial'>
                              Partial WCAG compliance achieved
                            </SelectItem>
                            <SelectItem value='compliant'>
                              Fully WCAG 2.2 AA compliant
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current state of accessibility implementation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='complianceDeadline'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Deadline (if applicable)</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Legal or regulatory deadline for accessibility
                        compliance (leave blank if none)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Service Requirements */}
            {currentStep === 2 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                    Accessibility Service Requirements
                  </h4>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Define the specific accessibility services and compliance
                    requirements for this client.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='wcagLevel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WCAG Compliance Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select WCAG level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='A'>
                              WCAG 2.2 Level A - Basic accessibility
                            </SelectItem>
                            <SelectItem value='AA'>
                              WCAG 2.2 Level AA - Standard compliance
                              (Recommended)
                            </SelectItem>
                            <SelectItem value='AAA'>
                              WCAG 2.2 Level AAA - Enhanced accessibility
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Level AA is the legal standard for most jurisdictions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='timeline'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Timeline</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select timeline' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='immediate'>
                              Immediate - ASAP
                            </SelectItem>
                            <SelectItem value='1-3_months'>
                              1-3 months
                            </SelectItem>
                            <SelectItem value='3-6_months'>
                              3-6 months
                            </SelectItem>
                            <SelectItem value='6-12_months'>
                              6-12 months
                            </SelectItem>
                            <SelectItem value='ongoing'>
                              Ongoing maintenance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Expected timeline for achieving compliance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-4'>
                  <FormLabel>Services Needed (Select all that apply)</FormLabel>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {[
                      'Website Accessibility Audit',
                      'WCAG 2.2 AA Compliance',
                      'Accessibility Remediation',
                      'User Testing with Disabilities',
                      'Legal Documentation',
                      'Ongoing Monitoring',
                      'Staff Training',
                      'Design System Accessibility'
                    ].map((service) => (
                      <div
                        key={service}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={service}
                          checked={form
                            .watch('servicesNeeded')
                            ?.includes(service)}
                          onCheckedChange={(checked) => {
                            const current =
                              form.getValues('servicesNeeded') || [];
                            if (checked) {
                              form.setValue('servicesNeeded', [
                                ...current,
                                service
                              ]);
                            } else {
                              form.setValue(
                                'servicesNeeded',
                                current.filter((s) => s !== service)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={service}
                          className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='space-y-4'>
                  <FormLabel>Priority Areas (Select focus areas)</FormLabel>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {[
                      'Navigation & Menus',
                      'Forms & Input Fields',
                      'Images & Media',
                      'Color & Contrast',
                      'Keyboard Navigation',
                      'Screen Reader Compatibility',
                      'Mobile Accessibility',
                      'PDF Accessibility'
                    ].map((area) => (
                      <div key={area} className='flex items-center space-x-2'>
                        <Checkbox
                          id={area}
                          checked={form.watch('priorityAreas')?.includes(area)}
                          onCheckedChange={(checked) => {
                            const current =
                              form.getValues('priorityAreas') || [];
                            if (checked) {
                              form.setValue('priorityAreas', [
                                ...current,
                                area
                              ]);
                            } else {
                              form.setValue(
                                'priorityAreas',
                                current.filter((a) => a !== area)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={area}
                          className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {area}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Credentials & Access */}
            {currentStep === 3 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
                  <div className='mb-2 flex items-center gap-2'>
                    <IconLock className='h-4 w-4 text-red-600' />
                    <h4 className='font-medium text-red-900 dark:text-red-100'>
                      Secure Credential Storage
                    </h4>
                  </div>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    All credentials are encrypted using AES-256 encryption and
                    stored securely. Only authorized A3S team members can access
                    this information for accessibility testing purposes.
                  </p>
                </div>

                {/* Website Credentials */}
                <div className='space-y-4'>
                  <h3 className='flex items-center gap-2 text-lg font-medium'>
                    <IconUser className='h-5 w-5' />
                    Website Admin Access
                  </h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='websiteCredentials.adminUrl'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin/Login URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='https://yoursite.com/wp-admin'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL to access website admin panel
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='websiteCredentials.username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder='admin_username' {...field} />
                          </FormControl>
                          <FormDescription>
                            Admin username for website access
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='websiteCredentials.password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Admin password (will be encrypted)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='websiteCredentials.notes'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Special login instructions, 2FA details, or other access notes...'
                            className='resize-none'
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* FTP Credentials */}
                <div className='space-y-4 border-t pt-6'>
                  <h3 className='flex items-center gap-2 text-lg font-medium'>
                    <IconKey className='h-5 w-5' />
                    FTP/SFTP Access (Optional)
                  </h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='ftpCredentials.host'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder='ftp.yoursite.com' {...field} />
                          </FormControl>
                          <FormDescription>
                            FTP server hostname or IP address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='ftpCredentials.port'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='21 (FTP) or 22 (SFTP)'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            FTP port number (usually 21 or 22)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='ftpCredentials.username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FTP Username</FormLabel>
                          <FormControl>
                            <Input placeholder='ftp_user' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='ftpCredentials.password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FTP Password</FormLabel>
                          <FormControl>
                            <Input
                              type='password'
                              placeholder='••••••••'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            FTP password (will be encrypted)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* API Credentials */}
                <div className='space-y-4 border-t pt-6'>
                  <h3 className='flex items-center gap-2 text-lg font-medium'>
                    <IconShield className='h-5 w-5' />
                    API Access (Optional)
                  </h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='apiCredentials.endpoint'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='https://api.yoursite.com/v1'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Base URL for API access
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='apiCredentials.apiKey'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input
                              type='password'
                              placeholder='••••••••••••••••'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            API key (will be encrypted)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='apiCredentials.apiSecret'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='••••••••••••••••'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          API secret key (will be encrypted)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Documents & Policies */}
            {currentStep === 4 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    Accessibility Documentation & Policies
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Help us understand your current accessibility documentation
                    and policy requirements for comprehensive compliance.
                  </p>
                </div>

                {/* Policy Status Assessment */}
                <div className='space-y-6'>
                  <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950'>
                    <h5 className='mb-2 font-medium text-orange-900 dark:text-orange-100'>
                      Policy Status Assessment
                    </h5>
                    <p className='text-sm text-orange-700 dark:text-orange-300'>
                      Based on your client type, let us know about your current
                      accessibility policy status and requirements.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='policyStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Policy Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select policy status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='none'>
                              No accessibility policy
                            </SelectItem>
                            <SelectItem value='has_policy'>
                              Has existing policy
                            </SelectItem>
                            <SelectItem value='needs_review'>
                              Policy needs review
                            </SelectItem>
                            <SelectItem value='needs_creation'>
                              Needs policy creation
                            </SelectItem>
                            <SelectItem value='in_progress'>
                              Policy in progress
                            </SelectItem>
                            <SelectItem value='completed'>
                              Policy completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the current status of your accessibility policy
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
                            placeholder='Additional notes about your accessibility policy requirements...'
                            className='min-h-[100px]'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any specific requirements or notes about your
                          accessibility policy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accessibility Policy */}
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='hasAccessibilityPolicy'
                      checked={form.watch('hasAccessibilityPolicy')}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          'hasAccessibilityPolicy',
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor='hasAccessibilityPolicy'
                      className='text-sm leading-none font-medium'
                    >
                      We have an existing accessibility policy
                    </label>
                  </div>

                  {form.watch('hasAccessibilityPolicy') && (
                    <FormField
                      control={form.control}
                      name='accessibilityPolicyUrl'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accessibility Policy URL</FormLabel>
                          <FormControl>
                            <Input
                              type='url'
                              placeholder='https://yoursite.com/accessibility-policy'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Link to your current accessibility policy page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Legal Documentation */}
                <div className='space-y-4 border-t pt-6'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='requiresLegalDocumentation'
                      checked={form.watch('requiresLegalDocumentation')}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          'requiresLegalDocumentation',
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor='requiresLegalDocumentation'
                      className='text-sm leading-none font-medium'
                    >
                      Legal compliance documentation required
                    </label>
                  </div>

                  {form.watch('requiresLegalDocumentation') && (
                    <div className='space-y-4'>
                      <FormLabel>
                        Required Compliance Documents (Select all that apply)
                      </FormLabel>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {[
                          'VPAT (Voluntary Product Accessibility Template)',
                          'Section 508 Compliance Report',
                          'ADA Compliance Certificate',
                          'WCAG 2.2 AA Conformance Report',
                          'Accessibility Testing Report',
                          'Legal Evidence Package',
                          'Remediation Plan Document',
                          'Ongoing Monitoring Report'
                        ].map((doc) => (
                          <div
                            key={doc}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={doc}
                              checked={form
                                .watch('complianceDocuments')
                                ?.includes(doc)}
                              onCheckedChange={(checked) => {
                                const current =
                                  form.getValues('complianceDocuments') || [];
                                if (checked) {
                                  form.setValue('complianceDocuments', [
                                    ...current,
                                    doc
                                  ]);
                                } else {
                                  form.setValue(
                                    'complianceDocuments',
                                    current.filter((d) => d !== doc)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={doc}
                              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {doc}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Previous Audits */}
                <div className='space-y-4 border-t pt-6'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='existingAudits'
                      checked={form.watch('existingAudits')}
                      onCheckedChange={(checked) =>
                        form.setValue('existingAudits', checked as boolean)
                      }
                    />
                    <label
                      htmlFor='existingAudits'
                      className='text-sm leading-none font-medium'
                    >
                      Previous accessibility audits have been conducted
                    </label>
                  </div>

                  {form.watch('existingAudits') && (
                    <FormField
                      control={form.control}
                      name='previousAuditResults'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Audit Results</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Please describe previous accessibility audits, findings, remediation efforts, and current status...'
                              className='resize-none'
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Details about previous accessibility assessments and
                            their outcomes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Communication & Preferences */}
            {currentStep === 5 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950'>
                  <h4 className='mb-2 font-medium text-indigo-900 dark:text-indigo-100'>
                    Communication & Project Preferences
                  </h4>
                  <p className='text-sm text-indigo-700 dark:text-indigo-300'>
                    Set up communication preferences and project management
                    settings for optimal collaboration.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='communicationPreference'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Communication Method *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select communication method' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='email'>
                              Email - Standard business communication
                            </SelectItem>
                            <SelectItem value='phone'>
                              Phone - Direct calls for urgent matters
                            </SelectItem>
                            <SelectItem value='slack'>
                              Slack - Real-time team collaboration
                            </SelectItem>
                            <SelectItem value='teams'>
                              Microsoft Teams - Video calls and chat
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Preferred method for project updates and communication
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
                        <FormLabel>Progress Reporting Frequency *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select reporting frequency' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='weekly'>
                              Weekly - Detailed progress updates
                            </SelectItem>
                            <SelectItem value='bi-weekly'>
                              Bi-weekly - Regular milestone reports
                            </SelectItem>
                            <SelectItem value='monthly'>
                              Monthly - Comprehensive monthly reports
                            </SelectItem>
                            <SelectItem value='quarterly'>
                              Quarterly - High-level quarterly reviews
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often you&apos;d like to receive project progress
                          reports
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='pointOfContact'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Point of Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Jane Smith (jane@company.com)'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Alternative contact person for project coordination
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select your time zone' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                            <SelectItem value='America/Anchorage'>
                              Alaska Time (AKT) - Anchorage
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
                              India Standard Time (IST) - Mumbai/Delhi
                            </SelectItem>
                            <SelectItem value='Australia/Sydney'>
                              Australian Eastern Time (AET) - Sydney
                            </SelectItem>
                            <SelectItem value='Australia/Melbourne'>
                              Australian Eastern Time (AET) - Melbourne
                            </SelectItem>
                            <SelectItem value='America/Toronto'>
                              Eastern Time (ET) - Toronto
                            </SelectItem>
                            <SelectItem value='America/Vancouver'>
                              Pacific Time (PT) - Vancouver
                            </SelectItem>
                            <SelectItem value='America/Mexico_City'>
                              Central Time (CT) - Mexico City
                            </SelectItem>
                            <SelectItem value='America/Sao_Paulo'>
                              Brasilia Time (BRT) - São Paulo
                            </SelectItem>
                            <SelectItem value='Africa/Cairo'>
                              Eastern European Time (EET) - Cairo
                            </SelectItem>
                            <SelectItem value='Africa/Johannesburg'>
                              South Africa Standard Time (SAST) - Johannesburg
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

                {/* Meeting Preferences */}
                <div className='space-y-4 border-t pt-6'>
                  <h3 className='text-lg font-medium'>
                    Meeting & Collaboration Preferences
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-4'>
                      <FormLabel>
                        Preferred Meeting Times (Select all that apply)
                      </FormLabel>
                      {[
                        'Morning (9 AM - 12 PM)',
                        'Afternoon (12 PM - 5 PM)',
                        'Evening (5 PM - 8 PM)',
                        'Flexible - Any time'
                      ].map((time) => (
                        <div key={time} className='flex items-center space-x-2'>
                          <Checkbox
                            id={time}
                            checked={form
                              .watch('preferredMeetingTimes')
                              ?.includes(time)}
                            onCheckedChange={(checked) => {
                              const current =
                                form.getValues('preferredMeetingTimes') || [];
                              if (checked) {
                                form.setValue('preferredMeetingTimes', [
                                  ...current,
                                  time
                                ]);
                              } else {
                                form.setValue(
                                  'preferredMeetingTimes',
                                  current.filter((t) => t !== time)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={time}
                            className='text-sm leading-none font-medium'
                          >
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className='space-y-4'>
                      <FormLabel>Communication Preferences</FormLabel>
                      {[
                        'Send calendar invites for all meetings',
                        'Include detailed agendas with meeting requests',
                        'Provide meeting recordings when possible',
                        'Send follow-up summaries after meetings'
                      ].map((pref) => (
                        <div key={pref} className='flex items-center space-x-2'>
                          <Checkbox
                            id={pref}
                            checked={form
                              .watch('communicationSettings')
                              ?.includes(pref)}
                            onCheckedChange={(checked) => {
                              const current =
                                form.getValues('communicationSettings') || [];
                              if (checked) {
                                form.setValue('communicationSettings', [
                                  ...current,
                                  pref
                                ]);
                              } else {
                                form.setValue(
                                  'communicationSettings',
                                  current.filter((p) => p !== pref)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={pref}
                            className='text-sm leading-none font-medium'
                          >
                            {pref}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Document Upload & Review */}
            {currentStep === 6 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950'>
                  <h4 className='mb-2 font-medium text-orange-900 dark:text-orange-100'>
                    Document Upload & Final Review
                  </h4>
                  <p className='text-sm text-orange-700 dark:text-orange-300'>
                    Upload important client documents and review all information
                    before finalizing the client setup.
                  </p>
                </div>

                {/* Document Upload Section */}
                <div className='space-y-6'>
                  <h3 className='flex items-center gap-2 text-lg font-medium'>
                    <IconFileText className='h-5 w-5' />
                    Client Document Upload
                  </h3>

                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Contract Documents */}
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Contract & Legal Documents
                      </h4>
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400 dark:border-gray-600'>
                        <IconFileText className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          Upload contracts, agreements, or legal documents
                        </p>
                        <input
                          type='file'
                          multiple
                          accept='.pdf,.doc,.docx'
                          className='hidden'
                          id='contract-upload'
                          onChange={(e) => {
                            // Handle file upload logic here
                            console.log('Contract files:', e.target.files);
                          }}
                        />
                        <label
                          htmlFor='contract-upload'
                          className='inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                        >
                          Choose Files
                        </label>
                        <p className='mt-2 text-xs text-gray-500'>
                          PDF, DOC, DOCX up to 10MB each
                        </p>
                      </div>
                    </div>

                    {/* Existing Accessibility Documents */}
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Accessibility Documents
                      </h4>
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-green-400 dark:border-gray-600'>
                        <IconShield className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          Upload existing accessibility audits, policies, or
                          reports
                        </p>
                        <input
                          type='file'
                          multiple
                          accept='.pdf,.doc,.docx'
                          className='hidden'
                          id='accessibility-upload'
                          onChange={(e) => {
                            // Handle file upload logic here
                            console.log('Accessibility files:', e.target.files);
                          }}
                        />
                        <label
                          htmlFor='accessibility-upload'
                          className='inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none'
                        >
                          Choose Files
                        </label>
                        <p className='mt-2 text-xs text-gray-500'>
                          PDF, DOC, DOCX up to 10MB each
                        </p>
                      </div>
                    </div>

                    {/* Brand Assets */}
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Brand Assets & Guidelines
                      </h4>
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-400 dark:border-gray-600'>
                        <IconBuilding className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          Upload brand guidelines, logos, or style guides
                        </p>
                        <input
                          type='file'
                          multiple
                          accept='.pdf,.doc,.docx,.png,.jpg,.jpeg,.svg'
                          className='hidden'
                          id='brand-upload'
                          onChange={(e) => {
                            // Handle file upload logic here
                            console.log('Brand files:', e.target.files);
                          }}
                        />
                        <label
                          htmlFor='brand-upload'
                          className='inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none'
                        >
                          Choose Files
                        </label>
                        <p className='mt-2 text-xs text-gray-500'>
                          PDF, DOC, PNG, JPG, SVG up to 10MB each
                        </p>
                      </div>
                    </div>

                    {/* Other Documents */}
                    <div className='space-y-4'>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Other Documents
                      </h4>
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400 dark:border-gray-600'>
                        <IconKey className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          Upload any other relevant client documents
                        </p>
                        <input
                          type='file'
                          multiple
                          accept='*'
                          className='hidden'
                          id='other-upload'
                          onChange={(e) => {
                            // Handle file upload logic here
                            console.log('Other files:', e.target.files);
                          }}
                        />
                        <label
                          htmlFor='other-upload'
                          className='inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none'
                        >
                          Choose Files
                        </label>
                        <p className='mt-2 text-xs text-gray-500'>
                          Any file type up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Review Section */}
                <div className='space-y-6 border-t pt-6'>
                  <h3 className='text-lg font-medium'>
                    Final Review & Settings
                  </h3>

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select client status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='pending'>
                              Pending - Awaiting setup completion
                            </SelectItem>
                            <SelectItem value='active'>
                              Active - Ready for projects
                            </SelectItem>
                            <SelectItem value='inactive'>
                              Inactive - Temporarily paused
                            </SelectItem>
                            <SelectItem value='suspended'>
                              Suspended - Account issues
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current status of the client account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='notes'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Additional Notes & Special Requirements
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Special requirements, accessibility goals, compliance deadlines, team preferences, or any other important information about this client...'
                            className='resize-none'
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information, special requirements, or
                          notes about this client&apos;s accessibility
                          compliance needs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms Agreement */}
                  <div className='rounded-lg bg-gray-50 p-6 dark:bg-gray-900'>
                    <div className='mb-4 flex items-center space-x-2'>
                      <Checkbox
                        id='agreedToTerms'
                        checked={form.watch('agreedToTerms')}
                        onCheckedChange={(checked) =>
                          form.setValue('agreedToTerms', checked as boolean)
                        }
                        required
                      />
                      <label
                        htmlFor='agreedToTerms'
                        className='text-sm leading-none font-medium'
                      >
                        I agree to the A3S Terms of Service and Privacy Policy *
                      </label>
                    </div>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      By checking this box, you confirm that you have read and
                      agree to our terms of service, privacy policy, and consent
                      to the secure storage of credentials and documents for
                      accessibility compliance purposes.
                    </p>
                  </div>

                  {/* Client Summary */}
                  <div className='rounded-lg bg-blue-50 p-6 dark:bg-blue-900'>
                    <h4 className='mb-4 text-lg font-medium'>
                      Client Setup Summary
                    </h4>
                    <div className='grid grid-cols-1 gap-6 text-sm lg:grid-cols-2'>
                      <div>
                        <span className='text-muted-foreground'>Client:</span>
                        <span className='ml-2 font-medium'>
                          {form.watch('name') || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Company:</span>
                        <span className='ml-2 font-medium'>
                          {form.watch('company') || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Email:</span>
                        <span className='ml-2 font-medium'>
                          {form.watch('email') || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          WCAG Level:
                        </span>
                        <span className='ml-2 font-medium'>
                          {form.watch('wcagLevel') || 'AA (Default)'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Communication:
                        </span>
                        <span className='ml-2 font-medium'>
                          {form.watch('communicationPreference') || 'Email'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Time Zone:
                        </span>
                        <span className='ml-2 font-medium'>
                          {form.watch('timeZone') || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Services:</span>
                        <span className='ml-2 font-medium'>
                          {form.watch('servicesNeeded')?.length || 0} selected
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Status:</span>
                        <span className='ml-2 font-medium capitalize'>
                          {form.watch('status') || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between border-t pt-6'>
              <div>
                {currentStep > 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={prevStep}
                    disabled={isSubmitting || isLoading}
                    className='flex items-center gap-2'
                  >
                    <IconChevronLeft className='h-4 w-4' />
                    Previous
                  </Button>
                )}
              </div>

              <div className='flex items-center gap-4'>
                {onCancel && (
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={onCancel}
                    disabled={isSubmitting || isLoading}
                  >
                    Cancel
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type='button'
                    onClick={handleNext}
                    disabled={isSubmitting || isLoading}
                    className='flex items-center gap-2'
                  >
                    Next
                    <IconChevronRight className='h-4 w-4' />
                  </Button>
                ) : (
                  <Button
                    type='submit'
                    disabled={isSubmitting || isLoading}
                    className='flex min-w-[120px] items-center gap-2'
                  >
                    {isSubmitting ? (
                      'Creating...'
                    ) : (
                      <>
                        <IconCheck className='h-4 w-4' />
                        {initialData ? 'Update Client' : 'Create Client'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

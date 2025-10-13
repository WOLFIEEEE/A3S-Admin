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
import {
  IconUser,
  IconBuilding,
  IconCurrencyDollar,
  IconFileText,
  IconCheck,
  IconChevronRight,
  IconChevronLeft
} from '@tabler/icons-react';
import { CreateClientInput, Client } from '@/types';
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

  // Billing & Pricing
  pricingTier: z
    .enum(['basic', 'professional', 'enterprise', 'custom'])
    .optional(),
  billingAmount: z.number().min(0, 'Billing amount must be positive'),
  billingStartDate: z.date(),
  billingFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
  paymentMethod: z.enum(['credit_card', 'ach', 'wire', 'check']).optional(),

  // Service Requirements
  servicesNeeded: z.array(z.string()).optional(),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional(),
  priorityAreas: z.array(z.string()).optional(),
  timeline: z
    .enum(['immediate', '1-3_months', '3-6_months', '6-12_months', 'ongoing'])
    .optional(),

  // Communication & Preferences
  communicationPreference: z
    .enum(['email', 'phone', 'slack', 'teams'])
    .optional(),
  reportingFrequency: z
    .enum(['weekly', 'bi-weekly', 'monthly', 'quarterly'])
    .optional(),
  pointOfContact: z.string().optional(),
  timeZone: z.string().optional(),

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
      'complianceDeadline'
    ],
    isRequired: true,
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'billing',
    title: 'Billing & Pricing',
    description: 'Payment terms, billing schedule, and pricing tier',
    icon: IconCurrencyDollar,
    fields: [
      'pricingTier',
      'billingAmount',
      'billingFrequency',
      'billingStartDate',
      'paymentMethod'
    ],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'services',
    title: 'Service Requirements',
    description: 'Accessibility services and compliance needs',
    icon: IconFileText,
    fields: ['servicesNeeded', 'wcagLevel', 'priorityAreas', 'timeline'],
    isRequired: true,
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'preferences',
    title: 'Communication & Preferences',
    description: 'Communication preferences and project settings',
    icon: IconCheck,
    fields: [
      'communicationPreference',
      'reportingFrequency',
      'pointOfContact',
      'timeZone'
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

export default function ClientForm({
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

      // Billing & Pricing
      pricingTier: undefined,
      billingAmount: 0,
      billingStartDate: new Date(),
      billingFrequency: 'monthly',
      paymentMethod: undefined,

      // Service Requirements
      servicesNeeded: [],
      wcagLevel: 'AA',
      priorityAreas: [],
      timeline: undefined,

      // Communication & Preferences
      communicationPreference: 'email',
      reportingFrequency: 'monthly',
      pointOfContact: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

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
      toast.success(
        initialData
          ? 'Client updated successfully'
          : 'Client created successfully'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
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
      await goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    await nextStep();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

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
                  : 'Add a new client to the A3S platform.'}
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='text-muted-foreground flex justify-between text-sm'>
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Step Navigation */}
          <div className='mt-6 flex items-center justify-between'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const hasError = stepValidation[index] === false;
              const isClickable = true; // Allow clicking any step

              return (
                <div key={step.id} className='flex items-center'>
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
          <Form form={form} onSubmit={handleSubmit}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
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
                          Complete mailing address for contracts, legal
                          documents, and billing
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
                      Help us understand your business context to provide
                      tailored accessibility solutions and compliance
                      strategies.
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
                              <SelectItem value='1-10'>
                                1-10 employees
                              </SelectItem>
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
                        <FormLabel>
                          Compliance Deadline (if applicable)
                        </FormLabel>
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

              {/* Step 3: Additional Details */}
              {currentStep === 2 && (
                <div className='space-y-8'>
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
                              <SelectValue placeholder='Select status' />
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
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Special requirements, accessibility goals, compliance deadlines, or any other important information about this client...'
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

                  {/* Summary */}
                  <div className='rounded-lg bg-gray-50 p-6 dark:bg-gray-900'>
                    <h4 className='mb-4 text-lg font-medium'>Client Summary</h4>
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
                        <span className='text-muted-foreground'>Billing:</span>
                        <span className='ml-2 font-medium'>
                          ${form.watch('billingAmount') || 0}{' '}
                          {form.watch('billingFrequency') || 'monthly'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>

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
        </CardContent>
      </Card>
    </div>
  );
}

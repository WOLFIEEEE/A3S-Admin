'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreateProjectInput, Client } from '@/types';
import { toast } from 'sonner';
import {
  IconBuilding,
  IconTarget,
  IconLoader2,
  IconFileText,
  IconKey,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFolder,
  IconSettings
} from '@tabler/icons-react';
import URLCalculator from '@/components/url-calculator';
import A3SBillingAssessment from '@/components/a3s-billing-assessment';

const projectFormSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  sheetId: z.string().optional(),
  projectType: z
    .enum([
      'a3s_program',
      'audit',
      'remediation',
      'monitoring',
      'training',
      'consultation',
      'full_compliance'
    ])
    .optional(),
  projectPlatform: z
    .enum(['website', 'mobile_app', 'desktop_app', 'web_app', 'api', 'other'])
    .optional(),
  techStack: z
    .enum([
      'wordpress',
      'react',
      'vue',
      'angular',
      'nextjs',
      'nuxt',
      'laravel',
      'django',
      'rails',
      'nodejs',
      'express',
      'fastapi',
      'spring',
      'aspnet',
      'flutter',
      'react_native',
      'ionic',
      'xamarin',
      'electron',
      'tauri',
      'wails',
      'android_native',
      'ios_native',
      'unity',
      'unreal',
      'other'
    ])
    .optional(),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  billingType: z.enum(['fixed', 'hourly', 'milestone']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().optional(),
  budget: z.number().optional(),
  hourlyRate: z.number().optional(),
  complianceRequirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  websiteUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  testingMethodology: z.array(z.string()).optional(),
  testingSchedule: z.string().optional(),
  bugSeverityWorkflow: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormEnhancedProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  initialData?: CreateProjectInput | null;
  isLoading?: boolean;
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project name, client, and basic details',
    icon: IconFolder,
    isRequired: true
  },
  {
    id: 'details',
    title: 'Project Details',
    description: 'Description, timeline, and accessibility requirements',
    icon: IconTarget,
    isRequired: true
  },
  {
    id: 'assessment',
    title: 'Site Assessment',
    description: 'URL analysis and page count calculation',
    icon: IconTarget,
    isRequired: true
  },
  {
    id: 'billing',
    title: 'Billing & Pricing',
    description: 'A3S plans and pricing assessment',
    icon: IconSettings,
    isRequired: true
  },
  {
    id: 'settings',
    title: 'Project Settings',
    description: 'Status, priority, and configuration options',
    icon: IconSettings,
    isRequired: true
  },
  {
    id: 'documents',
    title: 'Initial Documents',
    description: 'Upload project-related documents',
    icon: IconFileText,
    isRequired: false
  },
  {
    id: 'credentials',
    title: 'Staging Credentials',
    description: 'Configure staging site access',
    icon: IconKey,
    isRequired: false
  }
];

const projectTypeLabels: Record<string, string> = {
  a3s_program: 'A3S Program',
  audit: 'Accessibility Audit',
  remediation: 'Remediation',
  monitoring: 'Continuous Monitoring',
  training: 'Training & Education',
  consultation: 'Consultation'
};

const projectPlatformLabels: Record<string, string> = {
  website: 'Website',
  mobile_app: 'Mobile App',
  desktop_app: 'Desktop App',
  web_app: 'Web Application',
  api: 'API',
  other: 'Other'
};

const techStackLabels: Record<string, string> = {
  wordpress: 'WordPress',
  react: 'React',
  vue: 'Vue.js',
  angular: 'Angular',
  nextjs: 'Next.js',
  nuxt: 'Nuxt.js',
  laravel: 'Laravel',
  django: 'Django',
  rails: 'Ruby on Rails',
  nodejs: 'Node.js',
  express: 'Express.js',
  fastapi: 'FastAPI',
  spring: 'Spring Boot',
  aspnet: 'ASP.NET',
  flutter: 'Flutter',
  react_native: 'React Native',
  ionic: 'Ionic',
  xamarin: 'Xamarin',
  electron: 'Electron',
  tauri: 'Tauri',
  wails: 'Wails',
  android_native: 'Android Native',
  ios_native: 'iOS Native',
  unity: 'Unity',
  unreal: 'Unreal Engine',
  other: 'Other'
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function ProjectFormEnhanced({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}: ProjectFormEnhancedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps] = useState<Set<number>>(new Set());
  const [stepValidation] = useState<Record<number, boolean>>({});
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedBillingPlan, setSelectedBillingPlan] = useState<any>(null);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [siteAnalysis, setSiteAnalysis] = useState<any>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: initialData?.clientId || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      sheetId: initialData?.sheetId || '',
      projectType: initialData?.projectType || undefined,
      projectPlatform: initialData?.projectPlatform || undefined,
      techStack: initialData?.techStack || undefined,
      wcagLevel: initialData?.wcagLevel || undefined,
      priority: initialData?.priority || undefined,
      billingType: initialData?.billingType || undefined,
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
      estimatedHours: initialData?.estimatedHours || undefined,
      budget: initialData?.budget || undefined,
      hourlyRate: initialData?.hourlyRate || undefined,
      complianceRequirements: initialData?.complianceRequirements || [],
      deliverables: initialData?.deliverables || [],
      acceptanceCriteria: initialData?.acceptanceCriteria || [],
      tags: initialData?.tags || [],
      notes: initialData?.notes || '',
      websiteUrl: initialData?.websiteUrl || '',
      testingMethodology: initialData?.testingMethodology || [],
      testingSchedule: initialData?.testingSchedule || '',
      bugSeverityWorkflow: initialData?.bugSeverityWorkflow || ''
    }
  });

  const selectedClient = Array.isArray(clients)
    ? clients.find((client) => client.id === form.watch('clientId'))
    : undefined;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const result = await response.json();
        if (result.success) {
          // Handle the paginated response structure
          const clientsData = result.data?.clients || result.data || [];
          setClients(clientsData);
        } else {
          throw new Error(result.error || 'Failed to fetch clients');
        }
      } catch (error) {
        // Error fetching clients
        toast.error('Failed to load clients');
      }
    };

    fetchClients();
  }, []);

  // Step validation function
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const step = steps[stepIndex];
    if (!step) return true;

    try {
      // Validate specific fields for each step
      const formData = form.getValues();

      switch (stepIndex) {
        case 0: // Basic Information
          return !!(formData.clientId && formData.name);
        case 1: // Project Details
          return !!(formData.description && formData.projectType);
        case 2: // Site Assessment
          return pageCount > 0;
        case 3: // Billing & Pricing
          return !!(selectedBillingPlan && monthlyTotal > 0);
        case 4: // Project Settings
          return !!(formData.priority && formData.billingType);
        case 5: // Documents (optional)
        case 6: // Credentials (optional)
          return true;
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  };

  // Step navigation functions
  const goToStep = async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

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

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert form data to API format
      const projectData: CreateProjectInput = {
        clientId: data.clientId,
        name: data.name,
        description: data.description || undefined,
        sheetId: data.sheetId || undefined,
        status: 'planning', // Default status for new projects
        priority: data.priority || 'medium',
        wcagLevel: data.wcagLevel || 'AA',
        projectType: data.projectType || 'a3s_program',
        projectPlatform: data.projectPlatform || 'website',
        techStack: data.techStack || 'other',
        complianceRequirements: data.complianceRequirements || [],
        websiteUrl: data.websiteUrl || undefined,
        testingMethodology: data.testingMethodology || [],
        testingSchedule: data.testingSchedule || undefined,
        bugSeverityWorkflow: data.bugSeverityWorkflow || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        estimatedHours: data.estimatedHours || undefined,
        budget: data.budget || undefined,
        billingType: data.billingType || 'fixed',
        hourlyRate: data.hourlyRate || undefined,
        deliverables: data.deliverables || [],
        acceptanceCriteria: data.acceptanceCriteria || [],
        tags: data.tags || [],
        notes: data.notes || undefined,
        createdBy: 'current-user', // This should be set by the API
        lastModifiedBy: 'current-user' // This should be set by the API
      };

      await onSubmit(projectData);
    } catch (error) {
      // Error submitting form
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className='w-full space-y-6'>
      {/* Progress Header */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            <div className='text-muted-foreground flex items-center justify-between text-sm'>
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Step Navigation */}
          <div className='mt-6'>
            {/* Mobile Step Navigation */}
            <div className='block md:hidden'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      currentStep >= 0
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-gray-100 text-gray-500'
                    }`}
                  >
                    {React.createElement(steps[currentStep].icon, {
                      className: 'h-4 w-4'
                    })}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                      {steps[currentStep].title}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>

                {/* Mobile Step Navigation Dots */}
                <div className='flex items-center space-x-1'>
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`h-2 w-2 rounded-full transition-all duration-200 ${
                        index === currentStep
                          ? 'w-4 bg-blue-500'
                          : completedSteps.has(index)
                            ? 'bg-green-400'
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Step Navigation */}
            <div className='hidden md:block'>
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4'>
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = completedSteps.has(index);
                  const hasError = stepValidation[index] === false;
                  const isClickable = true;

                  return (
                    <div
                      key={step.id}
                      className={`relative flex cursor-pointer flex-col items-center rounded-lg border p-2 transition-all duration-200 md:p-3 ${
                        isActive
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                          : isCompleted
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                            : hasError
                              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                      } ${isClickable ? 'hover:shadow-sm' : 'cursor-not-allowed opacity-50'}`}
                      onClick={() => isClickable && goToStep(index)}
                    >
                      {/* Step Number/Icon */}
                      <div
                        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : isCompleted
                              ? 'border-green-500 bg-green-500 text-white'
                              : hasError
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <IconCheck className='h-4 w-4' />
                        ) : (
                          <StepIcon className='h-4 w-4' />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className='text-center'>
                        <p
                          className={`mb-1 text-xs font-medium md:text-sm ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : hasError
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`hidden text-xs leading-tight lg:block ${
                            isActive
                              ? 'text-blue-500 dark:text-blue-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>

                      {/* Active Step Indicator */}
                      {isActive && (
                        <div className='absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 transform rounded-full bg-blue-500'></div>
                      )}

                      {/* Connection Line (except for last step) */}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-6 -right-2 h-0.5 w-4 ${
                            isCompleted || (isActive && index < currentStep)
                              ? 'bg-green-300 dark:bg-green-700'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
              {React.createElement(steps[currentStep].icon, {
                className: 'h-4 w-4 text-blue-600 dark:text-blue-400'
              })}
            </div>
            <div>
              <h3 className='text-lg font-semibold'>
                {steps[currentStep].title}
              </h3>
              <p className='text-muted-foreground text-sm'>
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form
            form={form}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                    Basic Project Information
                  </h4>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Select the client and provide basic project details
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='clientId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a client' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(clients) &&
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  <div className='flex flex-col'>
                                    <span className='font-medium'>
                                      {client.company}
                                    </span>
                                    <span className='text-muted-foreground text-xs'>
                                      {client.name} • {client.email}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., Website Accessibility Audit 2024'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedClient && (
                  <div className='flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                    <IconBuilding className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                      Client: {selectedClient.company} ({selectedClient.name})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    Project Details & Requirements
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Provide detailed project information and accessibility
                    requirements
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Comprehensive accessibility audit and remediation for company website to achieve WCAG 2.2 AA compliance...'
                          className='min-h-[80px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the project scope and
                        objectives.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='websiteUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormDescription>
                        Primary website URL for this project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='testingSchedule'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testing Schedule</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Before 21st of each month'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify when testing should be performed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bugSeverityWorkflow'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bug Severity Workflow</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Blocker>High>Medium>Low'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the priority order for fixing bugs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split('T')[0]
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
                          When should this project begin?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target End Date</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toISOString()
                                    .split('T')[0]
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
                          Target completion date for the project.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='complianceRequirements'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Requirements</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          {field.value?.map((requirement, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Input
                                value={requirement}
                                onChange={(e) => {
                                  const newRequirements = [
                                    ...(field.value || [])
                                  ];
                                  newRequirements[index] = e.target.value;
                                  field.onChange(newRequirements);
                                }}
                                placeholder='e.g., WCAG 2.2 Level AA compliance'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const newRequirements =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newRequirements);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              field.onChange([...(field.value || []), '']);
                            }}
                          >
                            Add Requirement
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Specify the compliance standards and requirements for
                        this project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='deliverables'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Deliverables</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          {field.value?.map((deliverable, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Input
                                value={deliverable}
                                onChange={(e) => {
                                  const newDeliverables = [
                                    ...(field.value || [])
                                  ];
                                  newDeliverables[index] = e.target.value;
                                  field.onChange(newDeliverables);
                                }}
                                placeholder='e.g., Accessibility audit report'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const newDeliverables =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newDeliverables);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              field.onChange([...(field.value || []), '']);
                            }}
                          >
                            Add Deliverable
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        List the expected deliverables for this project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='testingMethodology'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testing Methodology</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          {field.value?.map((method, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Input
                                value={method}
                                onChange={(e) => {
                                  const newMethods = [...(field.value || [])];
                                  newMethods[index] = e.target.value;
                                  field.onChange(newMethods);
                                }}
                                placeholder='e.g., Screen reader testing using NVDA'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const newMethods =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newMethods);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              field.onChange([...(field.value || []), '']);
                            }}
                          >
                            Add Testing Method
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        List the accessibility testing methods that will be
                        performed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='projectType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a project type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(projectTypeLabels).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='projectPlatform'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a platform' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(projectPlatformLabels).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='techStack'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tech Stack *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a tech stack' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(techStackLabels).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
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
                        <FormLabel>WCAG Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select WCAG level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='A'>WCAG 2.2 Level A</SelectItem>
                            <SelectItem value='AA'>
                              WCAG 2.2 Level AA
                            </SelectItem>
                            <SelectItem value='AAA'>
                              WCAG 2.2 Level AAA
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Site Assessment */}
            {currentStep === 2 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950'>
                  <h4 className='mb-2 font-medium text-purple-900 dark:text-purple-100'>
                    Website Analysis & Page Count
                  </h4>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    Analyze the website structure to determine the number of
                    pages that need accessibility testing
                  </p>
                </div>

                <URLCalculator
                  initialUrl={form.watch('websiteUrl') || ''}
                  onPagesCalculated={(count, analysis) => {
                    setPageCount(count);
                    setSiteAnalysis(analysis);
                    toast.success(`Analysis complete: ${count} pages found`);
                  }}
                />
              </div>
            )}

            {/* Step 3: Billing & Pricing */}
            {currentStep === 3 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    A3S Billing Assessment
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Select the appropriate A3S plan based on your website&apos;s
                    page count and requirements
                  </p>
                </div>

                {siteAnalysis && (
                  <Card className='mb-6'>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Site Analysis Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                        <div className='rounded-lg bg-blue-50 p-3 text-center'>
                          <div className='text-xl font-bold text-blue-600'>
                            {siteAnalysis.totalPages}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Total Pages
                          </div>
                        </div>
                        <div className='rounded-lg bg-green-50 p-3 text-center'>
                          <div className='text-xl font-bold text-green-600'>
                            {siteAnalysis.technologies.cms || 'Unknown'}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            CMS Detected
                          </div>
                        </div>
                        <div className='rounded-lg bg-orange-50 p-3 text-center'>
                          <div
                            className={`text-xl font-bold ${
                              siteAnalysis.compliance.wcagLevel === 'AAA'
                                ? 'text-green-600'
                                : siteAnalysis.compliance.wcagLevel === 'AA'
                                  ? 'text-blue-600'
                                  : siteAnalysis.compliance.wcagLevel === 'A'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                            }`}
                          >
                            {siteAnalysis.compliance.wcagLevel}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Current WCAG
                          </div>
                        </div>
                        <div className='rounded-lg bg-red-50 p-3 text-center'>
                          <div className='text-xl font-bold text-red-600'>
                            {siteAnalysis.compliance.issuesFound.critical +
                              siteAnalysis.compliance.issuesFound.major}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            Critical + Major Issues
                          </div>
                        </div>
                      </div>

                      {siteAnalysis.compliance.estimatedFixTime > 0 && (
                        <div className='mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
                          <div className='text-sm font-medium text-yellow-800'>
                            Estimated remediation time:{' '}
                            {Math.round(
                              siteAnalysis.compliance.estimatedFixTime
                            )}{' '}
                            hours
                          </div>
                          <div className='mt-1 text-xs text-yellow-600'>
                            Based on detected accessibility issues and site
                            complexity
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <A3SBillingAssessment
                  pageCount={pageCount}
                  projectType={form.watch('projectType')}
                  clientType={selectedClient?.clientType}
                  onPlanSelected={(plan, total) => {
                    setSelectedBillingPlan(plan);
                    setMonthlyTotal(total);
                    form.setValue('budget', total);
                    form.setValue('billingType', 'fixed');
                    toast.success(
                      `Selected ${plan.name} plan - $${total}/month`
                    );
                  }}
                />
              </div>
            )}

            {/* Step 4: Project Settings */}
            {currentStep === 4 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950'>
                  <h4 className='mb-2 font-medium text-purple-900 dark:text-purple-100'>
                    Project Settings & Configuration
                  </h4>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    Configure project status, priority, and other settings
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='priority'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select priority level' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='low'>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className={priorityColors.low}
                                >
                                  Low
                                </Badge>
                                <span>Non-urgent, flexible timeline</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='medium'>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className={priorityColors.medium}
                                >
                                  Medium
                                </Badge>
                                <span>Standard priority</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='high'>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className={priorityColors.high}
                                >
                                  High
                                </Badge>
                                <span>Important, expedited timeline</span>
                              </div>
                            </SelectItem>
                            <SelectItem value='urgent'>
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className={priorityColors.urgent}
                                >
                                  Urgent
                                </Badge>
                                <span>Critical, immediate attention</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='billingType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select billing type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='fixed'>Fixed Price</SelectItem>
                            <SelectItem value='hourly'>Hourly Rate</SelectItem>
                            <SelectItem value='milestone'>
                              Milestone-based
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='estimatedHours'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='e.g., 40'
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated total hours for project completion.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='hourlyRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='e.g., 150'
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Hourly rate for time-based billing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='acceptanceCriteria'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptance Criteria</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          {field.value?.map((criteria, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Input
                                value={criteria}
                                onChange={(e) => {
                                  const newCriteria = [...(field.value || [])];
                                  newCriteria[index] = e.target.value;
                                  field.onChange(newCriteria);
                                }}
                                placeholder='e.g., All pages pass WCAG 2.2 AA validation'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const newCriteria =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newCriteria);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              field.onChange([...(field.value || []), '']);
                            }}
                          >
                            Add Criteria
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Define the criteria that must be met for project
                        completion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Tags</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          {field.value?.map((tag, index) => (
                            <div
                              key={index}
                              className='flex items-center space-x-2'
                            >
                              <Input
                                value={tag}
                                onChange={(e) => {
                                  const newTags = [...(field.value || [])];
                                  newTags[index] = e.target.value;
                                  field.onChange(newTags);
                                }}
                                placeholder='e.g., government, e-commerce, mobile'
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const newTags =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newTags);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              field.onChange([...(field.value || []), '']);
                            }}
                          >
                            Add Tag
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add tags to categorize and organize this project.
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
                          placeholder='Any additional notes, special requirements, or important information about this project...'
                          className='min-h-[100px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any additional information that might be
                        relevant for this project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 5: Initial Documents */}
            {currentStep === 5 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950'>
                  <h4 className='mb-2 font-medium text-orange-900 dark:text-orange-100'>
                    Initial Project Documents
                  </h4>
                  <p className='text-sm text-orange-700 dark:text-orange-300'>
                    Upload any initial documents related to this project
                  </p>
                </div>

                <div className='py-8 text-center'>
                  <IconFileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>
                    Document Management
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Documents can be uploaded and managed after project creation
                    through the project detail view.
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Go to the project&apos;s &quot;Documents&quot; tab to upload
                    files, manage versions, and organize project resources.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Staging Credentials */}
            {currentStep === 6 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
                  <h4 className='mb-2 font-medium text-red-900 dark:text-red-100'>
                    Staging Site Credentials
                  </h4>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    Configure staging site access credentials for this project
                  </p>
                </div>

                <div className='py-8 text-center'>
                  <IconKey className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>
                    Credential Management
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Staging credentials can be configured after project creation
                    through the project detail view.
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Go to the project&apos;s &quot;Credentials&quot; tab to set
                    up staging site access, manage API keys, and configure
                    deployment settings.
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className='flex items-center justify-between border-t pt-6'>
              <div className='flex items-center gap-2'>
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

              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                >
                  Cancel
                </Button>

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
                    className='flex items-center gap-2'
                  >
                    {isSubmitting || isLoading ? (
                      <IconLoader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <IconCheck className='h-4 w-4' />
                    )}
                    Create Project
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

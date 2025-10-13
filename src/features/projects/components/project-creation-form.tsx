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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  IconUser,
  IconBuilding,
  IconCurrencyDollar,
  IconFileText,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconAccessible,
  IconCalendar,
  IconClock,
  IconTarget,
  IconShield,
  IconUsers
} from '@tabler/icons-react';
import {
  CreateProjectInput,
  ProjectType,
  WCAGLevel,
  BillingType,
  ProjectPriority
} from '@/types/project';
import { Client } from '@/types/client';
import { toast } from 'sonner';

const projectFormSchema = z.object({
  // Basic Information
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  projectType: z.enum([
    'a3s_program',
    'audit',
    'remediation',
    'monitoring',
    'training',
    'consultation',
    'full_compliance'
  ]),
  projectPlatform: z.enum([
    'website',
    'mobile_app',
    'desktop_app',
    'web_app',
    'api',
    'other'
  ]),
  techStack: z.enum([
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
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  wcagLevel: z.enum(['A', 'AA', 'AAA']),

  // Timeline
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().min(0, 'Hours must be positive').optional(),

  // Budget & Billing
  budget: z.number().min(0, 'Budget must be positive').optional(),
  billingType: z.enum(['fixed', 'hourly', 'milestone']),
  hourlyRate: z.number().min(0, 'Rate must be positive').optional(),

  // Compliance & Requirements
  complianceRequirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),

  // Metadata
  tags: z.array(z.string()).optional(),
  sheetId: z.string().optional(),
  notes: z.string().optional(),
  websiteUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  testingSchedule: z.string().optional(),
  bugSeverityWorkflow: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectCreationFormProps {
  client: Client;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateProjectInput>;
  isLoading?: boolean;
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project details and accessibility requirements',
    icon: IconFileText,
    fields: ['name', 'description', 'projectType', 'priority', 'wcagLevel'],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'timeline',
    title: 'Timeline & Scope',
    description: 'Project timeline and estimated effort',
    icon: IconCalendar,
    fields: ['startDate', 'endDate', 'estimatedHours'],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'budget',
    title: 'Budget & Billing',
    description: 'Project budget and billing configuration',
    icon: IconCurrencyDollar,
    fields: ['budget', 'billingType', 'hourlyRate'],
    isRequired: true,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'requirements',
    title: 'Requirements & Deliverables',
    description: 'Compliance requirements and project deliverables',
    icon: IconTarget,
    fields: ['complianceRequirements', 'deliverables', 'acceptanceCriteria'],
    isRequired: false,
    estimatedTime: '3-5 minutes'
  },
  {
    id: 'finalize',
    title: 'Finalize Project',
    description: 'Review and finalize project setup',
    icon: IconCheck,
    fields: ['tags', 'sheetId', 'notes'],
    isRequired: false,
    estimatedTime: '1-2 minutes'
  }
];

const projectTypeLabels = {
  a3s_program: 'A3S Program',
  audit: 'Accessibility Audit',
  remediation: 'Remediation & Fixes',
  monitoring: 'Ongoing Monitoring',
  training: 'Training & Education',
  consultation: 'Consultation Services',
  full_compliance: 'Full Compliance Package'
};

const complianceOptions = [
  'WCAG 2.2 Level A Compliance',
  'WCAG 2.2 Level AA Compliance',
  'WCAG 2.2 Level AAA Compliance',
  'Section 508 Compliance',
  'ADA Title III Compliance',
  'EN 301 549 Compliance',
  'AODA Compliance (Ontario)',
  'Color Contrast Requirements',
  'Keyboard Navigation Support',
  'Screen Reader Compatibility',
  'Mobile Accessibility',
  'PDF Accessibility',
  'Video Captioning & Audio Descriptions',
  'Form Accessibility',
  'Focus Management',
  'Alternative Text for Images'
];

const deliverableOptions = [
  'Comprehensive Accessibility Audit Report',
  'WCAG 2.2 Compliance Certificate',
  'VPAT (Voluntary Product Accessibility Template)',
  'Remediation Implementation Plan',
  'Code Review & Recommendations',
  'User Testing Results',
  'Accessibility Training Materials',
  'Ongoing Monitoring Dashboard',
  'Legal Evidence Package',
  'Accessibility Policy Documentation',
  'Testing Scripts & Procedures',
  'Developer Guidelines',
  'Content Author Guidelines',
  'Accessibility Statement',
  'Progress Reports & Analytics'
];

export default function ProjectCreationForm({
  client,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}: ProjectCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>(
    {}
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      projectType: initialData?.projectType || 'a3s_program',
      priority: initialData?.priority || 'medium',
      wcagLevel: initialData?.wcagLevel || 'AA',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || undefined,
      estimatedHours: initialData?.estimatedHours || 40,
      budget: initialData?.budget || 0,
      billingType: initialData?.billingType || 'fixed',
      hourlyRate: initialData?.hourlyRate || 150,
      complianceRequirements: initialData?.complianceRequirements || [],
      deliverables: initialData?.deliverables || [],
      acceptanceCriteria: initialData?.acceptanceCriteria || [],
      tags: initialData?.tags || [],
      sheetId: initialData?.sheetId || '',
      notes: initialData?.notes || ''
    }
  });

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      const projectData: CreateProjectInput = {
        ...data,
        clientId: client.id,
        status: 'planning',
        createdBy: 'current-user-id', // Replace with actual user ID
        lastModifiedBy: 'current-user-id',
        projectPlatform: data.projectPlatform,
        techStack: data.techStack,
        complianceRequirements: data.complianceRequirements || [],
        websiteUrl: data.websiteUrl || undefined,
        testingMethodology: [],
        testingSchedule: data.testingSchedule || undefined,
        bugSeverityWorkflow: data.bugSeverityWorkflow || undefined,
        deliverables: data.deliverables || [],
        acceptanceCriteria: data.acceptanceCriteria || [],
        tags: data.tags || []
      };

      await onSubmit(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
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

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className='w-full space-y-6'>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <CardTitle>Create New Project for {client.name}</CardTitle>
              <CardDescription>
                {client.company} - Set up a comprehensive accessibility
                compliance project
              </CardDescription>
            </div>
            <Badge variant='outline' className='flex items-center gap-2'>
              <IconBuilding className='h-3 w-3' />
              {client.company}
            </Badge>
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
          <div className='mt-6 flex items-center justify-between overflow-x-auto pb-4'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const hasError = stepValidation[index] === false;

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
                              : 'cursor-pointer border-gray-300 text-gray-400 hover:scale-105 hover:border-blue-300 hover:text-blue-500'
                      }`}
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
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                    Project Foundation
                  </h4>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Define the core project details and accessibility compliance
                    requirements.
                  </p>
                </div>

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
                      <FormDescription>
                        A clear, descriptive name for this accessibility project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Comprehensive accessibility audit and remediation for the main website to achieve WCAG 2.2 AA compliance...'
                          className='resize-none'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description of the project scope and objectives
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='projectType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select project type' />
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
                        <FormDescription>
                          Type of accessibility service being provided
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='priority'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select priority' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='low'>
                              Low - Standard timeline
                            </SelectItem>
                            <SelectItem value='medium'>
                              Medium - Normal priority
                            </SelectItem>
                            <SelectItem value='high'>
                              High - Important project
                            </SelectItem>
                            <SelectItem value='urgent'>
                              Urgent - Legal deadline
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Project urgency and importance level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              WCAG 2.2 Level A - Basic
                            </SelectItem>
                            <SelectItem value='AA'>
                              WCAG 2.2 Level AA - Standard (Recommended)
                            </SelectItem>
                            <SelectItem value='AAA'>
                              WCAG 2.2 Level AAA - Enhanced
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Target WCAG compliance level for this project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Timeline & Scope */}
            {currentStep === 1 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    Project Timeline & Scope
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Define project timeline, milestones, and estimated effort
                    required for completion.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Start Date</FormLabel>
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
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          When will this project officially begin?
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
                        <FormLabel>Target Completion Date</FormLabel>
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
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Target date for project completion (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='estimatedHours'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='40'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Total estimated hours required to complete this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Budget & Billing */}
            {currentStep === 2 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950'>
                  <h4 className='mb-2 font-medium text-yellow-900 dark:text-yellow-100'>
                    Budget & Billing Configuration
                  </h4>
                  <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                    Set up project budget, billing type, and rates for accurate
                    project tracking and invoicing.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='budget'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Budget</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='5000'
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Total budget allocated for this project (USD)
                        </FormDescription>
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select billing type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='fixed'>
                              Fixed Price - One-time payment
                            </SelectItem>
                            <SelectItem value='hourly'>
                              Hourly Rate - Time-based billing
                            </SelectItem>
                            <SelectItem value='milestone'>
                              Milestone-based - Payment per milestone
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How will this project be billed?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('billingType') === 'hourly' && (
                  <FormField
                    control={form.control}
                    name='hourlyRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='150'
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Hourly rate for this project (USD per hour)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Step 4: Requirements & Deliverables */}
            {currentStep === 3 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950'>
                  <h4 className='mb-2 font-medium text-purple-900 dark:text-purple-100'>
                    Compliance Requirements & Deliverables
                  </h4>
                  <p className='text-sm text-purple-700 dark:text-purple-300'>
                    Define specific compliance requirements, deliverables, and
                    acceptance criteria for this project.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='complianceRequirements'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Requirements</FormLabel>
                      <FormDescription className='mb-4'>
                        Select all compliance requirements that apply to this
                        project
                      </FormDescription>
                      <div className='grid max-h-60 grid-cols-1 gap-3 overflow-y-auto rounded-lg border p-4 md:grid-cols-2'>
                        {complianceOptions.map((requirement) => (
                          <div
                            key={requirement}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={requirement}
                              checked={
                                field.value?.includes(requirement) || false
                              }
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    requirement
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (item) => item !== requirement
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={requirement}
                              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {requirement}
                            </label>
                          </div>
                        ))}
                      </div>
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
                      <FormDescription className='mb-4'>
                        Select all deliverables that will be provided upon
                        project completion
                      </FormDescription>
                      <div className='grid max-h-60 grid-cols-1 gap-3 overflow-y-auto rounded-lg border p-4 md:grid-cols-2'>
                        {deliverableOptions.map((deliverable) => (
                          <div
                            key={deliverable}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={deliverable}
                              checked={
                                field.value?.includes(deliverable) || false
                              }
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    deliverable
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (item) => item !== deliverable
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={deliverable}
                              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {deliverable}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='acceptanceCriteria'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptance Criteria</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='• All WCAG 2.2 AA violations identified and documented&#10;• Remediation plan provided with priority levels&#10;• Testing completed with assistive technologies&#10;• Legal evidence package delivered'
                          className='resize-none'
                          rows={6}
                          {...field}
                          value={field.value?.join('\n') || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split('\n')
                                .filter((line) => line.trim())
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Define clear criteria for project completion (one per
                        line)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 5: Finalize Project */}
            {currentStep === 4 && (
              <div className='space-y-8'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <h4 className='mb-2 font-medium text-green-900 dark:text-green-100'>
                    Finalize Project Setup
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300'>
                    Add final details, tags, and notes to complete the project
                    setup.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., website, mobile, government, urgent'
                          {...field}
                          value={field.value?.join(', ') || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for easy project categorization and
                        filtering
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sheetId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Sheet ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Google Sheet ID for project tracking'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to an external tracking sheet (Google Sheets, Excel
                        Online, etc.)
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
                          className='resize-none'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional information or special considerations for
                        this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Summary */}
                <div className='rounded-lg border bg-gray-50 p-6 dark:bg-gray-900'>
                  <h4 className='mb-4 font-medium'>Project Summary</h4>
                  <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                    <div>
                      <span className='text-muted-foreground'>Client:</span>
                      <span className='ml-2 font-medium'>
                        {client.name} ({client.company})
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Project Type:
                      </span>
                      <span className='ml-2 font-medium'>
                        {
                          projectTypeLabels[
                            form.watch('projectType') as ProjectType
                          ]
                        }
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>WCAG Level:</span>
                      <span className='ml-2 font-medium'>
                        WCAG 2.2 Level {form.watch('wcagLevel')}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Priority:</span>
                      <span className='ml-2 font-medium capitalize'>
                        {form.watch('priority')}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Estimated Hours:
                      </span>
                      <span className='ml-2 font-medium'>
                        {form.watch('estimatedHours') || 0} hours
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Budget:</span>
                      <span className='ml-2 font-medium'>
                        ${(form.watch('budget') || 0).toLocaleString()}
                      </span>
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
                <Button
                  type='button'
                  variant='ghost'
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                >
                  Cancel
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type='button'
                    onClick={nextStep}
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
                        Create Project
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

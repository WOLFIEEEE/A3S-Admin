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
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFolder
} from '@tabler/icons-react';

const projectFormSchema = z
  .object({
    // Project Type Selection (A3S vs Normal)
    isA3SProject: z.boolean(),

    // Basic Project Info
    clientId: z.string().min(1, 'Please select a client'),
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().optional(),
    websiteUrl: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),

    // Essential Fields
    wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

    // A3S Specific Fields (conditional)
    techStack: z
      .enum([
        'wordpress',
        'shopify',
        'drupal',
        'wix',
        'squarespace',
        'webflow',
        'tylertech',
        'other'
      ])
      .optional(),
    customTechStack: z.string().optional(),

    // Optional fields
    notes: z.string().optional()
  })
  .refine(
    (data) => {
      // If A3S project and techStack is 'other', customTechStack must be provided
      if (data.isA3SProject && data.techStack === 'other') {
        return data.customTechStack && data.customTechStack.trim().length > 0;
      }
      return true;
    },
    {
      message: "Custom tech stack is required when 'Others' is selected",
      path: ['customTechStack']
    }
  );

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormSimpleProps {
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  initialData?: CreateProjectInput | null;
  isLoading?: boolean;
}

const steps = [
  {
    id: 'project-type',
    title: 'Project Type',
    description: 'Choose between A3S or Normal project',
    icon: IconTarget,
    isRequired: true
  },
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project name, client, and basic details',
    icon: IconFolder,
    isRequired: true
  }
];

const techStackLabels: Record<string, string> = {
  wordpress: 'WordPress',
  shopify: 'Shopify',
  drupal: 'Drupal',
  wix: 'Wix',
  squarespace: 'Squarespace',
  webflow: 'Webflow',
  tylertech: 'TylerTech (GovCMS)',
  other: 'Others'
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function ProjectFormSimple({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}: ProjectFormSimpleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      isA3SProject: false,
      clientId: initialData?.clientId || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      websiteUrl: initialData?.websiteUrl || '',
      wcagLevel: initialData?.wcagLevel || 'AA',
      priority: initialData?.priority || 'medium',
      techStack:
        (initialData?.techStack as
          | 'wordpress'
          | 'tylertech'
          | 'shopify'
          | 'drupal'
          | 'other') || undefined,
      customTechStack: (initialData as any)?.customTechStack || '',
      notes: initialData?.notes || ''
    }
  });

  const isA3SProject = form.watch('isA3SProject');
  const techStack = form.watch('techStack');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const result = await response.json();
        if (result.success) {
          const clientsData = result.data?.clients || result.data || [];
          setClients(clientsData);
        } else {
          throw new Error(result.error || 'Failed to fetch clients');
        }
      } catch (error) {
        toast.error('Failed to load clients');
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert form data to API format
      const projectData: CreateProjectInput = {
        clientId: data.clientId,
        name: data.name,
        description: data.description || undefined,
        status: 'planning', // Default status for new projects
        priority: data.priority,
        wcagLevel: data.wcagLevel,
        projectType: data.isA3SProject ? 'a3s_program' : 'audit',
        projectPlatform: 'website', // Default to website
        techStack: data.isA3SProject
          ? data.techStack === 'other' && data.customTechStack
            ? data.customTechStack
            : data.techStack || 'wordpress'
          : 'other',
        websiteUrl: data.websiteUrl || undefined,
        notes: data.notes || undefined,
        billingType: 'fixed', // Default billing type
        complianceRequirements: [], // Default empty array
        testingMethodology: [], // Default empty array
        deliverables: [], // Default empty array
        acceptanceCriteria: [], // Default empty array
        tags: [], // Default empty array
        createdBy: 'current-user',
        lastModifiedBy: 'current-user'
      };

      await onSubmit(projectData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const formData = form.getValues();

    switch (stepIndex) {
      case 0: // Project Type
        return true; // Always valid
      case 1: // Basic Information
        const basicValid = !!(formData.clientId && formData.name);
        if (formData.isA3SProject) {
          const hasTechStack = !!(
            formData.techStack &&
            (formData.techStack !== 'other' || formData.customTechStack)
          );
          return basicValid && hasTechStack;
        }
        return basicValid;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          <div className='mt-6 grid grid-cols-2 gap-4'>
            {steps.map((step, _index) => {
              const StepIcon = step.icon;
              const isActive = _index === currentStep;
              const isCompleted = _index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${
                    isActive
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                      : isCompleted
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <IconCheck className='h-4 w-4' />
                    ) : (
                      <StepIcon className='h-4 w-4' />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Form form={form} onSubmit={handleSubmit} className='space-y-6'>
        {/* Step 0: Project Type Selection */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <IconTarget className='h-5 w-5' />
                <span>Project Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FormField
                control={form.control}
                name='isA3SProject'
                render={({ field }) => (
                  <FormItem>
                    <div className='space-y-4'>
                      <FormLabel className='text-base font-medium'>
                        What type of project is this?
                      </FormLabel>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* A3S Project Option */}
                        <div
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                            field.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                          onClick={() => field.onChange(true)}
                        >
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`h-4 w-4 rounded-full border-2 ${
                                field.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {field.value && (
                                <div className='m-0.5 h-2 w-2 rounded-full bg-white' />
                              )}
                            </div>
                            <div>
                              <h3 className='font-medium'>A3S Project</h3>
                              <p className='text-muted-foreground text-sm'>
                                Full A3S program with requirements
                                documentation, accessibility statement, staging
                                credentials, and tech stack selection
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Normal Project Option */}
                        <div
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                            !field.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                          onClick={() => field.onChange(false)}
                        >
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`h-4 w-4 rounded-full border-2 ${
                                !field.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {!field.value && (
                                <div className='m-0.5 h-2 w-2 rounded-full bg-white' />
                              )}
                            </div>
                            <div>
                              <h3 className='font-medium'>Normal Project</h3>
                              <p className='text-muted-foreground text-sm'>
                                Standard accessibility project with basic
                                requirements
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <IconFolder className='h-5 w-5' />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Client Selection */}
              <FormField
                control={form.control}
                name='clientId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a client' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className='flex items-center space-x-2'>
                              <IconBuilding className='h-4 w-4' />
                              <span>{client.company}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the client for this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter project name' {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for the project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter project description...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of the project scope and objectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website URL */}
              <FormField
                control={form.control}
                name='websiteUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The primary website URL for this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* WCAG Level */}
              <FormField
                control={form.control}
                name='wcagLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WCAG Compliance Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select WCAG level' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='A'>Level A</SelectItem>
                        <SelectItem value='AA'>
                          Level AA (Recommended)
                        </SelectItem>
                        <SelectItem value='AAA'>Level AAA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Target WCAG compliance level for this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select priority' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='low'>
                          <div className='flex items-center space-x-2'>
                            <Badge className={priorityColors.low}>Low</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value='medium'>
                          <div className='flex items-center space-x-2'>
                            <Badge className={priorityColors.medium}>
                              Medium
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value='high'>
                          <div className='flex items-center space-x-2'>
                            <Badge className={priorityColors.high}>High</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value='urgent'>
                          <div className='flex items-center space-x-2'>
                            <Badge className={priorityColors.urgent}>
                              Urgent
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Project priority level</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* A3S Specific Fields */}
              {isA3SProject && (
                <>
                  <div className='border-t pt-6'>
                    <h3 className='mb-4 text-lg font-medium'>
                      A3S Project Settings
                    </h3>

                    {/* Tech Stack */}
                    <FormField
                      control={form.control}
                      name='techStack'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technology Stack *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select technology stack' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(techStackLabels).map(
                                ([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Primary technology stack for this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Tech Stack */}
                    {techStack === 'other' && (
                      <FormField
                        control={form.control}
                        name='customTechStack'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Technology Stack *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Enter custom tech stack'
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Specify the custom technology stack
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Any additional notes or requirements...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes or special requirements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>
            {currentStep > 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={goToPrevStep}
                disabled={isSubmitting}
              >
                <IconChevronLeft className='mr-2 h-4 w-4' />
                Previous
              </Button>
            )}
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          <div className='flex space-x-2'>
            {currentStep < steps.length - 1 ? (
              <Button
                type='button'
                onClick={goToNextStep}
                disabled={!validateStep(currentStep) || isSubmitting}
              >
                Next
                <IconChevronRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='submit'
                disabled={!validateStep(currentStep) || isSubmitting}
              >
                {isSubmitting && (
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Create Project
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}

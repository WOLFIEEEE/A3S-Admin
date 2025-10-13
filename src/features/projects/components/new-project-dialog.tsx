'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IconPlus,
  IconAccessible,
  IconCalendar,
  IconCurrencyDollar,
  IconClock,
  IconUser,
  IconBuilding,
  IconShield,
  IconTarget,
  IconLoader2
} from '@tabler/icons-react';
import { Client } from '@/types/client';
import { CreateProjectInput } from '@/types/project';

const projectFormSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  sheetId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  wcagLevel: z.enum(['A', 'AA', 'AAA']),
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
  billingType: z.enum(['fixed', 'hourly', 'milestone']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  complianceRequirements: z.string().optional(),
  deliverables: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  tags: z.string().optional(),
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

interface NewProjectDialogProps {
  clients: Client[];
  selectedClientId?: string;
  trigger?: React.ReactNode;
  onProjectCreated?: (project: any) => void;
}

const projectTypeLabels: Record<string, string> = {
  audit: 'Accessibility Audit',
  remediation: 'Remediation',
  monitoring: 'Continuous Monitoring',
  training: 'Training & Education',
  consultation: 'Consultation',
  full_compliance: 'Full Compliance Package'
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function NewProjectDialog({
  clients,
  selectedClientId,
  trigger,
  onProjectCreated
}: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: selectedClientId || '',
      name: '',
      description: '',
      sheetId: '',
      priority: 'medium',
      wcagLevel: 'AA',
      projectType: 'audit',
      billingType: 'fixed',
      startDate: '',
      endDate: '',
      estimatedHours: undefined,
      budget: undefined,
      hourlyRate: undefined,
      complianceRequirements: '',
      deliverables: '',
      acceptanceCriteria: '',
      tags: '',
      notes: ''
    }
  });

  const selectedClient = clients.find((c) => c.id === form.watch('clientId'));
  const billingType = form.watch('billingType');

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
        priority: data.priority,
        wcagLevel: data.wcagLevel,
        projectType: data.projectType,
        projectPlatform: data.projectPlatform,
        techStack: data.techStack,
        billingType: data.billingType,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        estimatedHours: data.estimatedHours,
        budget: data.budget,
        hourlyRate: data.hourlyRate,
        complianceRequirements: data.complianceRequirements
          ? data.complianceRequirements
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        websiteUrl: data.websiteUrl || undefined,
        testingMethodology: [],
        testingSchedule: data.testingSchedule || undefined,
        bugSeverityWorkflow: data.bugSeverityWorkflow || undefined,
        deliverables: data.deliverables
          ? data.deliverables
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        acceptanceCriteria: data.acceptanceCriteria
          ? data.acceptanceCriteria
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        tags: data.tags
          ? data.tags
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        notes: data.notes || undefined,
        createdBy: 'current-user-id', // Replace with actual user ID
        lastModifiedBy: 'current-user-id'
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const result = await response.json();
      toast.success('Project created successfully!');

      setOpen(false);
      form.reset();

      if (onProjectCreated) {
        onProjectCreated(result.data);
      } else {
        router.push(
          `/dashboard/clients/${data.clientId}/projects/${result.data.id}`
        );
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button size='lg' className='w-full sm:w-auto'>
      <IconPlus className='mr-2 h-4 w-4' />
      New Project
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className='max-h-[90vh] w-[95vw] max-w-6xl sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw]'>
        <DialogHeader className='space-y-3 pb-4'>
          <DialogTitle className='flex items-center gap-2 text-xl sm:text-2xl'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900'>
              <IconAccessible className='h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400' />
            </div>
            Create New Accessibility Project
          </DialogTitle>
          <DialogDescription className='text-base sm:text-lg'>
            Set up a new WCAG compliance project with detailed requirements and
            deliverables.
          </DialogDescription>
          {selectedClient && (
            <div className='flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
              <IconBuilding className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                Client: {selectedClient.company} ({selectedClient.name})
              </span>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className='max-h-[calc(90vh-200px)] pr-4'>
          <Form
            form={form}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-8 px-1'
          >
            {/* Client Selection */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconUser className='text-muted-foreground h-4 w-4' />
                <h3 className='text-lg font-semibold'>
                  Client & Project Details
                </h3>
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
                          {clients.map((client) => (
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

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
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
                name='sheetId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Sheet ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Google Sheets ID or external tracking reference'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional reference to external project tracking sheets or
                      documents.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Project Configuration */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconAccessible className='text-muted-foreground h-4 w-4' />
                <h3 className='text-lg font-semibold'>
                  Accessibility Configuration
                </h3>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
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
                            <SelectValue />
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
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='A'>WCAG 2.2 Level A</SelectItem>
                          <SelectItem value='AA'>WCAG 2.2 Level AA</SelectItem>
                          <SelectItem value='AAA'>
                            WCAG 2.2 Level AAA
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            <SelectValue />
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
              </div>
            </div>

            <Separator />

            {/* Timeline & Budget */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconCalendar className='text-muted-foreground h-4 w-4' />
                <h3 className='text-lg font-semibold'>Timeline & Budget</h3>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
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
                            <SelectValue />
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

                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='estimatedHours'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='e.g., 120'
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='budget'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='e.g., 15000'
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {billingType === 'hourly' && (
                  <FormField
                    control={form.control}
                    name='hourlyRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='e.g., 125'
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Project Requirements */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconTarget className='text-muted-foreground h-4 w-4' />
                <h3 className='text-lg font-semibold'>
                  Requirements & Deliverables
                </h3>
              </div>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='complianceRequirements'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compliance Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='e.g., WCAG 2.2 AA compliance, Section 508, ADA compliance, keyboard navigation, screen reader compatibility'
                          className='min-h-[60px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of specific compliance
                        requirements.
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
                        <Textarea
                          placeholder='e.g., Accessibility audit report, Remediation plan, VPAT document, Training materials, Compliance certificate'
                          className='min-h-[60px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of expected project deliverables.
                      </FormDescription>
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
                          placeholder='e.g., All WCAG 2.2 AA violations resolved, Automated testing passes, Manual testing completed, Client approval received'
                          className='min-h-[60px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of criteria that must be met for
                        project completion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <IconShield className='text-muted-foreground h-4 w-4' />
                <h3 className='text-lg font-semibold'>
                  Additional Information
                </h3>
              </div>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., website, mobile-app, e-commerce, government, healthcare'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for categorizing and filtering
                        projects.
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
                          placeholder='Any additional information, special requirements, or notes about this project...'
                          className='min-h-[80px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </ScrollArea>

        {/* Dialog Footer */}
        <div className='-mx-6 flex flex-col gap-3 border-t bg-gray-50/50 px-6 pt-6 pb-6 sm:flex-row dark:bg-gray-900/50'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            className='w-full sm:w-auto sm:min-w-[120px]'
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className='w-full sm:min-w-[200px] sm:flex-1'
            size='lg'
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Project...
              </>
            ) : (
              <>
                <IconPlus className='mr-2 h-4 w-4' />
                Create Project
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

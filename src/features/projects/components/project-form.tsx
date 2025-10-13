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
import { CreateProjectInput, Project, Developer } from '@/types';
import { toast } from 'sonner';

const projectFormSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  sheetId: z.string().optional(),
  status: z.enum([
    'planning',
    'active',
    'on_hold',
    'completed',
    'cancelled',
    'archived'
  ]),
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
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
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
  testingSchedule: z.string().optional(),
  bugSeverityWorkflow: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  clientId: string;
  initialData?: Project | null;
  developers?: Developer[];
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ProjectForm({
  clientId,
  initialData,
  developers = [],
  onSubmit,
  onCancel,
  isLoading = false
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      sheetId: initialData?.sheetId || '',
      status: initialData?.status || 'planning',
      priority: initialData?.priority || 'medium',
      wcagLevel: initialData?.wcagLevel || 'AA',
      projectType: initialData?.projectType || 'a3s_program',
      billingType: initialData?.billingType || 'fixed',
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
      estimatedHours: initialData?.estimatedHours || undefined,
      budget: initialData?.budget || undefined,
      hourlyRate: initialData?.hourlyRate || undefined,
      complianceRequirements: initialData?.complianceRequirements || [],
      deliverables: initialData?.deliverables || [],
      acceptanceCriteria: initialData?.acceptanceCriteria || [],
      tags: initialData?.tags || [],
      notes: initialData?.notes || ''
    }
  });

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      const projectData: CreateProjectInput = {
        ...data,
        clientId,
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
      toast.success(
        initialData
          ? 'Project updated successfully'
          : 'Project created successfully'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-4xl'>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Project' : 'Create New Project'}
        </CardTitle>
        <CardDescription>
          {initialData
            ? 'Update project information and settings.'
            : 'Create a new accessibility compliance project.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Basic Information</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Website Accessibility Audit'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sheetId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sheet ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Google Sheets ID for project tracking and documentation
                    </FormDescription>
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comprehensive WCAG 2.2 AA compliance audit and remediation for the client's main website..."
                      className='resize-none'
                      rows={3}
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
          </div>

          {/* Project Settings */}
          <div className='space-y-4 border-t pt-6'>
            <h3 className='text-lg font-medium'>Project Settings</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                        <SelectItem value='planning'>Planning</SelectItem>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='on_hold'>On Hold</SelectItem>
                        <SelectItem value='completed'>Completed</SelectItem>
                        <SelectItem value='cancelled'>Cancelled</SelectItem>
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
                    <FormLabel>Priority</FormLabel>
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
                        <SelectItem value='low'>Low</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='high'>High</SelectItem>
                        <SelectItem value='urgent'>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className='space-y-4 border-t pt-6'>
            <h3 className='text-lg font-medium'>Timeline & Budget</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (Optional)</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
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
                    <FormLabel>Estimated Hours (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='40'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Total estimated hours for project completion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='budget'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='5000'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Project budget in USD</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className='space-y-4 border-t pt-6'>
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Additional project notes, special requirements, or important considerations...'
                      className='resize-none'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional information or special requirements for this
                    project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-4 border-t pt-6'>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type='submit'
              disabled={isSubmitting || isLoading}
              className='min-w-[120px]'
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                  ? 'Update Project'
                  : 'Create Project'}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

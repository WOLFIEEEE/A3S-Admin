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
import { CreateTicketInput, Ticket, Developer } from '@/types';
import { toast } from 'sonner';

const ticketFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['bug', 'feature', 'task', 'accessibility', 'improvement']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.string().optional()
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  projectId: string;
  reporterId: string;
  initialData?: Ticket | null;
  developers?: Developer[];
  onSubmit: (data: CreateTicketInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const typeLabels = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  task: 'Task',
  improvement: 'Improvement',
  accessibility: 'Accessibility'
};

const priorityLabels = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
  critical: 'Critical'
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600'
};

export default function TicketForm({
  projectId,
  reporterId,
  initialData,
  developers = [],
  onSubmit,
  onCancel,
  isLoading = false
}: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'task',
      priority: initialData?.priority || 'medium',
      assigneeId: initialData?.assigneeId || 'unassigned',
      estimatedHours: initialData?.estimatedHours || undefined,
      tags: initialData?.tags?.join(', ') || ''
    }
  });

  const handleSubmit = async (data: TicketFormValues) => {
    try {
      setIsSubmitting(true);

      const ticketData: CreateTicketInput = {
        ...data,
        projectId,
        reporterId,
        assigneeId:
          data.assigneeId === 'unassigned' ? undefined : data.assigneeId,
        estimatedHours: data.estimatedHours || undefined,
        tags: data.tags || undefined
      };

      await onSubmit(ticketData);
      toast.success(
        initialData
          ? 'Ticket updated successfully'
          : 'Ticket created successfully'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>
              {initialData ? 'Edit Ticket' : 'Create New Accessibility Ticket'}
            </CardTitle>
            <CardDescription>
              {initialData
                ? 'Update ticket information and assignment.'
                : 'Create a new WCAG compliance ticket for accessibility issues and improvements.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-8'>
        <Form form={form} onSubmit={handleSubmit} className='space-y-8'>
          {/* WCAG Guidelines */}
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
            <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
              WCAG 2.2 AA Compliance Guidelines
            </h4>
            <p className='mb-3 text-sm text-blue-700 dark:text-blue-300'>
              When creating accessibility tickets, please reference specific
              WCAG criteria and provide clear impact descriptions.
            </p>
            <div className='grid grid-cols-1 gap-3 text-xs md:grid-cols-3'>
              <div className='rounded bg-white p-2 dark:bg-blue-900'>
                <div className='font-medium text-blue-900 dark:text-blue-100'>
                  Perceivable
                </div>
                <div className='text-blue-700 dark:text-blue-300'>
                  1.1-1.4 (Images, Audio, Color)
                </div>
              </div>
              <div className='rounded bg-white p-2 dark:bg-blue-900'>
                <div className='font-medium text-blue-900 dark:text-blue-100'>
                  Operable
                </div>
                <div className='text-blue-700 dark:text-blue-300'>
                  2.1-2.5 (Keyboard, Navigation)
                </div>
              </div>
              <div className='rounded bg-white p-2 dark:bg-blue-900'>
                <div className='font-medium text-blue-900 dark:text-blue-100'>
                  Understandable
                </div>
                <div className='text-blue-700 dark:text-blue-300'>
                  3.1-3.3 (Readable, Predictable)
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Accessibility Issue Details</h3>

            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Fix color contrast issue on navigation menu (WCAG 1.4.3)'
                      {...field}
                      aria-describedby='title-description'
                    />
                  </FormControl>
                  <FormDescription id='title-description'>
                    Clear title including WCAG criteria reference (e.g.,
                    &ldquo;Fix keyboard navigation - WCAG 2.1.1&rdquo;)
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='ISSUE: Navigation menu text has insufficient color contrast (2.1:1 ratio)
WCAG CRITERIA: 1.4.3 Contrast (Minimum) - Level AA
CURRENT STATE: Text fails minimum 4.5:1 contrast requirement
IMPACT: Users with visual impairments cannot read navigation items
AFFECTED USERS: Low vision, color blindness, bright screen conditions
STEPS TO REPRODUCE: 1. Navigate to homepage 2. Check nav text contrast 3. Use color picker tool
EXPECTED OUTCOME: Achieve minimum 4.5:1 contrast ratio for all navigation text'
                      className='min-h-[140px] resize-none'
                      {...field}
                      aria-describedby='description-help'
                    />
                  </FormControl>
                  <FormDescription id='description-help'>
                    Include: WCAG criteria, current state, impact on users,
                    steps to reproduce, and expected outcome
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Classification */}
          <div className='space-y-4 border-t pt-6'>
            <h3 className='text-lg font-medium'>Classification</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger aria-describedby='type-help'>
                          <SelectValue placeholder='Select ticket type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription id='type-help'>
                      Category of the accessibility issue or request
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
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger aria-describedby='priority-help'>
                          <SelectValue placeholder='Select priority level' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <span
                                className={
                                  priorityColors[
                                    value as keyof typeof priorityColors
                                  ]
                                }
                              >
                                {label}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription id='priority-help'>
                      Urgency level based on impact and WCAG compliance
                      requirements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Assignment & Timeline */}
          <div className='space-y-4 border-t pt-6'>
            <h3 className='text-lg font-medium'>Assignment & Timeline</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='assigneeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Team Member</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger aria-describedby='assignee-help'>
                          <SelectValue placeholder='Select team member' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='unassigned'>Unassigned</SelectItem>
                        <SelectItem value='auto-assign'>
                          Auto-assign based on skills
                        </SelectItem>
                        {developers.map((developer) => (
                          <SelectItem key={developer.id} value={developer.id}>
                            <div className='flex w-full items-center justify-between'>
                              <span>{developer.name}</span>
                              <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                                <span className='capitalize'>
                                  {developer.role}
                                </span>
                                {developer.skills.includes('WCAG') && (
                                  <span className='rounded bg-blue-100 px-1 text-blue-800'>
                                    WCAG
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription id='assignee-help'>
                      Select a developer responsible for resolving this
                      accessibility issue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='estimatedHours'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='2'
                        min='0'
                        step='0.5'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        aria-describedby='hours-help'
                      />
                    </FormControl>
                    <FormDescription id='hours-help'>
                      Estimated time to complete this ticket
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tags */}
          <div className='space-y-4 border-t pt-6'>
            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WCAG Tags & Categories</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='wcag-1.4.3, color-contrast, navigation, high-impact, screen-reader'
                      {...field}
                      aria-describedby='tags-help'
                    />
                  </FormControl>
                  <FormDescription id='tags-help'>
                    Comma-separated tags: WCAG criteria (wcag-1.4.3), components
                    (navigation, forms), impact (high-impact, critical),
                    assistive tech (screen-reader, keyboard-only)
                  </FormDescription>

                  {/* Common Tags Suggestions */}
                  <div className='mt-2'>
                    <div className='text-muted-foreground mb-2 text-xs'>
                      Common tags:
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {[
                        'wcag-1.4.3',
                        'wcag-2.1.1',
                        'wcag-1.1.1',
                        'color-contrast',
                        'keyboard-navigation',
                        'screen-reader',
                        'alt-text',
                        'forms',
                        'navigation',
                        'high-impact',
                        'critical',
                        'aria-labels'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type='button'
                          onClick={() => {
                            const currentTags = field.value
                              ? field.value.split(',').map((t) => t.trim())
                              : [];
                            if (!currentTags.includes(tag)) {
                              const newTags = [...currentTags, tag].join(', ');
                              field.onChange(newTags);
                            }
                          }}
                          className='rounded bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  ? 'Update Ticket'
                  : 'Create Ticket'}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

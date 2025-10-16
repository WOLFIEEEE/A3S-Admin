'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import { IconLoader2, IconBuilding, IconUsers } from '@tabler/icons-react';
import { toast } from 'sonner';
import { TEAM_TYPE_LABELS } from '@/types/team';

// Form validation schema
const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(255, 'Team name must be less than 255 characters'),
  description: z.string().optional(),
  teamType: z.enum(['internal', 'external'] as const),
  managerId: z.string().optional()
});

type TeamFormData = z.infer<typeof teamSchema>;

interface Manager {
  id: string;
  name: string;
  role: string;
  teamName: string;
}

export default function NewTeamForm() {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      teamType: 'internal',
      managerId: ''
    }
  });

  useEffect(() => {
    fetchPotentialManagers();
  }, []);

  const fetchPotentialManagers = async () => {
    try {
      const response = await fetch(
        '/api/teams/members?role=manager&role=ceo&role=team_lead&role=project_manager'
      );
      if (!response.ok) throw new Error('Failed to fetch potential managers');

      const result = await response.json();
      if (result.success) {
        const members = result.data.members || [];
        const managerList = members.map((member: any) => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          role: member.title || member.role,
          teamName: member.team?.name || 'No Team'
        }));
        setManagers(managerList);
      }
    } catch (error) {
      // Don't show error toast for this as it's not critical
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          teamType: data.teamType,
          managerId:
            data.managerId && data.managerId !== 'none'
              ? data.managerId
              : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Team created successfully!');
        router.push('/dashboard/teams');
      } else {
        throw new Error(result.error || 'Failed to create team');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create team'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Basic Information */}
        <div className='space-y-6'>
          <div className='flex items-center space-x-2'>
            <IconBuilding className='h-5 w-5' />
            <h3 className='text-lg font-medium'>Team Information</h3>
          </div>

          <div className='grid grid-cols-1 gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter team name (e.g., Frontend Development, QA Team)'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name for your team
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
                      placeholder="Describe the team's purpose, responsibilities, and goals..."
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the team&apos;s role and
                    responsibilities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='teamType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select team type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TEAM_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Internal teams are employees, external teams are
                    contractors/consultants
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {managers.length > 0 && (
              <FormField
                control={form.control}
                name='managerId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Manager</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a team manager (optional)' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>No Manager</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {manager.name}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {manager.role} • {manager.teamName}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign a manager to oversee this team (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex items-center justify-between border-t pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Team...
              </>
            ) : (
              <>
                <IconUsers className='mr-2 h-4 w-4' />
                Create Team
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

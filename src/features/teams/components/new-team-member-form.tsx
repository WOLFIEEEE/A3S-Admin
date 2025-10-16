'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { IconLoader2, IconUser, IconBuilding } from '@tabler/icons-react';
import { toast } from 'sonner';
import { TeamWithDetails, EmployeeRole, ROLE_LABELS } from '@/types/team';

// Form validation schema
const teamMemberSchema = z.object({
  teamId: z.string().min(1, 'Please select a team'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.enum([
    'ceo',
    'manager',
    'team_lead',
    'senior_developer',
    'developer',
    'junior_developer',
    'designer',
    'qa_engineer',
    'project_manager',
    'business_analyst',
    'consultant',
    'contractor'
  ]),
  title: z.string().optional(),
  department: z.string().optional(),
  reportsToId: z.string().optional(),
  startDate: z.string().optional()
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export default function NewTeamMemberForm() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [managers, setManagers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      teamId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: '',
      department: '',
      reportsToId: '',
      startDate: ''
    }
  });

  const watchedTeamId = form.watch('teamId');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (watchedTeamId) {
      fetchManagers(watchedTeamId);
    }
  }, [watchedTeamId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');

      const result = await response.json();
      if (result.success) {
        setTeams(result.data.teams || []);
      }
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  };

  const fetchManagers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/members?teamId=${teamId}`);
      if (!response.ok) throw new Error('Failed to fetch team members');

      const result = await response.json();
      if (result.success) {
        const members = result.data.members || [];
        const managerRoles = ['ceo', 'manager', 'team_lead', 'project_manager'];
        const potentialManagers = members
          .filter((member: any) => managerRoles.includes(member.role))
          .map((member: any) => ({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            role: ROLE_LABELS[member.role as EmployeeRole]
          }));
        setManagers(potentialManagers);
      }
    } catch (error) {
      setManagers([]);
    }
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : undefined,
        reportsToId:
          data.reportsToId && data.reportsToId !== 'none'
            ? data.reportsToId
            : undefined
      };

      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create team member');
      }

      if (result.success) {
        toast.success('Team member created successfully!');
        router.push('/dashboard/teams');
      } else {
        throw new Error(result.error || 'Failed to create team member');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create team member'
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
            <IconUser className='h-5 w-5' />
            <h3 className='text-lg font-medium'>Basic Information</h3>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter first name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter last name' {...field} />
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
                      placeholder='Enter email address'
                      {...field}
                    />
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
                    <Input placeholder='Enter phone number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Team and Role Information */}
        <div className='space-y-6'>
          <div className='flex items-center space-x-2'>
            <IconBuilding className='h-5 w-5' />
            <h3 className='text-lg font-medium'>Team & Role Information</h3>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='teamId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a team' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.teamType})
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
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Senior React Developer'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='department'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Engineering, Design' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {managers.length > 0 && (
              <FormField
                control={form.control}
                name='reportsToId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reports To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select manager' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>No direct manager</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Start Date */}
        <div className='space-y-6'>
          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date (Optional)</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className='flex justify-end space-x-4 pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/teams')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Member...
              </>
            ) : (
              'Create Team Member'
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable, FilterConfig } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Enhanced project interface with all necessary fields
export interface ProjectWithDetails {
  id: string;
  name: string;
  description: string | null;
  status:
    | 'planning'
    | 'active'
    | 'on_hold'
    | 'completed'
    | 'cancelled'
    | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  wcagLevel: 'A' | 'AA' | 'AAA';
  billingType: 'hourly' | 'fixed' | 'milestone';
  budget: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
  } | null;
  issueCount: number;
  criticalIssueCount: number;
  progress: number;
  teamSize: number;
  lastActivity: Date | null;
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  on_hold:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  archived:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const wcagLevelColors = {
  A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  AA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  AAA: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

export const columns: ColumnDef<ProjectWithDetails>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className='flex flex-col'>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className='font-medium hover:underline'
          >
            {project.name}
          </Link>
          {project.description && (
            <p className='text-muted-foreground line-clamp-1 text-sm'>
              {project.description}
            </p>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: ({ row }) => {
      const client = row.original.client;
      if (!client)
        return <span className='text-muted-foreground'>No client</span>;

      return (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={`https://avatar.vercel.sh/${client.email}`} />
            <AvatarFallback>
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{client.name}</span>
            <span className='text-muted-foreground text-sm'>
              {client.company}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge className={statusColors[status as keyof typeof statusColors]}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      return (
        <Badge
          className={priorityColors[priority as keyof typeof priorityColors]}
        >
          {priority.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'wcagLevel',
    header: 'WCAG Level',
    cell: ({ row }) => {
      const level = row.getValue('wcagLevel') as string;
      return (
        <Badge
          className={wcagLevelColors[level as keyof typeof wcagLevelColors]}
        >
          {level}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number;
      return (
        <div className='flex items-center space-x-2'>
          <Progress value={progress} className='w-[60px]' />
          <span className='text-sm font-medium'>{progress}%</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'issueCount',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Issues
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const issueCount = row.getValue('issueCount') as number;
      const criticalCount = row.original.criticalIssueCount;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{issueCount} total</span>
          {criticalCount > 0 && (
            <span className='text-sm text-red-600'>
              {criticalCount} critical
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Budget
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const budget = row.getValue('budget') as string | null;
      const billingType = row.original.billingType;

      if (!budget)
        return <span className='text-muted-foreground'>Not set</span>;

      const budgetNumber = parseFloat(budget);

      return (
        <div className='flex flex-col'>
          <span className='font-medium'>${budgetNumber.toLocaleString()}</span>
          <span className='text-muted-foreground text-sm capitalize'>
            {billingType}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Timeline',
    cell: ({ row }) => {
      const startDate = row.getValue('startDate') as Date | null;
      const endDate = row.original.endDate;

      return (
        <div className='flex flex-col text-sm'>
          {startDate && <span>Start: {format(startDate, 'MMM dd, yyyy')}</span>}
          {endDate && <span>End: {format(endDate, 'MMM dd, yyyy')}</span>}
          {!startDate && !endDate && (
            <span className='text-muted-foreground'>Not scheduled</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'teamSize',
    header: 'Team',
    cell: ({ row }) => {
      const teamSize = row.getValue('teamSize') as number;
      return (
        <div className='flex items-center'>
          <span className='font-medium'>{teamSize}</span>
          <span className='text-muted-foreground ml-1 text-sm'>
            {teamSize === 1 ? 'member' : 'members'}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'lastActivity',
    header: 'Last Activity',
    cell: ({ row }) => {
      const lastActivity = row.getValue('lastActivity') as Date | null;
      if (!lastActivity)
        return <span className='text-muted-foreground'>No activity</span>;

      return (
        <span className='text-sm'>{format(lastActivity, 'MMM dd, yyyy')}</span>
      );
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(project.id)}
            >
              Copy project ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                <Eye className='mr-2 h-4 w-4' />
                View project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/projects/${project.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-red-600'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Planning', value: 'planning' },
      { label: 'Active', value: 'active' },
      { label: 'On Hold', value: 'on_hold' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'Archived', value: 'archived' }
    ]
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    placeholder: 'All Priorities',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Urgent', value: 'urgent' }
    ]
  },
  {
    key: 'wcagLevel',
    label: 'WCAG Level',
    type: 'select',
    placeholder: 'All Levels',
    options: [
      { label: 'Level A', value: 'A' },
      { label: 'Level AA', value: 'AA' },
      { label: 'Level AAA', value: 'AAA' }
    ]
  },
  {
    key: 'billingType',
    label: 'Billing Type',
    type: 'select',
    placeholder: 'All Types',
    options: [
      { label: 'Hourly', value: 'hourly' },
      { label: 'Fixed', value: 'fixed' },
      { label: 'Milestone', value: 'milestone' }
    ]
  }
];

interface ProjectsOverviewTableProps {
  data: ProjectWithDetails[];
}

export function ProjectsOverviewTable({ data }: ProjectsOverviewTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey='name'
      searchPlaceholder='Search projects...'
      filters={filters}
      enableExport={true}
      title='Projects Overview'
      description='Comprehensive view of all projects with advanced filtering and management capabilities'
    />
  );
}

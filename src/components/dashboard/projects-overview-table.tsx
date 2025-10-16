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
import { DataTable } from '@/components/ui/data-table';
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

// Removed unused color constants - priorityColors and wcagLevelColors

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
        <div className='flex max-w-[200px] flex-col'>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className='truncate font-medium hover:underline'
          >
            {project.name}
          </Link>
          {project.description && (
            <p className='text-muted-foreground mt-1 line-clamp-1 text-sm'>
              {project.description}
            </p>
          )}
        </div>
      );
    },
    size: 200
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: ({ row }) => {
      const client = row.original.client;
      if (!client)
        return <span className='text-muted-foreground'>No client</span>;

      return (
        <div className='flex max-w-[140px] items-center space-x-2'>
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
          <div className='flex min-w-0 flex-col'>
            <span className='truncate font-medium'>{client.name}</span>
            <span className='text-muted-foreground truncate text-sm'>
              {client.company}
            </span>
          </div>
        </div>
      );
    },
    size: 140
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
    },
    size: 100
  },
  //   {
  //     accessorKey: 'priority',
  //     header: 'Priority',
  //     cell: ({ row }) => {
  //       const priority = row.getValue('priority') as string;
  //       return (
  //         <Badge
  //           className={priorityColors[priority as keyof typeof priorityColors]}
  //         >
  //           {priority.toUpperCase()}
  //         </Badge>
  //       );
  //     },
  //     size: 90,
  //   },
  //   {
  //     accessorKey: 'wcagLevel',
  //     header: 'WCAG Level',
  //     cell: ({ row }) => {
  //       const level = row.getValue('wcagLevel') as string;
  //       return (
  //         <Badge
  //           className={wcagLevelColors[level as keyof typeof wcagLevelColors]}
  //         >
  //           {level}
  //         </Badge>
  //       );
  //     },
  //     size: 90,
  //   },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number;
      return (
        <div className='flex items-center space-x-2'>
          <Progress value={progress} className='w-[50px]' />
          <span className='text-sm font-medium'>{progress}%</span>
        </div>
      );
    },
    size: 100
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
    },
    size: 110
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
    },
    size: 110
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
    },
    size: 130
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
    },
    size: 100
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
    },
    size: 110
  },
  {
    id: 'actions',
    enableHiding: false,
    size: 60,
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

// Temporarily removed filters until advanced DataTable is implemented

interface ProjectsOverviewTableProps {
  data: ProjectWithDetails[];
}

export function ProjectsOverviewTable({
  data = []
}: ProjectsOverviewTableProps) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className='w-full'>
      <DataTable columns={columns} data={safeData} />
    </div>
  );
}

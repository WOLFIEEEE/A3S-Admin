'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
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
import { IssueWithRelations } from '@/lib/db/queries/issues';

const severityColors = {
  '1_critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  '2_high':
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  '3_medium':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  '4_low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const devStatusColors = {
  not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  '3rd_party':
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  wont_fix: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const qaStatusColors = {
  not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  fixed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  verified:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  '3rd_party':
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const issueTypeColors = {
  keyboard_navigation:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  screen_reader:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  color_contrast:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  focus_management:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  aria_labels: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  semantic_markup:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  form_validation:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  multimedia: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export const columns: ColumnDef<IssueWithRelations>[] = [
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
    accessorKey: 'issueTitle',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Issue Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const issue = row.original;
      return (
        <div className='flex max-w-[300px] flex-col'>
          <Link
            href={`/dashboard/issues/${issue.id}`}
            className='line-clamp-1 font-medium hover:underline'
          >
            {issue.issueTitle}
          </Link>
          {issue.issueDescription && (
            <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
              {issue.issueDescription}
            </p>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'project',
    header: 'Project',
    cell: ({ row }) => {
      const project = row.original.project;
      return project?.id || '';
    },
    filterFn: (row, id, value) => {
      const project = row.original.project;
      if (!project) return false;
      return project.id === value;
    },
    enableHiding: true
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => {
      const severity = row.getValue('severity') as string;
      const severityLabels = {
        '1_critical': 'Critical',
        '2_high': 'High',
        '3_medium': 'Medium',
        '4_low': 'Low'
      };
      return (
        <Badge
          className={severityColors[severity as keyof typeof severityColors]}
        >
          {severityLabels[severity as keyof typeof severityLabels]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'issueType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('issueType') as string;
      const typeLabels = {
        keyboard_navigation: 'Keyboard',
        screen_reader: 'Screen Reader',
        color_contrast: 'Color Contrast',
        focus_management: 'Focus',
        aria_labels: 'ARIA Labels',
        semantic_markup: 'Semantic',
        form_validation: 'Form',
        multimedia: 'Multimedia',
        other: 'Other'
      };
      return (
        <Badge
          className={issueTypeColors[type as keyof typeof issueTypeColors]}
        >
          {typeLabels[type as keyof typeof typeLabels]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'devStatus',
    header: 'Dev Status',
    cell: ({ row }) => {
      const status = row.getValue('devStatus') as string;
      const statusLabels = {
        not_started: 'Not Started',
        in_progress: 'In Progress',
        done: 'Done',
        blocked: 'Blocked',
        '3rd_party': '3rd Party',
        wont_fix: "Won't Fix"
      };
      return (
        <Badge
          className={devStatusColors[status as keyof typeof devStatusColors]}
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'qaStatus',
    header: 'QA Status',
    cell: ({ row }) => {
      const status = row.getValue('qaStatus') as string;
      const statusLabels = {
        not_started: 'Not Started',
        in_progress: 'In Progress',
        fixed: 'Fixed',
        verified: 'Verified',
        failed: 'Failed',
        '3rd_party': '3rd Party'
      };
      return (
        <Badge
          className={qaStatusColors[status as keyof typeof qaStatusColors]}
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'conformanceLevel',
    header: 'WCAG Level',
    cell: ({ row }) => {
      const level = row.getValue('conformanceLevel') as string;
      const levelColors = {
        level_a:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        level_aa:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        level_aaa:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
      return (
        <Badge className={levelColors[level as keyof typeof levelColors]}>
          {level.replace('level_', '').toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'wcagCriterion',
    header: 'WCAG Criterion',
    cell: ({ row }) => {
      const criterion = row.getValue('wcagCriterion') as string | null;
      if (!criterion)
        return <span className='text-muted-foreground'>Not specified</span>;
      return <span className='font-mono text-sm'>{criterion}</span>;
    }
  },
  {
    accessorKey: 'testingMonth',
    header: 'Testing Period',
    cell: ({ row }) => {
      const month = row.getValue('testingMonth') as string | null;
      const year = row.original.testingYear;

      if (!month || !year)
        return <span className='text-muted-foreground'>Not set</span>;

      return (
        <span className='text-sm'>
          {month} {year}
        </span>
      );
    }
  },
  {
    accessorKey: 'isDuplicate',
    header: 'Duplicate',
    cell: ({ row }) => {
      const isDuplicate = row.getValue('isDuplicate') as boolean;
      return isDuplicate ? (
        <Badge variant='outline' className='text-orange-600'>
          Duplicate
        </Badge>
      ) : null;
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <span className='text-sm'>{format(date, 'MMM dd, yyyy')}</span>;
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date;
      return <span className='text-sm'>{format(date, 'MMM dd, yyyy')}</span>;
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const issue = row.original;

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
              onClick={() => navigator.clipboard.writeText(issue.id)}
            >
              Copy issue ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/issues/${issue.id}`}>
                <Eye className='mr-2 h-4 w-4' />
                View issue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/issues/${issue.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit issue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className='mr-2 h-4 w-4' />
              Add comment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

// Temporarily removed filters until advanced DataTable is implemented

interface IssuesOverviewTableProps {
  data: IssueWithRelations[];
}

export function IssuesOverviewTable({ data = [] }: IssuesOverviewTableProps) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className='w-full'>
      <DataTable columns={columns} data={safeData} />
    </div>
  );
}

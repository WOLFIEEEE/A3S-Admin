'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable, FilterConfig } from '@/components/ui/data-table';
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
  automated_tools:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  text_spacing: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  browser_zoom:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
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
    enableHiding: false,
    size: 50
  },
  {
    accessorKey: 'issueTitle',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 p-0 font-medium'
        >
          Issue Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const issue = row.original;
      return (
        <div className='flex max-w-[350px] min-w-[280px] flex-col'>
          <Link
            href={`/dashboard/issues/${issue.id}`}
            className='line-clamp-1 text-sm font-medium hover:underline'
          >
            {issue.issueTitle}
          </Link>
          {issue.issueDescription && (
            <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
              {issue.issueDescription}
            </p>
          )}
        </div>
      );
    },
    size: 300
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
          variant='secondary'
        >
          {severityLabels[severity as keyof typeof severityLabels]}
        </Badge>
      );
    },
    size: 100
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
        automated_tools: 'Automated',
        text_spacing: 'Text Spacing',
        browser_zoom: 'Browser Zoom',
        other: 'Other'
      };
      return (
        <Badge
          className={issueTypeColors[type as keyof typeof issueTypeColors]}
          variant='secondary'
        >
          {typeLabels[type as keyof typeof typeLabels]}
        </Badge>
      );
    },
    size: 120
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
          variant='secondary'
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      );
    },
    size: 120
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
          variant='secondary'
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      );
    },
    size: 120
  },
  {
    accessorKey: 'conformanceLevel',
    header: 'WCAG Level',
    cell: ({ row }) => {
      const level = row.getValue('conformanceLevel') as string;
      if (!level)
        return <span className='text-muted-foreground text-sm'>Not set</span>;

      const levelColors = {
        A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        AA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        AAA: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
      return (
        <Badge
          className={levelColors[level as keyof typeof levelColors]}
          variant='secondary'
        >
          {level}
        </Badge>
      );
    },
    size: 100
  },
  {
    accessorKey: 'failedWcagCriteria',
    header: 'WCAG Criteria',
    cell: ({ row }) => {
      const criteria = row.getValue('failedWcagCriteria') as string[] | null;
      if (!criteria || criteria.length === 0) {
        return (
          <span className='text-muted-foreground text-sm'>Not specified</span>
        );
      }
      return (
        <div className='flex flex-wrap gap-1'>
          {criteria.slice(0, 2).map((criterion, index) => (
            <Badge key={index} variant='outline' className='text-xs'>
              {criterion}
            </Badge>
          ))}
          {criteria.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{criteria.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    size: 130
  },
  {
    accessorKey: 'testingMonth',
    header: 'Testing Period',
    cell: ({ row }) => {
      const month = row.getValue('testingMonth') as string | null;
      const year = row.original.testingYear;

      if (!month || !year)
        return <span className='text-muted-foreground text-sm'>Not set</span>;

      return (
        <span className='text-sm'>
          {month} {year}
        </span>
      );
    },
    size: 120
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
    },
    size: 100
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 p-0 font-medium'
        >
          Created
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <span className='text-sm'>{format(date, 'MMM dd, yyyy')}</span>;
    },
    size: 110
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date;
      return <span className='text-sm'>{format(date, 'MMM dd, yyyy')}</span>;
    },
    size: 120
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
    },
    size: 50
  }
];

const filters: FilterConfig[] = [
  {
    key: 'severity',
    label: 'Severity',
    type: 'select',
    placeholder: 'All Severities',
    options: [
      { label: 'Critical', value: '1_critical' },
      { label: 'High', value: '2_high' },
      { label: 'Medium', value: '3_medium' },
      { label: 'Low', value: '4_low' }
    ]
  },
  {
    key: 'issueType',
    label: 'Issue Type',
    type: 'select',
    placeholder: 'All Types',
    options: [
      { label: 'Keyboard Navigation', value: 'keyboard_navigation' },
      { label: 'Screen Reader', value: 'screen_reader' },
      { label: 'Color Contrast', value: 'color_contrast' },
      { label: 'Automated Tools', value: 'automated_tools' },
      { label: 'Text Spacing', value: 'text_spacing' },
      { label: 'Browser Zoom', value: 'browser_zoom' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    key: 'devStatus',
    label: 'Dev Status',
    type: 'select',
    placeholder: 'All Dev Statuses',
    options: [
      { label: 'Not Started', value: 'not_started' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Done', value: 'done' },
      { label: 'Blocked', value: 'blocked' },
      { label: '3rd Party', value: '3rd_party' },
      { label: "Won't Fix", value: 'wont_fix' }
    ]
  },
  {
    key: 'qaStatus',
    label: 'QA Status',
    type: 'select',
    placeholder: 'All QA Statuses',
    options: [
      { label: 'Not Started', value: 'not_started' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Fixed', value: 'fixed' },
      { label: 'Verified', value: 'verified' },
      { label: 'Failed', value: 'failed' },
      { label: '3rd Party', value: '3rd_party' }
    ]
  },
  {
    key: 'conformanceLevel',
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
    key: 'isDuplicate',
    label: 'Duplicate Status',
    type: 'select',
    placeholder: 'All Issues',
    options: [
      { label: 'Original Issues', value: 'false' },
      { label: 'Duplicate Issues', value: 'true' }
    ]
  }
];

interface Project {
  id: string;
  name: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    company: string;
    email?: string;
  } | null;
  issueCount?: number;
  criticalIssueCount?: number;
}

interface EnhancedIssuesTableProps {
  data: IssueWithRelations[];
  projects: Project[];
}

export function EnhancedIssuesTable({
  data,
  projects
}: EnhancedIssuesTableProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Filter data based on selected project
  const filteredData = useMemo(() => {
    if (selectedProject === 'all') {
      return data;
    }
    return data.filter((issue) => issue.project?.id === selectedProject);
  }, [data, selectedProject]);

  // Get project statistics
  const projectStats = useMemo(() => {
    const stats = projects.map((project) => {
      const projectIssues = data.filter(
        (issue) => issue.project?.id === project.id
      );
      return {
        ...project,
        totalIssues: projectIssues.length,
        criticalIssues: projectIssues.filter(
          (issue) => issue.severity === '1_critical'
        ).length,
        inProgress: projectIssues.filter(
          (issue) => issue.devStatus === 'in_progress'
        ).length,
        completed: projectIssues.filter(
          (issue) => issue.devStatus === 'done' && issue.qaStatus === 'verified'
        ).length
      };
    });
    return stats;
  }, [data, projects]);

  const selectedProjectData =
    selectedProject === 'all'
      ? null
      : projectStats.find((p) => p.id === selectedProject);

  return (
    <div className='space-y-6'>
      {/* Header with Title and Project Filter */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Accessibility Issues
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Comprehensive view of all accessibility issues with advanced
            filtering and tracking
          </p>
        </div>
      </div>

      {/* Project Filter - Left Aligned */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Filter className='text-muted-foreground h-4 w-4' />
          <span className='text-sm font-medium'>Filter by Project:</span>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className='w-[300px]'>
              <SelectValue placeholder='Select a project' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                All Projects ({data.length} issues)
              </SelectItem>
              {projectStats.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.totalIssues} issues)
                  {project.client && (
                    <span className='text-muted-foreground ml-1'>
                      - {project.client.company}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedProject !== 'all' && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedProject('all')}
            className='flex items-center gap-1'
          >
            <X className='h-3 w-3' />
            Clear Filter
          </Button>
        )}
      </div>

      {/* Project Statistics */}
      {selectedProjectData && (
        <div className='grid grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold'>
                {selectedProjectData.totalIssues}
              </div>
              <div className='text-muted-foreground text-sm'>Total Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='bg-red-50 p-4 text-center dark:bg-red-950/20'>
              <div className='text-2xl font-bold text-red-600'>
                {selectedProjectData.criticalIssues}
              </div>
              <div className='text-muted-foreground text-sm'>Critical</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='bg-blue-50 p-4 text-center dark:bg-blue-950/20'>
              <div className='text-2xl font-bold text-blue-600'>
                {selectedProjectData.inProgress}
              </div>
              <div className='text-muted-foreground text-sm'>In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='bg-green-50 p-4 text-center dark:bg-green-950/20'>
              <div className='text-2xl font-bold text-green-600'>
                {selectedProjectData.completed}
              </div>
              <div className='text-muted-foreground text-sm'>Completed</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issues Table - Let DataTable handle its own scrolling */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey='issueTitle'
        searchPlaceholder='Search issues...'
        filters={filters}
        enableExport={true}
        title='Accessibility Issues'
        description='Comprehensive view of all accessibility issues with advanced filtering and tracking'
      />
    </div>
  );
}

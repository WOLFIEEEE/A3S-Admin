'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ProjectsOverviewTable,
  ProjectWithDetails
} from './projects-overview-table';
import { IssuesOverviewTable } from './issues-overview-table';
import { AccessibilityIssueWithRelations } from '@/types/accessibility';
import { IssueWithRelations } from '@/lib/db/queries/issues';
import {
  IconFolder,
  IconBug,
  IconUsers,
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconTarget
} from '@tabler/icons-react';

interface ComprehensiveOverviewProps {
  projects: ProjectWithDetails[];
  issues: IssueWithRelations[];
  totalClients: number;
  totalProjects: number;
  totalTickets: number;
  activeProjects: number;
  resolvedTickets: number;
  complianceRate: number;
}

export default function ComprehensiveOverview({
  projects,
  issues,
  totalClients,
  totalProjects,
  totalTickets,
  activeProjects,
  resolvedTickets,
  complianceRate
}: ComprehensiveOverviewProps) {
  // Calculate additional metrics
  const criticalIssues = issues.filter(
    (issue) => issue.severity === '1_critical'
  ).length;
  const highIssues = issues.filter(
    (issue) => issue.severity === '2_high'
  ).length;
  const inProgressIssues = issues.filter(
    (issue) => issue.devStatus === 'in_progress'
  ).length;
  const blockedIssues = issues.filter(
    (issue) => issue.devStatus === 'blocked'
  ).length;
  const verifiedIssues = issues.filter(
    (issue) => issue.qaStatus === 'verified'
  ).length;

  const projectsByStatus = {
    active: projects.filter((p) => p.status === 'active').length,
    planning: projects.filter((p) => p.status === 'planning').length,
    onHold: projects.filter((p) => p.status === 'on_hold').length,
    completed: projects.filter((p) => p.status === 'completed').length
  };

  const projectsByPriority = {
    urgent: projects.filter((p) => p.priority === 'urgent').length,
    high: projects.filter((p) => p.priority === 'high').length,
    medium: projects.filter((p) => p.priority === 'medium').length,
    low: projects.filter((p) => p.priority === 'low').length
  };

  return (
    <div className='space-y-6'>
      {/* Key Metrics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clients</CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalClients}</div>
            <p className='text-muted-foreground text-xs'>
              Active client relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Projects
            </CardTitle>
            <IconFolder className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeProjects}</div>
            <p className='text-muted-foreground text-xs'>
              Out of {totalProjects} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Critical Issues
            </CardTitle>
            <IconAlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {criticalIssues}
            </div>
            <p className='text-muted-foreground text-xs'>
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Compliance Rate
            </CardTitle>
            <IconTarget className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complianceRate}%</div>
            <p className='text-muted-foreground text-xs'>
              {verifiedIssues} of {totalTickets} issues resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <IconClock className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {inProgressIssues}
            </div>
            <p className='text-muted-foreground text-xs'>
              Issues being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Blocked Issues
            </CardTitle>
            <IconBug className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {blockedIssues}
            </div>
            <p className='text-muted-foreground text-xs'>
              Need attention to proceed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              High Priority Issues
            </CardTitle>
            <IconTrendingUp className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {highIssues}
            </div>
            <p className='text-muted-foreground text-xs'>
              High severity accessibility issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Verified Issues
            </CardTitle>
            <IconCheck className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {verifiedIssues}
            </div>
            <p className='text-muted-foreground text-xs'>
              QA verified and completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Projects by Status</CardTitle>
            <CardDescription>
              Current distribution of project statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Active</span>
                <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                  {projectsByStatus.active}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Planning</span>
                <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                  {projectsByStatus.planning}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>On Hold</span>
                <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'>
                  {projectsByStatus.onHold}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Completed</span>
                <Badge className='bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'>
                  {projectsByStatus.completed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Projects by Priority</CardTitle>
            <CardDescription>
              Priority distribution across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Urgent</span>
                <Badge className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'>
                  {projectsByPriority.urgent}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>High</span>
                <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'>
                  {projectsByPriority.high}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Medium</span>
                <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                  {projectsByPriority.medium}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Low</span>
                <Badge className='bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'>
                  {projectsByPriority.low}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue='projects' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='projects'>
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value='issues'>Issues ({issues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value='projects' className='space-y-4'>
          <ProjectsOverviewTable data={projects} />
        </TabsContent>

        <TabsContent value='issues' className='space-y-4'>
          <IssuesOverviewTable data={issues} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

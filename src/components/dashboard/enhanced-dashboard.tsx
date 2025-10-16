'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  ProjectsOverviewTable,
  ProjectWithDetails
} from './projects-overview-table';
import { IssuesOverviewTable } from './issues-overview-table';
import { IssueWithRelations } from '@/lib/db/queries/issues';
import {
  IconFolder,
  IconBug,
  IconUsers,
  IconTrendingUp,
  IconAlertTriangle,
  IconChartBar,
  IconActivity,
  IconPlus
} from '@tabler/icons-react';

interface EnhancedDashboardProps {
  projects: ProjectWithDetails[];
  issues: IssueWithRelations[];
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
}

export default function EnhancedDashboard({
  projects = [],
  issues = [],
  totalClients,
  totalProjects,
  activeProjects
}: EnhancedDashboardProps) {
  // Ensure data is always an array
  const safeProjects = React.useMemo(
    () => (Array.isArray(projects) ? projects : []),
    [projects]
  );
  const safeIssues = React.useMemo(
    () => (Array.isArray(issues) ? issues : []),
    [issues]
  );

  // Calculate metrics
  const criticalIssues = safeIssues.filter(
    (issue) => issue.severity === '1_critical'
  ).length;
  const highIssues = safeIssues.filter(
    (issue) => issue.severity === '2_high'
  ).length;
  const inProgressIssues = safeIssues.filter(
    (issue) => issue.devStatus === 'in_progress'
  ).length;

  // Project status data for charts - show all statuses for consistency
  const projectStatusData = [
    {
      name: 'Active',
      value: safeProjects.filter((p) => p.status === 'active').length,
      fill: 'hsl(var(--chart-1))'
    },
    {
      name: 'Planning',
      value: safeProjects.filter((p) => p.status === 'planning').length,
      fill: 'hsl(var(--chart-2))'
    },
    {
      name: 'On Hold',
      value: safeProjects.filter((p) => p.status === 'on_hold').length,
      fill: 'hsl(var(--chart-3))'
    },
    {
      name: 'Completed',
      value: safeProjects.filter((p) => p.status === 'completed').length,
      fill: 'hsl(var(--chart-4))'
    },
    {
      name: 'Cancelled',
      value: safeProjects.filter((p) => p.status === 'cancelled').length,
      fill: 'hsl(var(--chart-5))'
    }
  ]; // Show all statuses including those with 0 values

  // Issue severity data - use consistent chart colors
  const issueSeverityData = [
    {
      name: 'Critical',
      value: criticalIssues,
      fill: 'hsl(var(--chart-1))'
    },
    {
      name: 'High',
      value: highIssues,
      fill: 'hsl(var(--chart-2))'
    },
    {
      name: 'Medium',
      value: safeIssues.filter((i) => i.severity === '3_medium').length,
      fill: 'hsl(var(--chart-3))'
    },
    {
      name: 'Low',
      value: safeIssues.filter((i) => i.severity === '4_low').length,
      fill: 'hsl(var(--chart-4))'
    }
  ]; // Show all severities including those with 0 values

  // Calculate real monthly progress data from actual project and issue data
  const monthlyProgressData = React.useMemo(() => {
    const currentDate = new Date();
    const months = [];

    // Generate last 6 months of real data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      // Count projects created in this month
      const projectsInMonth = safeProjects.filter((project) => {
        const projectDate = new Date(project.createdAt);
        return (
          projectDate.getMonth() === date.getMonth() &&
          projectDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Count issues created in this month
      const issuesInMonth = safeIssues.filter((issue) => {
        const issueDate = new Date(issue.createdAt);
        return (
          issueDate.getMonth() === date.getMonth() &&
          issueDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Count resolved issues in this month
      const resolvedInMonth = safeIssues.filter((issue) => {
        const issueDate = new Date(issue.updatedAt);
        return (
          issueDate.getMonth() === date.getMonth() &&
          issueDate.getFullYear() === date.getFullYear() &&
          (issue.qaStatus === 'verified' || issue.devStatus === 'done')
        );
      }).length;

      months.push({
        month: monthName,
        projects: projectsInMonth,
        issues: issuesInMonth,
        resolved: resolvedInMonth
      });
    }

    return months;
  }, [safeProjects, safeIssues]);

  // Chart configurations
  const projectStatusConfig = {
    active: {
      label: 'Active',
      color: 'hsl(var(--chart-1))'
    },
    planning: {
      label: 'Planning',
      color: 'hsl(var(--chart-2))'
    },
    onHold: {
      label: 'On Hold',
      color: 'hsl(var(--chart-3))'
    },
    completed: {
      label: 'Completed',
      color: 'hsl(var(--chart-4))'
    }
  } satisfies ChartConfig;

  const progressConfig = {
    projects: {
      label: 'Projects',
      color: 'hsl(var(--chart-1))'
    },
    issues: {
      label: 'Issues Found',
      color: 'hsl(var(--chart-2))'
    },
    resolved: {
      label: 'Issues Resolved',
      color: 'hsl(var(--chart-3))'
    }
  } satisfies ChartConfig;

  return (
    <div className='w-full max-w-none space-y-6'>
      {/* Key Metrics Cards - Full Width */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clients</CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalClients}</div>
            <p className='text-muted-foreground text-xs'>
              Active relationships
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
              Of {totalProjects} total
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
            <p className='text-muted-foreground text-xs'>Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <IconActivity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inProgressIssues}</div>
            <p className='text-muted-foreground text-xs'>Active work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Issues</CardTitle>
            <IconBug className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{safeIssues.length}</div>
            <p className='text-muted-foreground text-xs'>All severities</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Improved Layout */}
      <div className='space-y-6'>
        {/* First Row - Project Status and Issue Severity */}
        <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
          {/* Project Status Distribution */}
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <IconChartBar className='h-5 w-5' />
                Project Status Distribution
              </CardTitle>
              <CardDescription>Current status of all projects</CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              {safeProjects.length > 0 ? (
                <ChartContainer
                  config={projectStatusConfig}
                  className='mx-auto aspect-square max-h-[350px]'
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={projectStatusData}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                    >
                      {projectStatusData.map((entry, _index) => (
                        <Cell
                          key={`cell-${_index}`}
                          fill={entry.fill}
                          className='fill-current dark:fill-white'
                        />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey='name' />}
                      className='flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center'
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className='text-muted-foreground flex h-[350px] items-center justify-center'>
                  <div className='text-center'>
                    <IconFolder className='mx-auto mb-2 h-12 w-12 opacity-50' />
                    <p className='text-sm'>No project data available</p>
                  </div>
                </div>
              )}

              {/* Accessible Table Alternative */}
              <div className='mt-4'>
                <h4 className='sr-only'>Project Status Data Table</h4>
                <div className='overflow-hidden rounded-md border'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-3 py-2 text-left font-medium'>
                          Status
                        </th>
                        <th className='px-3 py-2 text-right font-medium'>
                          Count
                        </th>
                        <th className='px-3 py-2 text-right font-medium'>
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectStatusData.map((item, _index) => (
                        <tr key={_index} className='border-t'>
                          <td className='px-3 py-2'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='h-3 w-3 rounded-full'
                                style={{ backgroundColor: item.fill }}
                              />
                              {item.name}
                            </div>
                          </td>
                          <td className='px-3 py-2 text-right'>{item.value}</td>
                          <td className='px-3 py-2 text-right'>
                            {safeProjects.length > 0
                              ? Math.round(
                                  (item.value / safeProjects.length) * 100
                                )
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue Severity Breakdown */}
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <IconAlertTriangle className='h-5 w-5' />
                Issue Severity Breakdown
              </CardTitle>
              <CardDescription>
                Distribution of issues by severity level
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              {safeIssues.length > 0 ? (
                <ChartContainer config={progressConfig} className='h-[350px]'>
                  <BarChart
                    data={issueSeverityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      className='text-foreground'
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      className='text-foreground'
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey='value'
                      fill='var(--color-projects)'
                      className='fill-current dark:fill-white'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className='text-muted-foreground flex h-[350px] items-center justify-center'>
                  <div className='text-center'>
                    <IconBug className='mx-auto mb-2 h-12 w-12 opacity-50' />
                    <p className='text-sm'>No issue data available</p>
                  </div>
                </div>
              )}

              {/* Accessible Table Alternative */}
              <div className='mt-4'>
                <h4 className='sr-only'>Issue Severity Data Table</h4>
                <div className='overflow-hidden rounded-md border'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='px-3 py-2 text-left font-medium'>
                          Severity
                        </th>
                        <th className='px-3 py-2 text-right font-medium'>
                          Count
                        </th>
                        <th className='px-3 py-2 text-right font-medium'>
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueSeverityData.map((item, _index) => (
                        <tr key={_index} className='border-t'>
                          <td className='px-3 py-2'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='h-3 w-3 rounded-full'
                                style={{ backgroundColor: item.fill }}
                              />
                              {item.name}
                            </div>
                          </td>
                          <td className='px-3 py-2 text-right'>{item.value}</td>
                          <td className='px-3 py-2 text-right'>
                            {safeIssues.length > 0
                              ? Math.round(
                                  (item.value / safeIssues.length) * 100
                                )
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Monthly Progress (Full Width) */}
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <IconTrendingUp className='h-5 w-5' />
              Monthly Progress Trend
            </CardTitle>
            <CardDescription>
              Projects and issues trend over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            {monthlyProgressData.some(
              (month) =>
                month.projects > 0 || month.issues > 0 || month.resolved > 0
            ) ? (
              <ChartContainer config={progressConfig} className='h-[350px]'>
                <AreaChart
                  data={monthlyProgressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='month'
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    className='text-foreground'
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    className='text-foreground'
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type='monotone'
                    dataKey='projects'
                    stackId='1'
                    stroke='var(--color-projects)'
                    fill='var(--color-projects)'
                    className='fill-current dark:fill-white'
                    fillOpacity={0.6}
                  />
                  <Area
                    type='monotone'
                    dataKey='issues'
                    stackId='1'
                    stroke='var(--color-issues)'
                    fill='var(--color-issues)'
                    className='fill-current dark:fill-white'
                    fillOpacity={0.6}
                  />
                  <Area
                    type='monotone'
                    dataKey='resolved'
                    stackId='1'
                    stroke='var(--color-resolved)'
                    fill='var(--color-resolved)'
                    className='fill-current dark:fill-white'
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className='text-muted-foreground flex h-[350px] items-center justify-center'>
                <div className='text-center'>
                  <IconTrendingUp className='mx-auto mb-2 h-12 w-12 opacity-50' />
                  <p className='text-sm'>No monthly progress data available</p>
                </div>
              </div>
            )}

            {/* Accessible Table Alternative */}
            <div className='mt-4'>
              <h4 className='sr-only'>Monthly Progress Data Table</h4>
              <div className='overflow-hidden rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-3 py-2 text-left font-medium'>Month</th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Projects
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Issues Found
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Issues Resolved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyProgressData.map((item, _index) => (
                      <tr key={_index} className='border-t'>
                        <td className='px-3 py-2 font-medium'>{item.month}</td>
                        <td className='px-3 py-2 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <div className='bg-chart-1 h-3 w-3 rounded-full' />
                            {item.projects}
                          </div>
                        </td>
                        <td className='px-3 py-2 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <div className='bg-chart-2 h-3 w-3 rounded-full' />
                            {item.issues}
                          </div>
                        </td>
                        <td className='px-3 py-2 text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <div className='bg-chart-3 h-3 w-3 rounded-full' />
                            {item.resolved}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Section */}
      <Tabs defaultValue='projects' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='projects'>Projects Overview</TabsTrigger>
          <TabsTrigger value='issues'>Issues Overview</TabsTrigger>
        </TabsList>

        <TabsContent value='projects' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <IconFolder className='h-5 w-5' />
                    Projects Overview
                  </CardTitle>
                  <CardDescription>
                    Comprehensive view of all projects with advanced filtering
                    and management capabilities
                  </CardDescription>
                </div>
                <Link href='/dashboard/projects/new'>
                  <Button className='flex items-center gap-2'>
                    <IconPlus className='h-4 w-4' />
                    New Project
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='min-h-[500px]'>
                <ProjectsOverviewTable data={safeProjects} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='issues' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <IconBug className='h-5 w-5' />
                    Issues Overview
                  </CardTitle>
                  <CardDescription>
                    Accessibility issues across all projects with advanced
                    filtering and tracking capabilities
                  </CardDescription>
                </div>
                <Link href='/dashboard/tickets/new'>
                  <Button className='flex items-center gap-2'>
                    <IconPlus className='h-4 w-4' />
                    New Issue
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='min-h-[500px]'>
                <IssuesOverviewTable data={safeIssues} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

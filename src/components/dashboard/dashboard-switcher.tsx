'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import CompactClientProjectFlow from './compact-client-project-flow';
import {
  IconDashboard,
  IconLayoutDashboard,
  IconChartBar,
  IconUsers,
  IconTicket,
  IconTrendingUp,
  IconCalendar,
  IconShield,
  IconActivity,
  IconTarget,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconFileText,
  IconSettings,
  IconChevronDown
} from '@tabler/icons-react';

interface DashboardView {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const dashboardViews: DashboardView[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Key metrics and system overview',
    icon: IconDashboard,
    badge: 'Default'
  },
  {
    id: 'compact',
    title: 'Compact View',
    description: 'Unified clients and projects flow',
    icon: IconLayoutDashboard,
    badge: 'New'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Detailed performance analytics',
    icon: IconChartBar,
    badge: 'Insights'
  },
  {
    id: 'clients',
    title: 'Client Management',
    description: 'Client insights and management',
    icon: IconUsers,
    badge: 'Active'
  },
  {
    id: 'projects',
    title: 'Project Tracking',
    description: 'Project progress and milestones',
    icon: IconTarget,
    badge: 'Hot'
  },
  {
    id: 'compliance',
    title: 'Compliance Center',
    description: 'WCAG compliance monitoring',
    icon: IconShield,
    badge: 'Critical'
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Platform configuration and settings',
    icon: IconSettings,
    badge: 'Admin'
  }
];

interface DashboardSwitcherProps {
  children: React.ReactNode;
  clients?: any[];
  projects?: any[];
}

export default function DashboardSwitcher({
  children,
  clients = [],
  projects = []
}: DashboardSwitcherProps) {
  const [activeView, setActiveView] = useState('overview');

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
  };

  const selectedView =
    dashboardViews.find((view) => view.id === activeView) || dashboardViews[0];

  const renderDashboardContent = () => {
    switch (activeView) {
      case 'overview':
        return children;
      case 'compact':
        return (
          <CompactClientProjectFlow clients={clients} projects={projects} />
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'clients':
        return <ClientManagementView />;
      case 'projects':
        return <ProjectTrackingView />;
      case 'compliance':
        return <ComplianceCenterView />;
      case 'settings':
        return <SystemSettingsView />;
      default:
        return children;
    }
  };

  return (
    <div className='bg-background min-h-screen w-full'>
      {/* Full Page Header */}
      <div className='bg-card/50 supports-[backdrop-filter]:bg-card/50 border-b backdrop-blur'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                A3S Admin Dashboard
              </h1>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Comprehensive accessibility compliance management platform
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='gap-1'>
                <IconActivity className='h-3 w-3' />
                <span className='hidden sm:inline'>Live Data</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard View Selector */}
      <div className='bg-card/30 border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm font-medium'>
                Dashboard View:
              </span>
            </div>
            <div className='w-full sm:w-auto'>
              <Select value={activeView} onValueChange={handleViewChange}>
                <SelectTrigger className='w-full sm:w-[320px]'>
                  <SelectValue>
                    <div className='flex items-center gap-2'>
                      {React.createElement(selectedView.icon, {
                        className: 'h-4 w-4'
                      })}
                      <span className='truncate'>{selectedView.title}</span>
                      {selectedView.badge && (
                        <Badge
                          variant={selectedView.badgeVariant || 'secondary'}
                          className='ml-1 shrink-0 text-xs'
                        >
                          {selectedView.badge}
                        </Badge>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className='w-full sm:w-[320px]'>
                  {dashboardViews.map((view) => {
                    const Icon = view.icon;
                    return (
                      <SelectItem key={view.id} value={view.id}>
                        <div className='flex w-full items-center gap-2'>
                          <Icon className='h-4 w-4 shrink-0' />
                          <div className='flex min-w-0 flex-1 flex-col'>
                            <span className='truncate font-medium'>
                              {view.title}
                            </span>
                            <span className='text-muted-foreground truncate text-xs'>
                              {view.description}
                            </span>
                          </div>
                          {view.badge && (
                            <Badge
                              variant={view.badgeVariant || 'secondary'}
                              className='ml-auto shrink-0 text-xs'
                            >
                              {view.badge}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Full Page */}
      <div className='container mx-auto px-4 py-6'>
        <div className='space-y-6'>{renderDashboardContent()}</div>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView() {
  return (
    <div className='space-y-6'>
      {/* Metrics Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <IconTrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$45,231.89</div>
            <p className='text-muted-foreground text-xs'>
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Project Completion
            </CardTitle>
            <IconCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>85%</div>
            <p className='text-muted-foreground text-xs'>+5% from last month</p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg. Response Time
            </CardTitle>
            <IconClock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2.4h</div>
            <p className='text-muted-foreground text-xs'>
              -12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Client Satisfaction
            </CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>4.8/5</div>
            <p className='text-muted-foreground text-xs'>
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconChartBar className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>
                  Performance charts will be integrated here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Monthly Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconTrendingUp className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Monthly analytics dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Client Management View Component
function ClientManagementView() {
  return (
    <div className='space-y-6'>
      {/* Client Metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clients</CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,234</div>
            <p className='text-muted-foreground text-xs'>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Clients
            </CardTitle>
            <IconCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>987</div>
            <p className='text-muted-foreground text-xs'>+8% from last month</p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              New This Month
            </CardTitle>
            <IconTrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>45</div>
            <p className='text-muted-foreground text-xs'>
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Analytics */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconUsers className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Client distribution charts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Client Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconShield className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Client health metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Project Tracking View Component
function ProjectTrackingView() {
  return (
    <div className='space-y-6'>
      {/* Project Metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Projects
            </CardTitle>
            <IconTarget className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-muted-foreground text-xs'>
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <IconCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>89</div>
            <p className='text-muted-foreground text-xs'>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>On Schedule</CardTitle>
            <IconCalendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>134</div>
            <p className='text-muted-foreground text-xs'>
              85% of active projects
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>At Risk</CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>22</div>
            <p className='text-muted-foreground text-xs'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Analytics */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconCalendar className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Project timeline visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconTarget className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Resource allocation charts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Compliance Center View Component
function ComplianceCenterView() {
  return (
    <div className='space-y-6'>
      {/* Compliance Metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              WCAG AA Compliance
            </CardTitle>
            <IconShield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>94%</div>
            <p className='text-muted-foreground text-xs'>+3% from last month</p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Critical Issues
            </CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>23</div>
            <p className='text-muted-foreground text-xs'>-8% from last month</p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Audits Completed
            </CardTitle>
            <IconCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>67</div>
            <p className='text-muted-foreground text-xs'>
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Compliance Score
            </CardTitle>
            <IconTrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>8.7/10</div>
            <p className='text-muted-foreground text-xs'>
              +0.3 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Analytics */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Compliance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconShield className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Compliance trend analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Issue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconFileText className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>Issue distribution charts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// System Settings View Component
function SystemSettingsView() {
  return (
    <div className='space-y-6'>
      {/* System Metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Status</CardTitle>
            <IconSettings className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>Online</div>
            <p className='text-muted-foreground text-xs'>
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Database Health
            </CardTitle>
            <IconCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>99.9%</div>
            <p className='text-muted-foreground text-xs'>Uptime this month</p>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-muted-foreground text-xs'>Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* System Management */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconSettings className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>System configuration panel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex h-[250px] items-center justify-center sm:h-[300px]'>
              <div className='text-center'>
                <IconUsers className='mx-auto mb-2 h-12 w-12' />
                <p className='text-sm'>User management interface</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

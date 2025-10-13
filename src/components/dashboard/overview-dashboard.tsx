import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingUp,
  IconUsers,
  IconTicket,
  IconFolder,
  IconCheck
} from '@tabler/icons-react';
import React from 'react';

interface OverviewDashboardProps {
  totalClients: number;
  totalProjects: number;
  totalTickets: number;
  activeProjects: number;
  resolvedTickets: number;
  complianceRate: number;
}

export default function OverviewDashboard({
  totalClients,
  totalProjects,
  totalTickets,
  activeProjects,
  resolvedTickets,
  complianceRate
}: OverviewDashboardProps) {
  return (
    <div className='space-y-6'>
      {/* Key Metrics Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {totalClients}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconUsers className='h-3 w-3' />
                Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Client management <IconUsers className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Accessibility compliance clients
            </div>
          </CardFooter>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {activeProjects}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconFolder className='h-3 w-3' />
                In Progress
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Projects ongoing <IconFolder className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Accessibility compliance projects
            </div>
          </CardFooter>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {totalTickets}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconTicket className='h-3 w-3' />
                All Tickets
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Issue tracking <IconTicket className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              Accessibility compliance tickets
            </div>
          </CardFooter>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardDescription>Resolution Rate</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {complianceRate}%
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <IconCheck className='h-3 w-3' />
                Success
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Tickets resolved <IconCheck className='size-4' />
            </div>
            <div className='text-muted-foreground'>
              WCAG compliance success rate
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Additional Information Cards */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across the platform
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className='text-muted-foreground text-sm'>
              Dashboard is ready for real-time data integration
            </div>
          </CardFooter>
        </Card>

        <Card className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className='text-muted-foreground text-sm'>
              Manage clients, projects, and tickets from the sidebar
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { IconPlus, IconUsers, IconHierarchy } from '@tabler/icons-react';
import Link from 'next/link';
import TeamManagementDashboard from '@/features/teams/components/team-management-dashboard';

export const metadata: Metadata = {
  title: 'A3S Admin | Team Management',
  description: 'Manage teams, members, and organizational structure'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TeamsPage() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        <div className='flex-shrink-0'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Team Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Team Management</h1>
            <p className='text-muted-foreground mt-2'>
              Manage your internal and external teams, members, and
              organizational structure
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Link href='/dashboard/teams/organization-chart'>
              <Button variant='outline'>
                <IconHierarchy className='mr-2 h-4 w-4' />
                Organization Chart
              </Button>
            </Link>
            <Link href='/dashboard/teams/new-member'>
              <Button variant='outline'>
                <IconUsers className='mr-2 h-4 w-4' />
                Add Member
              </Button>
            </Link>
            <Link href='/dashboard/teams/new'>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                New Team
              </Button>
            </Link>
          </div>
        </div>

        <div className='flex-1'>
          <TeamManagementDashboard />
        </div>
      </div>
    </PageContainer>
  );
}

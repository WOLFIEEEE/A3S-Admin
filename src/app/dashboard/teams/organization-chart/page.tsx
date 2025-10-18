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
import OrganizationChart from '@/features/teams/components/organization-chart';

export const metadata: Metadata = {
  title: 'A3S Admin | Organization Chart',
  description: 'View the organizational hierarchy and reporting structure'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OrganizationChartPage() {
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
                <BreadcrumbLink href='/dashboard/teams'>
                  Team Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Organization Chart</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='text-center'>
          <h1 className='text-3xl font-bold'>Organization Chart</h1>
          <p className='text-muted-foreground mt-2'>
            Visual representation of your organizational hierarchy and reporting
            structure
          </p>
        </div>

        <div className='flex-1'>
          <OrganizationChart />
        </div>
      </div>
    </PageContainer>
  );
}

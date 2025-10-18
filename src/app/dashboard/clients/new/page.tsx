import PageContainer from '@/components/layout/page-container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import NewClientPageClient from '@/features/clients/components/new-client-page';

export const metadata = {
  title: 'A3S Admin | New Client',
  description: 'Add a new client to the A3S accessibility compliance platform'
};

// Force dynamic rendering - child component may fetch data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ClientNewPage() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        {/* Breadcrumb Navigation */}
        <div className='flex-shrink-0'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard/clients'>
                  Clients
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Client</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Client Form - Full Width */}
        <div className='w-full flex-1'>
          <NewClientPageClient />
        </div>
      </div>
    </PageContainer>
  );
}

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
import ClientDetailView from '@/features/clients/components/client-detail-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Client Details',
  description: 'View and manage client information and projects'
};

interface ClientDetailPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientDetailPage({
  params
}: ClientDetailPageProps) {
  const { clientId } = await params;
  return (
    <PageContainer scrollable={true}>
      <div className='flex min-h-full w-full flex-col space-y-6'>
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
                <BreadcrumbPage>Client Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Client Detail View */}
        <div className='w-full flex-1'>
          <ClientDetailView clientId={clientId} />
        </div>
      </div>
    </PageContainer>
  );
}

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
import TicketDetailView from '@/features/tickets/components/ticket-detail-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Ticket Details',
  description: 'View and manage ticket information, comments, and attachments'
};

interface TicketDetailPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function TicketDetailPage({
  params
}: TicketDetailPageProps) {
  const { ticketId } = await params;

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
                <BreadcrumbLink href='/dashboard/tickets'>
                  Tickets
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Ticket Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Ticket Detail View */}
        <div className='w-full flex-1'>
          <TicketDetailView ticketId={ticketId} />
        </div>
      </div>
    </PageContainer>
  );
}

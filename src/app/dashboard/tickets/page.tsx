import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TicketListing from '@/features/tickets/components/ticket-listing';
import { Ticket } from '@/types';

export const metadata = {
  title: 'A3S Admin | Tickets',
  description: 'Manage accessibility compliance tickets across all projects'
};

async function fetchTickets(): Promise<Ticket[]> {
  try {
    // Use server-side database query instead of API call
    const { getAllTickets } = await import('@/lib/db/queries/tickets');
    const result = await getAllTickets({ limit: 1000 });
    return result.tickets;
  } catch (error) {
    // Error fetching tickets - return empty array
    return [];
  }
}

export default async function TicketsPage() {
  const tickets = await fetchTickets();

  return (
    <PageContainer scrollable={true}>
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='flex items-start justify-between'>
          <Heading
            title='All Tickets'
            description='Manage accessibility compliance tickets across all projects'
          />
        </div>
        <Separator />
        <div className='w-full'>
          <TicketListing tickets={tickets} showProjectInfo={true} />
        </div>
      </div>
    </PageContainer>
  );
}

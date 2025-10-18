import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import TicketListing from '@/features/tickets/components/ticket-listing';

export const metadata = {
  title: 'A3S Admin | Tickets',
  description: 'Manage accessibility compliance tickets across all projects'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TicketsPage() {
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <Heading
              title='All Tickets'
              description='Manage accessibility compliance tickets across all projects'
            />
          </div>
          <Link href='/dashboard/tickets/new'>
            <Button className='flex items-center gap-2'>
              <IconPlus className='h-4 w-4' />
              Create Ticket
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Tickets Listing with Real Data */}
        <TicketListing showProjectInfo={true} showHeader={false} />
      </div>
    </PageContainer>
  );
}

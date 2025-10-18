import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ClientListing from '@/features/clients/components/client-listing';
import { Client } from '@/types';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export const metadata = {
  title: 'A3S Admin | Clients',
  description: 'Manage your A3S accessibility compliance clients'
};

// Force dynamic rendering - this page fetches data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchClients(): Promise<Client[]> {
  try {
    // Use server-side database query instead of API call
    const { getAllClients } = await import('@/lib/db/queries/clients');
    const result = await getAllClients({ limit: 1000 });
    return result.clients;
  } catch (error) {
    // Error fetching clients - return empty array
    return [];
  }
}

export default async function ClientsPage() {
  const clients = await fetchClients();

  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        <div className='flex-shrink-0'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Clients'
              description='Manage your A3S accessibility compliance clients'
            />
            <Link href='/dashboard/clients/new'>
              <Button className='flex items-center gap-2'>
                <IconPlus className='h-4 w-4' />
                New Client
              </Button>
            </Link>
          </div>
          <Separator className='mt-4' />
        </div>
        <div className='w-full flex-1'>
          <ClientListing clients={clients} />
        </div>
      </div>
    </PageContainer>
  );
}

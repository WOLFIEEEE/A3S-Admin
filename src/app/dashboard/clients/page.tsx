import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ClientListing from '@/features/clients/components/client-listing';
import { Client } from '@/types';

export const metadata = {
  title: 'A3S Admin | Clients',
  description: 'Manage your A3S accessibility compliance clients'
};

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
    <PageContainer scrollable={true}>
      <div className='flex min-h-full w-full flex-col space-y-6'>
        <div className='flex-shrink-0'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Clients'
              description='Manage your A3S accessibility compliance clients'
            />
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

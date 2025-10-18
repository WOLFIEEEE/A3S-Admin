import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ClientListing from '@/features/clients/components/client-listing';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export const metadata = {
  title: 'A3S Admin | Clients',
  description: 'Manage your A3S accessibility compliance clients'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ClientsPage() {
  return (
    <PageContainer>
      <div className='flex flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <Heading
              title='Clients'
              description='Manage your A3S accessibility compliance clients'
            />
          </div>
          <Link href='/dashboard/clients/new'>
            <Button className='flex items-center gap-2'>
              <IconPlus className='h-4 w-4' />
              New Client
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Clients Listing with Real Data */}
        <div className='flex-1'>
          <ClientListing />
        </div>
      </div>
    </PageContainer>
  );
}

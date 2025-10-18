import { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import ReportsListing from '@/features/reports/components/reports-listing';

export const metadata: Metadata = {
  title: 'A3S Admin | Reports',
  description:
    'Generate and manage accessibility reports with AI-powered content'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ReportsPage() {
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <Heading
              title='Reports'
              description='Generate AI-powered accessibility reports and manage client communications'
            />
          </div>
          <Link href='/dashboard/reports/new'>
            <Button className='flex items-center gap-2'>
              <IconPlus className='h-4 w-4' />
              New Report
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Reports Listing with Real Data */}
        <ReportsListing />
      </div>
    </PageContainer>
  );
}

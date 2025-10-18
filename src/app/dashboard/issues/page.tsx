import PageContainer from '@/components/layout/page-container';
import IssuesListing from '@/features/issues/components/issues-listing';

export const metadata = {
  title: 'A3S Admin | Accessibility Issues',
  description:
    'Manage accessibility issues across all projects with comprehensive filtering and tracking'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function IssuesPage() {
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Issues Listing with Real Data */}
        <IssuesListing />
      </div>
    </PageContainer>
  );
}

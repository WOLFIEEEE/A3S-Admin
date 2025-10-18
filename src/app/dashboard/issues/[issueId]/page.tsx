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
import IssueDetailView from '@/features/issues/components/issue-detail-view';
import { AccessibilityIssueWithRelations } from '@/types/accessibility';

export const metadata: Metadata = {
  title: 'A3S Admin | Issue Details',
  description:
    'View and manage accessibility issue details, comments, and status updates'
};

// Force dynamic rendering - this page fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface IssueDetailPageProps {
  params: Promise<{
    issueId: string;
  }>;
}

async function fetchIssue(
  issueId: string
): Promise<AccessibilityIssueWithRelations | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/issues/${issueId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export default async function IssueDetailPage({
  params
}: IssueDetailPageProps) {
  const { issueId } = await params;
  const issue = await fetchIssue(issueId);

  if (!issue) {
    return (
      <PageContainer>
        <div className='w-full py-12 text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Issue Not Found
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            The accessibility issue you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href='/dashboard/issues'>Issues</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='max-w-[200px] truncate'>
                {issue.issueTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Issue Detail View */}
        <IssueDetailView issue={issue} />
      </div>
    </PageContainer>
  );
}

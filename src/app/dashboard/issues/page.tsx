import PageContainer from '@/components/layout/page-container';
import { EnhancedIssuesTable } from '@/components/dashboard/enhanced-issues-table';
import { IssueWithRelations } from '@/lib/db/queries/issues';
import { getAllProjects } from '@/lib/db/queries/projects';

export const metadata = {
  title: 'A3S Admin | Accessibility Issues',
  description:
    'Manage accessibility issues across all projects with comprehensive filtering and tracking'
};

// Force dynamic rendering - this page fetches data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchIssues(): Promise<IssueWithRelations[]> {
  try {
    // Use server-side database query instead of API call
    const { getIssues } = await import('@/lib/db/queries/issues');
    const result = await getIssues({ limit: 1000 });
    return result.issues;
  } catch (error) {
    // Error fetching issues - return empty array
    return [];
  }
}

async function fetchProjects() {
  try {
    const result = await getAllProjects({ limit: 1000 });
    return result.projects;
  } catch (error) {
    // Error fetching projects - return empty array
    return [];
  }
}

export default async function IssuesPage() {
  const [issues, projects] = await Promise.all([
    fetchIssues(),
    fetchProjects()
  ]);

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <EnhancedIssuesTable data={issues} projects={projects} />
      </div>
    </PageContainer>
  );
}

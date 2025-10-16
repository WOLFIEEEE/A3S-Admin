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
import ProjectDetailView from '@/features/projects/components/project-detail-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Project Details',
  description:
    'View and manage project information, milestones, team, and accessibility issues'
};

interface ProjectDetailPageProps {
  params: Promise<{
    clientId: string;
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { clientId, projectId } = await params;

  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        {/* Breadcrumb Navigation */}
        <div className='flex-shrink-0'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard/clients'>
                  Clients
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/clients/${clientId}`}>
                  Client Details
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Project Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Project Detail View */}
        <div className='w-full flex-1'>
          <ProjectDetailView clientId={clientId} projectId={projectId} />
        </div>
      </div>
    </PageContainer>
  );
}

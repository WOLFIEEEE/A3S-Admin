import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ProjectsOverviewTable,
  ProjectWithDetails
} from '@/components/dashboard/projects-overview-table';
import { getAllProjects } from '@/lib/db/queries/projects';
import { getAllClients } from '@/lib/db/queries/clients';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export const metadata = {
  title: 'A3S Admin | Projects',
  description: 'Manage your accessibility compliance projects'
};

// Force dynamic rendering - this page fetches data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchProjectsData(): Promise<ProjectWithDetails[]> {
  try {
    const [projectsResult] = await Promise.all([
      getAllProjects({ limit: 1000 }),
      getAllClients({ limit: 1000 })
    ]);

    // Transform projects data to match ProjectWithDetails interface with real data
    const transformedProjects: ProjectWithDetails[] =
      projectsResult.projects.map((project) => ({
        ...project,
        progress: project.progressPercentage || 0, // Use real progress from database
        teamSize: 0, // Will be calculated from actual team assignments
        lastActivity: project.updatedAt // Use real last update time
      }));

    return transformedProjects;
  } catch (error) {
    // Error fetching projects - return empty array
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await fetchProjectsData();

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex-shrink-0'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Projects Overview'
              description='Comprehensive view of all projects with advanced filtering and management capabilities'
            />
            <Link href='/dashboard/projects/new'>
              <Button className='flex items-center gap-2'>
                <IconPlus className='h-4 w-4' />
                New Project
              </Button>
            </Link>
          </div>
          <Separator className='mt-4' />
        </div>
        <div className='w-full'>
          <div className='min-h-[500px]'>
            <ProjectsOverviewTable data={projects} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

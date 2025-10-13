import PageContainer from '@/components/layout/page-container';
import {
  ProjectsOverviewTable,
  ProjectWithDetails
} from '@/components/dashboard/projects-overview-table';
import { getAllProjects } from '@/lib/db/queries/projects';
import { getAllClients } from '@/lib/db/queries/clients';

export const metadata = {
  title: 'A3S Admin | Projects',
  description: 'Manage your accessibility compliance projects'
};

async function fetchProjectsData(): Promise<ProjectWithDetails[]> {
  try {
    const [projectsResult, clientsResult] = await Promise.all([
      getAllProjects({ limit: 1000 }),
      getAllClients({ limit: 1000 })
    ]);

    // Transform projects data to match ProjectWithDetails interface
    const transformedProjects: ProjectWithDetails[] =
      projectsResult.projects.map((project) => ({
        ...project,
        progress: Math.floor(Math.random() * 100), // Mock progress for now
        teamSize: Math.floor(Math.random() * 8) + 1, // Mock team size
        lastActivity: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ) // Mock last activity
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
    <PageContainer scrollable={true}>
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <ProjectsOverviewTable data={projects} />
      </div>
    </PageContainer>
  );
}

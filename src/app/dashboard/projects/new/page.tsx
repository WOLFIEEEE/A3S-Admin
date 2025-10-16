import PageContainer from '@/components/layout/page-container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import NewProjectPageClient from '@/features/projects/components/new-project-page';

export const metadata = {
  title: 'A3S Admin | New Project',
  description: 'Add a new project to the A3S accessibility compliance platform'
};

export default function ProjectNewPage() {
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
                <BreadcrumbLink href='/dashboard/projects'>
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Project</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Project Form - Full Width */}
        <div className='w-full flex-1'>
          <NewProjectPageClient />
        </div>
      </div>
    </PageContainer>
  );
}

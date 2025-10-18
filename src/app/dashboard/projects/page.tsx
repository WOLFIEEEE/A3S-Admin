import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import ProjectsListing from '@/features/projects/components/projects-listing';

export const metadata = {
  title: 'A3S Admin | Projects',
  description: 'Manage your accessibility compliance projects'
};

// Force dynamic rendering - child component fetches data from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProjectsPage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <Heading
              title='Projects Overview'
              description='Comprehensive view of all projects with advanced filtering and management capabilities'
            />
          </div>
          <Link href='/dashboard/projects/new'>
            <Button className='flex items-center gap-2'>
              <IconPlus className='h-4 w-4' />
              New Project
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Projects Listing with Real Data */}
        <ProjectsListing />
      </div>
    </PageContainer>
  );
}

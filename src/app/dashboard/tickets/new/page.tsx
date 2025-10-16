import PageContainer from '@/components/layout/page-container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import NewTicketPageClient from '@/features/tickets/components/new-ticket-page';
import { Project, Developer } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'A3S Admin | New Ticket',
  description: 'Create a new accessibility compliance ticket'
};

// Mock data - replace with actual API calls
const mockProjects: Project[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Saguache County Website Audit',
    description: 'WCAG 2.2 AA compliance audit for main county website',
    status: 'active',
    priority: 'high',
    wcagLevel: 'AA',
    projectType: 'audit',
    projectPlatform: 'website',
    techStack: 'wordpress',
    complianceRequirements: ['WCAG 2.2 Level AA Compliance'],
    websiteUrl: 'https://saguachecounty.gov',
    testingMethodology: [
      'Screen reader testing',
      'Keyboard navigation testing'
    ],
    testingSchedule: 'Monthly testing before 15th',
    bugSeverityWorkflow: 'Blocker>High>Medium>Low',
    billingType: 'fixed',
    progressPercentage: 65,
    milestonesCompleted: 3,
    totalMilestones: 5,
    deliverables: ['Audit Report', 'Compliance Certificate'],
    acceptanceCriteria: ['All violations documented'],
    tags: ['government', 'audit'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    lastModifiedBy: 'user-1'
  },
  {
    id: '2',
    clientId: '2',
    name: 'Gilpin County Portal Accessibility',
    description: 'Accessibility improvements for citizen portal',
    status: 'active',
    priority: 'medium',
    wcagLevel: 'AA',
    projectType: 'remediation',
    projectPlatform: 'web_app',
    techStack: 'react',
    complianceRequirements: ['WCAG 2.2 Level AA Compliance'],
    websiteUrl: 'https://gilpincounty.gov',
    testingMethodology: ['Automated testing', 'Manual testing'],
    testingSchedule: 'Weekly testing',
    bugSeverityWorkflow: 'Critical>High>Medium>Low',
    billingType: 'hourly',
    progressPercentage: 30,
    milestonesCompleted: 1,
    totalMilestones: 4,
    deliverables: ['Remediation Plan', 'Testing Results'],
    acceptanceCriteria: ['All issues fixed'],
    tags: ['government', 'portal'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'user-1',
    lastModifiedBy: 'user-1'
  }
];

const mockDevelopers: Developer[] = [
  {
    id: 'dev1',
    name: 'Sarah Chen',
    email: 'sarah@a3s.app',
    role: 'senior',
    skills: ['React', 'WCAG', 'ARIA', 'Screen Readers'],
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dev2',
    name: 'Mike Rodriguez',
    email: 'mike@a3s.app',
    role: 'mid',
    skills: ['Vue', 'Accessibility Testing', 'Color Contrast'],
    isActive: true,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export default async function NewTicketPage({
  searchParams
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  if (!userId) {
    redirect('/auth/sign-in');
  }

  // Get default project if specified in URL
  const defaultProjectId = params.projectId;
  const defaultProject = defaultProjectId
    ? mockProjects.find((p) => p.id === defaultProjectId)
    : undefined;

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
                <BreadcrumbLink href='/dashboard/tickets'>
                  Tickets
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Ticket</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Project Context */}
        {defaultProject && (
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                Creating ticket for: {defaultProject.name}
              </span>
            </div>
            <p className='mt-1 text-xs text-blue-700 dark:text-blue-300'>
              {defaultProject.description}
            </p>
          </div>
        )}

        {/* Ticket Form - Full Width */}
        <div className='w-full flex-1'>
          <NewTicketPageClient
            projectId={defaultProjectId || mockProjects[0].id}
            reporterId={userId}
            developers={mockDevelopers}
          />
        </div>
      </div>
    </PageContainer>
  );
}

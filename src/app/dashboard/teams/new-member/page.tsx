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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconUsers } from '@tabler/icons-react';
import NewTeamMemberForm from '@/features/teams/components/new-team-member-form';

export const metadata: Metadata = {
  title: 'A3S Admin | Add Team Member',
  description: 'Add a new team member to your organization'
};

export default function NewTeamMemberPage() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        <div className='flex-shrink-0'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard/teams'>
                  Team Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add Team Member</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='flex items-center space-x-2'>
          <IconUsers className='h-6 w-6' />
          <div>
            <h1 className='text-3xl font-bold'>Add Team Member</h1>
            <p className='text-muted-foreground mt-2'>
              Add a new member to your team with their role, contact
              information, and employment details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Member Information</CardTitle>
            <CardDescription>
              Fill in the details below to add a new team member to your
              organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTeamMemberForm />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

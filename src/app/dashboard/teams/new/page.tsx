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
import { IconBuilding } from '@tabler/icons-react';
import NewTeamForm from '@/features/teams/components/new-team-form';

export const metadata: Metadata = {
  title: 'Create New Team',
  description: 'Create a new team in your organization'
};

export default function NewTeamPage() {
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
                <BreadcrumbPage>Create New Team</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='flex items-center space-x-2'>
          <IconBuilding className='h-6 w-6' />
          <div>
            <h1 className='text-3xl font-bold'>Create New Team</h1>
            <p className='text-muted-foreground mt-2'>
              Create a new internal or external team to organize your workforce
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new team in your
              organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTeamForm />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

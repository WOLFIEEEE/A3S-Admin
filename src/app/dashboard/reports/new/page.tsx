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
import EnhancedReportGenerator from '@/features/reports/components/enhanced-report-generator';

export const metadata: Metadata = {
  title: 'A3S Admin | New Report',
  description: 'Generate a new AI-powered accessibility report'
};

export default function NewReportPage() {
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
                <BreadcrumbLink href='/dashboard/reports'>
                  Reports
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Report</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Report Generator */}
        <div className='w-full flex-1'>
          <EnhancedReportGenerator />
        </div>
      </div>
    </PageContainer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconFileText,
  IconDownload,
  IconEdit,
  IconLoader2
} from '@tabler/icons-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface Report {
  id: string;
  projectId: string;
  title: string;
  reportType: string;
  status: string;
  sentAt?: string | null;
  sentTo?: string[] | null;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
}

interface ReportStats {
  totalReports: number;
  sentThisMonth: number;
  draftReports: number;
  aiGenerated: number;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  generated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  edited:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
};

const reportTypeLabels = {
  executive_summary: 'Executive Summary',
  technical_report: 'Technical Report',
  compliance_report: 'Compliance Report',
  monthly_progress: 'Monthly Progress',
  custom: 'Custom Report'
};

export default function ReportsListing() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    sentThisMonth: 0,
    draftReports: 0,
    aiGenerated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Use fast API endpoint for better performance
      const response = await fetch('/api/reports/fast?limit=20');

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const result = await response.json();

      if (result.success) {
        const reportsData = result.data || [];
        setReports(reportsData);

        // Calculate stats from the data
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const sentThisMonth = reportsData.filter((report: Report) => {
          if (!report.sentAt) return false;
          const sentDate = new Date(report.sentAt);
          return (
            sentDate.getMonth() === currentMonth &&
            sentDate.getFullYear() === currentYear
          );
        }).length;

        const draftReports = reportsData.filter(
          (report: Report) => report.status === 'draft'
        ).length;
        const aiGenerated = reportsData.filter(
          (report: Report) =>
            report.status === 'generated' ||
            report.status === 'edited' ||
            report.status === 'sent'
        ).length;

        setStats({
          totalReports: reportsData.length,
          sentThisMonth,
          draftReports,
          aiGenerated
        });
      } else {
        setError('Failed to load reports');
      }
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <IconFileText className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>Error loading reports</h3>
          <p className='text-muted-foreground mb-6 text-center'>{error}</p>
          <Button onClick={fetchReports}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Quick Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalReports}</div>
            <p className='text-muted-foreground text-xs'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Sent This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.sentThisMonth}</div>
            <p className='text-muted-foreground text-xs'>Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Draft Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.draftReports}</div>
            <p className='text-muted-foreground text-xs'>Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.aiGenerated}</div>
            <p className='text-muted-foreground text-xs'>
              {stats.totalReports > 0
                ? Math.round((stats.aiGenerated / stats.totalReports) * 100)
                : 0}
              % of all reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Your latest accessibility reports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <IconFileText className='text-muted-foreground mb-4 h-16 w-16' />
              <h3 className='mb-2 text-lg font-medium'>No reports yet</h3>
              <p className='text-muted-foreground mb-6 max-w-md text-center'>
                Create your first AI-powered accessibility report by selecting a
                project and its issues.
              </p>
              <Link href='/dashboard/reports/new'>
                <Button>
                  <IconFileText className='mr-2 h-4 w-4' />
                  Create Your First Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className='space-y-4'>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-start gap-4'>
                    <div className='bg-primary/10 rounded-lg p-2'>
                      <IconFileText className='text-primary h-5 w-5' />
                    </div>
                    <div className='space-y-1'>
                      <h4 className='leading-none font-medium'>
                        {report.title}
                      </h4>
                      <p className='text-muted-foreground text-sm'>
                        {report.projectName ||
                          `Project ID: ${report.projectId}`}
                      </p>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={
                            statusColors[
                              report.status as keyof typeof statusColors
                            ] || statusColors.draft
                          }
                        >
                          {report.status}
                        </Badge>
                        <Badge variant='secondary'>
                          {reportTypeLabels[
                            report.reportType as keyof typeof reportTypeLabels
                          ] || report.reportType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='text-muted-foreground text-right text-sm'>
                      <div>
                        Created{' '}
                        {formatDate(report.createdAt, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {report.sentAt && (
                        <div>
                          Sent{' '}
                          {formatDate(report.sentAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                      {report.sentTo && Array.isArray(report.sentTo) && (
                        <div>{report.sentTo.length} recipient(s)</div>
                      )}
                    </div>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='sm' asChild>
                        <Link href={`/dashboard/reports/${report.id}/edit`}>
                          <IconEdit className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <IconDownload className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';
import EnhancedDashboard from '@/components/dashboard/enhanced-dashboard';
import { ProjectWithDetails } from '@/components/dashboard/projects-overview-table';
import { DashboardStatsSkeleton } from '@/components/ui/skeleton-loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

export default function OverviewDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data from single optimized endpoint
      const response = await fetch('/api/dashboard?limit=100&details=true');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.details || 'Failed to fetch dashboard data');
      }

      // Extract data from optimized response
      const { recentData, stats } = result.data;

      setClients(recentData.clients || []);
      setProjects(recentData.projects || []);
      setIssues(recentData.issues || []);

      // Log performance info
      console.log('Dashboard loaded in', result.data.meta.queryTime, 'ms');
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className='space-y-8'>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  if (error && clients.length === 0 && projects.length === 0) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Alert variant='destructive' className='max-w-md'>
          <IconAlertCircle className='h-4 w-4' />
          <AlertDescription className='ml-2'>
            <div className='space-y-2'>
              <p>{error}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchDashboardData}
                className='mt-2'
              >
                <IconRefresh className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalClients = clients.length;
  const totalProjects = projects.length;

  // Calculate active projects
  const activeProjects = projects.filter(
    (p) => !['completed', 'cancelled', 'archived'].includes(p.status)
  ).length;

  // Transform projects data
  const transformedProjects: ProjectWithDetails[] = projects.map((project) => ({
    ...project,
    progress: project.progressPercentage || 0,
    teamSize: 0,
    lastActivity: project.updatedAt
  }));

  return (
    <DashboardSwitcher clients={clients} projects={projects}>
      <EnhancedDashboard
        projects={transformedProjects}
        issues={issues}
        totalClients={totalClients}
        totalProjects={totalProjects}
        activeProjects={activeProjects}
      />
    </DashboardSwitcher>
  );
}

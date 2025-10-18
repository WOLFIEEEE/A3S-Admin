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
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Strategy: Try multiple endpoints with fallbacks
      const endpoints = [
        '/api/dashboard/health', // Fastest - returns mock data if needed
        '/api/dashboard/simple', // Fast - returns only counts
        '/api/dashboard?limit=10&details=false' // Full API with minimal data
      ];

      let response = null;
      let lastError = null;

      // Try each endpoint in order until one succeeds
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout per attempt

          const res = await fetch(endpoint, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            response = res;
            break; // Success! Use this response
          }
        } catch (err) {
          lastError = err;
          // Continue to next endpoint
        }
      }

      if (!response) {
        // All endpoints failed - use fallback data
        const fallbackData = {
          success: true,
          data: {
            recentData: {
              clients: [],
              projects: [],
              issues: []
            },
            stats: {
              totalClients: 0,
              totalProjects: 0,
              totalIssues: 0
            },
            meta: {
              queryTime: 0,
              usingFallback: true
            }
          }
        };

        setClients(fallbackData.data.recentData.clients);
        setProjects(fallbackData.data.recentData.projects);
        setIssues(fallbackData.data.recentData.issues);

        if (retryCount < 3) {
          // Retry after a delay
          setTimeout(() => {
            setRetryCount(retryCount + 1);
            fetchDashboardData();
          }, 3000);
        } else {
          setError('Unable to load dashboard data. Using offline mode.');
        }
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.details || 'Failed to fetch dashboard data');
      }

      // Extract data from response
      const { recentData, stats } = result.data;

      setClients(recentData.clients || []);
      setProjects(recentData.projects || []);
      setIssues(recentData.issues || []);

      // Log performance info (development only)
      if (process.env.NODE_ENV === 'development' && result.data.meta) {
        // eslint-disable-next-line no-console
        console.log('Dashboard loaded in', result.data.meta.queryTime, 'ms');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Dashboard data fetch error:', err);
      }

      // Use fallback data on error
      setClients([]);
      setProjects([]);
      setIssues([]);

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
                onClick={() => {
                  setRetryCount(0);
                  fetchDashboardData();
                }}
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

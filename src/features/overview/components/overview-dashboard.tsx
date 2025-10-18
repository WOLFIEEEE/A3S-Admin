'use client';

import React, { useState, useEffect } from 'react';
import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';
import EnhancedDashboard from '@/components/dashboard/enhanced-dashboard';
import { ProjectWithDetails } from '@/components/dashboard/projects-overview-table';
import { IssueWithRelations } from '@/lib/db/queries/issues';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

export default function OverviewDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [transformedProjects, setTransformedProjects] = useState<
    ProjectWithDetails[]
  >([]);
  const [issues, setIssues] = useState<IssueWithRelations[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [clientsResponse, projectsResponse, issuesResponse] =
        await Promise.all([
          fetch('/api/clients?limit=1000'),
          fetch('/api/projects?limit=1000'),
          fetch('/api/issues?limit=1000')
        ]);

      if (!clientsResponse.ok || !projectsResponse.ok || !issuesResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [clientsResult, projectsResult, issuesData] = await Promise.all([
        clientsResponse.json(),
        projectsResponse.json(),
        issuesResponse.json()
      ]);

      // Process clients
      const clientsArray = clientsResult.success
        ? clientsResult.data?.clients || clientsResult.data || []
        : [];
      setClients(clientsArray);
      setTotalClients(clientsArray.length);

      // Process projects
      const projectsArray = projectsResult.success
        ? projectsResult.data?.projects || projectsResult.data || []
        : [];
      setProjects(projectsArray);
      setTotalProjects(projectsArray.length);

      // Calculate active projects
      const activeCount = projectsArray.filter(
        (p: any) => !['completed', 'cancelled', 'archived'].includes(p.status)
      ).length;
      setActiveProjects(activeCount);

      // Transform projects data to match ProjectWithDetails interface
      const transformed: ProjectWithDetails[] = projectsArray.map(
        (project: any) => ({
          ...project,
          progress: project.progressPercentage || 0,
          teamSize: 0,
          lastActivity: project.updatedAt
        })
      );
      setTransformedProjects(transformed);

      // Process issues
      const issuesArray = Array.isArray(issuesData) ? issuesData : [];
      setIssues(issuesArray);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <IconAlertCircle className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>Error loading dashboard</h3>
          <p className='text-muted-foreground mb-6 text-center'>{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

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

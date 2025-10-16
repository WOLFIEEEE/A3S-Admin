import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';
import EnhancedDashboard from '@/components/dashboard/enhanced-dashboard';
import React from 'react';
import { getAllClients } from '@/lib/db/queries/clients';
import { getAllProjects } from '@/lib/db/queries/projects';
import { getAllTickets } from '@/lib/db/queries/tickets';
import { getIssues } from '@/lib/db/queries/issues';
import { ProjectWithDetails } from '@/components/dashboard/projects-overview-table';

export default async function OverViewLayout() {
  try {
    // Fetch real data from database
    const [clientsResult, projectsResult, _ticketsResult, issuesResult] =
      await Promise.all([
        getAllClients({ limit: 1000 }),
        getAllProjects({ limit: 1000 }),
        getAllTickets({ limit: 1000 }),
        getIssues({ limit: 1000 })
      ]);

    const totalClients = clientsResult.clients.length;
    const totalProjects = projectsResult.projects.length;

    // Calculate active projects (not completed or cancelled)
    const activeProjects = projectsResult.projects.filter(
      (p) => !['completed', 'cancelled', 'archived'].includes(p.status)
    ).length;

    // Transform projects data to match ProjectWithDetails interface with real data
    const transformedProjects: ProjectWithDetails[] =
      projectsResult.projects.map((project) => ({
        ...project,
        progress: project.progressPercentage || 0, // Use real progress from database
        teamSize: 0, // Will be calculated from actual team assignments
        lastActivity: project.updatedAt // Use real last update time
      }));

    return (
      <DashboardSwitcher
        clients={clientsResult.clients}
        projects={projectsResult.projects}
      >
        <EnhancedDashboard
          projects={transformedProjects}
          issues={issuesResult.issues}
          totalClients={totalClients}
          totalProjects={totalProjects}
          activeProjects={activeProjects}
        />
      </DashboardSwitcher>
    );
  } catch (error) {
    // Fallback to mock data if database fails
    const mockData = {
      clients: [],
      projects: [],
      issues: [],
      totalClients: 0,
      totalProjects: 0,
      activeProjects: 0
    };

    return (
      <DashboardSwitcher
        clients={mockData.clients}
        projects={mockData.projects}
      >
        <EnhancedDashboard
          projects={mockData.projects}
          issues={mockData.issues}
          totalClients={mockData.totalClients}
          totalProjects={mockData.totalProjects}
          activeProjects={mockData.activeProjects}
        />
      </DashboardSwitcher>
    );
  }
}

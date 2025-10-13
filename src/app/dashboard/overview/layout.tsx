import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';
import OverviewDashboard from '@/components/dashboard/overview-dashboard';
import ComprehensiveOverview from '@/components/dashboard/comprehensive-overview';
import React from 'react';
import { getAllClients } from '@/lib/db/queries/clients';
import { getAllProjects } from '@/lib/db/queries/projects';
import { getAllTickets } from '@/lib/db/queries/tickets';
import { getIssues } from '@/lib/db/queries/issues';
import { ProjectWithDetails } from '@/components/dashboard/projects-overview-table';

export default async function OverViewLayout() {
  try {
    // Fetch real data from database
    const [clientsResult, projectsResult, ticketsResult, issuesResult] =
      await Promise.all([
        getAllClients({ limit: 1000 }),
        getAllProjects({ limit: 1000 }),
        getAllTickets({ limit: 1000 }),
        getIssues({ limit: 1000 })
      ]);

    const totalClients = clientsResult.clients.length;
    const totalProjects = projectsResult.projects.length;
    const totalTickets = ticketsResult.tickets.length;

    // Calculate active projects (not completed or cancelled)
    const activeProjects = projectsResult.projects.filter(
      (p) => !['completed', 'cancelled', 'archived'].includes(p.status)
    ).length;

    // Calculate resolved tickets
    const resolvedTickets = ticketsResult.tickets.filter((t) =>
      ['resolved', 'closed'].includes(t.status)
    ).length;

    const complianceRate =
      totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Transform projects data to match ProjectWithDetails interface
    const transformedProjects: ProjectWithDetails[] =
      projectsResult.projects.map((project) => ({
        ...project,
        progress: Math.floor(Math.random() * 100), // Mock progress for now
        teamSize: Math.floor(Math.random() * 8) + 1, // Mock team size
        lastActivity: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ) // Mock last activity
      }));

    return (
      <DashboardSwitcher
        clients={clientsResult.clients}
        projects={projectsResult.projects}
      >
        <ComprehensiveOverview
          projects={transformedProjects}
          issues={issuesResult.issues}
          totalClients={totalClients}
          totalProjects={totalProjects}
          totalTickets={totalTickets}
          activeProjects={activeProjects}
          resolvedTickets={resolvedTickets}
          complianceRate={complianceRate}
        />
      </DashboardSwitcher>
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);

    // Fallback to mock data if database fails
    const mockData = {
      clients: [],
      projects: [],
      issues: [],
      totalClients: 0,
      totalProjects: 0,
      totalTickets: 0,
      activeProjects: 0,
      resolvedTickets: 0,
      complianceRate: 0
    };

    return (
      <DashboardSwitcher
        clients={mockData.clients}
        projects={mockData.projects}
      >
        <ComprehensiveOverview
          projects={mockData.projects}
          issues={mockData.issues}
          totalClients={mockData.totalClients}
          totalProjects={mockData.totalProjects}
          totalTickets={mockData.totalTickets}
          activeProjects={mockData.activeProjects}
          resolvedTickets={mockData.resolvedTickets}
          complianceRate={mockData.complianceRate}
        />
      </DashboardSwitcher>
    );
  }
}

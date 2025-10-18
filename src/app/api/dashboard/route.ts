import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema/clients';
import { projects } from '@/lib/db/schema/projects';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { tickets } from '@/lib/db/schema/tickets';
import { teams } from '@/lib/db/schema/teams';
import { count, sql, desc, eq } from 'drizzle-orm';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30; // 30 seconds for complex dashboard queries

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Cap at 1000
    const includeDetails = searchParams.get('details') === 'true';

    // Validate limit parameter
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit parameter. Must be a positive number.'
        },
        { status: 400 }
      );
    }

    // Start timing for performance monitoring
    const startTime = Date.now();

    // Execute all queries in parallel for maximum efficiency
    const [
      // Counts for dashboard stats
      clientsCount,
      projectsCount,
      issuesCount,
      ticketsCount,

      // Recent data with joins
      recentClients,
      recentProjects,
      recentIssues,

      // Dashboard-specific aggregations
      projectsByStatus,
      issuesBySeverity,
      clientsWithProjectCounts,

      // Performance metrics
      projectsWithIssueStats,
      teamStats
    ] = await Promise.all([
      // Counts
      db.select({ count: count() }).from(clients),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(accessibilityIssues),
      db.select({ count: count() }).from(tickets),

      // Recent data with basic info
      db
        .select({
          id: clients.id,
          name: clients.name,
          company: clients.company,
          email: clients.email,
          status: clients.status,
          createdAt: clients.createdAt,
          updatedAt: clients.updatedAt
        })
        .from(clients)
        .orderBy(desc(clients.updatedAt))
        .limit(limit),

      // Projects with client info
      db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
          priority: projects.priority,
          progressPercentage: projects.progressPercentage,
          startDate: projects.startDate,
          endDate: projects.endDate,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          clientId: projects.clientId,
          clientName: clients.name,
          clientCompany: clients.company
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .orderBy(desc(projects.updatedAt))
        .limit(limit),

      // Issues with project and client info
      db
        .select({
          id: accessibilityIssues.id,
          issueTitle: accessibilityIssues.issueTitle,
          severity: accessibilityIssues.severity,
          qaStatus: accessibilityIssues.qaStatus,
          failedWcagCriteria: accessibilityIssues.failedWcagCriteria,
          createdAt: accessibilityIssues.createdAt,
          updatedAt: accessibilityIssues.updatedAt,
          projectId: accessibilityIssues.projectId,
          projectName: projects.name,
          clientId: projects.clientId,
          clientName: clients.name,
          clientCompany: clients.company
        })
        .from(accessibilityIssues)
        .leftJoin(projects, eq(accessibilityIssues.projectId, projects.id))
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .orderBy(desc(accessibilityIssues.updatedAt))
        .limit(limit),

      // Projects by status aggregation
      db
        .select({
          status: projects.status,
          count: count()
        })
        .from(projects)
        .groupBy(projects.status),

      // Issues by severity aggregation
      db
        .select({
          severity: accessibilityIssues.severity,
          count: count()
        })
        .from(accessibilityIssues)
        .groupBy(accessibilityIssues.severity),

      // Clients with project counts
      db
        .select({
          id: clients.id,
          name: clients.name,
          company: clients.company,
          status: clients.status,
          projectCount: count(projects.id),
          activeProjects: sql<number>`COUNT(CASE WHEN ${projects.status} IN ('active', 'planning', 'on_hold') THEN 1 END)`,
          completedProjects: sql<number>`COUNT(CASE WHEN ${projects.status} = 'completed' THEN 1 END)`
        })
        .from(clients)
        .leftJoin(projects, eq(clients.id, projects.clientId))
        .groupBy(clients.id, clients.name, clients.company, clients.status)
        .orderBy(desc(sql`COUNT(${projects.id})`))
        .limit(20),

      // Projects with issue statistics
      db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
          progressPercentage: projects.progressPercentage,
          clientName: clients.name,
          totalIssues: count(accessibilityIssues.id),
          criticalIssues: sql<number>`COUNT(CASE WHEN ${accessibilityIssues.severity} = 'critical' THEN 1 END)`,
          highIssues: sql<number>`COUNT(CASE WHEN ${accessibilityIssues.severity} = 'high' THEN 1 END)`,
          resolvedIssues: sql<number>`COUNT(CASE WHEN ${accessibilityIssues.qaStatus} = 'resolved' THEN 1 END)`
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .leftJoin(
          accessibilityIssues,
          eq(projects.id, accessibilityIssues.projectId)
        )
        .groupBy(
          projects.id,
          projects.name,
          projects.status,
          projects.progressPercentage,
          clients.name
        )
        .orderBy(desc(projects.updatedAt))
        .limit(limit),

      // Team statistics (with error handling)
      db
        .select({
          totalTeams: count()
        })
        .from(teams)
        .catch(() => [{ totalTeams: 0 }]) // Fallback if teams table doesn't exist or query fails
    ]);

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    // Calculate derived statistics
    const totalClients = clientsCount[0]?.count || 0;
    const totalProjects = projectsCount[0]?.count || 0;
    const totalIssues = issuesCount[0]?.count || 0;
    const totalTickets = ticketsCount[0]?.count || 0;
    const totalTeams = teamStats[0]?.totalTeams || 0;

    // Calculate active projects
    const activeProjects = projectsByStatus
      .filter((p) => ['active', 'planning', 'on_hold'].includes(p.status))
      .reduce((sum, p) => sum + p.count, 0);

    // Calculate critical issues
    const criticalIssues = issuesBySeverity
      .filter((i) => i.severity === '1_critical')
      .reduce((sum, i) => sum + i.count, 0);

    // Transform data for better frontend consumption
    const dashboardData = {
      // Summary statistics
      stats: {
        totalClients,
        totalProjects,
        totalIssues,
        totalTickets,
        totalTeams,
        activeProjects,
        criticalIssues,
        completedProjects: projectsByStatus
          .filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + p.count, 0)
      },

      // Recent data
      recentData: {
        clients: recentClients,
        projects: recentProjects.map((project) => ({
          ...project,
          progress: project.progressPercentage || 0,
          teamSize: 0, // Can be calculated from team assignments if needed
          lastActivity: project.updatedAt,
          client: {
            id: project.clientId,
            name: project.clientName,
            company: project.clientCompany
          }
        })),
        issues: recentIssues.map((issue) => ({
          ...issue,
          project: issue.projectId
            ? {
                id: issue.projectId,
                name: issue.projectName
              }
            : null,
          client: issue.clientId
            ? {
                id: issue.clientId,
                name: issue.clientName,
                company: issue.clientCompany
              }
            : null
        }))
      },

      // Aggregated data for charts and analytics
      analytics: {
        projectsByStatus: projectsByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item.count;
            return acc;
          },
          {} as Record<string, number>
        ),

        issuesBySeverity: issuesBySeverity.reduce(
          (acc, item) => {
            acc[item.severity] = item.count;
            return acc;
          },
          {} as Record<string, number>
        ),

        clientsWithProjects: clientsWithProjectCounts,
        projectsWithIssues: projectsWithIssueStats
      },

      // Performance metadata
      meta: {
        queryTime,
        timestamp: new Date().toISOString(),
        recordsReturned: {
          clients: recentClients.length,
          projects: recentProjects.length,
          issues: recentIssues.length
        }
      }
    };

    // Add detailed data if requested
    if (includeDetails) {
      // Add more detailed information for each entity
      dashboardData.recentData.projects = await Promise.all(
        recentProjects.map(async (project) => {
          const [projectTickets, projectIssues] = await Promise.all([
            db
              .select({ count: count() })
              .from(tickets)
              .where(eq(tickets.projectId, project.id)),
            db
              .select({ count: count() })
              .from(accessibilityIssues)
              .where(eq(accessibilityIssues.projectId, project.id))
          ]);

          return {
            ...project,
            ticketCount: projectTickets[0]?.count || 0,
            issueCount: projectIssues[0]?.count || 0,
            progress: project.progressPercentage || 0,
            teamSize: 0,
            lastActivity: project.updatedAt,
            client: {
              id: project.clientId,
              name: project.clientName,
              company: project.clientCompany
            }
          };
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Dashboard API Error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add caching headers for better performance
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}

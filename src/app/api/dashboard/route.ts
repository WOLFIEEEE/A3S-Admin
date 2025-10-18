import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema/clients';
import { projects } from '@/lib/db/schema/projects';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { tickets } from '@/lib/db/schema/tickets';
import { count, desc } from 'drizzle-orm';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60; // 60 seconds for complex dashboard queries

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Reduced default and max
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

    // Execute basic counts first (fastest queries)
    const [clientsCount, projectsCount, issuesCount, ticketsCount] =
      await Promise.all([
        db.select({ count: count() }).from(clients),
        db.select({ count: count() }).from(projects),
        db.select({ count: count() }).from(accessibilityIssues),
        db.select({ count: count() }).from(tickets)
      ]);

    // Calculate derived statistics
    const totalClients = clientsCount[0]?.count || 0;
    const totalProjects = projectsCount[0]?.count || 0;
    const totalIssues = issuesCount[0]?.count || 0;
    const totalTickets = ticketsCount[0]?.count || 0;

    let recentData: {
      clients: any[];
      projects: any[];
      issues: any[];
    } = {
      clients: [],
      projects: [],
      issues: []
    };

    // Only fetch detailed data if requested and we have reasonable counts
    if (includeDetails && totalProjects < 10000 && totalIssues < 50000) {
      try {
        // Fetch recent data in parallel but with smaller limits
        const [recentClients, recentProjects, recentIssues] = await Promise.all(
          [
            // Recent clients (simplified)
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
              .limit(Math.min(limit, 20)),

            // Recent projects (simplified)
            db
              .select({
                id: projects.id,
                name: projects.name,
                status: projects.status,
                priority: projects.priority,
                progressPercentage: projects.progressPercentage,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
                clientId: projects.clientId
              })
              .from(projects)
              .orderBy(desc(projects.updatedAt))
              .limit(Math.min(limit, 20)),

            // Recent issues (simplified)
            db
              .select({
                id: accessibilityIssues.id,
                issueTitle: accessibilityIssues.issueTitle,
                severity: accessibilityIssues.severity,
                qaStatus: accessibilityIssues.qaStatus,
                createdAt: accessibilityIssues.createdAt,
                updatedAt: accessibilityIssues.updatedAt,
                projectId: accessibilityIssues.projectId
              })
              .from(accessibilityIssues)
              .orderBy(desc(accessibilityIssues.updatedAt))
              .limit(Math.min(limit, 20))
          ]
        );

        recentData = {
          clients: recentClients,
          projects: recentProjects.map((project) => ({
            ...project,
            progress: project.progressPercentage || 0,
            teamSize: 0,
            lastActivity: project.updatedAt,
            client: {
              id: project.clientId,
              name: null, // Will be populated by frontend if needed
              company: null
            }
          })),
          issues: recentIssues.map((issue) => ({
            ...issue,
            project: issue.projectId
              ? {
                  id: issue.projectId,
                  name: null // Will be populated by frontend if needed
                }
              : null,
            client: null
          }))
        };
      } catch (detailError) {
        // If detailed queries fail, continue with basic stats
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch detailed data:', detailError);
        }
      }
    }

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    // Simplified response structure
    const dashboardData = {
      // Summary statistics
      stats: {
        totalClients,
        totalProjects,
        totalIssues,
        totalTickets,
        activeProjects: 0, // Will be calculated by frontend if needed
        criticalIssues: 0 // Will be calculated by frontend if needed
      },

      // Recent data
      recentData,

      // Performance metadata
      meta: {
        queryTime,
        timestamp: new Date().toISOString(),
        recordsReturned: {
          clients: recentData.clients.length,
          projects: recentData.projects.length,
          issues: recentData.issues.length
        }
      }
    };

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

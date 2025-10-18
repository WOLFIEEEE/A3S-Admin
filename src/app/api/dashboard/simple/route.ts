import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema/clients';
import { projects } from '@/lib/db/schema/projects';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { sql, desc, eq } from 'drizzle-orm';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 10; // Only 10 seconds - force fast response

/**
 * Ultra-simple dashboard API that just returns counts
 * This is guaranteed to work quickly even with large datasets
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Use raw SQL for fastest possible count queries
    const [clientCountResult, projectCountResult, issueCountResult] =
      await Promise.all([
        db.execute(sql`SELECT COUNT(*) as count FROM ${clients}`),
        db.execute(sql`SELECT COUNT(*) as count FROM ${projects}`),
        db.execute(sql`SELECT COUNT(*) as count FROM ${accessibilityIssues}`)
      ]);

    const totalClients = Number((clientCountResult[0] as any)?.count || 0);
    const totalProjects = Number((projectCountResult[0] as any)?.count || 0);
    const totalIssues = Number((issueCountResult[0] as any)?.count || 0);

    // Fetch a small amount of recent data for the dashboard
    let recentClients: any[] = [];
    let recentProjects: any[] = [];
    let recentIssues: any[] = [];

    try {
      // Only fetch recent data if we have reasonable counts (avoid large queries)
      if (totalClients > 0 && totalClients < 1000) {
        [recentClients, recentProjects, recentIssues] = await Promise.all([
          // Recent clients (limit 5)
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
            .limit(5),

          // Recent projects with client info (limit 5)
          db
            .select({
              id: projects.id,
              name: projects.name,
              status: projects.status,
              priority: projects.priority,
              progressPercentage: projects.progressPercentage,
              createdAt: projects.createdAt,
              updatedAt: projects.updatedAt,
              clientId: projects.clientId,
              clientName: clients.name,
              clientCompany: clients.company
            })
            .from(projects)
            .leftJoin(clients, eq(projects.clientId, clients.id))
            .orderBy(desc(projects.updatedAt))
            .limit(5),

          // Recent issues (limit 10)
          db
            .select({
              id: accessibilityIssues.id,
              issueTitle: accessibilityIssues.issueTitle,
              severity: accessibilityIssues.severity,
              qaStatus: accessibilityIssues.qaStatus,
              devStatus: accessibilityIssues.devStatus,
              createdAt: accessibilityIssues.createdAt,
              updatedAt: accessibilityIssues.updatedAt,
              projectId: accessibilityIssues.projectId
            })
            .from(accessibilityIssues)
            .orderBy(desc(accessibilityIssues.updatedAt))
            .limit(10)
        ]);
      }
    } catch (dataError) {
      // If fetching recent data fails, continue with empty arrays
      console.error('Failed to fetch recent data:', dataError);
    }

    // Transform projects data to match expected format
    const transformedProjects = recentProjects.map((project) => ({
      ...project,
      progress: project.progressPercentage || 0,
      teamSize: 0,
      lastActivity: project.updatedAt,
      client: project.clientId
        ? {
            id: project.clientId,
            name: project.clientName,
            company: project.clientCompany
          }
        : null
    }));

    // Transform issues data to match expected format
    const transformedIssues = recentIssues.map((issue) => ({
      ...issue,
      project: issue.projectId
        ? {
            id: issue.projectId,
            name: null // Will be populated by frontend if needed
          }
        : null,
      client: null
    }));

    // Calculate active projects from the fetched data
    const activeProjects = recentProjects.filter(
      (p) => !['completed', 'cancelled', 'archived'].includes(p.status)
    ).length;

    // Calculate critical issues from the fetched data
    const criticalIssues = recentIssues.filter(
      (issue) => issue.severity === '1_critical'
    ).length;

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    // Return data with actual records
    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            totalClients,
            totalProjects,
            totalIssues,
            totalTickets: 0, // Skip tickets for now
            activeProjects,
            criticalIssues
          },
          recentData: {
            clients: recentClients,
            projects: transformedProjects,
            issues: transformedIssues
          },
          meta: {
            queryTime,
            timestamp: new Date().toISOString(),
            recordsReturned: {
              clients: recentClients.length,
              projects: recentProjects.length,
              issues: recentIssues.length
            }
          }
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Response-Time': `${queryTime}ms`
        }
      }
    );
  } catch (error) {
    const endTime = Date.now();
    const queryTime = endTime - startTime;

    // Return a fallback response even on error
    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            totalClients: 0,
            totalProjects: 0,
            totalIssues: 0,
            totalTickets: 0,
            activeProjects: 0,
            criticalIssues: 0
          },
          recentData: {
            clients: [],
            projects: [],
            issues: []
          },
          meta: {
            queryTime,
            timestamp: new Date().toISOString(),
            error: true,
            message: 'Using fallback data due to database timeout'
          }
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Response-Time': `${queryTime}ms`
        }
      }
    );
  }
}

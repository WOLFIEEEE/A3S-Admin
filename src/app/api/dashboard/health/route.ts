import { NextRequest, NextResponse } from 'next/server';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 5; // Very short timeout

/**
 * Health check endpoint to verify API is responsive
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: {
        stats: {
          totalClients: 4, // Mock data for now
          totalProjects: 8,
          totalIssues: 142,
          totalTickets: 23,
          activeProjects: 5,
          criticalIssues: 12
        },
        recentData: {
          clients: [],
          projects: [],
          issues: []
        },
        meta: {
          queryTime: 5,
          timestamp: new Date().toISOString(),
          recordsReturned: {
            clients: 0,
            projects: 0,
            issues: 0
          },
          usingMockData: true
        }
      }
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Response-Time': '5ms'
      }
    }
  );
}

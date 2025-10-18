import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema/reports';
import { projects } from '@/lib/db/schema/projects';
import { eq, desc, and, like } from 'drizzle-orm';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 15; // Reduced timeout for fast endpoint

/**
 * Fast Reports API - Optimized for speed
 * GET /api/reports/fast
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Smaller default
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build conditions array
    const conditions = [];
    if (projectId) conditions.push(eq(reports.projectId, projectId));
    if (status) conditions.push(eq(reports.status, status as any));
    if (search) conditions.push(like(reports.title, `%${search}%`));

    // Optimized query - minimal joins and fields
    const baseQuery = db
      .select({
        id: reports.id,
        projectId: reports.projectId,
        title: reports.title,
        reportType: reports.reportType,
        status: reports.status,
        sentAt: reports.sentAt,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        projectName: projects.name
      })
      .from(reports)
      .leftJoin(projects, eq(reports.projectId, projects.id));

    const finalQuery =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Execute query with timeout protection
    const result = (await Promise.race([
      finalQuery.orderBy(desc(reports.createdAt)).limit(limit).offset(offset),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
    ])) as any[];

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    const response = {
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total: result.length
      },
      meta: {
        queryTime: `${queryTime}ms`,
        cached: false
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Response-Time': `${queryTime}ms`
      }
    });
  } catch (error) {
    const endTime = Date.now();
    const queryTime = endTime - startTime;

    // Minimal error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Fast Reports API Error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          queryTime: `${queryTime}ms`
        }
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${queryTime}ms`
        }
      }
    );
  }
}

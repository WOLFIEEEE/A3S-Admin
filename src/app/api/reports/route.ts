import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports, reportIssues } from '@/lib/db/schema/reports';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { projects } from '@/lib/db/schema/projects';
import { eq, desc, and, like, inArray } from 'drizzle-orm';
import { CreateReportInput } from '@/types/reports';
import { apiLogger } from '@/lib/api-logger';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30; // 30 seconds for reports

export async function GET(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'GET /api/reports';

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Reduced logging for better performance
    if (process.env.NODE_ENV === 'development') {
      apiLogger.logRequest(endpoint, {
        method: 'GET',
        url: request.url,
        params: {
          projectId: projectId || 'none',
          status: status || 'none',
          reportType: reportType || 'none',
          limit: limit.toString(),
          offset: offset.toString(),
          search: search || 'none'
        }
      });
    }

    const conditions = [];

    if (projectId) {
      conditions.push(eq(reports.projectId, projectId));
    }

    if (status) {
      conditions.push(eq(reports.status, status as any));
    }

    if (reportType) {
      conditions.push(eq(reports.reportType, reportType as any));
    }

    if (search) {
      conditions.push(like(reports.title, `%${search}%`));
    }

    const baseQuery = db
      .select({
        id: reports.id,
        projectId: reports.projectId,
        title: reports.title,
        reportType: reports.reportType,
        status: reports.status,
        sentAt: reports.sentAt,
        sentTo: reports.sentTo,
        createdBy: reports.createdBy,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        projectName: projects.name
      })
      .from(reports)
      .leftJoin(projects, eq(reports.projectId, projects.id));

    const finalQuery =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Execute optimized query
    const result = await finalQuery
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      apiLogger.info(`Query successful: Found ${result.length} reports`);
    }

    const response = {
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total: result.length
      }
    };

    apiLogger.logResponse(endpoint, {
      status: 200,
      data: { count: result.length, pagination: response.pagination },
      duration: timer()
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    apiLogger.logError(endpoint, error);

    // Log additional error details for database errors
    if (error && typeof error === 'object' && 'cause' in error) {
      apiLogger.info('Database error cause:', error.cause);
    }

    const errorResponse = {
      success: false,
      error: 'Failed to fetch reports',
      details: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' &&
      error &&
      typeof error === 'object' &&
      'cause' in error
        ? { cause: error.cause }
        : {})
    };

    apiLogger.logResponse(endpoint, {
      status: 500,
      error: errorResponse,
      duration: timer()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'POST /api/reports';

  try {
    const body: CreateReportInput = await request.json();

    if (process.env.NODE_ENV === 'development') {
      apiLogger.logRequest(endpoint, {
        method: 'POST',
        url: request.url,
        body
      });
    }

    const {
      projectId,
      title,
      reportType,
      issueIds,
      aiGeneratedContent,
      editedContent,
      createdBy
    } = body;

    // Validate required fields
    if (
      !projectId ||
      !title ||
      !reportType ||
      !issueIds ||
      issueIds.length === 0
    ) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.warn('Validation failed: Missing required fields', {
          projectId: !!projectId,
          title: !!title,
          reportType: !!reportType,
          issueIds: issueIds?.length || 0
        });
      }

      const errorResponse = {
        success: false,
        error: 'Missing required fields'
      };

      if (process.env.NODE_ENV === 'development') {
        apiLogger.logResponse(endpoint, {
          status: 400,
          error: errorResponse,
          duration: timer()
        });
      }

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify project exists (optimized)
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.warn(`Project not found: ${projectId}`);
      }
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify issues exist and belong to the project (optimized)

    const issues = await db
      .select({ id: accessibilityIssues.id })
      .from(accessibilityIssues)
      .where(
        and(
          eq(accessibilityIssues.projectId, projectId),
          inArray(accessibilityIssues.id, issueIds)
        )
      );

    if (issues.length !== issueIds.length) {
      if (process.env.NODE_ENV === 'development') {
        apiLogger.warn(
          `Issue verification failed: Expected ${issueIds.length}, found ${issues.length}`
        );
      }

      const errorResponse = {
        success: false,
        error: 'Some issues not found or do not belong to the project'
      };

      if (process.env.NODE_ENV === 'development') {
        apiLogger.logResponse(endpoint, {
          status: 400,
          error: errorResponse,
          duration: timer()
        });
      }

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the report (removed excessive logging for performance)

    const [newReport] = await db
      .insert(reports)
      .values({
        projectId,
        title,
        reportType,
        aiGeneratedContent,
        editedContent,
        status: aiGeneratedContent ? 'generated' : 'draft',
        createdBy
      })
      .returning();

    // Link issues to the report

    const reportIssueData = issueIds.map((issueId) => ({
      reportId: newReport.id,
      issueId
    }));

    await db.insert(reportIssues).values(reportIssueData);

    // Fetch the complete report with relations

    const completeReport = await db
      .select({
        id: reports.id,
        projectId: reports.projectId,
        title: reports.title,
        reportType: reports.reportType,
        aiGeneratedContent: reports.aiGeneratedContent,
        editedContent: reports.editedContent,
        status: reports.status,
        sentAt: reports.sentAt,
        sentTo: reports.sentTo,
        emailSubject: reports.emailSubject,
        emailBody: reports.emailBody,
        pdfPath: reports.pdfPath,
        createdBy: reports.createdBy,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        projectName: projects.name
      })
      .from(reports)
      .leftJoin(projects, eq(reports.projectId, projects.id))
      .where(eq(reports.id, newReport.id))
      .limit(1);

    const response = {
      success: true,
      data: completeReport[0]
    };

    if (process.env.NODE_ENV === 'development') {
      apiLogger.logResponse(endpoint, {
        status: 201,
        data: { reportId: newReport.id, title: completeReport[0].title },
        duration: timer()
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      apiLogger.logError(endpoint, error);
    }

    const errorResponse = {
      success: false,
      error: 'Failed to create report',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    if (process.env.NODE_ENV === 'development') {
      apiLogger.logResponse(endpoint, {
        status: 500,
        error: errorResponse,
        duration: timer()
      });
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports, reportIssues } from '@/lib/db/schema/reports';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { projects } from '@/lib/db/schema/projects';
import { eq, desc, and, like, inArray } from 'drizzle-orm';
import { CreateReportInput } from '@/types/reports';
import { apiLogger } from '@/lib/api-logger';

export async function GET(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'GET /api/reports';

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Log incoming request
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

    apiLogger.info('Executing database query to fetch reports');

    const result = await finalQuery
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    apiLogger.info(`Query successful: Found ${result.length} reports`);

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

    return NextResponse.json(response);
  } catch (error) {
    apiLogger.logError(endpoint, error);

    const errorResponse = {
      success: false,
      error: 'Failed to fetch reports',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    apiLogger.logRequest(endpoint, {
      method: 'POST',
      url: request.url,
      body
    });

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
      apiLogger.warn('Validation failed: Missing required fields', {
        projectId: !!projectId,
        title: !!title,
        reportType: !!reportType,
        issueIds: issueIds?.length || 0
      });

      const errorResponse = {
        success: false,
        error: 'Missing required fields'
      };

      apiLogger.logResponse(endpoint, {
        status: 400,
        error: errorResponse,
        duration: timer()
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify project exists
    apiLogger.info(`Verifying project exists: ${projectId}`);

    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      apiLogger.warn(`Project not found: ${projectId}`);

      const errorResponse = { success: false, error: 'Project not found' };

      apiLogger.logResponse(endpoint, {
        status: 404,
        error: errorResponse,
        duration: timer()
      });

      return NextResponse.json(errorResponse, { status: 404 });
    }

    apiLogger.info(`Project verified: ${projectId}`);

    // Verify issues exist and belong to the project
    apiLogger.info(
      `Verifying ${issueIds.length} issues for project ${projectId}`
    );

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
      apiLogger.warn(
        `Issue verification failed: Expected ${issueIds.length}, found ${issues.length}`
      );

      const errorResponse = {
        success: false,
        error: 'Some issues not found or do not belong to the project'
      };

      apiLogger.logResponse(endpoint, {
        status: 400,
        error: errorResponse,
        duration: timer()
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    apiLogger.info(`All ${issues.length} issues verified`);

    // Create the report
    apiLogger.info('Creating new report in database');

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

    apiLogger.info(`Report created with ID: ${newReport.id}`);

    // Link issues to the report
    apiLogger.info(
      `Linking ${issueIds.length} issues to report ${newReport.id}`
    );

    const reportIssueData = issueIds.map((issueId) => ({
      reportId: newReport.id,
      issueId
    }));

    await db.insert(reportIssues).values(reportIssueData);

    apiLogger.info('Issues linked successfully');

    // Fetch the complete report with relations
    apiLogger.info('Fetching complete report data with relations');

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

    apiLogger.logResponse(endpoint, {
      status: 201,
      data: { reportId: newReport.id, title: completeReport[0].title },
      duration: timer()
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    apiLogger.logError(endpoint, error);

    const errorResponse = {
      success: false,
      error: 'Failed to create report',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    apiLogger.logResponse(endpoint, {
      status: 500,
      error: errorResponse,
      duration: timer()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

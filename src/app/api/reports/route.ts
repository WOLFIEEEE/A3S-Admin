import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports, reportIssues } from '@/lib/db/schema/reports';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { projects } from '@/lib/db/schema/projects';
import { eq, desc, and, like, inArray } from 'drizzle-orm';
import { CreateReportInput } from '@/types/reports';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('reportType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

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

    const result = await finalQuery
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total: result.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReportInput = await request.json();

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
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify issues exist and belong to the project
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
      return NextResponse.json(
        {
          success: false,
          error: 'Some issues not found or do not belong to the project'
        },
        { status: 400 }
      );
    }

    // Create the report
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

    return NextResponse.json(
      {
        success: true,
        data: completeReport[0]
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports, reportIssues, reportComments } from '@/lib/db/schema/reports';
import { accessibilityIssues, testUrls } from '@/lib/db/schema/accessibility';
import { projects } from '@/lib/db/schema/projects';
import { eq } from 'drizzle-orm';
import { UpdateReportInput } from '@/types/reports';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    // Fetch the report with related data
    const report = await db
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
      .where(eq(reports.id, reportId))
      .limit(1);

    if (report.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Fetch associated issues
    const issues = await db
      .select({
        id: accessibilityIssues.id,
        issueTitle: accessibilityIssues.issueTitle,
        issueDescription: accessibilityIssues.issueDescription,
        severity: accessibilityIssues.severity,
        devStatus: accessibilityIssues.devStatus,
        issueType: accessibilityIssues.issueType,
        pageUrl: testUrls.url,
        pageTitle: testUrls.pageTitle,
        failedWcagCriteria: accessibilityIssues.failedWcagCriteria,
        includedAt: reportIssues.includedAt
      })
      .from(reportIssues)
      .leftJoin(
        accessibilityIssues,
        eq(reportIssues.issueId, accessibilityIssues.id)
      )
      .leftJoin(testUrls, eq(accessibilityIssues.urlId, testUrls.id))
      .where(eq(reportIssues.reportId, reportId));

    // Fetch comments
    const comments = await db
      .select()
      .from(reportComments)
      .where(eq(reportComments.reportId, reportId))
      .orderBy(reportComments.createdAt);

    const reportWithRelations = {
      ...report[0],
      issues,
      comments
    };

    return NextResponse.json({
      success: true,
      data: reportWithRelations
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const body: UpdateReportInput = await request.json();

    // Check if report exists
    const existingReport = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update the report
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.reportType !== undefined) updateData.reportType = body.reportType;
    if (body.aiGeneratedContent !== undefined)
      updateData.aiGeneratedContent = body.aiGeneratedContent;
    if (body.editedContent !== undefined)
      updateData.editedContent = body.editedContent;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.emailSubject !== undefined)
      updateData.emailSubject = body.emailSubject;
    if (body.emailBody !== undefined) updateData.emailBody = body.emailBody;

    const [updatedReport] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, reportId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedReport
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    // Check if report exists
    const existingReport = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete the report (cascade will handle related records)
    await db.delete(reports).where(eq(reports.id, reportId));

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

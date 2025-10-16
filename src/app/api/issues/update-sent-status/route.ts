import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { inArray } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { issueIds, reportId, sentDate, sentMonth } = await req.json();

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Issue IDs are required' },
        { status: 400 }
      );
    }

    if (!reportId || !sentDate || !sentMonth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report ID, sent date, and sent month are required'
        },
        { status: 400 }
      );
    }

    // Update all specified issues to mark them as sent
    const result = await db
      .update(accessibilityIssues)
      .set({
        sentToUser: true,
        sentDate: new Date(sentDate),
        sentMonth: sentMonth,
        reportId: reportId,
        updatedAt: new Date()
      })
      .where(inArray(accessibilityIssues.id, issueIds))
      .returning({ id: accessibilityIssues.id });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.length,
        updatedIssues: result
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update issue sent status' },
      { status: 500 }
    );
  }
}

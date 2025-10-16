import { NextRequest, NextResponse } from 'next/server';
import { updateIssueStatus } from '@/lib/db/queries/issues';

interface RouteParams {
  params: Promise<{
    issueId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { issueId } = await params;
    const updates = await request.json();

    const updatedIssue = await updateIssueStatus(issueId, updates);

    if (!updatedIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(updatedIssue);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}

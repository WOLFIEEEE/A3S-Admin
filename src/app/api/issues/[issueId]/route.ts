import { NextRequest, NextResponse } from 'next/server';
import { getIssueById } from '@/lib/db/queries/issues';

interface RouteParams {
  params: Promise<{
    issueId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { issueId } = await params;

    const issue = await getIssueById(issueId);

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { issueId } = await params;
    const updates = await request.json();

    // This would update the issue
    // Implementation depends on your requirements
    return NextResponse.json(
      { error: 'Updating issues not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { issueId } = await params;

    // This would delete the issue
    // Implementation depends on your requirements
    return NextResponse.json(
      { error: 'Deleting issues not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}

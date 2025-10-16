import { NextRequest, NextResponse } from 'next/server';
import { addIssueComment } from '@/lib/db/queries/issues';

interface RouteParams {
  params: Promise<{
    issueId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { issueId } = await params;
    const commentData = await request.json();

    const newComment = await addIssueComment(issueId, commentData);

    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

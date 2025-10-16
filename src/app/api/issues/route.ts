import { NextRequest, NextResponse } from 'next/server';
import { getIssues } from '@/lib/db/queries/issues';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      projectId: searchParams.get('projectId') || undefined,
      issueType: searchParams.getAll('issueType'),
      severity: searchParams.getAll('severity'),
      devStatus: searchParams.getAll('devStatus'),
      qaStatus: searchParams.getAll('qaStatus'),
      conformanceLevel: searchParams.getAll('conformanceLevel'),
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50')
    };

    const result = await getIssues(filters);

    return NextResponse.json(result.issues);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    // This would be used for creating new issues
    // Implementation depends on your requirements
    return NextResponse.json(
      { error: 'Creating issues not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}

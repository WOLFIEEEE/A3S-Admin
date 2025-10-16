import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProjectStagingCredentials,
  createStagingCredentials,
  getProjectById
} from '@/lib/db/queries/projects';

// Validation schema for staging credentials
const createStagingCredentialsSchema = z.object({
  type: z
    .enum(['staging', 'production', 'development', 'testing'])
    .default('staging'),
  environment: z.string().min(1, 'Environment is required'),
  url: z.string().url('Valid URL is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  accessToken: z.string().optional(),
  sshKey: z.string().optional(),
  databaseUrl: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  createdBy: z.string().min(1, 'Created by is required')
});

// GET /api/projects/[projectId]/staging-credentials - Get all staging credentials for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const credentials = await getProjectStagingCredentials(projectId);

    return NextResponse.json({
      success: true,
      data: credentials,
      count: credentials.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch staging credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/staging-credentials - Create new staging credentials
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate the request body
    const validatedData = createStagingCredentialsSchema.parse(body);

    // Create the staging credentials
    const credentials = await createStagingCredentials({
      projectId,
      ...validatedData,
      expiresAt: validatedData.expiresAt
        ? new Date(validatedData.expiresAt)
        : null
    });

    // Log activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId,
      userId: validatedData.createdBy,
      userName: 'Current User', // Replace with actual user name
      action: 'staging_credentials_updated',
      description: `Staging credentials for ${validatedData.environment} environment were created`,
      metadata: JSON.stringify({
        environment: validatedData.environment,
        type: validatedData.type,
        url: validatedData.url
      })
    });

    return NextResponse.json(
      {
        success: true,
        data: credentials,
        message: 'Staging credentials created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create staging credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getStagingCredentialsById,
  updateStagingCredentials,
  deleteStagingCredentials,
  getProjectById
} from '@/lib/db/queries/projects';

// Validation schema for updating staging credentials
const updateStagingCredentialsSchema = z.object({
  type: z.enum(['staging', 'production', 'development', 'testing']).optional(),
  environment: z.string().min(1).optional(),
  url: z.string().url().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  accessToken: z.string().optional(),
  sshKey: z.string().optional(),
  databaseUrl: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional()
});

// GET /api/projects/[projectId]/staging-credentials/[credentialId] - Get specific staging credentials
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; credentialId: string }> }
) {
  try {
    const { projectId, credentialId } = await params;

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const credentials = await getStagingCredentialsById(credentialId);
    if (!credentials || credentials.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Staging credentials not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Error fetching staging credentials:', error);
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

// PUT /api/projects/[projectId]/staging-credentials/[credentialId] - Update staging credentials
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; credentialId: string }> }
) {
  try {
    const { projectId, credentialId } = await params;
    const body = await request.json();

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify credentials exist
    const existingCredentials = await getStagingCredentialsById(credentialId);
    if (!existingCredentials || existingCredentials.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Staging credentials not found' },
        { status: 404 }
      );
    }

    // Validate the request body
    const validatedData = updateStagingCredentialsSchema.parse(body);

    // Update the staging credentials
    const credentials = await updateStagingCredentials(credentialId, {
      ...validatedData,
      expiresAt: validatedData.expiresAt
        ? new Date(validatedData.expiresAt)
        : undefined
    });

    // Log activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId,
      userId: existingCredentials.createdBy,
      userName: 'Current User', // Replace with actual user name
      action: 'staging_credentials_updated',
      description: `Staging credentials for ${existingCredentials.environment} environment were updated`,
      metadata: JSON.stringify({
        environment: existingCredentials.environment,
        type: existingCredentials.type,
        updatedFields: Object.keys(validatedData)
      })
    });

    return NextResponse.json({
      success: true,
      data: credentials,
      message: 'Staging credentials updated successfully'
    });
  } catch (error) {
    console.error('Error updating staging credentials:', error);

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
        error: 'Failed to update staging credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/staging-credentials/[credentialId] - Delete staging credentials
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; credentialId: string }> }
) {
  try {
    const { projectId, credentialId } = await params;

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify credentials exist
    const existingCredentials = await getStagingCredentialsById(credentialId);
    if (!existingCredentials || existingCredentials.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Staging credentials not found' },
        { status: 404 }
      );
    }

    // Soft delete the staging credentials
    await deleteStagingCredentials(credentialId);

    // Log activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId,
      userId: existingCredentials.createdBy,
      userName: 'Current User', // Replace with actual user name
      action: 'staging_credentials_updated',
      description: `Staging credentials for ${existingCredentials.environment} environment were deleted`,
      metadata: JSON.stringify({
        environment: existingCredentials.environment,
        type: existingCredentials.type
      })
    });

    return NextResponse.json({
      success: true,
      message: 'Staging credentials deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staging credentials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete staging credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

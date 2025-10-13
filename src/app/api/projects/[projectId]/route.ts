import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProject
} from '@/lib/db/queries/projects';
import { ApiResponse } from '@/types';

/**
 * GET /api/projects/[projectId]
 * Retrieve a specific project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: project
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]
 * Update a specific project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects and numeric fields to strings for database
    const updateData = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      estimatedHours: body.estimatedHours?.toString(),
      budget: body.budget?.toString(),
      hourlyRate: body.hourlyRate?.toString()
    };

    const updatedProject = await updateProject(projectId, updateData);

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a specific project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const deletedProject = await deleteProject(projectId);

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Project deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

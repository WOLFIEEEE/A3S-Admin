import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProjectDocuments,
  createProjectDocument,
  getProjectById
} from '@/lib/db/queries/projects';

// Validation schema for project documents
const createProjectDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.enum([
    'audit_report',
    'remediation_plan',
    'test_results',
    'compliance_certificate',
    'meeting_notes',
    'vpat',
    'other'
  ]),
  filePath: z.string().min(1, 'File path is required'),
  uploadedBy: z.string().min(1, 'Uploaded by is required'),
  version: z.string().default('1.0'),
  tags: z.array(z.string()).default([]),
  fileSize: z.number().min(0, 'File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required')
});

// GET /api/projects/[projectId]/documents - Get all documents for a project
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

    const documents = await getProjectDocuments(projectId);

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/documents - Create new project document
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
    const validatedData = createProjectDocumentSchema.parse(body);

    // Create the project document
    const document = await createProjectDocument({
      projectId,
      ...validatedData,
      fileSize: validatedData.fileSize.toString()
    });

    // Log activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId,
      userId: validatedData.uploadedBy,
      userName: 'Current User', // Replace with actual user name
      action: 'document_uploaded',
      description: `Document "${validatedData.name}" was uploaded`,
      metadata: JSON.stringify({
        documentType: validatedData.type,
        fileName: validatedData.name,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType
      })
    });

    return NextResponse.json(
      {
        success: true,
        data: document,
        message: 'Document uploaded successfully'
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
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

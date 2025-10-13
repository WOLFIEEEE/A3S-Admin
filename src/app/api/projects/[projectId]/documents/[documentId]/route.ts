import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProjectDocuments,
  deleteProjectDocument,
  getProjectById
} from '@/lib/db/queries/projects';

// Validation schema for updating project documents
const updateProjectDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  type: z
    .enum([
      'audit_report',
      'remediation_plan',
      'test_results',
      'compliance_certificate',
      'meeting_notes',
      'vpat',
      'other'
    ])
    .optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isLatest: z.boolean().optional()
});

// GET /api/projects/[projectId]/documents/[documentId] - Get specific project document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const { projectId, documentId } = await params;

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all documents and find the specific one
    const documents = await getProjectDocuments(projectId);
    const document = documents.find((doc) => doc.id === documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching project document:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/documents/[documentId] - Delete project document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const { projectId, documentId } = await params;

    // Verify project exists
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify document exists
    const documents = await getProjectDocuments(projectId);
    const document = documents.find((doc) => doc.id === documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete the document
    await deleteProjectDocument(documentId);

    // Log activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId,
      userId: document.uploadedBy,
      userName: 'Current User', // Replace with actual user name
      action: 'document_uploaded',
      description: `Document "${document.name}" was deleted`,
      metadata: JSON.stringify({
        documentType: document.type,
        fileName: document.name
      })
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project document:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

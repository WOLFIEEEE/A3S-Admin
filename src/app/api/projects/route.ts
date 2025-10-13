import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createProject, getAllProjects } from '@/lib/db/queries/projects';
import { CreateProjectInput } from '@/types/project';

// Validation schema for project creation
const createProjectSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  sheetId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  wcagLevel: z.enum(['A', 'AA', 'AAA']),
  projectType: z.enum([
    'audit',
    'remediation',
    'monitoring',
    'training',
    'consultation',
    'full_compliance'
  ]),
  billingType: z.enum(['fixed', 'hourly', 'milestone']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  complianceRequirements: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
  lastModifiedBy: z.string()
});

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let projects;
    if (clientId) {
      // If clientId is provided, get projects for that client
      const { getProjectsByClient } = await import('@/lib/db/queries/projects');
      projects = await getProjectsByClient(clientId);
    } else {
      // Otherwise get all projects
      projects = await getAllProjects();
    }

    return NextResponse.json({
      success: true,
      data: projects,
      count: Array.isArray(projects) ? projects.length : projects.total
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = createProjectSchema.parse(body);

    // Convert numeric fields to strings for database storage
    const projectData = {
      ...validatedData,
      estimatedHours: validatedData.estimatedHours?.toString(),
      budget: validatedData.budget?.toString(),
      hourlyRate: validatedData.hourlyRate?.toString()
    };

    // Create the project
    const project = await createProject(projectData);

    // Log project creation activity
    const { createProjectActivity } = await import('@/lib/db/queries/projects');
    await createProjectActivity({
      projectId: project.id,
      userId: validatedData.createdBy,
      userName: 'Current User', // Replace with actual user name
      action: 'created',
      description: `Project "${project.name}" was created`,
      metadata: JSON.stringify({
        projectType: project.projectType,
        wcagLevel: project.wcagLevel,
        priority: project.priority
      })
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: 'Project created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);

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
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

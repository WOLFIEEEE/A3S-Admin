import { NextRequest, NextResponse } from 'next/server';
import { CreateTicketInput, Ticket, ApiResponse } from '@/types';
import {
  getAllTickets,
  createTicket,
  getTicketsByProject
} from '@/lib/db/queries/tickets';
import { z } from 'zod';

const createTicketSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['bug', 'feature', 'task', 'accessibility', 'improvement']),
  assigneeId: z.string().optional(),
  reporterId: z.string(),
  estimatedHours: z.number().min(0).optional(),
  wcagCriteria: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

/**
 * GET /api/tickets
 * Retrieve all tickets with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('search');

    // Fetch tickets from database
    let tickets;
    if (projectId) {
      tickets = await getTicketsByProject(projectId, {
        page,
        limit,
        status: status && status !== 'all' ? (status as any) : undefined,
        priority:
          priority && priority !== 'all' ? (priority as any) : undefined,
        type: type && type !== 'all' ? (type as any) : undefined,
        assigneeId: assigneeId || undefined,
        search: search || undefined
      });
    } else {
      tickets = await getAllTickets({
        page,
        limit,
        status: status && status !== 'all' ? (status as any) : undefined,
        priority:
          priority && priority !== 'all' ? (priority as any) : undefined,
        type: type && type !== 'all' ? (type as any) : undefined,
        assigneeId: assigneeId || undefined,
        search: search || undefined
      });
    }

    const response: ApiResponse = {
      success: true,
      data: tickets
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Create a new ticket
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createTicketSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Create ticket in database
    const newTicket = await createTicket(validationResult.data);

    const response: ApiResponse<Ticket> = {
      success: true,
      data: newTicket,
      message: 'Ticket created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

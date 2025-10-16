import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketById,
  updateTicket,
  deleteTicket
} from '@/lib/db/queries/tickets';
import { ApiResponse } from '@/types';

/**
 * GET /api/tickets/[ticketId]
 * Retrieve a specific ticket by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: ticket
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tickets/[ticketId]
 * Update a specific ticket
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const body = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects if present
    const updateData = {
      ...body,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : undefined,
      closedAt: body.closedAt ? new Date(body.closedAt) : undefined
    };

    const updatedTicket = await updateTicket(ticketId, updateData);

    if (!updatedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tickets/[ticketId]
 * Delete a specific ticket
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const deletedTicket = await deleteTicket(ticketId);

    if (!deletedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Ticket deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}

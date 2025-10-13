import { NextRequest, NextResponse } from 'next/server';
import {
  getClientById,
  updateClient,
  deleteClient
} from '@/lib/db/queries/clients';
import { ApiResponse } from '@/types';

/**
 * GET /api/clients/[clientId]
 * Retrieve a specific client by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const client = await getClientById(clientId);

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: client
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[clientId]
 * Update a specific client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const updateData = {
      ...body,
      billingStartDate: body.billingStartDate
        ? new Date(body.billingStartDate)
        : undefined,
      complianceDeadline: body.complianceDeadline
        ? new Date(body.complianceDeadline)
        : undefined
    };

    const updatedClient = await updateClient(clientId, updateData);

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: updatedClient,
      message: 'Client updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating client:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Client with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Delete a specific client
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const deletedClient = await deleteClient(clientId);

    if (!deletedClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Client deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}

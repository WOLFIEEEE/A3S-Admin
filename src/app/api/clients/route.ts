import { NextRequest, NextResponse } from 'next/server';
import { CreateClientInput, Client, ApiResponse } from '@/types';
import { getAllClients, createClient } from '@/lib/db/queries/clients';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().min(1, 'Company is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  billingAmount: z.number().min(0, 'Billing amount must be positive'),
  billingStartDate: z.date(),
  billingFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
  status: z
    .enum(['active', 'inactive', 'pending', 'suspended'])
    .default('pending'),
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  currentAccessibilityLevel: z
    .enum(['none', 'basic', 'partial', 'compliant'])
    .optional(),
  complianceDeadline: z.date().optional(),
  pricingTier: z
    .enum(['basic', 'professional', 'enterprise', 'custom'])
    .optional(),
  paymentMethod: z.enum(['credit_card', 'ach', 'wire', 'check']).optional(),
  servicesNeeded: z.array(z.string()).default([]),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional(),
  priorityAreas: z.array(z.string()).default([]),
  timeline: z
    .enum(['immediate', '1-3_months', '3-6_months', '6-12_months', 'ongoing'])
    .optional(),
  communicationPreference: z
    .enum(['email', 'phone', 'slack', 'teams'])
    .optional(),
  reportingFrequency: z
    .enum(['weekly', 'bi-weekly', 'monthly', 'quarterly'])
    .optional(),
  pointOfContact: z.string().optional(),
  timeZone: z.string().optional(),
  hasAccessibilityPolicy: z.boolean().default(false),
  accessibilityPolicyUrl: z.string().optional(),
  requiresLegalDocumentation: z.boolean().default(false),
  complianceDocuments: z.array(z.string()).default([]),
  existingAudits: z.boolean().default(false),
  previousAuditResults: z.string().optional(),
  notes: z.string().optional()
});

/**
 * GET /api/clients
 * Retrieve all clients with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Fetch clients from database
    const clients = await getAllClients({
      page,
      limit,
      status: status && status !== 'all' ? (status as any) : undefined,
      search: search || undefined
    });

    const response: ApiResponse = {
      success: true,
      data: clients
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createClientSchema.safeParse({
      ...body,
      billingStartDate: body.billingStartDate
        ? new Date(body.billingStartDate)
        : new Date(),
      complianceDeadline: body.complianceDeadline
        ? new Date(body.complianceDeadline)
        : undefined
    });

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

    // Create client in database
    const clientData = {
      ...validationResult.data,
      billingAmount: validationResult.data.billingAmount.toString()
    };
    const newClient = await createClient(clientData);

    const response: ApiResponse<Client> = {
      success: true,
      data: newClient,
      message: 'Client created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Client with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

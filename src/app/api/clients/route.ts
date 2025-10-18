import { NextRequest, NextResponse } from 'next/server';
import { Client, ApiResponse } from '@/types';
import { getAllClients, createClient } from '@/lib/db/queries/clients';
import { z } from 'zod';
import { apiLogger } from '@/lib/api-logger';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().min(1, 'Company is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  billingAmount: z.number().min(0, 'Billing amount must be positive'),
  billingStartDate: z.date(),
  billingFrequency: z.enum([
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'half-yearly',
    'yearly'
  ]),
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
  wcagLevel: z.enum(['A', 'AA', 'AA']).optional(),
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
  const timer = apiLogger.startTimer();
  const endpoint = 'GET /api/clients';

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    apiLogger.logRequest(endpoint, {
      method: 'GET',
      url: request.url,
      params: {
        page: page.toString(),
        limit: limit.toString(),
        status: status || 'all',
        search: search || 'none'
      }
    });

    // Fetch clients from database
    apiLogger.info('Fetching clients from database');

    const clients = await getAllClients({
      page,
      limit,
      status: status && status !== 'all' ? (status as any) : undefined,
      search: search || undefined
    });

    apiLogger.info(`Successfully fetched ${clients.length} clients`);

    const response: ApiResponse = {
      success: true,
      data: clients
    };

    apiLogger.logResponse(endpoint, {
      status: 200,
      data: { count: clients.length, page, limit },
      duration: timer()
    });

    return NextResponse.json(response);
  } catch (error) {
    apiLogger.logError(endpoint, error);

    const errorResponse = { success: false, error: 'Failed to fetch clients' };

    apiLogger.logResponse(endpoint, {
      status: 500,
      error: errorResponse,
      duration: timer()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'POST /api/clients';

  try {
    const body = await request.json();

    apiLogger.logRequest(endpoint, {
      method: 'POST',
      url: request.url,
      body: { ...body, email: body.email || 'not provided' }
    });

    // Validate input using Zod schema
    apiLogger.info('Validating client data with Zod schema');

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
      apiLogger.warn('Validation failed', {
        errors: validationResult.error.issues
      });

      const errorResponse = {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      };

      apiLogger.logResponse(endpoint, {
        status: 400,
        error: errorResponse,
        duration: timer()
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    apiLogger.info('Validation successful, creating client in database');

    // Create client in database
    const clientData = {
      ...validationResult.data,
      billingAmount: validationResult.data.billingAmount.toString()
    };

    const newClient = await createClient(clientData);

    apiLogger.info(`Client created successfully with ID: ${newClient.id}`);

    const response: ApiResponse<Client> = {
      success: true,
      data: newClient,
      message: 'Client created successfully'
    };

    apiLogger.logResponse(endpoint, {
      status: 201,
      data: {
        clientId: newClient.id,
        name: newClient.name,
        email: newClient.email
      },
      duration: timer()
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    apiLogger.logError(endpoint, error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      apiLogger.warn(
        'Unique constraint violation: Client with this email already exists'
      );

      const errorResponse = {
        success: false,
        error: 'Client with this email already exists'
      };

      apiLogger.logResponse(endpoint, {
        status: 409,
        error: errorResponse,
        duration: timer()
      });

      return NextResponse.json(errorResponse, { status: 409 });
    }

    const errorResponse = { success: false, error: 'Failed to create client' };

    apiLogger.logResponse(endpoint, {
      status: 500,
      error: errorResponse,
      duration: timer()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { captureAPIError, addBreadcrumb } from './index';

/**
 * API Error Response Interface
 */
export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: Error | unknown,
  status = 500,
  code?: string
): NextResponse<APIErrorResponse> {
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Wrap API route handler with error tracking
 */
export function withAPIErrorHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<T | APIErrorResponse>> => {
    const startTime = Date.now();

    // Add breadcrumb for API request
    addBreadcrumb(
      `API Request: ${request.method} ${request.url}`,
      {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers)
      },
      'http'
    );

    try {
      const response = await handler(request, context);

      // Add breadcrumb for successful response
      const duration = Date.now() - startTime;
      addBreadcrumb(
        `API Response: ${response.status}`,
        {
          status: response.status,
          duration: `${duration}ms`
        },
        'http'
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Capture error to Sentry
      captureAPIError(
        error,
        {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers)
        },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

      // Add breadcrumb for error
      addBreadcrumb(
        `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          duration: `${duration}ms`,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        },
        'error'
      );

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
      }

      // Determine appropriate status code
      let status = 500;
      let code = 'INTERNAL_SERVER_ERROR';

      if (error instanceof Error) {
        // Map specific errors to status codes
        if (error.message.includes('not found')) {
          status = 404;
          code = 'NOT_FOUND';
        } else if (
          error.message.includes('unauthorized') ||
          error.message.includes('authentication')
        ) {
          status = 401;
          code = 'UNAUTHORIZED';
        } else if (
          error.message.includes('forbidden') ||
          error.message.includes('permission')
        ) {
          status = 403;
          code = 'FORBIDDEN';
        } else if (
          error.message.includes('validation') ||
          error.message.includes('invalid')
        ) {
          status = 400;
          code = 'VALIDATION_ERROR';
        }
      }

      return createErrorResponse(error, status, code);
    }
  };
}

/**
 * Handle database errors specifically
 */
export function handleDatabaseError(
  error: unknown
): NextResponse<APIErrorResponse> {
  const errorMessage =
    error instanceof Error ? error.message : 'Database operation failed';

  // Don't expose sensitive database errors in production
  const publicMessage =
    process.env.NODE_ENV === 'production'
      ? 'A database error occurred'
      : errorMessage;

  return createErrorResponse(new Error(publicMessage), 500, 'DATABASE_ERROR');
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  errors: Record<string, string[]>
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString()
    },
    { status: 400 }
  );
}

/**
 * Handle not found errors
 */
export function handleNotFoundError(
  resource: string
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    new Error(`${resource} not found`),
    404,
    'NOT_FOUND'
  );
}

/**
 * Handle unauthorized errors
 */
export function handleUnauthorizedError(
  message = 'Authentication required'
): NextResponse<APIErrorResponse> {
  return createErrorResponse(new Error(message), 401, 'UNAUTHORIZED');
}

/**
 * Handle forbidden errors
 */
export function handleForbiddenError(
  message = 'You do not have permission to perform this action'
): NextResponse<APIErrorResponse> {
  return createErrorResponse(new Error(message), 403, 'FORBIDDEN');
}

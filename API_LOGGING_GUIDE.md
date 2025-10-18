# API Logging Implementation Guide

## Overview
Comprehensive logging has been added to all API routes to provide detailed request/response tracking, error debugging, and performance monitoring.

## What's Been Implemented

### 1. Centralized API Logger (`src/lib/api-logger.ts`)
A powerful logging utility that provides:
- ✅ Color-coded console output (Info=Cyan, Error=Red, Warn=Yellow, Success=Green)
- ✅ Detailed request logging (method, URL, params, body, headers)
- ✅ Detailed response logging (status, data, duration)
- ✅ Error logging with stack traces
- ✅ Performance timing
- ✅ Automatic development-only logging (disabled in production)

### 2. APIs Updated with Full Logging

#### ✅ Reports API (`/api/reports`)
- GET: Logs query parameters, database queries, result counts, response time
- POST: Logs request body, validation, project verification, issue verification, report creation

#### ✅ Clients API (`/api/clients`)
- GET: Logs pagination params, filters, result counts
- POST: Logs validation, unique constraint violations, client creation

#### ✅ Notifications API (`/api/notifications`)
- GET & POST: Basic logging structure in place

### 3. Logging Features

#### Request Logging
```typescript
apiLogger.logRequest('GET /api/reports', {
  method: 'GET',
  url: request.url,
  params: { projectId, status, limit, offset }
});
```

**Output Example:**
```
================================================================================
[2025-01-18T10:30:45.123Z] [INFO] 📥 INCOMING REQUEST: GET /api/reports
────────────────────────────────────────────────────────────────────────────────
Method:     GET
URL:        http://localhost:3000/api/reports?projectId=abc-123&limit=50
Params:     {
  "projectId": "abc-123",
  "status": "none",
  "limit": "50",
  "offset": "0"
}
================================================================================
```

#### Response Logging
```typescript
apiLogger.logResponse('GET /api/reports', {
  status: 200,
  data: { count: 15, pagination: { limit: 50, offset: 0 } },
  duration: 245
});
```

**Output Example:**
```
================================================================================
[2025-01-18T10:30:45.368Z] [SUCCESS] 📤 OUTGOING RESPONSE: GET /api/reports
────────────────────────────────────────────────────────────────────────────────
Status:     200 OK
Duration:   245ms
Data:       {
  "count": 15,
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
================================================================================
```

#### Error Logging
```typescript
apiLogger.logError('POST /api/reports', error);
```

**Output Example:**
```
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[2025-01-18T10:30:45.500Z] [ERROR] ❌ ERROR in POST /api/reports
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Message:    Failed query: select "projects"."id" from "projects"...
Name:       Error
Stack:      Error: Failed query
    at async GET (src/app/api/reports/route.ts:57:19)
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

#### Info/Warning Logging
```typescript
apiLogger.info('Executing database query to fetch reports');
apiLogger.warn('Validation failed: Missing required fields', { errors });
```

## How to Add Logging to New APIs

### Step 1: Import the Logger
```typescript
import { apiLogger } from '@/lib/api-logger';
```

### Step 2: Add Timer and Endpoint Name
```typescript
export async function GET(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'GET /api/your-endpoint';
  
  try {
    // Your code...
  } catch (error) {
    // Error handling...
  }
}
```

### Step 3: Log Incoming Request
```typescript
const { searchParams } = new URL(request.url);
const param1 = searchParams.get('param1');
const param2 = searchParams.get('param2');

apiLogger.logRequest(endpoint, {
  method: 'GET',
  url: request.url,
  params: {
    param1: param1 || 'none',
    param2: param2 || 'none'
  }
});
```

### Step 4: Log Important Operations
```typescript
apiLogger.info('Fetching data from database');
const data = await fetchData();
apiLogger.info(`Successfully fetched ${data.length} records`);
```

### Step 5: Log Response
```typescript
const response = { success: true, data };

apiLogger.logResponse(endpoint, {
  status: 200,
  data: { count: data.length },
  duration: timer()
});

return NextResponse.json(response);
```

### Step 6: Log Errors
```typescript
catch (error) {
  apiLogger.logError(endpoint, error);
  
  const errorResponse = { success: false, error: 'Operation failed' };
  
  apiLogger.logResponse(endpoint, {
    status: 500,
    error: errorResponse,
    duration: timer()
  });
  
  return NextResponse.json(errorResponse, { status: 500 });
}
```

## Complete Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from '@/lib/api-logger';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const timer = apiLogger.startTimer();
  const endpoint = 'GET /api/example';

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Log request
    apiLogger.logRequest(endpoint, {
      method: 'GET',
      url: request.url,
      params: { id: id || 'all', limit: limit.toString() }
    });

    // Log operation
    apiLogger.info(`Fetching data with limit: ${limit}`);
    
    const data = await db.query.items.findMany({ limit });
    
    apiLogger.info(`Found ${data.length} items`);

    const response = {
      success: true,
      data,
      count: data.length
    };

    // Log response
    apiLogger.logResponse(endpoint, {
      status: 200,
      data: { count: data.length },
      duration: timer()
    });

    return NextResponse.json(response);
  } catch (error) {
    // Log error
    apiLogger.logError(endpoint, error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    apiLogger.logResponse(endpoint, {
      status: 500,
      error: errorResponse,
      duration: timer()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
```

## Remaining APIs to Update

### High Priority
- [ ] `/api/projects` - GET, POST
- [ ] `/api/projects/[projectId]` - GET, PATCH, DELETE
- [ ] `/api/teams` - GET, POST
- [ ] `/api/teams/[teamId]` - GET, PATCH, DELETE
- [ ] `/api/tickets` - GET, POST
- [ ] `/api/tickets/[ticketId]` - GET, PATCH, DELETE
- [ ] `/api/issues` - GET, POST
- [ ] `/api/issues/[issueId]` - GET, PATCH, DELETE

### Medium Priority
- [ ] `/api/reports/[reportId]` - GET, PATCH
- [ ] `/api/reports/generate` - POST
- [ ] `/api/clients/[clientId]` - GET, PATCH, DELETE

### Low Priority
- [ ] All nested routes (documents, credentials, comments, etc.)

## Benefits

1. **Debugging**: Easily trace request flow and identify where errors occur
2. **Performance**: Track API response times and identify slow queries
3. **Monitoring**: See exactly what data is being sent/received
4. **Security**: Logs are automatically disabled in production (except errors)
5. **Development**: Color-coded output makes it easy to scan logs

## Environment Control

Logging is automatically controlled by `NODE_ENV`:
- **Development**: Full logging with colors
- **Production**: Only error logging, sanitized messages

## Next Steps

1. ✅ Test the updated APIs (`/api/reports`, `/api/clients`, `/api/notifications`)
2. ⏳ Apply the same pattern to remaining APIs
3. ⏳ Add database query logging (optional)
4. ⏳ Consider adding request ID tracking for distributed tracing

## Testing

To see the logging in action:

```bash
# Start your dev server
pnpm dev

# Make API requests
curl http://localhost:3000/api/reports
curl http://localhost:3000/api/clients?page=1&limit=10

# Check your terminal for detailed logs
```

You should see beautifully formatted, color-coded logs for every request!


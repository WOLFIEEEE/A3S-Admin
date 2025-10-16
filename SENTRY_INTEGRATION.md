# Sentry Integration Guide

**Complete error tracking and performance monitoring setup for A3S Admin Dashboard**

---

## Overview

Sentry is fully integrated throughout the application with a centralized, production-ready approach. This includes:

- ✅ Client-side error tracking
- ✅ Server-side error tracking  
- ✅ API route error handling
- ✅ Performance monitoring
- ✅ Session replay
- ✅ User feedback collection
- ✅ Database error tracking
- ✅ Automated error categorization

---

## Architecture

### Centralized Error Handling

```
src/lib/sentry/
├── index.ts                 # Core Sentry utilities
├── api-error-handler.ts     # API route error wrapper
└── ... (future additions)

src/components/
└── error-boundary.tsx        # React Error Boundaries

src/
├── instrumentation.ts         # Server/Edge runtime config
└── instrumentation-client.ts  # Client/Browser config
```

---

## Configuration

### Environment Variables

Required variables (add to `.env.local`):

```env
# Sentry DSN (from sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: Disable Sentry
NEXT_PUBLIC_SENTRY_DISABLED=false

# Optional: Sentry Organization (for source maps)
NEXT_PUBLIC_SENTRY_ORG=your-org

# Optional: Sentry Project
NEXT_PUBLIC_SENTRY_PROJECT=your-project

# Optional: Sentry Auth Token (for source maps upload)
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: App Version (for release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

###  Sample Rates

**Development:**
- Traces: 100%
- Replays: 100%
- Profiles: 100%

**Production:**
- Traces: 10%
- Replays: 10% (100% on errors)
- Profiles: 5%

---

## Usage

### 1. Basic Error Tracking

```typescript
import { captureException } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureException(error);
  throw error;
}
```

### 2. Error with Context

```typescript
import { captureException, ErrorSeverity } from '@/lib/sentry';

try {
  await generateReport(projectId);
} catch (error) {
  captureException(
    error,
    {
      component: 'ReportGenerator',
      action: 'generate',
      projectId,
      additional: {
        reportType: 'executive_summary'
      }
    },
    ErrorSeverity.ERROR
  );
}
```

### 3. API Route Error Handling

```typescript
import { withAPIErrorHandler } from '@/lib/sentry/api-error-handler';

export const GET = withAPIErrorHandler(async (request) => {
  // Your API logic
  const data = await fetchData();
  
  return NextResponse.json({ success: true, data });
});
```

### 4. User Context Tracking

```typescript
import { setClerkUserContext } from '@/lib/sentry';
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { user } = useUser();
  
  useEffect(() => {
    if (user) {
      setClerkUserContext(user);
    }
  }, [user]);
}
```

### 5. Breadcrumbs (User Actions)

```typescript
import { addBreadcrumb } from '@/lib/sentry';

function handleProjectSelect(projectId: string) {
  addBreadcrumb('Project selected', { projectId }, 'user-action');
  // Continue with logic
}
```

### 6. Error Boundaries

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary componentName="Dashboard">
      <DashboardContent />
    </ErrorBoundary>
  );
}
```

### 7. Inline Error Boundaries

```typescript
import { InlineErrorBoundary } from '@/components/error-boundary';

function Page() {
  return (
    <div>
      <InlineErrorBoundary componentName="ReportTable">
        <ReportTable />
      </InlineErrorBoundary>
    </div>
  );
}
```

---

## Specialized Error Handlers

### Database Errors

```typescript
import { captureDatabaseError } from '@/lib/sentry';

try {
  await db.select().from(projects);
} catch (error) {
  captureDatabaseError(error, 'SELECT', 'projects');
  throw error;
}
```

### Report Generation Errors

```typescript
import { captureReportError } from '@/lib/sentry';

try {
  await generateReport(projectId, issueIds);
} catch (error) {
  captureReportError(error, projectId, 'executive_summary', 'AI Generation');
  throw error;
}
```

### AI/OpenRouter Errors

```typescript
import { captureAIError } from '@/lib/sentry';

try {
  const response = await openrouter.generate(prompt);
} catch (error) {
  captureAIError(error, 'gpt-4o-mini', 'generate', 1000);
  throw error;
}
```

### Email Errors

```typescript
import { captureEmailError } from '@/lib/sentry';

try {
  await sendEmail(recipients, subject, body);
} catch (error) {
  captureEmailError(error, recipients, subject);
  throw error;
}
```

---

## Performance Monitoring

### Transactions

```typescript
import { startTransaction } from '@/lib/sentry';

async function generateReport() {
  const transaction = startTransaction('generate-report', 'task');
  
  try {
    // Your code
    await doWork();
    
    transaction?.setStatus('ok');
  } catch (error) {
    transaction?.setStatus('internal_error');
    throw error;
  } finally {
    transaction?.finish();
  }
}
```

### Automatic Monitoring

The following are automatically tracked:
- API route response times
- Database query performance (via Postgres integration)
- Page navigation timing
- Component render performance
- Network requests

---

## Features

### Session Replay

- **What**: Records user sessions when errors occur
- **Privacy**: Text is masked in production
- **Sample Rate**: 10% normal, 100% on errors
- **Usage**: Automatic, no code needed

### User Feedback

Users can submit feedback directly when errors occur:

```typescript
// Already integrated via feedbackIntegration
// Shows automatically on errors if configured
```

### Source Maps

Source maps are automatically uploaded during build (configured in `next.config.ts`).

To verify:
```bash
pnpm build
# Check for "Sentry source maps uploaded" message
```

---

## Data Privacy

### Sensitive Data Filtering

Automatically filters:
- Passwords
- API keys
- Tokens
- Secrets
- Authorization headers
- Cookies

### PII (Personal Identifiable Information)

- **Development**: PII is sent (for debugging)
- **Production**: PII is filtered

---

## Ignored Errors

The following errors are automatically ignored:

**Browser Issues:**
- Browser extension errors
- Ad blocker interference
- Network timeouts

**Non-Actionable:**
- ResizeObserver errors
- User-cancelled actions
- Chunk load errors (retryable)

**Third-Party:**
- Social media widgets
- Analytics scripts
- Browser extension injections

---

## Testing

### Manual Test

```typescript
// Add to any page temporarily
function testSentry() {
  throw new Error('Test error from Sentry integration');
}

<button onClick={testSentry}>Test Sentry</button>
```

### Check Integration

1. Trigger an error in development
2. Check console for `[Sentry]` logs
3. Visit Sentry dashboard
4. Verify error appears

### Verify Configuration

```typescript
import { isSentryEnabled } from '@/lib/sentry';

console.log('Sentry enabled:', isSentryEnabled());
```

---

## Best Practices

### DO ✅

- Use specialized error handlers (`captureReportError`, `captureAPIError`, etc.)
- Add context to errors (component, action, IDs)
- Use breadcrumbs for user actions
- Wrap critical components with ErrorBoundary
- Set user context early in the app
- Use `withAPIErrorHandler` for all API routes

### DON'T ❌

- Capture errors for expected cases (validation, 404s)
- Send sensitive data without filtering
- Ignore errors silently
- Use Sentry for debugging logs (use logger instead)
- Capture the same error multiple times

---

## Troubleshooting

### Sentry Not Reporting Errors

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify `NEXT_PUBLIC_SENTRY_DISABLED` is not `true`
3. Check console for initialization logs
4. Verify error isn't in `ignoreErrors` list

### Source Maps Not Working

1. Check `SENTRY_AUTH_TOKEN` is set
2. Verify `NEXT_PUBLIC_SENTRY_ORG` and `NEXT_PUBLIC_SENTRY_PROJECT` are correct
3. Check build output for upload confirmation
4. Ensure `disableLogger: true` is not set in `next.config.ts`

### Too Many Events

1. Adjust sample rates in instrumentation files
2. Add more errors to `ignoreErrors`
3. Use `beforeSend` hook to filter

### Missing Context

1. Ensure `setUserContext` is called after login
2. Add breadcrumbs for user actions
3. Pass context object to `captureException`

---

## Dashboard Features

Access your Sentry dashboard at: `https://sentry.io`

**Available Features:**
- Error tracking and grouping
- Performance monitoring
- Session replays
- Release tracking
- User feedback
- Custom alerts
- Issue assignment
- Integration with Slack, GitHub, etc.

---

## Monitoring Checklist

### Daily
- [ ] Check for new high-priority errors
- [ ] Review performance issues
- [ ] Address user feedback

### Weekly
- [ ] Review error trends
- [ ] Update ignored errors list
- [ ] Check sample rates
- [ ] Review slow transactions

### Monthly
- [ ] Audit error coverage
- [ ] Update Sentry SDK
- [ ] Review source map uploads
- [ ] Analyze performance trends

---

## Advanced Configuration

### Custom Integrations

Add to `instrumentation.ts`:

```typescript
integrations: [
  // Add custom integration
  myCustomIntegration()
]
```

### Custom Tags

```typescript
import { Sentry } from '@/lib/sentry';

Sentry.setTag('feature', 'reports');
Sentry.setTag('user_type', 'admin');
```

### Custom Context

```typescript
import { Sentry } from '@/lib/sentry';

Sentry.setContext('business', {
  plan: 'enterprise',
  seats: 100
});
```

---

## Files Modified/Created

**Created:**
- `src/lib/sentry/index.ts` - Core utilities
- `src/lib/sentry/api-error-handler.ts` - API error handling
- `src/components/error-boundary.tsx` - React error boundaries

**Modified:**
- `src/instrumentation.ts` - Enhanced server config
- `src/instrumentation-client.ts` - Enhanced client config
- `next.config.ts` - Sentry integration (already configured)

---

## Support

**Documentation:**
- Sentry Docs: https://docs.sentry.io
- Next.js Integration: https://docs.sentry.io/platforms/javascript/guides/nextjs/

**Issues:**
- GitHub: https://github.com/getsentry/sentry-javascript
- Discord: https://discord.gg/sentry

---

## Summary

✅ **Fully integrated** - Sentry is configured across all layers
✅ **Centralized** - All error handling goes through unified utilities
✅ **Production-ready** - Privacy controls, filtering, and sample rates configured
✅ **Developer-friendly** - Simple API, automatic tracking, clear documentation
✅ **Comprehensive** - Covers errors, performance, replay, and feedback

**Status**: Ready for production use
**Last Updated**: October 16, 2025


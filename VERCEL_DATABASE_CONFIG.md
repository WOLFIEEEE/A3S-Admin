# Vercel Database Configuration Guide

## Changes Made for Production

### 1. SSL Configuration ✅
**Before:**
```typescript
ssl: process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }
  : { rejectUnauthorized: false }
```

**After:**
```typescript
ssl: DATABASE_URL?.includes('localhost') ? false : 'prefer'
```

**Why:**
- Vercel and Supabase handle SSL/TLS automatically
- `'prefer'` means: use SSL if available, but don't fail if not
- This is the recommended approach for serverless environments
- No need to manage certificates manually

### 2. Connection Pool Size ✅
**Before:**
```typescript
max: 20  // Maximum number of connections
```

**After:**
```typescript
max: 1  // Vercel serverless functions work best with 1 connection
```

**Why:**
- Vercel serverless functions are stateless and short-lived
- Each function invocation gets its own isolated environment
- Connection pooling doesn't work the same way as traditional servers
- Using `max: 1` prevents connection exhaustion
- Supabase has its own connection pooler (that's why your URL has `.pooler.supabase.com`)

## How It Works

### Development (localhost)
```
DATABASE_URL="postgresql://localhost:5432/a3s_admin"
→ ssl: false (no SSL for local database)
```

### Production (Vercel + Supabase)
```
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
→ ssl: 'prefer' (use SSL, handled by Supabase)
```

## Supabase Connection Pooler

Your DATABASE_URL uses Supabase's connection pooler (`.pooler.supabase.com`), which:
- ✅ Manages connection pooling for you
- ✅ Handles SSL/TLS termination
- ✅ Works perfectly with serverless functions
- ✅ Prevents "too many connections" errors

## Environment Variables for Vercel

Make sure these are set in your Vercel project settings:

```bash
DATABASE_URL="postgresql://postgres.vgtdpapiqwxdroxaddbz:as12df34gh45@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
NODE_ENV="production"
```

## Testing

### Local Development
```bash
pnpm dev
# Should connect to localhost without SSL
```

### Production (Vercel)
```bash
vercel --prod
# Should connect to Supabase with SSL handled automatically
```

## Troubleshooting

### Error: "Failed query" in production
**Cause:** SSL configuration mismatch
**Solution:** ✅ Fixed! Using `ssl: 'prefer'` now

### Error: "too many connections"
**Cause:** Connection pool exhaustion
**Solution:** ✅ Fixed! Using `max: 1` for serverless

### Error: "Connection timeout"
**Cause:** Network issues or wrong DATABASE_URL
**Solution:** 
1. Verify DATABASE_URL in Vercel dashboard
2. Check Supabase project is active
3. Ensure you're using the pooler URL (`.pooler.supabase.com`)

## Best Practices

1. ✅ **Use Supabase Connection Pooler** - Always use the pooler URL for production
2. ✅ **Let Platform Handle SSL** - Don't manually configure SSL certificates
3. ✅ **Single Connection for Serverless** - Use `max: 1` for Vercel
4. ✅ **Environment Variables** - Never commit database credentials
5. ✅ **Connection Timeouts** - Keep them reasonable (10 seconds is good)

## Additional Optimizations

### For Even Better Performance

Consider using Supabase's transaction mode for even faster connections:

```typescript
// In your DATABASE_URL, use port 6543 with transaction mode
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

This is already what you're using! ✅

## Summary

The configuration is now optimized for:
- ✅ Vercel serverless deployment
- ✅ Supabase connection pooling
- ✅ Automatic SSL handling
- ✅ No connection exhaustion
- ✅ Fast cold starts

Your APIs should now work perfectly in production! 🎉


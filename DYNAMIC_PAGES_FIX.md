# Dynamic Pages Configuration Fix

## Problem
The build was failing with timeout errors on the `/dashboard/overview` page during static generation. The page was trying to statically generate but was making multiple database queries, causing it to exceed Next.js's 60-second timeout limit.

## Solution
Added `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` to all pages that:
- Fetch data from the database
- Use authentication (Clerk's `auth()`)
- Have child components that fetch data from APIs
- Use dynamic route parameters or search params

## Pages Updated

### Main Dashboard Pages
1. ✅ `src/app/dashboard/page.tsx` - Uses authentication
2. ✅ `src/app/dashboard/overview/page.tsx` - Fetches data from database (was causing build failure)
3. ✅ `src/app/dashboard/clients/page.tsx` - Fetches clients from database
4. ✅ `src/app/dashboard/projects/page.tsx` - Already had config ✓
5. ✅ `src/app/dashboard/tickets/page.tsx` - Already had config ✓
6. ✅ `src/app/dashboard/issues/page.tsx` - Already had config ✓
7. ✅ `src/app/dashboard/teams/page.tsx` - Child component fetches data from API
8. ✅ `src/app/dashboard/reports/page.tsx` - Child component fetches data from API
9. ✅ `src/app/dashboard/profile/[[...profile]]/page.tsx` - Uses auth/user data

### Detail Pages (Dynamic Routes)
10. ✅ `src/app/dashboard/clients/[clientId]/page.tsx` - Child component fetches data
11. ✅ `src/app/dashboard/projects/[projectId]/page.tsx` - Child component fetches data
12. ✅ `src/app/dashboard/clients/[clientId]/projects/[projectId]/page.tsx` - Child component fetches data
13. ✅ `src/app/dashboard/tickets/[ticketId]/page.tsx` - Child component fetches data
14. ✅ `src/app/dashboard/issues/[issueId]/page.tsx` - Fetches data from API

### Create/New Pages
15. ✅ `src/app/dashboard/clients/new/page.tsx` - Child component may fetch data
16. ✅ `src/app/dashboard/projects/new/page.tsx` - Child component fetches data
17. ✅ `src/app/dashboard/tickets/new/page.tsx` - Uses authentication and searchParams
18. ✅ `src/app/dashboard/teams/new/page.tsx` - Child component fetches data
19. ✅ `src/app/dashboard/teams/new-member/page.tsx` - Child component fetches data
20. ✅ `src/app/dashboard/reports/new/page.tsx` - Child component fetches data

### Special Pages
21. ✅ `src/app/dashboard/teams/organization-chart/page.tsx` - Child component fetches data

## Linter Warnings Fixed

### Component Files
1. ✅ `src/features/tickets/components/ticket-listing.tsx`
   - Removed unused import `CardTitle`
   - Removed unused prop `showProjectInfo`

### Instrumentation Files
2. ✅ `src/instrumentation-client.ts`
   - Removed unused `hint` parameter in `beforeSend` callback

3. ✅ `src/instrumentation.ts`
   - Removed unused `hint` parameter in `beforeSend` callback

### Seed Files
4. ✅ `src/lib/db/seed-teams.ts`
   - Removed unused variable `newDev` (line 175)
   - Removed unused variable `newQA` (line 231)
   - Removed unused variable `newContractor` (line 279)
   - Removed unused `error` parameter in catch block (line 308)

5. ✅ `src/lib/db/seed.ts`
   - Removed unused imports `eq`, `randomDate`, `randomId`
   - Removed unused variable `_date` (line 832)
   - Removed unused `error` parameter in catch block (line 905)

## Impact
- ✅ Fixes build timeout on `/dashboard/overview` page
- ✅ Prevents similar timeout issues on all dashboard pages
- ✅ Ensures proper dynamic rendering for pages with data fetching
- ✅ Cleans up all TypeScript/ESLint warnings
- ✅ All pages will now properly render on each request instead of attempting static generation

## Testing
After these changes, you should be able to:
1. Successfully build the application without timeouts
2. Push to the repository without pre-push hook failures
3. Deploy to Vercel/production without build errors

## Next Steps
Run the build to verify:
```bash
npm run build
# or
pnpm build
```

If successful, commit and push:
```bash
git add .
git commit -m "fix: add dynamic rendering to all data-fetching pages and fix linter warnings"
git push
```


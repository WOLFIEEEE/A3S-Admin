import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Skeleton Loaders for various UI patterns
 * Prevents content flash and provides smooth loading experience
 */

// Basic Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className='mb-2 h-6 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='h-4 w-4/6' />
        </div>
      </CardContent>
    </Card>
  );
}

// Table Skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className='space-y-3'>
      {/* Table Header */}
      <div className='flex gap-4 border-b pb-3'>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className='h-4 flex-1' />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className='flex gap-4 py-3'>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className='h-4 flex-1' />
          ))}
        </div>
      ))}
    </div>
  );
}

// Data Table Skeleton (with search and filters)
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className='space-y-4'>
      {/* Search and Filter Bar */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <Skeleton className='h-10 w-full sm:w-64' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-24' />
        </div>
      </div>

      {/* Table */}
      <div className='rounded-lg border'>
        <TableSkeleton rows={rows} columns={5} />
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-4 w-32' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-20' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className='space-y-6'>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </div>
      ))}
      <div className='flex justify-end gap-2 pt-4'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </div>
  );
}

// Grid of Cards Skeleton
export function CardGridSkeleton({
  count = 6,
  columns = 3
}: {
  count?: number;
  columns?: number;
}) {
  const gridCols =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid gap-4', gridCols)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className='flex items-center gap-4 rounded-lg border p-4'>
      <Skeleton className='h-12 w-12 flex-shrink-0 rounded-full' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <Skeleton className='h-8 w-20' />
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-4 rounded' />
      </CardHeader>
      <CardContent>
        <Skeleton className='mb-2 h-8 w-20' />
        <Skeleton className='h-3 w-32' />
      </CardContent>
    </Card>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Detail Page Skeleton
export function DetailPageSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Tabs */}
      <div className='flex gap-4 border-b'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-24' />
        ))}
      </div>

      {/* Content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-2'>
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className='space-y-4'>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Wizard/Stepper Skeleton
export function WizardSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Steps */}
      <div className='flex items-center justify-between'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex items-center gap-2'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <Skeleton className='hidden h-4 w-24 sm:block' />
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <Skeleton className='mb-2 h-6 w-48' />
          <Skeleton className='h-4 w-96' />
        </CardHeader>
        <CardContent>
          <FormSkeleton fields={4} />
        </CardContent>
      </Card>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-48' />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn('w-full', height)} />
      </CardContent>
    </Card>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>
      <Skeleton className='h-10 w-32' />
    </div>
  );
}

// Full Page Skeleton (combines multiple elements)
export function FullPageSkeleton() {
  return (
    <div className='space-y-6 p-4 md:p-6'>
      <PageHeaderSkeleton />
      <DashboardStatsSkeleton />
      <CardGridSkeleton count={6} columns={3} />
    </div>
  );
}

// Empty State Skeleton (minimal loading)
export function MinimalSkeleton() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <div className='space-y-4 text-center'>
        <Skeleton className='mx-auto h-12 w-12 rounded-full' />
        <Skeleton className='mx-auto h-4 w-48' />
        <Skeleton className='mx-auto h-3 w-64' />
      </div>
    </div>
  );
}

// Organization Chart Skeleton
export function OrgChartSkeleton() {
  return (
    <div className='space-y-8'>
      {/* Root Node */}
      <div className='flex justify-center'>
        <Card className='w-48'>
          <CardContent className='p-4'>
            <Skeleton className='mx-auto mb-2 h-10 w-10 rounded-full' />
            <Skeleton className='mx-auto mb-1 h-4 w-32' />
            <Skeleton className='mx-auto h-3 w-24' />
          </CardContent>
        </Card>
      </div>

      {/* Child Nodes */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='w-full'>
            <CardContent className='p-4'>
              <Skeleton className='mx-auto mb-2 h-10 w-10 rounded-full' />
              <Skeleton className='mx-auto mb-1 h-4 w-32' />
              <Skeleton className='mx-auto h-3 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Timeline Skeleton
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className='space-y-6'>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className='flex gap-4'>
          <div className='flex flex-col items-center'>
            <Skeleton className='h-8 w-8 flex-shrink-0 rounded-full' />
            {i < items - 1 && (
              <Skeleton className='mt-2 min-h-16 w-0.5 flex-1' />
            )}
          </div>
          <div className='flex-1 pb-8'>
            <Skeleton className='mb-2 h-4 w-32' />
            <Skeleton className='mb-3 h-3 w-48' />
            <Card>
              <CardContent className='p-4'>
                <Skeleton className='mb-2 h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}

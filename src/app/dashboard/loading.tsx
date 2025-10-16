import {
  DashboardStatsSkeleton,
  CardGridSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function DashboardLoading() {
  return (
    <div className='space-y-8'>
      <PageHeaderSkeleton />
      <DashboardStatsSkeleton />
      <CardGridSkeleton count={4} columns={2} />
    </div>
  );
}

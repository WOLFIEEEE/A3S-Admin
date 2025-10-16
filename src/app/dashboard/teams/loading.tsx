import {
  CardGridSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function TeamsLoading() {
  return (
    <div className='space-y-6'>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} columns={2} />
    </div>
  );
}

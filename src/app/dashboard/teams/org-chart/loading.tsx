import {
  OrgChartSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function OrgChartLoading() {
  return (
    <div className='space-y-6'>
      <PageHeaderSkeleton />
      <OrgChartSkeleton />
    </div>
  );
}

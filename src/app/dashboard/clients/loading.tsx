import {
  DataTableSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function ClientsLoading() {
  return (
    <div className='space-y-6'>
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={10} />
    </div>
  );
}

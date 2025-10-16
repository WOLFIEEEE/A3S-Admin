import {
  CardGridSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function ProjectsLoading() {
  return (
    <div className='space-y-6'>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={9} columns={3} />
    </div>
  );
}

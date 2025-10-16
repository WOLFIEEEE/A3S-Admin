import {
  FormSkeleton,
  PageHeaderSkeleton
} from '@/components/ui/skeleton-loader';

export default function NewTeamMemberLoading() {
  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <PageHeaderSkeleton />
      <div className='rounded-lg border p-6'>
        <FormSkeleton fields={8} />
      </div>
    </div>
  );
}

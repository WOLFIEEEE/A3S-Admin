import { WizardSkeleton } from '@/components/ui/skeleton-loader';

export default function NewProjectLoading() {
  return (
    <div className='mx-auto max-w-4xl'>
      <WizardSkeleton />
    </div>
  );
}

import { WizardSkeleton } from '@/components/ui/skeleton-loader';

export default function NewClientLoading() {
  return (
    <div className='mx-auto max-w-4xl'>
      <WizardSkeleton />
    </div>
  );
}

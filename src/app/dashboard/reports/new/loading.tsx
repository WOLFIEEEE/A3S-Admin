import { WizardSkeleton } from '@/components/ui/skeleton-loader';

export default function NewReportLoading() {
  return (
    <div className='mx-auto max-w-6xl'>
      <WizardSkeleton />
    </div>
  );
}

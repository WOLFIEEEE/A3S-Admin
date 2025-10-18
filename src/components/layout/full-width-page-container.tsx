import React from 'react';

export default function FullWidthPageContainer({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-full w-full overflow-hidden p-4 md:p-6'>
      <div className='h-full w-full'>{children}</div>
    </div>
  );
}

import React from 'react';

export default function PageContainer({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-full w-full overflow-hidden p-4 md:px-6'>
      <div className='mx-auto h-full w-full max-w-[1920px]'>{children}</div>
    </div>
  );
}

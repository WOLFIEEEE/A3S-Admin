import React from 'react';

export default function FullWidthPageContainer({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className='w-full p-4 md:p-6'>{children}</div>;
}

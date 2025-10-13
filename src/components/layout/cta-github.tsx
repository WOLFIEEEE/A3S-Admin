import React from 'react';
import { Button } from '@/components/ui/button';
import { IconAccessible, IconExternalLink } from '@tabler/icons-react';

export default function CtaA3S() {
  return (
    <Button variant='ghost' asChild size='sm' className='hidden sm:flex'>
      <a
        href='https://demo.a3s.app'
        rel='noopener noreferrer'
        target='_blank'
        className='dark:text-foreground flex items-center gap-2'
        title='Visit A3S Demo'
      >
        <IconAccessible className='h-4 w-4' />
        <span className='hidden text-xs lg:inline'>Demo</span>
        <IconExternalLink className='h-3 w-3' />
      </a>
    </Button>
  );
}

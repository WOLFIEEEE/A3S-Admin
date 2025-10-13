'use client';

import { ThemeLogo } from '@/components/branding/theme-logo';

export default function MiniFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur'>
      <div className='mx-auto max-w-7xl px-4 py-3 md:px-6'>
        <div className='text-muted-foreground flex items-center justify-between text-xs'>
          <div className='flex items-center gap-2'>
            <ThemeLogo width={16} height={16} className='flex-shrink-0' />
            <span>A3S Admin Dashboard</span>
          </div>
          <div className='flex items-center gap-4'>
            <span>© {currentYear} A3S</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

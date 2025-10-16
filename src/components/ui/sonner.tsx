'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      position='top-right'
      duration={4000}
      closeButton
      richColors
      expand={false}
      visibleToasts={5}
      toastOptions={{
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)'
        },
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border hover:group-[.toast]:bg-accent',
          error:
            'group-[.toast]:border-destructive group-[.toast]:text-destructive',
          success:
            'group-[.toast]:border-green-500 group-[.toast]:text-green-600 dark:group-[.toast]:text-green-400',
          warning:
            'group-[.toast]:border-yellow-500 group-[.toast]:text-yellow-600 dark:group-[.toast]:text-yellow-400',
          info: 'group-[.toast]:border-blue-500 group-[.toast]:text-blue-600 dark:group-[.toast]:text-blue-400'
        }
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

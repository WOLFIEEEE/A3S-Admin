'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getThemedAsset } from '@/lib/branding';

interface A3SLogoProps {
  variant?: 'icon' | 'logo' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  icon: {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  },
  logo: {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto'
  },
  text: {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto'
  }
};

export function A3SLogo({
  variant = 'logo',
  size = 'md',
  className,
  priority = false
}: A3SLogoProps) {
  const { resolvedTheme } = useTheme();

  // Determine if we should use dark or light version
  const isDark = resolvedTheme === 'dark';

  // Get the appropriate image path using branding utilities
  const currentImage = getThemedAsset(
    variant === 'icon' ? 'icons' : variant === 'text' ? 'text' : 'logos',
    isDark,
    'svg'
  );
  const altText = `A3S ${variant === 'icon' ? 'Icon' : variant === 'text' ? 'Text' : 'Logo'}`;

  return (
    <div className={cn(sizeClasses[variant][size], className)}>
      <Image
        src={currentImage}
        alt={altText}
        fill
        className='object-contain'
        priority={priority}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      />
    </div>
  );
}

// Specific logo components for common use cases
export function A3SHeaderLogo({ className }: { className?: string }) {
  return (
    <A3SLogo variant='logo' size='lg' className={className} priority={true} />
  );
}

export function A3SIcon({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return <A3SLogo variant='icon' size={size} className={className} />;
}

export function A3SAuthLogo({ className }: { className?: string }) {
  return (
    <A3SLogo variant='logo' size='xl' className={className} priority={true} />
  );
}

export function A3SText({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return <A3SLogo variant='text' size={size} className={className} />;
}

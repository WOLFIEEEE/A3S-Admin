'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function ThemeLogo({
  className = '',
  width = 32,
  height = 32
}: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during hydration to prevent layout shift
    return (
      <div
        className={`rounded bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width, height }}
      />
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const logoSrc = isDark
    ? '/assets/A3S Branding/A3S Website Logo/A3S White logo.svg'
    : '/assets/A3S Branding/A3S Website Logo/A3S black logo.svg';

  return (
    <Image
      src={logoSrc}
      alt='A3S Logo'
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

export function ThemeIcon({
  className = '',
  size = 24
}: ThemeLogoProps & { size?: number }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`bg-transparent ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const logoSrc = isDark
    ? '/assets/A3S Branding/A3S Website Logo/A3S White logo.png'
    : '/assets/A3S Branding/A3S Website Logo/A3S black logo.png';

  return (
    <Image
      src={logoSrc}
      alt='A3S Logo'
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

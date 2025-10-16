import React from 'react';
import { Metadata } from 'next';
import ChangelogContent from '@/features/documentation/components/changelog-content';

export const metadata: Metadata = {
  title: 'Changelog - A3S Admin Dashboard',
  description:
    'Version history and release notes for the A3S Admin Dashboard. Track new features, improvements, and bug fixes.'
};

export default function ChangelogPage() {
  return <ChangelogContent />;
}

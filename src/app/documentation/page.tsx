import React from 'react';
import { Metadata } from 'next';
import DocumentationContent from '@/features/documentation/components/documentation-content';

export const metadata: Metadata = {
  title: 'Documentation - A3S Admin Dashboard',
  description:
    'Complete documentation for the A3S Admin Dashboard including features, workflows, API reference, and deployment guides.'
};

export default function DocumentationPage() {
  return <DocumentationContent />;
}

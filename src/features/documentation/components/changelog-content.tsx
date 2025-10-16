'use client';

import React, { useState } from 'react';
import {
  IconSparkles,
  IconBug,
  IconAlertTriangle,
  IconTrash,
  IconLock,
  IconBolt,
  IconBook,
  IconRocket,
  IconChevronDown,
  IconChevronRight,
  IconCalendar,
  IconPackage,
  IconExternalLink
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type:
      | 'feature'
      | 'enhancement'
      | 'bugfix'
      | 'breaking'
      | 'deprecation'
      | 'security'
      | 'performance'
      | 'docs';
    title: string;
    description: string;
    items?: string[];
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2025-01-16',
    title: 'Initial Release',
    description:
      'The first production-ready release of A3S Admin Dashboard with full feature set.',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'Client Management',
        description: 'Complete client relationship management system',
        items: [
          'Create, read, update, and delete clients',
          'Multiple contact persons per client',
          'Industry and organization size tracking',
          'Document management (NDAs, contracts, certifications)',
          'Project association and tracking',
          'Activity timeline and audit logs'
        ]
      },
      {
        type: 'feature',
        title: 'Project Management',
        description:
          'Comprehensive project tracking with Google Sheets integration',
        items: [
          'Multi-step project creation wizard',
          'Google Sheets integration for issue tracking',
          'Real-time issue synchronization',
          'Credential management (FTP, GitHub, staging)',
          'Document versioning and file storage',
          'Team member assignment'
        ]
      },
      {
        type: 'feature',
        title: 'AI Report Generation',
        description: 'Automated report generation powered by OpenRouter',
        items: [
          '4-step streamlined workflow',
          'Multiple report types (Executive, Technical, Compliance, Monthly, Custom)',
          'OpenRouter AI integration with GPT-4 and Claude',
          'Rich text editor for content customization',
          'Email delivery with CC/BCC support',
          'Report history and management'
        ]
      },
      {
        type: 'feature',
        title: 'Issue Tracking',
        description: 'WCAG 2.2 compliance issue management',
        items: [
          'Google Sheets synchronization',
          'WCAG guideline classification',
          'Severity levels (Critical, High, Medium, Low)',
          'Status workflow (Open → In Progress → Resolved → Closed)',
          'Team member assignment and due dates',
          'Bulk operations and advanced filtering',
          'Export capabilities (CSV, Excel, PDF)'
        ]
      },
      {
        type: 'feature',
        title: 'Team Management',
        description: 'Organization-wide team and member management',
        items: [
          'Internal and external team organization',
          'Role-based access control',
          'Organization chart visualization',
          'Team member profiles and assignments',
          'Reporting hierarchy',
          'Department and availability tracking'
        ]
      },
      {
        type: 'feature',
        title: 'Notification System',
        description:
          'Comprehensive notification system with persistent history',
        items: [
          'Toast notifications with rich colors',
          'Action buttons (Retry, Undo, View)',
          'Persistent notification center',
          'Unread badge indicators',
          'Category-specific notifications',
          'Cross-tab synchronization',
          'Mobile-responsive design'
        ]
      },
      {
        type: 'enhancement',
        title: 'UI/UX Improvements',
        description: 'Modern, accessible user interface',
        items: [
          'ShadCN UI component library',
          'Dark/Light mode with system preference',
          'Mobile-first responsive design',
          'Command palette (Cmd/Ctrl + K)',
          'Keyboard shortcuts throughout',
          'Loading states and progress indicators',
          'WCAG 2.2 AA compliant interface'
        ]
      },
      {
        type: 'performance',
        title: 'Performance Optimizations',
        description: 'Fast and efficient application',
        items: [
          'Server-side rendering (SSR)',
          'Static generation where applicable',
          'Image optimization',
          'Code splitting and lazy loading',
          'Database query optimization',
          'Caching strategies'
        ]
      },
      {
        type: 'docs',
        title: 'Documentation',
        description: 'Comprehensive documentation and guides',
        items: [
          'README with quick start guide',
          '100+ pages of detailed documentation',
          'API reference with examples',
          'Database schema documentation',
          'Deployment guides for multiple platforms',
          'Best practices and troubleshooting'
        ]
      }
    ]
  }
];

const upcomingFeatures = [
  {
    quarter: 'Q1 2025',
    features: [
      'PDF export for reports',
      'Custom branding for reports',
      'Advanced analytics dashboard',
      'WebSocket for real-time updates'
    ]
  },
  {
    quarter: 'Q2 2025',
    features: [
      'Automated testing suite',
      'API webhooks',
      'Third-party integrations (Jira, Slack)',
      'Advanced reporting templates'
    ]
  },
  {
    quarter: 'Q3 2025',
    features: [
      'Multi-language support (i18n)',
      'Advanced RBAC with custom roles',
      'Audit trail system',
      'Advanced search with Elasticsearch'
    ]
  },
  {
    quarter: 'Q4 2025',
    features: [
      'White-label solution',
      'Enterprise SSO (SAML, OIDC)',
      'Advanced workflow automation',
      'Custom fields and forms'
    ]
  }
];

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <IconSparkles className='h-4 w-4 text-blue-500' />;
    case 'enhancement':
      return <IconRocket className='h-4 w-4 text-green-500' />;
    case 'bugfix':
      return <IconBug className='h-4 w-4 text-red-500' />;
    case 'breaking':
      return <IconAlertTriangle className='h-4 w-4 text-orange-500' />;
    case 'deprecation':
      return <IconTrash className='h-4 w-4 text-gray-500' />;
    case 'security':
      return <IconLock className='h-4 w-4 text-purple-500' />;
    case 'performance':
      return <IconBolt className='h-4 w-4 text-yellow-500' />;
    case 'docs':
      return <IconBook className='h-4 w-4 text-cyan-500' />;
    default:
      return <IconPackage className='h-4 w-4 text-gray-500' />;
  }
};

const getChangeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    feature: 'New Feature',
    enhancement: 'Enhancement',
    bugfix: 'Bug Fix',
    breaking: 'Breaking Change',
    deprecation: 'Deprecation',
    security: 'Security',
    performance: 'Performance',
    docs: 'Documentation'
  };
  return labels[type] || type;
};

export default function ChangelogContent() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>(['1.0.0']);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    );
  };

  return (
    <div className='from-background to-muted/20 min-h-screen bg-gradient-to-b'>
      {/* Header */}
      <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <IconPackage className='text-primary h-6 w-6' />
                <div>
                  <h1 className='text-xl font-bold'>Changelog</h1>
                  <p className='text-muted-foreground hidden text-xs sm:block'>
                    Version history and release notes
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Link href='/documentation'>
                <Button variant='outline' size='sm'>
                  <IconBook className='mr-2 h-4 w-4' />
                  <span className='hidden sm:inline'>Documentation</span>
                </Button>
              </Link>
              <Link href='/dashboard'>
                <Button size='sm'>
                  <span className='hidden sm:inline'>Back to Dashboard</span>
                  <span className='sm:hidden'>Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto max-w-5xl px-4 py-8'>
        {/* Hero Section */}
        <div className='mb-12'>
          <div className='from-primary/10 via-primary/5 to-background rounded-lg border bg-gradient-to-r p-8'>
            <Badge className='mb-4'>Latest: v1.0.0</Badge>
            <h2 className='mb-4 text-3xl font-bold'>What&apos;s New in A3S</h2>
            <p className='text-muted-foreground mb-6 text-lg'>
              Track all updates, new features, improvements, and bug fixes
              across all versions.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Button variant='outline' size='sm' asChild>
                <a
                  href='https://github.com/your-org/a3s-admin/releases'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <IconExternalLink className='mr-2 h-4 w-4' />
                  GitHub Releases
                </a>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                  })
                }
              >
                <IconRocket className='mr-2 h-4 w-4' />
                Upcoming Features
              </Button>
            </div>
          </div>
        </div>

        {/* Version History */}
        <div className='space-y-6'>
          <h3 className='flex items-center gap-2 text-2xl font-bold'>
            <IconCalendar className='text-primary h-6 w-6' />
            Release History
          </h3>

          {changelogData.map((entry) => {
            const isExpanded = expandedVersions.includes(entry.version);

            return (
              <Card key={entry.version} className='overflow-hidden'>
                <CardHeader
                  className='hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => toggleVersion(entry.version)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-3'>
                        <Badge
                          variant={
                            entry.type === 'major'
                              ? 'default'
                              : entry.type === 'minor'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          v{entry.version}
                        </Badge>
                        <span className='text-muted-foreground text-sm'>
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <CardTitle className='mb-2 text-xl'>
                        {entry.title}
                      </CardTitle>
                      <CardDescription>{entry.description}</CardDescription>
                    </div>
                    <Button variant='ghost' size='icon'>
                      {isExpanded ? (
                        <IconChevronDown className='h-5 w-5' />
                      ) : (
                        <IconChevronRight className='h-5 w-5' />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className='pt-0'>
                    <Separator className='mb-6' />

                    <div className='space-y-6'>
                      {entry.changes.map((change, _index) => (
                        <div key={_index} className='space-y-3'>
                          <div className='flex items-start gap-3'>
                            <div className='mt-1 flex-shrink-0'>
                              {getChangeIcon(change.type)}
                            </div>
                            <div className='flex-1'>
                              <div className='mb-1 flex items-center gap-2'>
                                <Badge variant='outline' className='text-xs'>
                                  {getChangeTypeLabel(change.type)}
                                </Badge>
                                <h4 className='font-semibold'>
                                  {change.title}
                                </h4>
                              </div>
                              <p className='text-muted-foreground mb-3 text-sm'>
                                {change.description}
                              </p>
                              {change.items && change.items.length > 0 && (
                                <ul className='space-y-1.5 text-sm'>
                                  {change.items.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className='flex items-start gap-2'
                                    >
                                      <IconChevronRight className='text-primary mt-0.5 h-4 w-4 flex-shrink-0' />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          {_index < entry.changes.length - 1 && (
                            <Separator className='my-4' />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Upcoming Features */}
        <div className='mt-16'>
          <h3 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
            <IconRocket className='text-primary h-6 w-6' />
            Upcoming Features
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {upcomingFeatures.map((quarter) => (
              <Card key={quarter.quarter}>
                <CardHeader>
                  <CardTitle className='text-lg'>{quarter.quarter}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2'>
                    {quarter.features.map((feature, _index) => (
                      <li
                        key={_index}
                        className='flex items-start gap-2 text-sm'
                      >
                        <IconChevronRight className='text-primary mt-0.5 h-4 w-4 flex-shrink-0' />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='bg-muted/50 mt-6'>
            <CardHeader>
              <CardTitle className='text-sm'>📣 Feature Requests</CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground text-sm'>
              <p className='mb-2'>
                Have an idea for a new feature? We&apos;d love to hear from you!
              </p>
              <Button variant='outline' size='sm' asChild>
                <a
                  href='https://github.com/your-org/a3s-admin/discussions'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <IconExternalLink className='mr-2 h-3 w-3' />
                  Submit Feature Request
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className='text-muted-foreground mt-16 border-t pt-8 text-center text-sm'>
          <p>Made with ❤️ by the A3S Team • Last updated: January 2025</p>
          <p className='mt-2'>
            <Link href='/documentation' className='hover:text-foreground'>
              View Documentation
            </Link>
            {' • '}
            <a href='mailto:support@a3s.com' className='hover:text-foreground'>
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

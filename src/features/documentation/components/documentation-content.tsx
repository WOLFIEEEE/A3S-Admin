'use client';

import React, { useState } from 'react';
import {
  IconBook,
  IconRocket,
  IconCode,
  IconDatabase,
  IconApi,
  IconCloud,
  IconBulb,
  IconSearch,
  IconMenu2,
  IconX,
  IconChevronRight,
  IconExternalLink,
  IconFileText,
  IconShieldCheck
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
  }[];
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <IconRocket className='h-5 w-5' />,
    description: 'Quick start guide and installation instructions',
    items: [
      {
        id: 'installation',
        title: 'Installation',
        description: 'Set up the project locally in minutes'
      },
      {
        id: 'configuration',
        title: 'Configuration',
        description: 'Environment variables and service setup'
      },
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Create your first client and project'
      }
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: <IconCode className='h-5 w-5' />,
    description: 'System design and technology stack',
    items: [
      {
        id: 'overview',
        title: 'Overview',
        description: 'High-level architecture and data flow'
      },
      {
        id: 'tech-stack',
        title: 'Tech Stack',
        description: 'Technologies and frameworks used'
      },
      {
        id: 'folder-structure',
        title: 'Folder Structure',
        description: 'Project organization and conventions'
      }
    ]
  },
  {
    id: 'features',
    title: 'Features & Workflows',
    icon: <IconFileText className='h-5 w-5' />,
    description: 'Detailed feature documentation',
    items: [
      {
        id: 'client-management',
        title: 'Client Management',
        description: 'Create, manage, and track clients'
      },
      {
        id: 'project-management',
        title: 'Project Management',
        description: 'Projects and Google Sheets integration'
      },
      {
        id: 'ai-reports',
        title: 'AI Report Generation',
        description: 'Generate professional accessibility reports'
      },
      {
        id: 'issue-tracking',
        title: 'Issue Tracking',
        description: 'WCAG compliance issue management'
      },
      {
        id: 'team-management',
        title: 'Team Management',
        description: 'Organize teams and members'
      },
      {
        id: 'notifications',
        title: 'Notification System',
        description: 'Toast notifications and notification center'
      }
    ]
  },
  {
    id: 'database',
    title: 'Database Schema',
    icon: <IconDatabase className='h-5 w-5' />,
    description: 'Database structure and relationships',
    items: [
      {
        id: 'schema-overview',
        title: 'Schema Overview',
        description: 'Entity relationship diagram'
      },
      {
        id: 'tables',
        title: 'Tables',
        description: 'Detailed table structures'
      },
      {
        id: 'relationships',
        title: 'Relationships',
        description: 'Foreign keys and associations'
      }
    ]
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: <IconApi className='h-5 w-5' />,
    description: 'REST API endpoints and usage',
    items: [
      {
        id: 'clients-api',
        title: 'Clients API',
        description: 'Client management endpoints'
      },
      {
        id: 'projects-api',
        title: 'Projects API',
        description: 'Project and issue endpoints'
      },
      {
        id: 'reports-api',
        title: 'Reports API',
        description: 'Report generation and email'
      },
      {
        id: 'teams-api',
        title: 'Teams API',
        description: 'Team and member endpoints'
      }
    ]
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: <IconCloud className='h-5 w-5' />,
    description: 'Production deployment guides',
    items: [
      {
        id: 'vercel',
        title: 'Vercel Deployment',
        description: 'Deploy to Vercel (recommended)'
      },
      {
        id: 'docker',
        title: 'Docker Deployment',
        description: 'Containerized deployment'
      },
      {
        id: 'manual',
        title: 'Manual Deployment',
        description: 'Deploy to your own server'
      }
    ]
  },
  {
    id: 'guides',
    title: 'Best Practices',
    icon: <IconBulb className='h-5 w-5' />,
    description: 'Tips, tricks, and recommendations',
    items: [
      {
        id: 'development',
        title: 'Development',
        description: 'Code organization and patterns'
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Security best practices'
      },
      {
        id: 'performance',
        title: 'Performance',
        description: 'Optimization techniques'
      },
      {
        id: 'maintenance',
        title: 'Maintenance',
        description: 'Updates and monitoring'
      }
    ]
  }
];

const quickLinks = [
  {
    title: 'Quick Start',
    description: '5-minute setup guide',
    href: '#getting-started',
    icon: <IconRocket className='h-4 w-4' />
  },
  {
    title: 'API Reference',
    description: 'Complete API docs',
    href: '#api',
    icon: <IconApi className='h-4 w-4' />
  },
  {
    title: 'Deployment',
    description: 'Go to production',
    href: '#deployment',
    icon: <IconCloud className='h-4 w-4' />
  },
  {
    title: 'Changelog',
    description: 'Version history',
    href: '/changelog',
    icon: <IconFileText className='h-4 w-4' />
  }
];

export default function DocumentationContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.items.some(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSelectedSection(sectionId);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className='from-background to-muted/20 min-h-screen bg-gradient-to-b'>
      {/* Header */}
      <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                className='lg:hidden'
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? (
                  <IconX className='h-5 w-5' />
                ) : (
                  <IconMenu2 className='h-5 w-5' />
                )}
              </Button>
              <div className='flex items-center gap-2'>
                <IconBook className='text-primary h-6 w-6' />
                <div>
                  <h1 className='text-xl font-bold'>Documentation</h1>
                  <p className='text-muted-foreground hidden text-xs sm:block'>
                    Complete guide to A3S Admin Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Link href='/changelog'>
                <Button variant='outline' size='sm'>
                  <IconFileText className='mr-2 h-4 w-4' />
                  <span className='hidden sm:inline'>Changelog</span>
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

          {/* Search Bar */}
          <div className='mt-4'>
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search documentation...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          {/* Sidebar Navigation */}
          <div
            className={cn(
              'lg:col-span-3',
              'fixed top-[140px] right-0 left-0 z-40 lg:sticky',
              'bg-background lg:bg-transparent',
              'border-b lg:border-0',
              'transition-transform duration-300',
              isSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0',
              'lg:h-[calc(100vh-180px)]'
            )}
          >
            <ScrollArea className='h-full px-4 lg:px-0'>
              <div className='space-y-2 pb-4'>
                {docSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2',
                        'text-sm font-medium transition-colors',
                        'hover:bg-muted',
                        selectedSection === section.id &&
                          'bg-primary text-primary-foreground'
                      )}
                    >
                      {section.icon}
                      {section.title}
                    </button>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 pl-9',
                          'text-xs transition-colors',
                          'hover:bg-muted',
                          selectedSection === item.id &&
                            'text-primary font-medium'
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-9'>
            {/* Hero Section */}
            <div className='mb-12'>
              <div className='from-primary/10 via-primary/5 to-background rounded-lg border bg-gradient-to-r p-8'>
                <Badge className='mb-4'>v1.0.0</Badge>
                <h2 className='mb-4 text-3xl font-bold'>
                  Welcome to A3S Documentation
                </h2>
                <p className='text-muted-foreground mb-6 text-lg'>
                  Comprehensive guide to building, deploying, and maintaining
                  your accessibility compliance platform.
                </p>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {quickLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.href}
                      className='bg-background hover:bg-muted group flex items-start gap-3 rounded-lg border p-4 transition-colors'
                    >
                      <div className='text-primary mt-0.5 flex-shrink-0'>
                        {link.icon}
                      </div>
                      <div>
                        <div className='flex items-center gap-1 text-sm font-medium'>
                          {link.title}
                          <IconChevronRight className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {link.description}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Documentation Sections */}
            <div className='space-y-12'>
              {filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className='scroll-mt-24'
                >
                  <div className='mb-6 flex items-center gap-3'>
                    <div className='bg-primary/10 text-primary flex-shrink-0 rounded-lg p-2'>
                      {section.icon}
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold'>{section.title}</h2>
                      <p className='text-muted-foreground text-sm'>
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {section.items.map((item) => (
                      <Card
                        key={item.id}
                        id={item.id}
                        className='cursor-pointer transition-shadow hover:shadow-md'
                        onClick={() => scrollToSection(item.id)}
                      >
                        <CardHeader>
                          <CardTitle className='flex items-center justify-between text-lg'>
                            {item.title}
                            <IconChevronRight className='text-muted-foreground h-4 w-4' />
                          </CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  <Separator className='mt-8' />
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className='mt-16 border-t pt-8'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <IconBulb className='h-4 w-4' />
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-muted-foreground text-sm'>
                    <p>
                      Check out our troubleshooting guide or contact support.
                    </p>
                    <Button variant='link' size='sm' className='mt-2 px-0'>
                      Get Support
                      <IconExternalLink className='ml-1 h-3 w-3' />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <IconShieldCheck className='h-4 w-4' />
                      Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-muted-foreground text-sm'>
                    <p>Learn security, performance, and development tips.</p>
                    <Button
                      variant='link'
                      size='sm'
                      className='mt-2 px-0'
                      onClick={() => scrollToSection('guides')}
                    >
                      View Guides
                      <IconChevronRight className='ml-1 h-3 w-3' />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <IconFileText className='h-4 w-4' />
                      What&apos;s New
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-muted-foreground text-sm'>
                    <p>See the latest features and improvements.</p>
                    <Link href='/changelog'>
                      <Button variant='link' size='sm' className='mt-2 px-0'>
                        View Changelog
                        <IconChevronRight className='ml-1 h-3 w-3' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <div className='text-muted-foreground mt-8 text-center text-sm'>
                <p>Made with ❤️ by the A3S Team • Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

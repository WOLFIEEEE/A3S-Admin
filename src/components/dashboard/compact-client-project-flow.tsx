'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  IconSearch,
  IconBuilding,
  IconFolder,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconAccessible,
  IconClock,
  IconDots,
  IconChevronRight,
  IconPlus,
  IconFilter,
  IconLayoutGrid,
  IconList
} from '@tabler/icons-react';
import Link from 'next/link';
import { Client } from '@/types/client';
import { Project } from '@/types/project';

interface CompactClientProjectFlowProps {
  clients: Client[];
  projects: Project[];
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'clients' | 'projects';

const statusColors = {
  // Client statuses
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',

  // Project statuses
  planning: 'bg-blue-50 text-blue-700 border-blue-200',
  on_hold: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  archived: 'bg-gray-50 text-gray-700 border-gray-200'
};

const priorityColors = {
  low: 'bg-gray-50 text-gray-600',
  medium: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600'
};

export default function CompactClientProjectFlow({
  clients,
  projects
}: CompactClientProjectFlowProps) {
  // Safe date formatting helper
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Get client name helper
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.company : 'Unknown Client';
  };

  // Get client projects count
  const getClientProjectsCount = (clientId: string) => {
    return projects.filter((p) => p.clientId === clientId).length;
  };

  // Get client active projects count
  const getClientActiveProjectsCount = (clientId: string) => {
    return projects.filter(
      (p) => p.clientId === clientId && p.status === 'active'
    ).length;
  };

  // Combined and filtered data
  const combinedData = useMemo(() => {
    let items: Array<{ type: 'client' | 'project'; data: Client | Project }> =
      [];

    if (filterType === 'all' || filterType === 'clients') {
      items.push(
        ...clients.map((client) => ({ type: 'client' as const, data: client }))
      );
    }

    if (filterType === 'all' || filterType === 'projects') {
      items.push(
        ...projects.map((project) => ({
          type: 'project' as const,
          data: project
        }))
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        if (item.type === 'client') {
          const client = item.data as Client;
          return (
            client.name.toLowerCase().includes(query) ||
            client.company.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
          );
        } else {
          const project = item.data as Project;
          return (
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            getClientName(project.clientId).toLowerCase().includes(query)
          );
        }
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'recent') {
        return (
          new Date(b.data.createdAt).getTime() -
          new Date(a.data.createdAt).getTime()
        );
      } else if (sortBy === 'name') {
        const aName =
          a.type === 'client'
            ? (a.data as Client).company
            : (a.data as Project).name;
        const bName =
          b.type === 'client'
            ? (b.data as Client).company
            : (b.data as Project).name;
        return aName.localeCompare(bName);
      }
      return 0;
    });

    return items;
  }, [clients, projects, searchQuery, filterType, sortBy]);

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className='group border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex min-w-0 flex-1 items-start gap-3'>
            <Avatar className='h-10 w-10 shrink-0'>
              <AvatarFallback className='bg-blue-100 text-blue-700'>
                {client.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h3 className='truncate text-sm font-semibold'>
                  {client.company}
                </h3>
                <Badge
                  variant='outline'
                  className={`text-xs ${statusColors[client.status]}`}
                >
                  {client.status}
                </Badge>
              </div>

              <p className='text-muted-foreground mb-2 truncate text-xs'>
                {client.name}
              </p>

              <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                <div className='flex items-center gap-1'>
                  <IconFolder className='h-3 w-3' />
                  <span>{getClientProjectsCount(client.id)} projects</span>
                </div>
                <div className='flex items-center gap-1'>
                  <IconTrendingUp className='h-3 w-3' />
                  <span>{getClientActiveProjectsCount(client.id)} active</span>
                </div>
                <div className='flex items-center gap-1'>
                  <IconCalendar className='h-3 w-3' />
                  <span>{formatDate(client.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <Link href={`/dashboard/clients/${client.id}`}>
            <Button
              size='sm'
              variant='ghost'
              className='opacity-0 transition-opacity group-hover:opacity-100'
            >
              <IconChevronRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className='group border-l-4 border-l-green-500 transition-all duration-200 hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex min-w-0 flex-1 items-start gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100'>
              <IconAccessible className='h-5 w-5 text-green-700' />
            </div>

            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h3 className='truncate text-sm font-semibold'>
                  {project.name}
                </h3>
                <Badge
                  variant='outline'
                  className={`text-xs ${statusColors[project.status]}`}
                >
                  {project.status.replace(/_/g, ' ')}
                </Badge>
                {project.priority && (
                  <Badge
                    variant='secondary'
                    className={`text-xs ${priorityColors[project.priority]}`}
                  >
                    {project.priority}
                  </Badge>
                )}
              </div>

              <p className='text-muted-foreground mb-2 truncate text-xs'>
                {getClientName(project.clientId)}
              </p>

              <div className='mb-2 flex items-center gap-2'>
                <Progress
                  value={project.progressPercentage || 0}
                  className='h-1 flex-1'
                />
                <span className='text-muted-foreground text-xs'>
                  {project.progressPercentage || 0}%
                </span>
              </div>

              <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                <div className='flex items-center gap-1'>
                  <IconAccessible className='h-3 w-3' />
                  <span>WCAG {project.wcagLevel}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <IconClock className='h-3 w-3' />
                  <span>
                    {project.milestonesCompleted}/{project.totalMilestones}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <IconCalendar className='h-3 w-3' />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href={`/dashboard/clients/${project.clientId}/projects/${project.id}`}
          >
            <Button
              size='sm'
              variant='ghost'
              className='opacity-0 transition-opacity group-hover:opacity-100'
            >
              <IconChevronRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const ListView = () => (
    <div className='space-y-2'>
      {combinedData.map((item, index) => (
        <div key={`${item.type}-${item.data.id}`}>
          {item.type === 'client' ? (
            <ClientCard client={item.data as Client} />
          ) : (
            <ProjectCard project={item.data as Project} />
          )}
        </div>
      ))}
    </div>
  );

  const GridView = () => (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {combinedData.map((item, index) => (
        <div key={`${item.type}-${item.data.id}`}>
          {item.type === 'client' ? (
            <ClientCard client={item.data as Client} />
          ) : (
            <ProjectCard project={item.data as Project} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Clients & Projects
          </h2>
          <p className='text-muted-foreground'>
            Unified view of your accessibility compliance portfolio
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Link href='/dashboard/clients/new'>
            <Button size='sm' variant='outline'>
              <IconUsers className='mr-2 h-4 w-4' />
              New Client
            </Button>
          </Link>
          <Link href='/dashboard/projects/new'>
            <Button size='sm'>
              <IconPlus className='mr-2 h-4 w-4' />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4 lg:flex-row'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                <Input
                  placeholder='Search clients and projects...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center gap-2'>
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
                <SelectTrigger className='w-[140px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Items</SelectItem>
                  <SelectItem value='clients'>Clients Only</SelectItem>
                  <SelectItem value='projects'>Projects Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='recent'>Most Recent</SelectItem>
                  <SelectItem value='name'>Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className='flex items-center rounded-md border'>
                <Button
                  size='sm'
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className='rounded-r-none'
                >
                  <IconLayoutGrid className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className='rounded-l-none'
                >
                  <IconList className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <IconUsers className='h-4 w-4 text-blue-600' />
              <div>
                <p className='text-2xl font-bold'>{clients.length}</p>
                <p className='text-muted-foreground text-xs'>Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <IconFolder className='h-4 w-4 text-green-600' />
              <div>
                <p className='text-2xl font-bold'>{projects.length}</p>
                <p className='text-muted-foreground text-xs'>Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <IconTrendingUp className='h-4 w-4 text-orange-600' />
              <div>
                <p className='text-2xl font-bold'>
                  {projects.filter((p) => p.status === 'active').length}
                </p>
                <p className='text-muted-foreground text-xs'>Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <IconAccessible className='h-4 w-4 text-purple-600' />
              <div>
                <p className='text-2xl font-bold'>
                  {Math.round(
                    projects.reduce(
                      (acc, p) => acc + (p.progressPercentage || 0),
                      0
                    ) / projects.length
                  ) || 0}
                  %
                </p>
                <p className='text-muted-foreground text-xs'>Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Showing {combinedData.length} items
          </p>
        </div>

        {combinedData.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <IconBuilding className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-medium'>No items found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by adding clients and projects'}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <GridView />
        ) : (
          <ListView />
        )}
      </div>
    </div>
  );
}

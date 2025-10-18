'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconPlus,
  IconSearch,
  IconTicket,
  IconUser,
  IconCalendar,
  IconClock,
  IconEye,
  IconEdit,
  IconArrowUp,
  IconArrowDown,
  IconMinus
} from '@tabler/icons-react';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '@/types';

interface TicketListingProps {
  tickets: Ticket[];
  projectId?: string;
  showProjectInfo?: boolean;
  onTicketUpdated?: (ticket: Ticket) => void;
  isLoading?: boolean;
  showHeader?: boolean;
}

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600'
};

const priorityIcons: Record<TicketPriority, React.ReactNode> = {
  low: <IconArrowDown className='h-3 w-3' />,
  medium: <IconMinus className='h-3 w-3' />,
  high: <IconArrowUp className='h-3 w-3' />,
  critical: <IconArrowUp className='h-3 w-3' />
};

const typeColors: Record<TicketType, string> = {
  bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  task: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  improvement:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  accessibility:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export default function TicketListing({
  tickets,
  projectId,
  onTicketUpdated,
  isLoading = false,
  showHeader = true
}: TicketListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'createdAt'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        (ticket) => ticket.priority === priorityFilter
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      } else if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    tickets,
    searchQuery,
    statusFilter,
    priorityFilter,
    typeFilter,
    sortBy,
    sortOrder
  ]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusUpdateUrl = (ticketId: string) => {
    return projectId
      ? `/dashboard/clients/[clientId]/projects/${projectId}/tickets/${ticketId}`
      : `/dashboard/tickets/${ticketId}`;
  };

  const handleStatusUpdate = async (
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      const updatedTicket = await response.json();
      if (onTicketUpdated) {
        onTicketUpdated(updatedTicket.data);
      }
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-6'>
              <div className='space-y-3'>
                <div className='bg-muted h-4 w-3/4 rounded'></div>
                <div className='bg-muted h-3 w-1/2 rounded'></div>
                <div className='flex gap-2'>
                  <div className='bg-muted h-5 w-16 rounded'></div>
                  <div className='bg-muted h-5 w-20 rounded'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header - Only show if showHeader is true */}
      {showHeader && (
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {projectId ? 'Project Tickets' : 'All Tickets'}
            </h1>
            <p className='text-muted-foreground'>
              Manage accessibility compliance tickets and track progress
            </p>
          </div>
          <Link
            href={
              projectId ? `${projectId}/tickets/new` : '/dashboard/tickets/new'
            }
          >
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Create Ticket
            </Button>
          </Link>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {/* Search */}
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <Input
                placeholder='Search tickets by title, description, or tags...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
                aria-label='Search tickets'
              />
            </div>

            {/* Filter Controls */}
            <div className='flex flex-wrap gap-4'>
              <Select
                value={statusFilter}
                onValueChange={(value: TicketStatus | 'all') =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger
                  className='w-[140px]'
                  aria-label='Filter by status'
                >
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='open'>Open</SelectItem>
                  <SelectItem value='in_progress'>In Progress</SelectItem>
                  <SelectItem value='review'>In Review</SelectItem>
                  <SelectItem value='resolved'>Resolved</SelectItem>
                  <SelectItem value='closed'>Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priorityFilter}
                onValueChange={(value: TicketPriority | 'all') =>
                  setPriorityFilter(value)
                }
              >
                <SelectTrigger
                  className='w-[140px]'
                  aria-label='Filter by priority'
                >
                  <SelectValue placeholder='All Priorities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Priorities</SelectItem>
                  <SelectItem value='critical'>Critical</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value: TicketType | 'all') =>
                  setTypeFilter(value)
                }
              >
                <SelectTrigger
                  className='w-[140px]'
                  aria-label='Filter by type'
                >
                  <SelectValue placeholder='All Types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='bug'>Bug</SelectItem>
                  <SelectItem value='feature'>Feature</SelectItem>
                  <SelectItem value='task'>Task</SelectItem>
                  <SelectItem value='improvement'>Improvement</SelectItem>
                  <SelectItem value='accessibility'>Accessibility</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
              >
                <SelectTrigger className='w-[160px]' aria-label='Sort tickets'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='createdAt-desc'>Newest First</SelectItem>
                  <SelectItem value='createdAt-asc'>Oldest First</SelectItem>
                  <SelectItem value='priority-desc'>
                    High Priority First
                  </SelectItem>
                  <SelectItem value='priority-asc'>
                    Low Priority First
                  </SelectItem>
                  <SelectItem value='title-asc'>Title (A-Z)</SelectItem>
                  <SelectItem value='title-desc'>Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Showing {filteredAndSortedTickets.length} of {tickets.length} tickets
        </p>
      </div>

      {/* Ticket List */}
      <div className='space-y-4'>
        {filteredAndSortedTickets.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <IconTicket className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-medium'>No tickets found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery ||
                statusFilter !== 'all' ||
                priorityFilter !== 'all' ||
                typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first accessibility ticket'}
              </p>
              {!searchQuery &&
                statusFilter === 'all' &&
                priorityFilter === 'all' &&
                typeFilter === 'all' && (
                  <Link
                    href={
                      projectId
                        ? `${projectId}/tickets/new`
                        : '/dashboard/tickets/new'
                    }
                  >
                    <Button>
                      <IconPlus className='mr-2 h-4 w-4' />
                      Create Your First Ticket
                    </Button>
                  </Link>
                )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedTickets.map((ticket) => (
            <Card key={ticket.id} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0 flex-1'>
                    {/* Title and Badges */}
                    <div className='mb-3 flex items-start gap-3'>
                      <div className='min-w-0 flex-1'>
                        <h3 className='mb-2 truncate text-lg font-semibold'>
                          {ticket.title}
                        </h3>
                        <div className='mb-2 flex flex-wrap items-center gap-2'>
                          <Badge className={statusColors[ticket.status]}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={typeColors[ticket.type]}>
                            {ticket.type}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${priorityColors[ticket.priority]}`}
                          >
                            {priorityIcons[ticket.priority]}
                            <span className='capitalize'>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className='text-muted-foreground mb-3 line-clamp-2 text-sm'>
                      {ticket.description}
                    </p>

                    {/* Tags */}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className='mb-3 flex flex-wrap gap-1'>
                        {ticket.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant='outline'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {ticket.tags.length > 3 && (
                          <Badge variant='outline' className='text-xs'>
                            +{ticket.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-xs'>
                      <div className='flex items-center gap-1'>
                        <IconCalendar className='h-3 w-3' />
                        <span>Created {formatDate(ticket.createdAt)}</span>
                      </div>

                      {ticket.assigneeId && (
                        <div className='flex items-center gap-1'>
                          <IconUser className='h-3 w-3' />
                          <span>Assigned</span>
                        </div>
                      )}

                      {ticket.estimatedHours && (
                        <div className='flex items-center gap-1'>
                          <IconClock className='h-3 w-3' />
                          <span>{ticket.estimatedHours}h estimated</span>
                        </div>
                      )}

                      {ticket.dueDate && (
                        <div className='flex items-center gap-1'>
                          <IconCalendar className='h-3 w-3' />
                          <span>Due {formatDate(ticket.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-2'>
                    {/* Quick Status Update */}
                    <Select
                      value={ticket.status}
                      onValueChange={(value: TicketStatus) =>
                        handleStatusUpdate(ticket.id, value)
                      }
                    >
                      <SelectTrigger
                        className='w-32'
                        aria-label={`Update status for ${ticket.title}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='open'>Open</SelectItem>
                        <SelectItem value='in_progress'>In Progress</SelectItem>
                        <SelectItem value='review'>In Review</SelectItem>
                        <SelectItem value='resolved'>Resolved</SelectItem>
                        <SelectItem value='closed'>Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Link href={getStatusUpdateUrl(ticket.id)}>
                      <Button
                        size='sm'
                        variant='ghost'
                        aria-label={`View details for ${ticket.title}`}
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                    </Link>

                    <Link href={`${getStatusUpdateUrl(ticket.id)}/edit`}>
                      <Button
                        size='sm'
                        variant='ghost'
                        aria-label={`Edit ${ticket.title}`}
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

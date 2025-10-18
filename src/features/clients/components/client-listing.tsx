'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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
  IconBuilding,
  IconMail,
  IconPhone,
  IconCalendar,
  IconEye,
  IconTrash,
  IconLoader2
} from '@tabler/icons-react';
import { Client, ClientStatus } from '@/types';

interface ClientListingProps {
  // No props needed - component fetches its own data
}

const statusColors: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const statusLabels: Record<ClientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
};

export default function ClientListing({}: ClientListingProps = {}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'createdAt'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/clients?limit=1000');

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const result = await response.json();

      if (result.success) {
        setClients(result.data?.clients || result.data || []);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.company.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'createdAt') {
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
  }, [clients, searchQuery, statusFilter, sortBy, sortOrder]);

  const _formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this client? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Update local state to remove the deleted client
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientId)
      );
    } catch (error) {
      alert('Failed to delete client. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>Loading clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <IconBuilding className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>Error loading clients</h3>
          <p className='text-muted-foreground mb-6 text-center'>{error}</p>
          <Button onClick={fetchClients}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-4'>
          <div>
            <p className='text-muted-foreground text-sm'>
              {filteredAndSortedClients.length} client
              {filteredAndSortedClients.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <Link href='/dashboard/clients/new'>
          <Button size='lg'>
            <IconPlus className='mr-2 h-4 w-4' />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-6 lg:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                <Input
                  placeholder='Search clients by name, email, or company...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value: ClientStatus | 'all') =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
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
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name-asc'>Name (A-Z)</SelectItem>
                <SelectItem value='name-desc'>Name (Z-A)</SelectItem>
                <SelectItem value='company-asc'>Company (A-Z)</SelectItem>
                <SelectItem value='company-desc'>Company (Z-A)</SelectItem>
                <SelectItem value='createdAt-desc'>Newest First</SelectItem>
                <SelectItem value='createdAt-asc'>Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Showing {filteredAndSortedClients.length} of {clients.length} clients
        </p>
      </div>

      {/* Client Cards */}
      <div className='grid gap-6'>
        {filteredAndSortedClients.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <IconBuilding className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-medium'>No clients found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first client'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href='/dashboard/clients/new'>
                  <Button>
                    <IconPlus className='mr-2 h-4 w-4' />
                    Add Your First Client
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedClients.map((client) => (
            <Card
              key={client.id}
              className='border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-lg'
            >
              <CardContent className='p-8'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <h3 className='truncate text-lg font-semibold'>
                        {client.name}
                      </h3>
                      <Badge className={statusColors[client.status]}>
                        {statusLabels[client.status]}
                      </Badge>
                    </div>

                    <div className='text-muted-foreground grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4'>
                      <div className='flex items-center gap-2'>
                        <IconBuilding className='h-4 w-4' />
                        <span className='truncate'>{client.company}</span>
                      </div>

                      <div className='flex items-center gap-2'>
                        <IconMail className='h-4 w-4' />
                        <span className='truncate'>{client.email}</span>
                      </div>

                      {client.phone && (
                        <div className='flex items-center gap-2'>
                          <IconPhone className='h-4 w-4' />
                          <span className='truncate'>{client.phone}</span>
                        </div>
                      )}

                      <div className='flex items-center gap-2'>
                        <IconCalendar className='h-4 w-4' />
                        <span>Client Type: {client.clientType || 'N/A'}</span>
                      </div>
                    </div>

                    <div className='text-muted-foreground mt-3 flex items-center gap-4 text-xs'>
                      <div className='flex items-center gap-1'>
                        <IconCalendar className='h-3 w-3' />
                        <span>Created {formatDate(client.createdAt)}</span>
                      </div>
                      {client.complianceDeadline && (
                        <div className='flex items-center gap-1'>
                          <IconCalendar className='h-3 w-3' />
                          <span>
                            Deadline {formatDate(client.complianceDeadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='ml-4 flex items-center gap-2'>
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Button size='sm' variant='ghost'>
                        <IconEye className='h-4 w-4' />
                      </Button>
                    </Link>

                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDeleteClient(client.id)}
                      className='text-red-600 hover:bg-red-50 hover:text-red-700'
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
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

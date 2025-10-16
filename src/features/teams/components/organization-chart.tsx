'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconMail,
  IconChevronDown,
  IconChevronRight,
  IconUser
} from '@tabler/icons-react';
import { OrganizationChartNode } from '@/types/team';
import { toast } from 'sonner';

interface OrganizationNodeProps {
  node: OrganizationChartNode;
  level: number;
}

function OrganizationNodeComponent({ node, level }: OrganizationNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ceo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      team_lead:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      senior_developer:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      developer:
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      designer: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      qa_engineer:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return (
      colors[role] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    );
  };

  const getTeamTypeColor = (teamType: string) => {
    return teamType === 'internal'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className='relative'>
      {/* Node Card */}
      <Card
        className={`mx-auto mb-4 w-80 ${level === 0 ? 'border-purple-200 shadow-lg' : 'hover:shadow-md'} transition-shadow`}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center space-x-3'>
            {/* Avatar */}
            <div className='relative'>
              {node.profileImageUrl ? (
                <img
                  src={node.profileImageUrl}
                  alt={`${node.firstName} ${node.lastName}`}
                  className='h-12 w-12 rounded-full object-cover'
                />
              ) : (
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white ${
                    level === 0
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                >
                  {node.firstName[0]}
                  {node.lastName[0]}
                </div>
              )}
              {level === 0 && (
                <div className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500'>
                  <span className='text-xs text-white'>👑</span>
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div className='flex-1'>
              <CardTitle className='text-lg font-semibold'>
                {node.firstName} {node.lastName}
              </CardTitle>
              <p className='text-muted-foreground text-sm'>{node.title}</p>
            </div>

            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsExpanded(!isExpanded)}
                className='h-8 w-8 p-0'
              >
                {isExpanded ? (
                  <IconChevronDown className='h-4 w-4' />
                ) : (
                  <IconChevronRight className='h-4 w-4' />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-3'>
            {/* Role and Team Badges */}
            <div className='flex flex-wrap gap-2'>
              <Badge className={getRoleColor(node.role)}>
                {node.role
                  .replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge className={getTeamTypeColor(node.teamType)}>
                {node.teamName} ({node.teamType})
              </Badge>
            </div>

            {/* Contact Information */}
            <div className='space-y-2'>
              <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
                <IconMail className='h-4 w-4' />
                <span>{node.email}</span>
              </div>
            </div>

            {/* Children Count */}
            {hasChildren && (
              <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
                <IconUser className='h-4 w-4' />
                <span>
                  {node.children.length} direct report
                  {node.children.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Lines and Children */}
      {hasChildren && isExpanded && (
        <div className='relative'>
          {/* Vertical line from parent */}
          <div className='bg-border absolute top-0 left-1/2 h-8 w-px -translate-x-px transform'></div>

          {/* Horizontal line */}
          {node.children.length > 1 && (
            <div
              className='bg-border absolute top-8 left-1/2 h-px -translate-x-px transform'
              style={{
                width: `${(node.children.length - 1) * 320 + 160}px`,
                left: `calc(50% - ${((node.children.length - 1) * 320 + 160) / 2}px)`
              }}
            ></div>
          )}

          {/* Children Container */}
          <div
            className={`flex ${node.children.length === 1 ? 'justify-center' : 'justify-center space-x-8'} pt-8`}
          >
            {node.children.map((child, _index) => (
              <div key={child.id} className='relative'>
                {/* Vertical line to child */}
                <div className='bg-border absolute -top-8 left-1/2 h-8 w-px -translate-x-px transform'></div>

                <OrganizationNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizationChart() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationChartNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizationChart();
  }, []);

  const fetchOrganizationChart = async () => {
    try {
      const response = await fetch('/api/teams/organization-chart');
      if (!response.ok) throw new Error('Failed to fetch organization chart');

      const result = await response.json();
      if (result.success) {
        setOrganizationData(result.data);
      }
    } catch (error) {
      toast.error('Failed to fetch organization chart');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2'></div>
          <p className='text-muted-foreground mt-4'>
            Loading organization chart...
          </p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <IconUser className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>No Organization Data</h3>
          <p className='text-muted-foreground text-center'>
            No team members found. Add team members to see the organization
            chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full'>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Organization Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>1</div>
              <p className='text-muted-foreground text-sm'>CEO</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {organizationData.children?.length || 0}
              </div>
              <p className='text-muted-foreground text-sm'>Direct Reports</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {countTotalMembers(organizationData)}
              </div>
              <p className='text-muted-foreground text-sm'>Total Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='overflow-x-auto pb-8'>
        <div className='min-w-max'>
          <OrganizationNodeComponent node={organizationData} level={0} />
        </div>
      </div>
    </div>
  );
}

function countTotalMembers(node: OrganizationChartNode): number {
  let count = 1; // Count the current node
  if (node.children) {
    for (const child of node.children) {
      count += countTotalMembers(child);
    }
  }
  return count;
}

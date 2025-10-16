'use client';

import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconUsers,
  IconBuilding,
  IconSearch,
  IconEdit,
  IconEye,
  IconMail,
  IconPhone
} from '@tabler/icons-react';
import {
  TeamWithDetails,
  TeamMemberWithDetails,
  TeamType,
  EmployeeRole
} from '@/types/team';
import { toast } from 'sonner';

export default function TeamManagementDashboard() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamTypeFilter, setTeamTypeFilter] = useState<TeamType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all');

  useEffect(() => {
    fetchTeams();
    fetchMembers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');

      const result = await response.json();
      if (result.success) {
        setTeams(result.data.teams || []);
      }
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/teams/members');
      if (!response.ok) throw new Error('Failed to fetch members');

      const result = await response.json();
      if (result.success) {
        setMembers(result.data.members || []);
      }
    } catch (error) {
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      teamTypeFilter === 'all' || team.teamType === teamTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalTeams: teams.length,
    internalTeams: teams.filter((t) => t.teamType === 'internal').length,
    externalTeams: teams.filter((t) => t.teamType === 'external').length,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.employmentStatus === 'active')
      .length,
    internalMembers: members.filter((m) => m.team?.teamType === 'internal')
      .length,
    externalMembers: members.filter((m) => m.team?.teamType === 'external')
      .length
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2'></div>
          <p className='text-muted-foreground mt-4'>Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Teams</CardTitle>
            <IconBuilding className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalTeams}</div>
            <p className='text-muted-foreground text-xs'>
              {stats.internalTeams} internal, {stats.externalTeams} external
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalMembers}</div>
            <p className='text-muted-foreground text-xs'>
              {stats.activeMembers} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Internal Team</CardTitle>
            <IconBuilding className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.internalMembers}</div>
            <p className='text-muted-foreground text-xs'>Internal employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>External Team</CardTitle>
            <IconBuilding className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.externalMembers}</div>
            <p className='text-muted-foreground text-xs'>
              Contractors & consultants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search teams or members...'
                className='pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={teamTypeFilter}
              onValueChange={(value: TeamType | 'all') =>
                setTeamTypeFilter(value)
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Team Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Teams</SelectItem>
                <SelectItem value='internal'>Internal</SelectItem>
                <SelectItem value='external'>External</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(value: EmployeeRole | 'all') =>
                setRoleFilter(value)
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='ceo'>CEO</SelectItem>
                <SelectItem value='manager'>Manager</SelectItem>
                <SelectItem value='team_lead'>Team Lead</SelectItem>
                <SelectItem value='senior_developer'>
                  Senior Developer
                </SelectItem>
                <SelectItem value='developer'>Developer</SelectItem>
                <SelectItem value='designer'>Designer</SelectItem>
                <SelectItem value='qa_engineer'>QA Engineer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams and Members Tabs */}
      <Tabs defaultValue='teams' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='teams'>
            Teams ({filteredTeams.length})
          </TabsTrigger>
          <TabsTrigger value='members'>
            Members ({filteredMembers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='teams' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredTeams.map((team) => (
              <Card key={team.id} className='transition-shadow hover:shadow-md'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-lg'>{team.name}</CardTitle>
                      <CardDescription className='mt-1'>
                        {team.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        team.teamType === 'internal' ? 'default' : 'secondary'
                      }
                    >
                      {team.teamType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Members:</span>
                      <span className='font-medium'>
                        {team.members?.length || 0}
                      </span>
                    </div>
                    {team.manager && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>Manager:</span>
                        <span className='font-medium'>
                          {team.manager.firstName} {team.manager.lastName}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Status:</span>
                      <Badge variant={team.isActive ? 'default' : 'secondary'}>
                        {team.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className='flex items-center space-x-2 pt-2'>
                      <Button size='sm' variant='outline'>
                        <IconEye className='mr-1 h-4 w-4' />
                        View
                      </Button>
                      <Button size='sm' variant='outline'>
                        <IconEdit className='mr-1 h-4 w-4' />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='members' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader>
                  <div className='flex items-start space-x-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white'>
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div className='flex-1'>
                      <CardTitle className='text-lg'>
                        {member.firstName} {member.lastName}
                      </CardTitle>
                      <CardDescription>
                        {member.title || member.role.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2 text-sm'>
                      <IconMail className='text-muted-foreground h-4 w-4' />
                      <span className='text-muted-foreground'>
                        {member.email}
                      </span>
                    </div>
                    {member.phone && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <IconPhone className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>
                          {member.phone}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Team:</span>
                      <Badge
                        variant={
                          member.team?.teamType === 'internal'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {member.team?.name || 'Unassigned'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Status:</span>
                      <Badge
                        variant={
                          member.employmentStatus === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {member.employmentStatus}
                      </Badge>
                    </div>
                    <div className='flex items-center space-x-2 pt-2'>
                      <Button size='sm' variant='outline'>
                        <IconEye className='mr-1 h-4 w-4' />
                        View
                      </Button>
                      <Button size='sm' variant='outline'>
                        <IconEdit className='mr-1 h-4 w-4' />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

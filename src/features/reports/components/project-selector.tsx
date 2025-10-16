'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  IconSearch,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconLoader2
} from '@tabler/icons-react';
import { Project } from '@/types/project';
import { Client } from '@/types/client';

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}

interface ProjectWithClient extends Project {
  client?: Client;
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
};

export default function ProjectSelector({
  selectedProject,
  onProjectSelect
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithClient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const result = await response.json();
      if (result.success) {
        // The API returns data.projects, not just data
        const projectsData = result.data?.projects || result.data || [];
        // Ensure we have an array
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      setProjects([]); // Ensure we have an empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    // Ensure projects is an array before filtering
    if (!Array.isArray(projects)) {
      setFilteredProjects([]);
      return;
    }

    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.client?.company
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleProjectSelect = (project: ProjectWithClient) => {
    onProjectSelect(project);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='flex items-center gap-2'>
            <IconLoader2 className='h-5 w-5 animate-spin' />
            <span>Loading projects...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search projects...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='planning'>Planning</SelectItem>
            <SelectItem value='on_hold'>On Hold</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {!Array.isArray(filteredProjects) || filteredProjects.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <IconBuilding className='text-muted-foreground mb-4 h-16 w-16' />
            <h3 className='mb-2 text-lg font-medium'>No projects found</h3>
            <p className='text-muted-foreground text-center'>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No projects available for report generation.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.isArray(filteredProjects) &&
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProject?.id === project.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-base leading-tight'>
                        {project.name}
                      </CardTitle>
                      {project.client?.company && (
                        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                          <IconBuilding className='h-3 w-3' />
                          {project.client.company}
                        </div>
                      )}
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className='bg-primary rounded-full p-1'>
                        <IconCheck className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {project.description && (
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {project.description}
                    </p>
                  )}

                  <div className='flex items-center justify-between'>
                    <Badge
                      variant='secondary'
                      className={
                        statusColors[
                          project.status as keyof typeof statusColors
                        ]
                      }
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>

                    {project.createdAt && (
                      <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                        <IconCalendar className='h-3 w-3' />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className='flex flex-wrap gap-1'>
                    {project.wcagLevel && (
                      <Badge variant='outline' className='text-xs'>
                        WCAG {project.wcagLevel}
                      </Badge>
                    )}
                    {project.techStack && (
                      <Badge variant='outline' className='text-xs'>
                        {project.techStack}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Selected Project Summary */}
      {selectedProject && (
        <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-green-900 dark:text-green-100'>
              <IconCheck className='h-4 w-4' />
              Selected Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='font-medium text-green-900 dark:text-green-100'>
                {selectedProject.name}
              </div>
              {selectedProject.description && (
                <p className='text-sm text-green-700 dark:text-green-300'>
                  {selectedProject.description}
                </p>
              )}
              <div className='flex gap-2'>
                <Badge variant='secondary'>
                  {selectedProject.status.replace('_', ' ')}
                </Badge>
                <Badge variant='outline'>
                  WCAG {selectedProject.wcagLevel || 'AA'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

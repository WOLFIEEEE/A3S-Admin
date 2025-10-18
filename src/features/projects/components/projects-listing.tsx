'use client';

import React, { useState, useEffect } from 'react';
import {
  ProjectsOverviewTable,
  ProjectWithDetails
} from '@/components/dashboard/projects-overview-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconFolderOff } from '@tabler/icons-react';

export default function ProjectsListing() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/projects?limit=1000');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result = await response.json();

      if (result.success) {
        const projectsData = result.data?.projects || result.data || [];
        // Transform projects data to match ProjectWithDetails interface
        const transformedProjects: ProjectWithDetails[] = projectsData.map(
          (project: any) => ({
            ...project,
            progress: project.progressPercentage || 0,
            teamSize: 0, // Will be calculated from actual team assignments
            lastActivity: project.updatedAt
          })
        );
        setProjects(transformedProjects);
      } else {
        throw new Error('Failed to load projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <IconFolderOff className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>Error loading projects</h3>
          <p className='text-muted-foreground mb-6 text-center'>{error}</p>
          <Button onClick={fetchProjects}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='min-h-[500px]'>
      <ProjectsOverviewTable data={projects} />
    </div>
  );
}

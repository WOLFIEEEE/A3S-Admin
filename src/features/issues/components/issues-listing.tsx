'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedIssuesTable } from '@/components/dashboard/enhanced-issues-table';
import { IssueWithRelations } from '@/lib/db/queries/issues';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  wcagLevel: string;
}

export default function IssuesListing() {
  const [issues, setIssues] = useState<IssueWithRelations[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both issues and projects in parallel
      const [issuesResponse, projectsResponse] = await Promise.all([
        fetch('/api/issues?limit=1000'),
        fetch('/api/projects?limit=1000')
      ]);

      if (!issuesResponse.ok || !projectsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [issuesData, projectsResult] = await Promise.all([
        issuesResponse.json(),
        projectsResponse.json()
      ]);

      // Handle issues data - API returns array directly
      setIssues(Array.isArray(issuesData) ? issuesData : []);

      // Handle projects data - API returns success object
      if (projectsResult.success) {
        const projectsArray =
          projectsResult.data?.projects || projectsResult.data || [];
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>Loading issues...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <IconAlertCircle className='text-muted-foreground mb-4 h-16 w-16' />
          <h3 className='mb-2 text-lg font-medium'>Error loading issues</h3>
          <p className='text-muted-foreground mb-6 text-center'>{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return <EnhancedIssuesTable data={issues} projects={projects} />;
}

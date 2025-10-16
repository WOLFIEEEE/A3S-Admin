'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectInput } from '@/types';
import EnhancedProjectForm from './enhanced-project-form';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();

  const handleCreateProject = async (
    data: CreateProjectInput,
    documents: any[] = []
  ) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const result = await response.json();

      toast.success('Project created successfully!');

      // Redirect to the new project's detail page
      router.push(
        `/dashboard/clients/${result.data.clientId}/projects/${result.data.id}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project'
      );
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/projects');
  };

  return (
    <EnhancedProjectForm
      onSubmit={handleCreateProject}
      onCancel={handleCancel}
    />
  );
}

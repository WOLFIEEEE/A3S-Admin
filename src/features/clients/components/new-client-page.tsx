'use client';

import { useRouter } from 'next/navigation';
import { CreateClientInput } from '@/types';
import ClientFormEnhanced from './client-form-enhanced';
import { toast } from 'sonner';

export default function NewClientPage() {
  const router = useRouter();

  const handleCreateClient = async (data: CreateClientInput) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create client');
      }

      const result = await response.json();

      toast.success('Client created successfully!');

      // Redirect to the new client's detail page
      router.push(`/dashboard/clients/${result.data.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create client'
      );
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/clients');
  };

  return (
    <ClientFormEnhanced onSubmit={handleCreateClient} onCancel={handleCancel} />
  );
}

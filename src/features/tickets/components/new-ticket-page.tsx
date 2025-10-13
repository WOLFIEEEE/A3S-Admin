'use client';

import { useRouter } from 'next/navigation';
import { CreateTicketInput, Developer } from '@/types';
import TicketForm from './ticket-form';
import { toast } from 'sonner';

interface NewTicketPageProps {
  projectId?: string;
  reporterId: string;
  developers: Developer[];
}

export default function NewTicketPage({
  projectId,
  reporterId,
  developers
}: NewTicketPageProps) {
  const router = useRouter();

  const handleCreateTicket = async (data: CreateTicketInput) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }

      const result = await response.json();

      toast.success('Ticket created successfully!');

      // Redirect to the new ticket's detail page
      router.push(`/dashboard/tickets/${result.data.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create ticket'
      );
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/tickets');
  };

  return (
    <TicketForm
      projectId={projectId || '1'} // Default to first project if not specified
      reporterId={reporterId}
      developers={developers}
      onSubmit={handleCreateTicket}
      onCancel={handleCancel}
    />
  );
}

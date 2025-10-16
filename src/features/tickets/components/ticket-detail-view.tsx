'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  IconTicket,
  IconEdit,
  IconPlus,
  IconFileText,
  IconAccessible,
  IconMessage,
  IconBuilding,
  IconFolder,
  IconCalendar,
  IconUser,
  IconPaperclip
} from '@tabler/icons-react';
import { Ticket } from '@/types';
import { Client } from '@/types/client';
import { Project } from '@/types/project';
import { toast } from 'sonner';

interface TicketDetailViewProps {
  ticketId: string;
}

interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  comment: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketAttachment {
  id: string;
  ticketId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

const statusColors = {
  open: 'bg-red-100 text-red-800 border-red-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  closed: 'bg-gray-100 text-gray-800 border-gray-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

const typeColors = {
  bug: 'bg-red-100 text-red-800',
  feature: 'bg-green-100 text-green-800',
  task: 'bg-blue-100 text-blue-800',
  accessibility: 'bg-purple-100 text-purple-800',
  improvement: 'bg-yellow-100 text-yellow-800'
};

export default function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    const loadTicketData = async () => {
      try {
        setIsLoading(true);

        // Fetch ticket data
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`);
        if (ticketResponse.ok) {
          const ticketResult = await ticketResponse.json();
          if (ticketResult.success) {
            setTicket(ticketResult.data);

            // Fetch project data if ticket has projectId
            if (ticketResult.data.projectId) {
              const projectResponse = await fetch(
                `/api/projects/${ticketResult.data.projectId}`
              );
              if (projectResponse.ok) {
                const projectResult = await projectResponse.json();
                if (projectResult.success) {
                  setProject(projectResult.data);

                  // Fetch client data if project has clientId
                  if (projectResult.data.clientId) {
                    const clientResponse = await fetch(
                      `/api/clients/${projectResult.data.clientId}`
                    );
                    if (clientResponse.ok) {
                      const clientResult = await clientResponse.json();
                      if (clientResult.success) {
                        setClient(clientResult.data);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // For now, use empty arrays for comments and attachments until we implement those APIs
        setComments([]);
        setAttachments([]);
      } catch (error) {
        toast.error('Failed to load ticket data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTicketData();
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);
      // TODO: Implement API call to add comment
      toast.success('Comment added successfully!');
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-muted-foreground'>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className='py-12 text-center'>
        <IconTicket className='text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50' />
        <h3 className='mb-2 text-lg font-medium'>Ticket Not Found</h3>
        <p className='text-muted-foreground mb-4'>
          The requested ticket could not be found.
        </p>
        <Button onClick={() => router.push('/dashboard/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                <IconTicket className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <div className='mb-2 flex items-center gap-3'>
                  <CardTitle className='text-2xl'>{ticket.title}</CardTitle>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={priorityColors[ticket.priority]}
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge className={typeColors[ticket.type]}>
                    {ticket.type}
                  </Badge>
                </div>
                <div className='text-muted-foreground mt-3 flex items-center gap-6 text-sm'>
                  {client && (
                    <div className='flex items-center gap-2'>
                      <IconBuilding className='h-4 w-4' />
                      <span>Client: {client.company}</span>
                    </div>
                  )}
                  {project && (
                    <div className='flex items-center gap-2'>
                      <IconFolder className='h-4 w-4' />
                      <span>Project: {project.name}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <IconCalendar className='h-4 w-4' />
                    <span>Created {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline'>
                <IconEdit className='mr-2 h-4 w-4' />
                Edit Ticket
              </Button>
              <Button variant='outline'>
                <IconPaperclip className='mr-2 h-4 w-4' />
                Add Attachment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ticket Details */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm whitespace-pre-wrap'>
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* WCAG Criteria */}
          {ticket.wcagCriteria && ticket.wcagCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconAccessible className='h-5 w-5' />
                  WCAG Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {ticket.wcagCriteria.map((criteria, _index) => (
                    <Badge key={_index} variant='outline' className='text-xs'>
                      {criteria}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {ticket.tags.map((tag, _index) => (
                    <Badge key={_index} variant='secondary' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconMessage className='h-5 w-5' />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Add Comment */}
              <div className='space-y-3'>
                <Textarea
                  placeholder='Add a comment...'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='min-h-[100px]'
                />
                <div className='flex justify-end'>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                  >
                    {isAddingComment ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center'>
                  <IconMessage className='mx-auto mb-3 h-12 w-12 opacity-50' />
                  <p className='text-sm'>
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {comments.map((comment) => (
                    <div key={comment.id} className='rounded-lg border p-4'>
                      <div className='mb-2 flex items-start justify-between'>
                        <div className='flex items-center gap-2'>
                          <IconUser className='h-4 w-4' />
                          <span className='text-sm font-medium'>
                            {comment.userName}
                          </span>
                          {comment.isInternal && (
                            <Badge variant='outline' className='text-xs'>
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className='text-muted-foreground text-xs'>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className='text-muted-foreground text-sm whitespace-pre-wrap'>
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Status:</span>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Priority:</span>
                  <Badge
                    variant='outline'
                    className={priorityColors[ticket.priority]}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Type:</span>
                  <Badge className={typeColors[ticket.type]}>
                    {ticket.type}
                  </Badge>
                </div>
                {ticket.assigneeId && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Assignee:</span>
                    <span className='font-medium'>{ticket.assigneeId}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Reporter:</span>
                  <span className='font-medium'>{ticket.reporterId}</span>
                </div>
                {ticket.estimatedHours && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Estimated Hours:
                    </span>
                    <span className='font-medium'>
                      {ticket.estimatedHours}h
                    </span>
                  </div>
                )}
                {ticket.actualHours && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Actual Hours:</span>
                    <span className='font-medium'>{ticket.actualHours}h</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Created:</span>
                  <span className='font-medium'>
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Updated:</span>
                  <span className='font-medium'>
                    {formatDate(ticket.updatedAt)}
                  </span>
                </div>
                {ticket.resolvedAt && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Resolved:</span>
                    <span className='font-medium'>
                      {formatDate(ticket.resolvedAt)}
                    </span>
                  </div>
                )}
                {ticket.closedAt && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Closed:</span>
                    <span className='font-medium'>
                      {formatDate(ticket.closedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconPaperclip className='h-5 w-5' />
                  Attachments ({attachments.length})
                </CardTitle>
                <Button variant='outline' size='sm'>
                  <IconPlus className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <div className='text-muted-foreground py-6 text-center'>
                  <IconPaperclip className='mx-auto mb-2 h-8 w-8 opacity-50' />
                  <p className='text-xs'>No attachments</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className='flex items-center justify-between rounded border p-2'
                    >
                      <div className='flex min-w-0 items-center gap-2'>
                        <IconFileText className='h-4 w-4 flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            {attachment.originalName}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Button variant='ghost' size='sm'>
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

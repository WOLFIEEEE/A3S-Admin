export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'accessibility' | 'improvement';
  assigneeId: string | null;
  reporterId: string;
  estimatedHours: number | null;
  actualHours: number | null;
  wcagCriteria: string[] | null;
  tags: string[];
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  commentId?: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  userId: string;
  action:
    | 'created'
    | 'updated'
    | 'assigned'
    | 'status_changed'
    | 'commented'
    | 'resolved'
    | 'closed';
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: Date;
}

export type CreateTicketInput = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTicketInput = Partial<CreateTicketInput>;

export type CreateTicketCommentInput = Omit<
  TicketComment,
  'id' | 'createdAt' | 'updatedAt'
>;
export type TicketStatus = Ticket['status'];
export type TicketPriority = Ticket['priority'];
export type TicketType = Ticket['type'];
export type TicketActivityAction = TicketActivity['action'];

import { eq, desc, asc, and, or, like, count } from 'drizzle-orm';
import { db } from '../index';
import {
  tickets,
  ticketComments,
  ticketAttachments,
  type Ticket,
  type NewTicket
} from '../schema/tickets';

// Ticket queries
export async function getAllTickets(options?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  search?: string;
}) {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    type,
    assigneeId,
    search
  } = options || {};

  const query = db.select().from(tickets);

  // Apply filters
  const conditions = [];

  if (status) {
    conditions.push(eq(tickets.status, status as any));
  }

  if (priority) {
    conditions.push(eq(tickets.priority, priority as any));
  }

  if (type) {
    conditions.push(eq(tickets.type, type as any));
  }

  if (assigneeId) {
    conditions.push(eq(tickets.assigneeId, assigneeId));
  }

  if (search) {
    conditions.push(
      or(
        like(tickets.title, `%${search}%`),
        like(tickets.description, `%${search}%`)
      )!
    );
  }

  const finalQuery =
    conditions.length > 0
      ? query.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : query;

  // Apply pagination and ordering
  const offset = (page - 1) * limit;
  const ticketsResult = await finalQuery
    .orderBy(desc(tickets.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    tickets: ticketsResult,
    total: ticketsResult.length, // Simplified for now
    page,
    limit,
    totalPages: Math.ceil(ticketsResult.length / limit)
  };
}

export async function getTicketById(id: string) {
  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getTicketsByProject(
  projectId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assigneeId?: string;
    search?: string;
  }
) {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    type,
    assigneeId,
    search
  } = options || {};

  const query = db.select().from(tickets);

  // Apply filters
  const conditions = [eq(tickets.projectId, projectId)];

  if (status) {
    conditions.push(eq(tickets.status, status as any));
  }

  if (priority) {
    conditions.push(eq(tickets.priority, priority as any));
  }

  if (type) {
    conditions.push(eq(tickets.type, type as any));
  }

  if (assigneeId) {
    conditions.push(eq(tickets.assigneeId, assigneeId));
  }

  if (search) {
    conditions.push(
      or(
        like(tickets.title, `%${search}%`),
        like(tickets.description, `%${search}%`)
      )!
    );
  }

  const finalQuery =
    conditions.length > 0
      ? query.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : query;

  // Apply pagination and ordering
  const offset = (page - 1) * limit;
  const ticketsResult = await finalQuery
    .orderBy(desc(tickets.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    tickets: ticketsResult,
    total: ticketsResult.length, // Simplified for now
    page,
    limit,
    totalPages: Math.ceil(ticketsResult.length / limit)
  };
}

export async function createTicket(ticket: NewTicket) {
  const result = await db.insert(tickets).values(ticket).returning();
  return result[0];
}

export async function updateTicket(id: string, updates: Partial<NewTicket>) {
  const result = await db
    .update(tickets)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(tickets.id, id))
    .returning();
  return result[0];
}

export async function deleteTicket(id: string) {
  const result = await db.delete(tickets).where(eq(tickets.id, id)).returning();
  return result[0] || null;
}

export async function getTicketsByStatus(status: Ticket['status']) {
  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.status, status))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByAssignee(assigneeId: string) {
  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.assigneeId, assigneeId))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByReporter(reporterId: string) {
  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.reporterId, reporterId))
    .orderBy(desc(tickets.createdAt));
}

export async function searchTickets(query: string) {
  return await db
    .select()
    .from(tickets)
    .where(
      or(
        like(tickets.title, `%${query}%`),
        like(tickets.description, `%${query}%`)
      )!
    )
    .orderBy(desc(tickets.createdAt));
}

export async function assignTicket(ticketId: string, assigneeId: string) {
  const result = await db
    .update(tickets)
    .set({
      assigneeId,
      updatedAt: new Date()
    })
    .where(eq(tickets.id, ticketId))
    .returning();
  return result[0];
}

export async function updateTicketStatus(
  ticketId: string,
  status: Ticket['status']
) {
  const updates: Partial<NewTicket> = {
    status,
    updatedAt: new Date()
  };

  if (status === 'resolved') {
    updates.resolvedAt = new Date();
  } else if (status === 'closed') {
    updates.closedAt = new Date();
  }

  const result = await db
    .update(tickets)
    .set(updates)
    .where(eq(tickets.id, ticketId))
    .returning();
  return result[0];
}

// Ticket comments queries
export async function getTicketComments(ticketId: string) {
  return await db
    .select()
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(asc(ticketComments.createdAt));
}

export async function createTicketComment(
  comment: typeof ticketComments.$inferInsert
) {
  const result = await db.insert(ticketComments).values(comment).returning();
  return result[0];
}

export async function updateTicketComment(
  id: string,
  updates: Partial<typeof ticketComments.$inferInsert>
) {
  const result = await db
    .update(ticketComments)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(ticketComments.id, id))
    .returning();
  return result[0];
}

export async function deleteTicketComment(id: string) {
  await db.delete(ticketComments).where(eq(ticketComments.id, id));
}

// Ticket attachments queries
export async function getTicketAttachments(ticketId: string) {
  return await db
    .select()
    .from(ticketAttachments)
    .where(eq(ticketAttachments.ticketId, ticketId))
    .orderBy(desc(ticketAttachments.uploadedAt));
}

export async function createTicketAttachment(
  attachment: typeof ticketAttachments.$inferInsert
) {
  const result = await db
    .insert(ticketAttachments)
    .values(attachment)
    .returning();
  return result[0];
}

export async function deleteTicketAttachment(id: string) {
  await db.delete(ticketAttachments).where(eq(ticketAttachments.id, id));
}

// Ticket statistics
export async function getTicketStats(projectId?: string) {
  const [totalTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(projectId ? eq(tickets.projectId, projectId) : undefined);

  const [openTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      projectId
        ? and(eq(tickets.projectId, projectId), eq(tickets.status, 'open'))
        : eq(tickets.status, 'open')
    );

  const [inProgressTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      projectId
        ? and(
            eq(tickets.projectId, projectId),
            eq(tickets.status, 'in_progress')
          )
        : eq(tickets.status, 'in_progress')
    );

  const [resolvedTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      projectId
        ? and(eq(tickets.projectId, projectId), eq(tickets.status, 'resolved'))
        : eq(tickets.status, 'resolved')
    );

  const [closedTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(
      projectId
        ? and(eq(tickets.projectId, projectId), eq(tickets.status, 'closed'))
        : eq(tickets.status, 'closed')
    );

  return {
    total: totalTickets.count,
    open: openTickets.count,
    inProgress: inProgressTickets.count,
    resolved: resolvedTickets.count,
    closed: closedTickets.count
  };
}

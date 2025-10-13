import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { projects } from './projects';

// Enums
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'resolved',
  'closed'
]);
export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low',
  'medium',
  'high',
  'critical'
]);
export const ticketTypeEnum = pgEnum('ticket_type', [
  'bug',
  'feature',
  'task',
  'accessibility',
  'improvement'
]);

// Tickets table
export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    priority: ticketPriorityEnum('priority').notNull().default('medium'),
    type: ticketTypeEnum('type').notNull(),
    assigneeId: varchar('assignee_id', { length: 255 }),
    reporterId: varchar('reporter_id', { length: 255 }).notNull(),
    estimatedHours: integer('estimated_hours'),
    actualHours: integer('actual_hours').default(0),
    wcagCriteria: text('wcag_criteria').array(),
    tags: text('tags').array().notNull().default([]),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at'),
    closedAt: timestamp('closed_at')
  },
  (table) => ({
    projectIdx: index('tickets_project_idx').on(table.projectId),
    statusIdx: index('tickets_status_idx').on(table.status),
    priorityIdx: index('tickets_priority_idx').on(table.priority),
    typeIdx: index('tickets_type_idx').on(table.type),
    assigneeIdx: index('tickets_assignee_idx').on(table.assigneeId),
    reporterIdx: index('tickets_reporter_idx').on(table.reporterId),
    dueDateIdx: index('tickets_due_date_idx').on(table.dueDate),
    createdAtIdx: index('tickets_created_at_idx').on(table.createdAt)
  })
);

// Ticket comments table
export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .references(() => tickets.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    comment: text('comment').notNull(),
    isInternal: boolean('is_internal').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    ticketIdx: index('ticket_comments_ticket_idx').on(table.ticketId),
    userIdx: index('ticket_comments_user_idx').on(table.userId),
    createdAtIdx: index('ticket_comments_created_at_idx').on(table.createdAt)
  })
);

// Ticket attachments table
export const ticketAttachments = pgTable(
  'ticket_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .references(() => tickets.id, { onDelete: 'cascade' })
      .notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    fileSize: decimal('file_size', { precision: 15, scale: 0 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
  },
  (table) => ({
    ticketIdx: index('ticket_attachments_ticket_idx').on(table.ticketId),
    uploadedAtIdx: index('ticket_attachments_uploaded_at_idx').on(
      table.uploadedAt
    )
  })
);

// ================================
// RELATIONS
// ================================

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  project: one(projects, {
    fields: [tickets.projectId],
    references: [projects.id]
  }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments)
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id]
  })
}));

export const ticketAttachmentsRelations = relations(
  ticketAttachments,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketAttachments.ticketId],
      references: [tickets.id]
    })
  })
);

// ================================
// ZOD SCHEMAS FOR VALIDATION
// ================================
export const insertTicketSchema = createInsertSchema(tickets);
export const selectTicketSchema = createSelectSchema(tickets);
export const insertTicketCommentSchema = createInsertSchema(ticketComments);
export const selectTicketCommentSchema = createSelectSchema(ticketComments);
export const insertTicketAttachmentSchema =
  createInsertSchema(ticketAttachments);
export const selectTicketAttachmentSchema =
  createSelectSchema(ticketAttachments);

// Types
export type Ticket = z.infer<typeof selectTicketSchema>;
export type NewTicket = z.infer<typeof insertTicketSchema>;
export type TicketComment = z.infer<typeof selectTicketCommentSchema>;
export type NewTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type TicketAttachment = z.infer<typeof selectTicketAttachmentSchema>;
export type NewTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;

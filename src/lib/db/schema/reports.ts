import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { accessibilityIssues } from './accessibility';

// Report status enum
export const reportStatusEnum = pgEnum('report_status', [
  'draft',
  'generated',
  'edited',
  'sent',
  'archived'
]);

// Report type enum
export const reportTypeEnum = pgEnum('report_type', [
  'executive_summary',
  'technical_report',
  'compliance_report',
  'monthly_progress',
  'custom'
]);

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  reportType: reportTypeEnum('report_type').notNull(),
  aiGeneratedContent: text('ai_generated_content'),
  editedContent: text('edited_content'),
  status: reportStatusEnum('status').default('draft').notNull(),
  sentAt: timestamp('sent_at'),
  sentTo: jsonb('sent_to').$type<string[]>(),
  emailSubject: varchar('email_subject', { length: 255 }),
  emailBody: text('email_body'),
  pdfPath: varchar('pdf_path', { length: 500 }),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Report Issues junction table
export const reportIssues = pgTable('report_issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id')
    .references(() => reports.id, { onDelete: 'cascade' })
    .notNull(),
  issueId: uuid('issue_id')
    .references(() => accessibilityIssues.id)
    .notNull(),
  includedAt: timestamp('included_at').defaultNow().notNull()
});

// Report Comments table for tracking changes and notes
export const reportComments = pgTable('report_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id')
    .references(() => reports.id, { onDelete: 'cascade' })
    .notNull(),
  comment: text('comment').notNull(),
  commentType: varchar('comment_type', { length: 50 })
    .default('general')
    .notNull(),
  authorId: varchar('author_id', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }),
  isInternal: boolean('is_internal').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const reportsRelations = relations(reports, ({ one, many }) => ({
  project: one(projects, {
    fields: [reports.projectId],
    references: [projects.id]
  }),
  reportIssues: many(reportIssues),
  comments: many(reportComments)
}));

export const reportIssuesRelations = relations(reportIssues, ({ one }) => ({
  report: one(reports, {
    fields: [reportIssues.reportId],
    references: [reports.id]
  }),
  issue: one(accessibilityIssues, {
    fields: [reportIssues.issueId],
    references: [accessibilityIssues.id]
  })
}));

export const reportCommentsRelations = relations(reportComments, ({ one }) => ({
  report: one(reports, {
    fields: [reportComments.reportId],
    references: [reports.id]
  })
}));

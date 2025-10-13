import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { projects } from './projects';

// ================================
// ACCESSIBILITY ENUMS
// ================================

// URL categorization enum
export const urlCategoryEnum = pgEnum('url_category', [
  'home',
  'content',
  'form',
  'admin',
  'other'
]);

// Issue type enum (maps to Excel sheet names)
export const issueTypeEnum = pgEnum('issue_type', [
  'automated_tools', // "Automated Tools" sheet
  'screen_reader', // "Screen Reader" sheet
  'keyboard_navigation', // "Keyboard Navigation" sheet
  'color_contrast', // "Color Contrast" sheet
  'text_spacing', // "Text Spacing" sheet
  'browser_zoom', // "Browser Zoom" sheet
  'other'
]);

// Severity enum (from "Severity" column in Excel)
export const severityEnum = pgEnum('severity', [
  '1_critical',
  '2_high',
  '3_medium',
  '4_low'
]);

// WCAG conformance level enum
export const conformanceLevelEnum = pgEnum('conformance_level', [
  'A',
  'AA',
  'AAA'
]);

// Development status enum (from Excel "Dev Status")
export const devStatusEnum = pgEnum('dev_status', [
  'not_started',
  'in_progress',
  'done',
  'blocked',
  '3rd_party',
  'wont_fix'
]);

// QA status enum (from Excel "QA Status")
export const qaStatusEnum = pgEnum('qa_status', [
  'not_started',
  'in_progress',
  'fixed',
  'verified',
  'failed',
  '3rd_party'
]);

// Comment type enum for issue comments
export const commentTypeEnum = pgEnum('comment_type', [
  'general',
  'dev_update',
  'qa_feedback',
  'technical_note',
  'resolution'
]);

// Author role enum for comments
export const authorRoleEnum = pgEnum('author_role', [
  'developer',
  'qa_tester',
  'accessibility_expert',
  'project_manager',
  'client'
]);

// ================================
// ACCESSIBILITY TABLES
// ================================

/**
 * Test URLs - All tested URLs
 * Direct relationship with project (no session layer)
 */
export const testUrls = pgTable(
  'test_urls',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    // URL details
    url: varchar('url', { length: 1000 }).notNull(),
    pageTitle: varchar('page_title', { length: 500 }),

    // URL categorization (derived from URL patterns)
    urlCategory: urlCategoryEnum('url_category').default('content'),

    // Testing metadata (from Excel)
    testingMonth: varchar('testing_month', { length: 20 }), // From Excel "Testing Month" column
    testingYear: integer('testing_year'),

    // Status
    isActive: boolean('is_active').default(true),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    projectUrlIdx: uniqueIndex('test_urls_project_url_idx').on(
      table.projectId,
      table.url
    )
  })
);

/**
 * Accessibility Issues - Core issue tracking
 * Direct relationship: Project → URL → Issue (no session layer)
 */
export const accessibilityIssues = pgTable(
  'accessibility_issues',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    urlId: uuid('url_id')
      .notNull()
      .references(() => testUrls.id, { onDelete: 'cascade' }),

    // Issue identification (from Excel columns)
    issueTitle: varchar('issue_title', { length: 500 }).notNull(), // "Issue Title" column
    issueDescription: text('issue_description'),

    // Issue classification (maps to Excel sheet names)
    issueType: issueTypeEnum('issue_type').notNull(),

    // Severity (from "Severity" column in Excel)
    severity: severityEnum('severity').notNull(),

    // Testing context (from Excel)
    testingMonth: varchar('testing_month', { length: 20 }), // "Testing Month" column
    testingYear: integer('testing_year'),

    // Testing environment (from "AT/Browser" column)
    testingEnvironment: varchar('testing_environment', { length: 200 }), // e.g., "Win 11/Chrome/NVDA"
    browser: varchar('browser', { length: 100 }), // Extracted from testing_environment
    operatingSystem: varchar('operating_system', { length: 100 }), // Extracted from testing_environment
    assistiveTechnology: varchar('assistive_technology', { length: 100 }), // Extracted from testing_environment

    // Expected vs Actual results (from Excel columns)
    expectedResult: text('expected_result').notNull(), // "Expected Result" column
    actualResult: text('actual_result'),

    // WCAG mapping (from "Failed WCAG 2.2 checkpoint(s)" column)
    failedWcagCriteria: text('failed_wcag_criteria').array().default([]), // Array of WCAG numbers
    conformanceLevel: conformanceLevelEnum('conformance_level'), // "Conformance level" column

    // Evidence (from "Screencast" column)
    screencastUrl: varchar('screencast_url', { length: 1000 }), // Direct from Excel
    screenshotUrls: text('screenshot_urls').array().default([]), // Additional evidence

    // Development workflow (from Excel "Dev Status" and "Dev Comments")
    devStatus: devStatusEnum('dev_status').default('not_started'),
    devComments: text('dev_comments'), // "Dev Comments" column
    devAssignedTo: varchar('dev_assigned_to', { length: 255 }), // Developer assigned

    // QA workflow (from Excel "QA Status" and "QA Comments")
    qaStatus: qaStatusEnum('qa_status').default('not_started'),
    qaComments: text('qa_comments'), // "QA Comments" column
    qaAssignedTo: varchar('qa_assigned_to', { length: 255 }), // QA tester assigned

    // Timeline tracking
    discoveredAt: timestamp('discovered_at').defaultNow().notNull(),
    devStartedAt: timestamp('dev_started_at'),
    devCompletedAt: timestamp('dev_completed_at'),
    qaStartedAt: timestamp('qa_started_at'),
    qaCompletedAt: timestamp('qa_completed_at'),
    resolvedAt: timestamp('resolved_at'),

    // Issue lifecycle
    isActive: boolean('is_active').default(true),
    isDuplicate: boolean('is_duplicate').default(false),
    duplicateOfId: uuid('duplicate_of_id'), // Self-reference will be added via relations

    // External tracking
    externalTicketId: varchar('external_ticket_id', { length: 255 }),
    externalTicketUrl: varchar('external_ticket_url', { length: 1000 }),

    // Import metadata (replaces session info)
    importBatchId: varchar('import_batch_id', { length: 255 }), // Groups issues from same Excel import
    sourceFileName: varchar('source_file_name', { length: 255 }), // Original Excel filename

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    projectUrlIdx: index('accessibility_issues_project_url_idx').on(
      table.projectId,
      table.urlId
    ),
    typeIdx: index('accessibility_issues_type_idx').on(table.issueType),
    severityIdx: index('accessibility_issues_severity_idx').on(table.severity),
    devStatusIdx: index('accessibility_issues_dev_status_idx').on(
      table.devStatus
    ),
    qaStatusIdx: index('accessibility_issues_qa_status_idx').on(table.qaStatus),
    importBatchIdx: index('accessibility_issues_import_batch_idx').on(
      table.importBatchId
    ),
    // Self-reference foreign key constraint
    duplicateOfFk: index('accessibility_issues_duplicate_of_idx').on(
      table.duplicateOfId
    )
  })
);

/**
 * Issue Comments - Collaboration (optional)
 */
export const issueComments = pgTable(
  'issue_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => accessibilityIssues.id, { onDelete: 'cascade' }),

    // Comment content
    commentText: text('comment_text').notNull(),
    commentType: commentTypeEnum('comment_type').default('general'),

    // Author info
    authorName: varchar('author_name', { length: 255 }),
    authorRole: authorRoleEnum('author_role'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    issueIdx: index('issue_comments_issue_idx').on(table.issueId)
  })
);

// ================================
// RELATIONS
// ================================

export const testUrlsRelations = relations(testUrls, ({ one, many }) => ({
  project: one(projects, {
    fields: [testUrls.projectId],
    references: [projects.id]
  }),
  accessibilityIssues: many(accessibilityIssues)
}));

export const accessibilityIssuesRelations = relations(
  accessibilityIssues,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [accessibilityIssues.projectId],
      references: [projects.id]
    }),
    url: one(testUrls, {
      fields: [accessibilityIssues.urlId],
      references: [testUrls.id]
    }),
    duplicateOf: one(accessibilityIssues, {
      fields: [accessibilityIssues.duplicateOfId],
      references: [accessibilityIssues.id],
      relationName: 'duplicateOf'
    }),
    duplicates: many(accessibilityIssues, {
      relationName: 'duplicateOf'
    }),
    comments: many(issueComments)
  })
);

export const issueCommentsRelations = relations(issueComments, ({ one }) => ({
  issue: one(accessibilityIssues, {
    fields: [issueComments.issueId],
    references: [accessibilityIssues.id]
  })
}));

// ================================
// ZOD SCHEMAS FOR VALIDATION
// ================================

export const insertTestUrlSchema = createInsertSchema(testUrls);
export const selectTestUrlSchema = createSelectSchema(testUrls);
export const insertAccessibilityIssueSchema =
  createInsertSchema(accessibilityIssues);
export const selectAccessibilityIssueSchema =
  createSelectSchema(accessibilityIssues);
export const insertIssueCommentSchema = createInsertSchema(issueComments);
export const selectIssueCommentSchema = createSelectSchema(issueComments);

// ================================
// TYPESCRIPT TYPES
// ================================

export type TestUrl = z.infer<typeof selectTestUrlSchema>;
export type NewTestUrl = z.infer<typeof insertTestUrlSchema>;
export type AccessibilityIssue = z.infer<typeof selectAccessibilityIssueSchema>;
export type NewAccessibilityIssue = z.infer<
  typeof insertAccessibilityIssueSchema
>;
export type IssueComment = z.infer<typeof selectIssueCommentSchema>;
export type NewIssueComment = z.infer<typeof insertIssueCommentSchema>;

// ================================
// REFERENCE DATA
// ================================

/**
 * Issue Types - Direct mapping to your Excel sheets
 */
export const ISSUE_TYPES = {
  automated_tools: {
    name: 'Automated Tools',
    description: 'Issues found by automated accessibility scanners',
    excel_sheet: 'Automated Tools'
  },
  screen_reader: {
    name: 'Screen Reader',
    description: 'Issues affecting screen reader users',
    excel_sheet: 'Screen Reader'
  },
  keyboard_navigation: {
    name: 'Keyboard Navigation',
    description: 'Issues affecting keyboard-only users',
    excel_sheet: 'Keyboard Navigation'
  },
  color_contrast: {
    name: 'Color Contrast',
    description: 'Visual accessibility and color contrast issues',
    excel_sheet: 'Color Contrast'
  },
  text_spacing: {
    name: 'Text Spacing',
    description: 'Text spacing and typography accessibility',
    excel_sheet: 'Text Spacing'
  },
  browser_zoom: {
    name: 'Browser Zoom',
    description: 'Zoom and reflow accessibility issues',
    excel_sheet: 'Browser Zoom'
  }
} as const;

/**
 * Severity Levels - Standardized from your Excel data
 */
export const SEVERITY_LEVELS = {
  '1_critical': {
    name: 'Critical',
    description: 'Blocks access to core functionality'
  },
  '2_high': {
    name: 'High',
    description: 'Significantly impairs user experience'
  },
  '3_medium': {
    name: 'Medium',
    description: 'Causes inconvenience or confusion'
  },
  '4_low': {
    name: 'Low',
    description: 'Minor accessibility improvement'
  }
} as const;

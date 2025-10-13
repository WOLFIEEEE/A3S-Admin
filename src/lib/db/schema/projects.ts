import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  pgEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { clients } from './clients';

// Enums
export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
]);
export const projectPriorityEnum = pgEnum('project_priority', [
  'low',
  'medium',
  'high',
  'urgent'
]);
export const projectTypeEnum = pgEnum('project_type', [
  'a3s_program',
  'audit',
  'remediation',
  'monitoring',
  'training',
  'consultation',
  'full_compliance'
]);
export const projectPlatformEnum = pgEnum('project_platform', [
  'website',
  'mobile_app',
  'desktop_app',
  'web_app',
  'api',
  'other'
]);
export const techStackEnum = pgEnum('tech_stack', [
  'wordpress',
  'react',
  'vue',
  'angular',
  'nextjs',
  'nuxt',
  'laravel',
  'django',
  'rails',
  'nodejs',
  'express',
  'fastapi',
  'spring',
  'aspnet',
  'flutter',
  'react_native',
  'ionic',
  'xamarin',
  'electron',
  'tauri',
  'wails',
  'android_native',
  'ios_native',
  'unity',
  'unreal',
  'other'
]);
export const projectWcagLevelEnum = pgEnum('project_wcag_level', [
  'A',
  'AA',
  'AAA'
]);
export const billingTypeEnum = pgEnum('billing_type', [
  'fixed',
  'hourly',
  'milestone'
]);
export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'in_progress',
  'completed',
  'overdue'
]);
export const developerRoleEnum = pgEnum('developer_role', [
  'project_lead',
  'senior_developer',
  'developer',
  'qa_engineer',
  'accessibility_specialist'
]);
export const timeEntryCategoryEnum = pgEnum('time_entry_category', [
  'development',
  'testing',
  'review',
  'meeting',
  'documentation',
  'research'
]);
export const documentTypeEnum = pgEnum('document_type', [
  'audit_report',
  'remediation_plan',
  'test_results',
  'compliance_certificate',
  'meeting_notes',
  'vpat',
  'other'
]);
export const activityActionEnum = pgEnum('activity_action', [
  'created',
  'updated',
  'milestone_completed',
  'developer_assigned',
  'status_changed',
  'document_uploaded',
  'time_logged',
  'staging_credentials_updated'
]);
export const credentialTypeEnum = pgEnum('credential_type', [
  'staging',
  'production',
  'development',
  'testing',
  'wordpress',
  'httpauth',
  'sftp',
  'database',
  'app_store',
  'play_store',
  'firebase',
  'aws',
  'azure',
  'gcp',
  'heroku',
  'vercel',
  'netlify',
  'github',
  'gitlab',
  'bitbucket',
  'docker',
  'kubernetes',
  'cms',
  'api_key',
  'oauth',
  'ssh_key',
  'ssl_certificate',
  'cdn',
  'analytics',
  'monitoring',
  'other'
]);

// Projects table
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    sheetId: varchar('sheet_id', { length: 255 }), // External sheet reference
    status: projectStatusEnum('status').notNull().default('planning'),
    priority: projectPriorityEnum('priority').notNull().default('medium'),

    // Accessibility specific
    wcagLevel: projectWcagLevelEnum('wcag_level').notNull().default('AA'),
    projectType: projectTypeEnum('project_type').notNull(),
    projectPlatform: projectPlatformEnum('project_platform')
      .notNull()
      .default('website'),
    techStack: techStackEnum('tech_stack').notNull().default('other'),
    complianceRequirements: text('compliance_requirements')
      .array()
      .notNull()
      .default([]),
    websiteUrl: varchar('website_url', { length: 500 }),
    testingMethodology: text('testing_methodology')
      .array()
      .notNull()
      .default([]),
    testingSchedule: text('testing_schedule'), // e.g., "Before 21st of each month"
    bugSeverityWorkflow: text('bug_severity_workflow'), // e.g., "Blocker>High>Medium>Low"

    // Timeline
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }),
    actualHours: decimal('actual_hours', { precision: 8, scale: 2 }).default(
      '0'
    ),

    // Budget & billing
    budget: decimal('budget', { precision: 12, scale: 2 }),
    billingType: billingTypeEnum('billing_type').notNull().default('fixed'),
    hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }),

    // Progress tracking
    progressPercentage: integer('progress_percentage').notNull().default(0),
    milestonesCompleted: integer('milestones_completed').notNull().default(0),
    totalMilestones: integer('total_milestones').notNull().default(0),

    // Deliverables
    deliverables: text('deliverables').array().notNull().default([]),
    acceptanceCriteria: text('acceptance_criteria')
      .array()
      .notNull()
      .default([]),

    // Import tracking (for Excel imports)
    defaultTestingMonth: varchar('default_testing_month', { length: 20 }), // Default testing month for this project
    defaultTestingYear: integer('default_testing_year'), // Default testing year for this project

    // Metadata
    tags: text('tags').array().notNull().default([]),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    lastModifiedBy: varchar('last_modified_by', { length: 255 }).notNull()
  },
  (table) => ({
    clientIdx: index('projects_client_idx').on(table.clientId),
    statusIdx: index('projects_status_idx').on(table.status),
    typeIdx: index('projects_type_idx').on(table.projectType),
    wcagLevelIdx: index('projects_wcag_level_idx').on(table.wcagLevel),
    createdAtIdx: index('projects_created_at_idx').on(table.createdAt)
  })
);

// Project milestones table
export const projectMilestones = pgTable(
  'project_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    dueDate: timestamp('due_date').notNull(),
    completedDate: timestamp('completed_date'),
    status: milestoneStatusEnum('status').notNull().default('pending'),
    assignedTo: varchar('assigned_to', { length: 255 }),
    deliverables: text('deliverables').array().notNull().default([]),
    acceptanceCriteria: text('acceptance_criteria')
      .array()
      .notNull()
      .default([]),
    order: integer('order').notNull(),
    wcagCriteria: text('wcag_criteria').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index('project_milestones_project_idx').on(table.projectId),
    statusIdx: index('project_milestones_status_idx').on(table.status),
    dueDateIdx: index('project_milestones_due_date_idx').on(table.dueDate),
    orderIdx: index('project_milestones_order_idx').on(table.order)
  })
);

// Project developers table
export const projectDevelopers = pgTable(
  'project_developers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    developerId: varchar('developer_id', { length: 255 }).notNull(),
    role: developerRoleEnum('role').notNull(),
    responsibilities: text('responsibilities').array().notNull().default([]),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    assignedBy: varchar('assigned_by', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }),
    maxHoursPerWeek: integer('max_hours_per_week')
  },
  (table) => ({
    projectIdx: index('project_developers_project_idx').on(table.projectId),
    developerIdx: index('project_developers_developer_idx').on(
      table.developerId
    ),
    roleIdx: index('project_developers_role_idx').on(table.role),
    activeIdx: index('project_developers_active_idx').on(table.isActive),
    projectDeveloperUnique: uniqueIndex(
      'project_developers_project_developer_idx'
    ).on(table.projectId, table.developerId)
  })
);

// Project time entries table
export const projectTimeEntries = pgTable(
  'project_time_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    developerId: varchar('developer_id', { length: 255 }).notNull(),
    date: timestamp('date').notNull(),
    hours: decimal('hours', { precision: 4, scale: 2 }).notNull(),
    description: text('description').notNull(),
    category: timeEntryCategoryEnum('category').notNull(),
    billable: boolean('billable').notNull().default(true),
    approved: boolean('approved').notNull().default(false),
    approvedBy: varchar('approved_by', { length: 255 }),
    approvedAt: timestamp('approved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index('project_time_entries_project_idx').on(table.projectId),
    developerIdx: index('project_time_entries_developer_idx').on(
      table.developerId
    ),
    dateIdx: index('project_time_entries_date_idx').on(table.date),
    categoryIdx: index('project_time_entries_category_idx').on(table.category),
    billableIdx: index('project_time_entries_billable_idx').on(table.billable),
    approvedIdx: index('project_time_entries_approved_idx').on(table.approved)
  })
);

// Project documents table
export const projectDocuments = pgTable(
  'project_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: documentTypeEnum('type').notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    version: varchar('version', { length: 50 }).notNull().default('1.0'),
    isLatest: boolean('is_latest').notNull().default(true),
    tags: text('tags').array().notNull().default([]),
    fileSize: decimal('file_size', { precision: 15, scale: 0 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull()
  },
  (table) => ({
    projectIdx: index('project_documents_project_idx').on(table.projectId),
    typeIdx: index('project_documents_type_idx').on(table.type),
    uploadedAtIdx: index('project_documents_uploaded_at_idx').on(
      table.uploadedAt
    ),
    latestIdx: index('project_documents_latest_idx').on(table.isLatest)
  })
);

// Project activities table
export const projectActivities = pgTable(
  'project_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    action: activityActionEnum('action').notNull(),
    description: text('description').notNull(),
    metadata: text('metadata'), // JSON string for additional data
    timestamp: timestamp('timestamp').defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index('project_activities_project_idx').on(table.projectId),
    userIdx: index('project_activities_user_idx').on(table.userId),
    actionIdx: index('project_activities_action_idx').on(table.action),
    timestampIdx: index('project_activities_timestamp_idx').on(table.timestamp)
  })
);

// Project staging credentials table
export const projectStagingCredentials = pgTable(
  'project_staging_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    type: credentialTypeEnum('type').notNull().default('staging'),
    environment: varchar('environment', { length: 100 }).notNull(), // staging, production, dev, etc.
    url: varchar('url', { length: 500 }).notNull(),
    username: varchar('username', { length: 255 }),
    password: text('password'), // Encrypted password
    apiKey: text('api_key'), // Encrypted API key
    accessToken: text('access_token'), // Encrypted access token
    sshKey: text('ssh_key'), // Encrypted SSH key
    databaseUrl: text('database_url'), // Encrypted database connection string
    remoteFolderPath: varchar('remote_folder_path', { length: 500 }), // SFTP remote folder path
    additionalUrls: text('additional_urls').array().default([]), // Array of additional URLs (staging/production)
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at'),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index('project_staging_credentials_project_idx').on(
      table.projectId
    ),
    typeIdx: index('project_staging_credentials_type_idx').on(table.type),
    environmentIdx: index('project_staging_credentials_environment_idx').on(
      table.environment
    ),
    activeIdx: index('project_staging_credentials_active_idx').on(
      table.isActive
    ),
    projectTypeEnvUnique: uniqueIndex(
      'project_staging_credentials_project_type_env_idx'
    ).on(table.projectId, table.type, table.environment)
  })
);

// ================================
// RELATIONS
// ================================

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id]
  }),
  milestones: many(projectMilestones),
  developers: many(projectDevelopers),
  timeEntries: many(projectTimeEntries),
  documents: many(projectDocuments),
  activities: many(projectActivities),
  stagingCredentials: many(projectStagingCredentials)
}));

export const projectMilestonesRelations = relations(
  projectMilestones,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectMilestones.projectId],
      references: [projects.id]
    })
  })
);

export const projectDevelopersRelations = relations(
  projectDevelopers,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectDevelopers.projectId],
      references: [projects.id]
    })
  })
);

export const projectTimeEntriesRelations = relations(
  projectTimeEntries,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTimeEntries.projectId],
      references: [projects.id]
    })
  })
);

export const projectDocumentsRelations = relations(
  projectDocuments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectDocuments.projectId],
      references: [projects.id]
    })
  })
);

export const projectActivitiesRelations = relations(
  projectActivities,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectActivities.projectId],
      references: [projects.id]
    })
  })
);

export const projectStagingCredentialsRelations = relations(
  projectStagingCredentials,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectStagingCredentials.projectId],
      references: [projects.id]
    })
  })
);

// ================================
// ZOD SCHEMAS FOR VALIDATION
// ================================
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const insertProjectMilestoneSchema =
  createInsertSchema(projectMilestones);
export const selectProjectMilestoneSchema =
  createSelectSchema(projectMilestones);
export const insertProjectDeveloperSchema =
  createInsertSchema(projectDevelopers);
export const selectProjectDeveloperSchema =
  createSelectSchema(projectDevelopers);
export const insertProjectTimeEntrySchema =
  createInsertSchema(projectTimeEntries);
export const selectProjectTimeEntrySchema =
  createSelectSchema(projectTimeEntries);
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments);
export const selectProjectDocumentSchema = createSelectSchema(projectDocuments);
export const insertProjectActivitySchema =
  createInsertSchema(projectActivities);
export const selectProjectActivitySchema =
  createSelectSchema(projectActivities);
export const insertProjectStagingCredentialsSchema = createInsertSchema(
  projectStagingCredentials
);
export const selectProjectStagingCredentialsSchema = createSelectSchema(
  projectStagingCredentials
);

// Types
export type Project = z.infer<typeof selectProjectSchema>;
export type NewProject = z.infer<typeof insertProjectSchema>;
export type ProjectMilestone = z.infer<typeof selectProjectMilestoneSchema>;
export type NewProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectDeveloper = z.infer<typeof selectProjectDeveloperSchema>;
export type NewProjectDeveloper = z.infer<typeof insertProjectDeveloperSchema>;
export type ProjectTimeEntry = z.infer<typeof selectProjectTimeEntrySchema>;
export type NewProjectTimeEntry = z.infer<typeof insertProjectTimeEntrySchema>;
export type ProjectDocument = z.infer<typeof selectProjectDocumentSchema>;
export type NewProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type ProjectActivity = z.infer<typeof selectProjectActivitySchema>;
export type NewProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectStagingCredentials = z.infer<
  typeof selectProjectStagingCredentialsSchema
>;
export type NewProjectStagingCredentials = z.infer<
  typeof insertProjectStagingCredentialsSchema
>;

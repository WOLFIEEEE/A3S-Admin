import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const clientStatusEnum = pgEnum('client_status', [
  'active',
  'inactive',
  'pending',
  'suspended'
]);
export const companySizeEnum = pgEnum('company_size', [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+'
]);
export const accessibilityLevelEnum = pgEnum('accessibility_level', [
  'none',
  'basic',
  'partial',
  'compliant'
]);
export const clientWcagLevelEnum = pgEnum('client_wcag_level', [
  'A',
  'AA',
  'AAA'
]);
export const timelineEnum = pgEnum('timeline', [
  'immediate',
  '1-3_months',
  '3-6_months',
  '6-12_months',
  'ongoing'
]);
export const communicationPreferenceEnum = pgEnum('communication_preference', [
  'email',
  'phone',
  'slack',
  'teams'
]);
export const reportingFrequencyEnum = pgEnum('reporting_frequency', [
  'weekly',
  'bi-weekly',
  'monthly',
  'quarterly'
]);
export const billingFrequencyEnum = pgEnum('billing_frequency', [
  'monthly',
  'quarterly',
  'yearly'
]);
export const pricingTierEnum = pgEnum('pricing_tier', [
  'basic',
  'professional',
  'enterprise',
  'custom'
]);
export const paymentMethodEnum = pgEnum('payment_method', [
  'credit_card',
  'ach',
  'wire',
  'check'
]);
export const clientTypeEnum = pgEnum('client_type', ['a3s', 'p15r']);
export const policyStatusEnum = pgEnum('policy_status', [
  'none',
  'has_policy',
  'needs_review',
  'needs_creation',
  'in_progress',
  'completed'
]);

// Clients table
export const clients = pgTable(
  'clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    company: varchar('company', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    address: text('address'),

    // Billing information
    billingAmount: decimal('billing_amount', {
      precision: 10,
      scale: 2
    }).notNull(),
    billingStartDate: timestamp('billing_start_date').notNull(),
    billingFrequency: billingFrequencyEnum('billing_frequency').notNull(),

    status: clientStatusEnum('status').notNull().default('pending'),

    // Business details
    companySize: companySizeEnum('company_size'),
    industry: varchar('industry', { length: 100 }),
    website: varchar('website', { length: 500 }),
    currentAccessibilityLevel: accessibilityLevelEnum(
      'current_accessibility_level'
    ),
    complianceDeadline: timestamp('compliance_deadline'),
    pricingTier: pricingTierEnum('pricing_tier'),
    paymentMethod: paymentMethodEnum('payment_method'),

    // Service requirements
    servicesNeeded: text('services_needed').array(),
    wcagLevel: clientWcagLevelEnum('wcag_level'),
    priorityAreas: text('priority_areas').array(),
    timeline: timelineEnum('timeline'),

    // Communication preferences
    communicationPreference: communicationPreferenceEnum(
      'communication_preference'
    ),
    reportingFrequency: reportingFrequencyEnum('reporting_frequency'),
    pointOfContact: varchar('point_of_contact', { length: 255 }),
    timeZone: varchar('time_zone', { length: 100 }),

    // Client type and policy status
    clientType: clientTypeEnum('client_type').notNull().default('a3s'),
    policyStatus: policyStatusEnum('policy_status').notNull().default('none'),
    policyNotes: text('policy_notes'),

    // Documents & policies
    hasAccessibilityPolicy: boolean('has_accessibility_policy').default(false),
    accessibilityPolicyUrl: varchar('accessibility_policy_url', {
      length: 500
    }),
    requiresLegalDocumentation: boolean('requires_legal_documentation').default(
      false
    ),
    complianceDocuments: text('compliance_documents').array(),
    existingAudits: boolean('existing_audits').default(false),
    previousAuditResults: text('previous_audit_results'),

    // Metadata
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    statusIdx: index('clients_status_idx').on(table.status),
    clientTypeIdx: index('clients_client_type_idx').on(table.clientType),
    policyStatusIdx: index('clients_policy_status_idx').on(table.policyStatus),
    companyIdx: index('clients_company_idx').on(table.company),
    createdAtIdx: index('clients_created_at_idx').on(table.createdAt)
  })
);

// Client files table
export const clientFiles = pgTable(
  'client_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // 'contract', 'credential', 'asset', 'document'
    filePath: varchar('file_path', { length: 500 }).notNull(),
    fileSize: decimal('file_size', { precision: 15, scale: 0 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    isEncrypted: boolean('is_encrypted').default(false).notNull(),
    uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    accessLevel: varchar('access_level', { length: 20 })
      .notNull()
      .default('public'), // 'public', 'restricted', 'confidential'
    metadata: text('metadata') // JSON string for additional metadata
  },
  (table) => ({
    clientIdx: index('client_files_client_idx').on(table.clientId),
    categoryIdx: index('client_files_category_idx').on(table.category),
    uploadedAtIdx: index('client_files_uploaded_at_idx').on(table.uploadedAt),
    accessLevelIdx: index('client_files_access_level_idx').on(table.accessLevel)
  })
);

// Client credentials table (encrypted sensitive data)
export const clientCredentials = pgTable(
  'client_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }),
    password: text('password'), // Encrypted
    apiKey: text('api_key'), // Encrypted
    notes: text('notes'), // Encrypted
    type: varchar('type', { length: 50 }).notNull(), // 'api', 'ftp', 'database', 'other'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => ({
    clientIdx: index('client_credentials_client_idx').on(table.clientId),
    typeIdx: index('client_credentials_type_idx').on(table.type)
  })
);

// ================================
// RELATIONS
// ================================

export const clientsRelations = relations(clients, ({ many }) => ({
  files: many(clientFiles),
  credentials: many(clientCredentials)
}));

export const clientFilesRelations = relations(clientFiles, ({ one }) => ({
  client: one(clients, {
    fields: [clientFiles.clientId],
    references: [clients.id]
  })
}));

export const clientCredentialsRelations = relations(
  clientCredentials,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientCredentials.clientId],
      references: [clients.id]
    })
  })
);

// ================================
// ZOD SCHEMAS FOR VALIDATION
// ================================
export const insertClientSchema = createInsertSchema(clients);
export const selectClientSchema = createSelectSchema(clients);
export const insertClientFileSchema = createInsertSchema(clientFiles);
export const selectClientFileSchema = createSelectSchema(clientFiles);
export const insertClientCredentialSchema =
  createInsertSchema(clientCredentials);
export const selectClientCredentialSchema =
  createSelectSchema(clientCredentials);

// Types
export type Client = z.infer<typeof selectClientSchema>;
export type NewClient = z.infer<typeof insertClientSchema>;
export type ClientFile = z.infer<typeof selectClientFileSchema>;
export type NewClientFile = z.infer<typeof insertClientFileSchema>;
export type ClientCredential = z.infer<typeof selectClientCredentialSchema>;
export type NewClientCredential = z.infer<typeof insertClientCredentialSchema>;

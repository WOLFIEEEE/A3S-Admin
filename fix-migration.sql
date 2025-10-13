-- Manual application of migration 0005_noisy_starhawk.sql
-- This adds the schema improvements without conflicting enums

-- Add new columns to projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "default_testing_month" varchar(20);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "default_testing_year" integer;

-- Create indexes for client_credentials
CREATE INDEX IF NOT EXISTS "client_credentials_client_idx" ON "client_credentials" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "client_credentials_type_idx" ON "client_credentials" USING btree ("type");

-- Create indexes for client_files
CREATE INDEX IF NOT EXISTS "client_files_client_idx" ON "client_files" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "client_files_category_idx" ON "client_files" USING btree ("category");
CREATE INDEX IF NOT EXISTS "client_files_uploaded_at_idx" ON "client_files" USING btree ("uploaded_at");
CREATE INDEX IF NOT EXISTS "client_files_access_level_idx" ON "client_files" USING btree ("access_level");

-- Create indexes for clients
CREATE INDEX IF NOT EXISTS "clients_status_idx" ON "clients" USING btree ("status");
CREATE INDEX IF NOT EXISTS "clients_client_type_idx" ON "clients" USING btree ("client_type");
CREATE INDEX IF NOT EXISTS "clients_policy_status_idx" ON "clients" USING btree ("policy_status");
CREATE INDEX IF NOT EXISTS "clients_company_idx" ON "clients" USING btree ("company");
CREATE INDEX IF NOT EXISTS "clients_created_at_idx" ON "clients" USING btree ("created_at");

-- Create indexes for project_activities
CREATE INDEX IF NOT EXISTS "project_activities_project_idx" ON "project_activities" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_activities_user_idx" ON "project_activities" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "project_activities_action_idx" ON "project_activities" USING btree ("action");
CREATE INDEX IF NOT EXISTS "project_activities_timestamp_idx" ON "project_activities" USING btree ("timestamp");

-- Create indexes for project_developers
CREATE INDEX IF NOT EXISTS "project_developers_project_idx" ON "project_developers" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_developers_developer_idx" ON "project_developers" USING btree ("developer_id");
CREATE INDEX IF NOT EXISTS "project_developers_role_idx" ON "project_developers" USING btree ("role");
CREATE INDEX IF NOT EXISTS "project_developers_active_idx" ON "project_developers" USING btree ("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "project_developers_project_developer_idx" ON "project_developers" USING btree ("project_id","developer_id");

-- Create indexes for project_documents
CREATE INDEX IF NOT EXISTS "project_documents_project_idx" ON "project_documents" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_documents_type_idx" ON "project_documents" USING btree ("type");
CREATE INDEX IF NOT EXISTS "project_documents_uploaded_at_idx" ON "project_documents" USING btree ("uploaded_at");
CREATE INDEX IF NOT EXISTS "project_documents_latest_idx" ON "project_documents" USING btree ("is_latest");

-- Create indexes for project_milestones
CREATE INDEX IF NOT EXISTS "project_milestones_project_idx" ON "project_milestones" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_milestones_status_idx" ON "project_milestones" USING btree ("status");
CREATE INDEX IF NOT EXISTS "project_milestones_due_date_idx" ON "project_milestones" USING btree ("due_date");
CREATE INDEX IF NOT EXISTS "project_milestones_order_idx" ON "project_milestones" USING btree ("order");

-- Create indexes for project_staging_credentials
CREATE INDEX IF NOT EXISTS "project_staging_credentials_project_idx" ON "project_staging_credentials" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_staging_credentials_type_idx" ON "project_staging_credentials" USING btree ("type");
CREATE INDEX IF NOT EXISTS "project_staging_credentials_environment_idx" ON "project_staging_credentials" USING btree ("environment");
CREATE INDEX IF NOT EXISTS "project_staging_credentials_active_idx" ON "project_staging_credentials" USING btree ("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "project_staging_credentials_project_type_env_idx" ON "project_staging_credentials" USING btree ("project_id","type","environment");

-- Create indexes for project_time_entries
CREATE INDEX IF NOT EXISTS "project_time_entries_project_idx" ON "project_time_entries" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_time_entries_developer_idx" ON "project_time_entries" USING btree ("developer_id");
CREATE INDEX IF NOT EXISTS "project_time_entries_date_idx" ON "project_time_entries" USING btree ("date");
CREATE INDEX IF NOT EXISTS "project_time_entries_category_idx" ON "project_time_entries" USING btree ("category");
CREATE INDEX IF NOT EXISTS "project_time_entries_billable_idx" ON "project_time_entries" USING btree ("billable");
CREATE INDEX IF NOT EXISTS "project_time_entries_approved_idx" ON "project_time_entries" USING btree ("approved");

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS "projects_client_idx" ON "projects" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" USING btree ("status");
CREATE INDEX IF NOT EXISTS "projects_type_idx" ON "projects" USING btree ("project_type");
CREATE INDEX IF NOT EXISTS "projects_wcag_level_idx" ON "projects" USING btree ("wcag_level");
CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" USING btree ("created_at");

-- Create indexes for ticket_attachments
CREATE INDEX IF NOT EXISTS "ticket_attachments_ticket_idx" ON "ticket_attachments" USING btree ("ticket_id");
CREATE INDEX IF NOT EXISTS "ticket_attachments_uploaded_at_idx" ON "ticket_attachments" USING btree ("uploaded_at");

-- Create indexes for ticket_comments
CREATE INDEX IF NOT EXISTS "ticket_comments_ticket_idx" ON "ticket_comments" USING btree ("ticket_id");
CREATE INDEX IF NOT EXISTS "ticket_comments_user_idx" ON "ticket_comments" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "ticket_comments_created_at_idx" ON "ticket_comments" USING btree ("created_at");

-- Create indexes for tickets
CREATE INDEX IF NOT EXISTS "tickets_project_idx" ON "tickets" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "tickets_status_idx" ON "tickets" USING btree ("status");
CREATE INDEX IF NOT EXISTS "tickets_priority_idx" ON "tickets" USING btree ("priority");
CREATE INDEX IF NOT EXISTS "tickets_type_idx" ON "tickets" USING btree ("type");
CREATE INDEX IF NOT EXISTS "tickets_assignee_idx" ON "tickets" USING btree ("assignee_id");
CREATE INDEX IF NOT EXISTS "tickets_reporter_idx" ON "tickets" USING btree ("reporter_id");
CREATE INDEX IF NOT EXISTS "tickets_due_date_idx" ON "tickets" USING btree ("due_date");
CREATE INDEX IF NOT EXISTS "tickets_created_at_idx" ON "tickets" USING btree ("created_at");


ALTER TABLE "projects" ADD COLUMN "default_testing_month" varchar(20);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "default_testing_year" integer;--> statement-breakpoint
CREATE INDEX "client_credentials_client_idx" ON "client_credentials" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_credentials_type_idx" ON "client_credentials" USING btree ("type");--> statement-breakpoint
CREATE INDEX "client_files_client_idx" ON "client_files" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_files_category_idx" ON "client_files" USING btree ("category");--> statement-breakpoint
CREATE INDEX "client_files_uploaded_at_idx" ON "client_files" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "client_files_access_level_idx" ON "client_files" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "clients_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clients_client_type_idx" ON "clients" USING btree ("client_type");--> statement-breakpoint
CREATE INDEX "clients_policy_status_idx" ON "clients" USING btree ("policy_status");--> statement-breakpoint
CREATE INDEX "clients_company_idx" ON "clients" USING btree ("company");--> statement-breakpoint
CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "project_activities_project_idx" ON "project_activities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_activities_user_idx" ON "project_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_activities_action_idx" ON "project_activities" USING btree ("action");--> statement-breakpoint
CREATE INDEX "project_activities_timestamp_idx" ON "project_activities" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "project_developers_project_idx" ON "project_developers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_developers_developer_idx" ON "project_developers" USING btree ("developer_id");--> statement-breakpoint
CREATE INDEX "project_developers_role_idx" ON "project_developers" USING btree ("role");--> statement-breakpoint
CREATE INDEX "project_developers_active_idx" ON "project_developers" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "project_developers_project_developer_idx" ON "project_developers" USING btree ("project_id","developer_id");--> statement-breakpoint
CREATE INDEX "project_documents_project_idx" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_documents_type_idx" ON "project_documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "project_documents_uploaded_at_idx" ON "project_documents" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "project_documents_latest_idx" ON "project_documents" USING btree ("is_latest");--> statement-breakpoint
CREATE INDEX "project_milestones_project_idx" ON "project_milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_milestones_status_idx" ON "project_milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_milestones_due_date_idx" ON "project_milestones" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "project_milestones_order_idx" ON "project_milestones" USING btree ("order");--> statement-breakpoint
CREATE INDEX "project_staging_credentials_project_idx" ON "project_staging_credentials" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_staging_credentials_type_idx" ON "project_staging_credentials" USING btree ("type");--> statement-breakpoint
CREATE INDEX "project_staging_credentials_environment_idx" ON "project_staging_credentials" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "project_staging_credentials_active_idx" ON "project_staging_credentials" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "project_staging_credentials_project_type_env_idx" ON "project_staging_credentials" USING btree ("project_id","type","environment");--> statement-breakpoint
CREATE INDEX "project_time_entries_project_idx" ON "project_time_entries" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_time_entries_developer_idx" ON "project_time_entries" USING btree ("developer_id");--> statement-breakpoint
CREATE INDEX "project_time_entries_date_idx" ON "project_time_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "project_time_entries_category_idx" ON "project_time_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "project_time_entries_billable_idx" ON "project_time_entries" USING btree ("billable");--> statement-breakpoint
CREATE INDEX "project_time_entries_approved_idx" ON "project_time_entries" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "projects_client_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_type_idx" ON "projects" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "projects_wcag_level_idx" ON "projects" USING btree ("wcag_level");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ticket_attachments_ticket_idx" ON "ticket_attachments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_attachments_uploaded_at_idx" ON "ticket_attachments" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "ticket_comments_ticket_idx" ON "ticket_comments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_comments_user_idx" ON "ticket_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_comments_created_at_idx" ON "ticket_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_project_idx" ON "tickets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_priority_idx" ON "tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tickets_type_idx" ON "tickets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tickets_assignee_idx" ON "tickets" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tickets_reporter_idx" ON "tickets" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "tickets_due_date_idx" ON "tickets" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "url_category";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "testing_month";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "testing_year";
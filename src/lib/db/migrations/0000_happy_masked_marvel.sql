CREATE TYPE "public"."accessibility_level" AS ENUM('none', 'basic', 'partial', 'compliant');--> statement-breakpoint
CREATE TYPE "public"."billing_frequency" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('active', 'inactive', 'pending', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."client_wcag_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
CREATE TYPE "public"."communication_preference" AS ENUM('email', 'phone', 'slack', 'teams');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1000+');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit_card', 'ach', 'wire', 'check');--> statement-breakpoint
CREATE TYPE "public"."pricing_tier" AS ENUM('basic', 'professional', 'enterprise', 'custom');--> statement-breakpoint
CREATE TYPE "public"."reporting_frequency" AS ENUM('weekly', 'bi-weekly', 'monthly', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."timeline" AS ENUM('immediate', '1-3_months', '3-6_months', '6-12_months', 'ongoing');--> statement-breakpoint
CREATE TYPE "public"."activity_action" AS ENUM('created', 'updated', 'milestone_completed', 'developer_assigned', 'status_changed', 'document_uploaded', 'time_logged');--> statement-breakpoint
CREATE TYPE "public"."billing_type" AS ENUM('fixed', 'hourly', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."developer_role" AS ENUM('project_lead', 'senior_developer', 'developer', 'qa_engineer', 'accessibility_specialist');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('audit_report', 'remediation_plan', 'test_results', 'compliance_certificate', 'meeting_notes', 'vpat', 'other');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."project_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('audit', 'remediation', 'monitoring', 'training', 'consultation', 'full_compliance');--> statement-breakpoint
CREATE TYPE "public"."project_wcag_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
CREATE TYPE "public"."time_entry_category" AS ENUM('development', 'testing', 'review', 'meeting', 'documentation', 'research');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('bug', 'feature', 'task', 'accessibility', 'improvement');--> statement-breakpoint
CREATE TABLE "client_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255),
	"password" text,
	"api_key" text,
	"notes" text,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" numeric(15, 0) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"is_encrypted" boolean DEFAULT false NOT NULL,
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"access_level" varchar(20) DEFAULT 'public' NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"phone" varchar(50),
	"address" text,
	"billing_amount" numeric(10, 2) NOT NULL,
	"billing_start_date" timestamp NOT NULL,
	"billing_frequency" "billing_frequency" NOT NULL,
	"status" "client_status" DEFAULT 'pending' NOT NULL,
	"company_size" "company_size",
	"industry" varchar(100),
	"website" varchar(500),
	"current_accessibility_level" "accessibility_level",
	"compliance_deadline" timestamp,
	"pricing_tier" "pricing_tier",
	"payment_method" "payment_method",
	"services_needed" text[],
	"wcag_level" "client_wcag_level",
	"priority_areas" text[],
	"timeline" timeline,
	"communication_preference" "communication_preference",
	"reporting_frequency" "reporting_frequency",
	"point_of_contact" varchar(255),
	"time_zone" varchar(100),
	"has_accessibility_policy" boolean DEFAULT false,
	"accessibility_policy_url" varchar(500),
	"requires_legal_documentation" boolean DEFAULT false,
	"compliance_documents" text[],
	"existing_audits" boolean DEFAULT false,
	"previous_audit_results" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"action" "activity_action" NOT NULL,
	"description" text NOT NULL,
	"metadata" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_developers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"developer_id" varchar(255) NOT NULL,
	"role" "developer_role" NOT NULL,
	"responsibilities" text[] DEFAULT '{}' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"hourly_rate" numeric(8, 2),
	"max_hours_per_week" integer
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "document_type" NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"version" varchar(50) DEFAULT '1.0' NOT NULL,
	"is_latest" boolean DEFAULT true NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"file_size" numeric(15, 0) NOT NULL,
	"mime_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"assigned_to" varchar(255),
	"deliverables" text[] DEFAULT '{}' NOT NULL,
	"acceptance_criteria" text[] DEFAULT '{}' NOT NULL,
	"order" integer NOT NULL,
	"wcag_criteria" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"developer_id" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"hours" numeric(4, 2) NOT NULL,
	"description" text NOT NULL,
	"category" time_entry_category NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sheet_id" varchar(255),
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"priority" "project_priority" DEFAULT 'medium' NOT NULL,
	"wcag_level" "project_wcag_level" DEFAULT 'AA' NOT NULL,
	"project_type" "project_type" NOT NULL,
	"compliance_requirements" text[] DEFAULT '{}' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2) DEFAULT '0',
	"budget" numeric(12, 2),
	"billing_type" "billing_type" DEFAULT 'fixed' NOT NULL,
	"hourly_rate" numeric(8, 2),
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"milestones_completed" integer DEFAULT 0 NOT NULL,
	"total_milestones" integer DEFAULT 0 NOT NULL,
	"deliverables" text[] DEFAULT '{}' NOT NULL,
	"acceptance_criteria" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"last_modified_by" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" numeric(15, 0) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"comment" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"type" "ticket_type" NOT NULL,
	"assignee_id" varchar(255),
	"reporter_id" varchar(255) NOT NULL,
	"estimated_hours" integer,
	"actual_hours" integer DEFAULT 0,
	"wcag_criteria" text[],
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "client_credentials" ADD CONSTRAINT "client_credentials_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_files" ADD CONSTRAINT "client_files_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_developers" ADD CONSTRAINT "project_developers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_time_entries" ADD CONSTRAINT "project_time_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
CREATE TYPE "public"."author_role" AS ENUM('developer', 'qa_tester', 'accessibility_expert', 'project_manager', 'client');--> statement-breakpoint
CREATE TYPE "public"."comment_type" AS ENUM('general', 'dev_update', 'qa_feedback', 'technical_note', 'resolution');--> statement-breakpoint
CREATE TYPE "public"."conformance_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
CREATE TYPE "public"."dev_status" AS ENUM('not_started', 'in_progress', 'done', 'blocked', '3rd_party', 'wont_fix');--> statement-breakpoint
CREATE TYPE "public"."issue_type" AS ENUM('automated_tools', 'screen_reader', 'keyboard_navigation', 'color_contrast', 'text_spacing', 'browser_zoom', 'other');--> statement-breakpoint
CREATE TYPE "public"."qa_status" AS ENUM('not_started', 'in_progress', 'fixed', 'verified', 'failed', '3rd_party');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('1_critical', '2_high', '3_medium', '4_low');--> statement-breakpoint
CREATE TYPE "public"."url_category" AS ENUM('home', 'content', 'form', 'admin', 'other');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('a3s', 'p15r');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('none', 'has_policy', 'needs_review', 'needs_creation', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."project_platform" AS ENUM('website', 'mobile_app', 'desktop_app', 'web_app', 'api', 'other');--> statement-breakpoint
CREATE TYPE "public"."tech_stack" AS ENUM('wordpress', 'react', 'vue', 'angular', 'nextjs', 'nuxt', 'laravel', 'django', 'rails', 'nodejs', 'express', 'fastapi', 'spring', 'aspnet', 'flutter', 'react_native', 'ionic', 'xamarin', 'electron', 'tauri', 'wails', 'android_native', 'ios_native', 'unity', 'unreal', 'other');--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'wordpress';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'httpauth';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'sftp';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'database';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'app_store';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'play_store';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'firebase';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'aws';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'azure';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'gcp';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'heroku';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'vercel';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'netlify';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'github';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'gitlab';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'bitbucket';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'docker';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'kubernetes';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'cms';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'api_key';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'oauth';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'ssh_key';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'ssl_certificate';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'cdn';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'analytics';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'monitoring';--> statement-breakpoint
ALTER TYPE "public"."credential_type" ADD VALUE 'other';--> statement-breakpoint
ALTER TYPE "public"."project_type" ADD VALUE 'a3s_program' BEFORE 'audit';--> statement-breakpoint
CREATE TABLE "accessibility_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url_id" uuid NOT NULL,
	"issue_title" varchar(500) NOT NULL,
	"issue_description" text,
	"issue_type" "issue_type" NOT NULL,
	"severity" "severity" NOT NULL,
	"testing_month" varchar(20),
	"testing_year" integer,
	"testing_environment" varchar(200),
	"browser" varchar(100),
	"operating_system" varchar(100),
	"assistive_technology" varchar(100),
	"expected_result" text NOT NULL,
	"actual_result" text,
	"failed_wcag_criteria" text[] DEFAULT '{}',
	"conformance_level" "conformance_level",
	"screencast_url" varchar(1000),
	"screenshot_urls" text[] DEFAULT '{}',
	"dev_status" "dev_status" DEFAULT 'not_started',
	"dev_comments" text,
	"dev_assigned_to" varchar(255),
	"qa_status" "qa_status" DEFAULT 'not_started',
	"qa_comments" text,
	"qa_assigned_to" varchar(255),
	"discovered_at" timestamp DEFAULT now() NOT NULL,
	"dev_started_at" timestamp,
	"dev_completed_at" timestamp,
	"qa_started_at" timestamp,
	"qa_completed_at" timestamp,
	"resolved_at" timestamp,
	"is_active" boolean DEFAULT true,
	"is_duplicate" boolean DEFAULT false,
	"duplicate_of_id" uuid,
	"external_ticket_id" varchar(255),
	"external_ticket_url" varchar(1000),
	"import_batch_id" varchar(255),
	"source_file_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"comment_text" text NOT NULL,
	"comment_type" "comment_type" DEFAULT 'general',
	"author_name" varchar(255),
	"author_role" "author_role",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_urls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" varchar(1000) NOT NULL,
	"page_title" varchar(500),
	"url_category" "url_category" DEFAULT 'content',
	"testing_month" varchar(20),
	"testing_year" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "client_type" "client_type" DEFAULT 'a3s' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "policy_status" "policy_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "policy_notes" text;--> statement-breakpoint
ALTER TABLE "project_staging_credentials" ADD COLUMN "remote_folder_path" varchar(500);--> statement-breakpoint
ALTER TABLE "project_staging_credentials" ADD COLUMN "additional_urls" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_platform" "project_platform" DEFAULT 'website' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tech_stack" "tech_stack" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "website_url" varchar(500);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "testing_methodology" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "testing_schedule" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "bug_severity_workflow" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "url_category" varchar(50) DEFAULT 'content';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "testing_month" varchar(20);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "testing_year" integer;--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD CONSTRAINT "accessibility_issues_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD CONSTRAINT "accessibility_issues_url_id_test_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."test_urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD CONSTRAINT "accessibility_issues_duplicate_of_id_accessibility_issues_id_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "public"."accessibility_issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_issue_id_accessibility_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."accessibility_issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_urls" ADD CONSTRAINT "test_urls_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accessibility_issues_project_url_idx" ON "accessibility_issues" USING btree ("project_id","url_id");--> statement-breakpoint
CREATE INDEX "accessibility_issues_type_idx" ON "accessibility_issues" USING btree ("issue_type");--> statement-breakpoint
CREATE INDEX "accessibility_issues_severity_idx" ON "accessibility_issues" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "accessibility_issues_dev_status_idx" ON "accessibility_issues" USING btree ("dev_status");--> statement-breakpoint
CREATE INDEX "accessibility_issues_qa_status_idx" ON "accessibility_issues" USING btree ("qa_status");--> statement-breakpoint
CREATE INDEX "accessibility_issues_import_batch_idx" ON "accessibility_issues" USING btree ("import_batch_id");--> statement-breakpoint
CREATE INDEX "issue_comments_issue_idx" ON "issue_comments" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_urls_project_url_idx" ON "test_urls" USING btree ("project_id","url");
CREATE TYPE "public"."report_status" AS ENUM('draft', 'generated', 'edited', 'sent', 'archived');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('executive_summary', 'technical_report', 'compliance_report', 'monthly_progress', 'custom');--> statement-breakpoint
CREATE TABLE "report_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"comment_type" varchar(50) DEFAULT 'general' NOT NULL,
	"author_id" varchar(255),
	"author_name" varchar(255),
	"is_internal" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"included_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"report_type" "report_type" NOT NULL,
	"ai_generated_content" text,
	"edited_content" text,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"sent_to" jsonb,
	"email_subject" varchar(255),
	"email_body" text,
	"pdf_path" varchar(500),
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accessibility_issues" ALTER COLUMN "conformance_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."conformance_level";--> statement-breakpoint
CREATE TYPE "public"."conformance_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
ALTER TABLE "accessibility_issues" ALTER COLUMN "conformance_level" SET DATA TYPE "public"."conformance_level" USING "conformance_level"::"public"."conformance_level";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "wcag_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."client_wcag_level";--> statement-breakpoint
CREATE TYPE "public"."client_wcag_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "wcag_level" SET DATA TYPE "public"."client_wcag_level" USING "wcag_level"::"public"."client_wcag_level";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "wcag_level" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "wcag_level" SET DEFAULT 'AA'::text;--> statement-breakpoint
DROP TYPE "public"."project_wcag_level";--> statement-breakpoint
CREATE TYPE "public"."project_wcag_level" AS ENUM('A', 'AA', 'AAA');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "wcag_level" SET DEFAULT 'AA'::"public"."project_wcag_level";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "wcag_level" SET DATA TYPE "public"."project_wcag_level" USING "wcag_level"::"public"."project_wcag_level";--> statement-breakpoint
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_issues" ADD CONSTRAINT "report_issues_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_issues" ADD CONSTRAINT "report_issues_issue_id_accessibility_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."accessibility_issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;

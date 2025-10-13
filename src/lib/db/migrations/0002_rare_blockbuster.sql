CREATE TYPE "public"."credential_type" AS ENUM('staging', 'production', 'development', 'testing');--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'staging_credentials_updated';--> statement-breakpoint
CREATE TABLE "project_staging_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "credential_type" DEFAULT 'staging' NOT NULL,
	"environment" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"username" varchar(255),
	"password" text,
	"api_key" text,
	"access_token" text,
	"ssh_key" text,
	"database_url" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_staging_credentials" ADD CONSTRAINT "project_staging_credentials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
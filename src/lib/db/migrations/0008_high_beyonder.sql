ALTER TABLE "accessibility_issues" ADD COLUMN "sent_to_user" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD COLUMN "sent_date" timestamp;--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD COLUMN "sent_month" varchar(20);--> statement-breakpoint
ALTER TABLE "accessibility_issues" ADD COLUMN "report_id" uuid;--> statement-breakpoint
CREATE INDEX "accessibility_issues_sent_to_user_idx" ON "accessibility_issues" USING btree ("sent_to_user");--> statement-breakpoint
CREATE INDEX "accessibility_issues_report_id_idx" ON "accessibility_issues" USING btree ("report_id");
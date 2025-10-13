ALTER TABLE "accessibility_issues" DROP CONSTRAINT "accessibility_issues_duplicate_of_id_accessibility_issues_id_fk";
--> statement-breakpoint
CREATE INDEX "accessibility_issues_duplicate_of_idx" ON "accessibility_issues" USING btree ("duplicate_of_id");
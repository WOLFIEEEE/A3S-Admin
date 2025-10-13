import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(connectionString);

async function createAccessibilityTables() {
  try {
    console.log('🔄 Creating accessibility tables...');

    // Just run the original migration SQL that was generated
    console.log('📝 Running accessibility migration...');

    const migrationSQL = `
-- Create accessibility tables from migration 0003
CREATE TABLE IF NOT EXISTS "test_urls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS "accessibility_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS "issue_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"issue_id" uuid NOT NULL,
	"comment_text" text NOT NULL,
	"comment_type" "comment_type" DEFAULT 'general',
	"author_name" varchar(255),
	"author_role" "author_role",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys
ALTER TABLE "test_urls" ADD CONSTRAINT IF NOT EXISTS "test_urls_project_id_projects_id_fk" 
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade;

ALTER TABLE "accessibility_issues" ADD CONSTRAINT IF NOT EXISTS "accessibility_issues_project_id_projects_id_fk" 
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade;

ALTER TABLE "accessibility_issues" ADD CONSTRAINT IF NOT EXISTS "accessibility_issues_url_id_test_urls_id_fk" 
  FOREIGN KEY ("url_id") REFERENCES "public"."test_urls"("id") ON DELETE cascade;

ALTER TABLE "issue_comments" ADD CONSTRAINT IF NOT EXISTS "issue_comments_issue_id_accessibility_issues_id_fk" 
  FOREIGN KEY ("issue_id") REFERENCES "public"."accessibility_issues"("id") ON DELETE cascade;

-- Create indexes
CREATE INDEX IF NOT EXISTS "accessibility_issues_project_url_idx" ON "accessibility_issues" ("project_id","url_id");
CREATE INDEX IF NOT EXISTS "accessibility_issues_type_idx" ON "accessibility_issues" ("issue_type");
CREATE INDEX IF NOT EXISTS "accessibility_issues_severity_idx" ON "accessibility_issues" ("severity");
CREATE INDEX IF NOT EXISTS "accessibility_issues_dev_status_idx" ON "accessibility_issues" ("dev_status");
CREATE INDEX IF NOT EXISTS "accessibility_issues_qa_status_idx" ON "accessibility_issues" ("qa_status");
CREATE INDEX IF NOT EXISTS "accessibility_issues_import_batch_idx" ON "accessibility_issues" ("import_batch_id");
CREATE INDEX IF NOT EXISTS "accessibility_issues_duplicate_of_idx" ON "accessibility_issues" ("duplicate_of_id");
CREATE INDEX IF NOT EXISTS "issue_comments_issue_idx" ON "issue_comments" ("issue_id");
CREATE UNIQUE INDEX IF NOT EXISTS "test_urls_project_url_idx" ON "test_urls" ("project_id","url");
`;

    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ All accessibility tables created successfully!');
    console.log('📊 Created tables:');
    console.log('   - test_urls (with project relationship)');
    console.log('   - accessibility_issues (with comprehensive tracking)');
    console.log('   - issue_comments (for collaboration)');
    console.log('   - All necessary indexes for performance');
    console.log('   - All foreign key relationships');
  } catch (error) {
    console.error('❌ Error creating accessibility tables:', error.message);
    // Don't throw - some errors are expected (like "already exists")
  } finally {
    await sql.end();
  }
}

createAccessibilityTables();

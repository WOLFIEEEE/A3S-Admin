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

    // Create the accessibility enums first
    console.log('📝 Creating enums...');

    await sql.unsafe(`
      CREATE TYPE IF NOT EXISTS "url_category" AS ENUM('home', 'content', 'form', 'admin', 'other');
    `);

    await sql`
      CREATE TYPE IF NOT EXISTS "issue_type" AS ENUM('automated_tools', 'screen_reader', 'keyboard_navigation', 'color_contrast', 'text_spacing', 'browser_zoom', 'other');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "severity" AS ENUM('1_critical', '2_high', '3_medium', '4_low');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "conformance_level" AS ENUM('A', 'AA', 'AAA');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "dev_status" AS ENUM('not_started', 'in_progress', 'done', 'blocked', '3rd_party', 'wont_fix');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "qa_status" AS ENUM('not_started', 'in_progress', 'fixed', 'verified', 'failed', '3rd_party');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "comment_type" AS ENUM('general', 'dev_update', 'qa_feedback', 'technical_note', 'resolution');
    `;

    await sql`
      CREATE TYPE IF NOT EXISTS "author_role" AS ENUM('developer', 'qa_tester', 'accessibility_expert', 'project_manager', 'client');
    `;

    console.log('✅ Enums created successfully');

    // Create test_urls table
    console.log('📝 Creating test_urls table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "test_urls" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "project_id" uuid NOT NULL,
        "url" varchar(1000) NOT NULL,
        "page_title" varchar(500),
        "url_category" "url_category" DEFAULT 'content',
        "testing_month" varchar(20),
        "testing_year" integer,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "test_urls_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action
      );
    `;

    // Create accessibility_issues table
    console.log('📝 Creating accessibility_issues table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "accessibility_issues" (
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
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "accessibility_issues_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action,
        CONSTRAINT "accessibility_issues_url_id_test_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."test_urls"("id") ON DELETE cascade ON UPDATE no action
      );
    `;

    // Create issue_comments table
    console.log('📝 Creating issue_comments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "issue_comments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "issue_id" uuid NOT NULL,
        "comment_text" text NOT NULL,
        "comment_type" "comment_type" DEFAULT 'general',
        "author_name" varchar(255),
        "author_role" "author_role",
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "issue_comments_issue_id_accessibility_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."accessibility_issues"("id") ON DELETE cascade ON UPDATE no action
      );
    `;

    console.log('📝 Creating indexes...');

    // Create indexes for test_urls
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "test_urls_project_url_idx" ON "test_urls" USING btree ("project_id","url");`;

    // Create indexes for accessibility_issues
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_project_url_idx" ON "accessibility_issues" USING btree ("project_id","url_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_type_idx" ON "accessibility_issues" USING btree ("issue_type");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_severity_idx" ON "accessibility_issues" USING btree ("severity");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_dev_status_idx" ON "accessibility_issues" USING btree ("dev_status");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_qa_status_idx" ON "accessibility_issues" USING btree ("qa_status");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_import_batch_idx" ON "accessibility_issues" USING btree ("import_batch_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "accessibility_issues_duplicate_of_idx" ON "accessibility_issues" USING btree ("duplicate_of_id");`;

    // Create indexes for issue_comments
    await sql`CREATE INDEX IF NOT EXISTS "issue_comments_issue_idx" ON "issue_comments" USING btree ("issue_id");`;

    console.log('✅ All accessibility tables created successfully!');
    console.log('📊 Created tables:');
    console.log('   - test_urls (with project relationship)');
    console.log('   - accessibility_issues (with comprehensive tracking)');
    console.log('   - issue_comments (for collaboration)');
    console.log('   - All necessary indexes for performance');
    console.log('   - All foreign key relationships');
  } catch (error) {
    console.error('❌ Error creating accessibility tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createAccessibilityTables();

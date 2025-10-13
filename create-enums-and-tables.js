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

async function createEnumsAndTables() {
  try {
    console.log('🔄 Creating accessibility enums and tables...');

    // Step 1: Create all required enums
    console.log('📝 Creating enums...');

    const enums = [
      {
        name: 'url_category',
        values: ['home', 'content', 'form', 'admin', 'other']
      },
      {
        name: 'issue_type',
        values: [
          'automated_tools',
          'screen_reader',
          'keyboard_navigation',
          'color_contrast',
          'text_spacing',
          'browser_zoom',
          'other'
        ]
      },
      {
        name: 'severity',
        values: ['1_critical', '2_high', '3_medium', '4_low']
      },
      { name: 'conformance_level', values: ['A', 'AA', 'AAA'] },
      {
        name: 'dev_status',
        values: [
          'not_started',
          'in_progress',
          'done',
          'blocked',
          '3rd_party',
          'wont_fix'
        ]
      },
      {
        name: 'qa_status',
        values: [
          'not_started',
          'in_progress',
          'fixed',
          'verified',
          'failed',
          '3rd_party'
        ]
      },
      {
        name: 'comment_type',
        values: [
          'general',
          'dev_update',
          'qa_feedback',
          'technical_note',
          'resolution'
        ]
      },
      {
        name: 'author_role',
        values: [
          'developer',
          'qa_tester',
          'accessibility_expert',
          'project_manager',
          'client'
        ]
      }
    ];

    for (const enumDef of enums) {
      try {
        const enumValues = enumDef.values.map((v) => `'${v}'`).join(', ');
        await sql.unsafe(
          `CREATE TYPE "${enumDef.name}" AS ENUM(${enumValues})`
        );
        console.log(`✅ Created enum: ${enumDef.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Enum ${enumDef.name} already exists, skipping`);
        } else {
          console.log(`❌ Error creating enum ${enumDef.name}:`, error.message);
        }
      }
    }

    // Step 2: Create tables
    console.log('📝 Creating tables...');

    // Create test_urls table
    try {
      await sql`
        CREATE TABLE test_urls (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id uuid NOT NULL,
          url varchar(1000) NOT NULL,
          page_title varchar(500),
          url_category url_category DEFAULT 'content',
          testing_month varchar(20),
          testing_year integer,
          is_active boolean DEFAULT true,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Created test_urls table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  test_urls table already exists');
      } else {
        console.log('❌ Error creating test_urls:', error.message);
      }
    }

    // Create accessibility_issues table
    try {
      await sql`
        CREATE TABLE accessibility_issues (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id uuid NOT NULL,
          url_id uuid NOT NULL,
          issue_title varchar(500) NOT NULL,
          issue_description text,
          issue_type issue_type NOT NULL,
          severity severity NOT NULL,
          testing_month varchar(20),
          testing_year integer,
          testing_environment varchar(200),
          browser varchar(100),
          operating_system varchar(100),
          assistive_technology varchar(100),
          expected_result text NOT NULL,
          actual_result text,
          failed_wcag_criteria text[] DEFAULT '{}',
          conformance_level conformance_level,
          screencast_url varchar(1000),
          screenshot_urls text[] DEFAULT '{}',
          dev_status dev_status DEFAULT 'not_started',
          dev_comments text,
          dev_assigned_to varchar(255),
          qa_status qa_status DEFAULT 'not_started',
          qa_comments text,
          qa_assigned_to varchar(255),
          discovered_at timestamp DEFAULT now() NOT NULL,
          dev_started_at timestamp,
          dev_completed_at timestamp,
          qa_started_at timestamp,
          qa_completed_at timestamp,
          resolved_at timestamp,
          is_active boolean DEFAULT true,
          is_duplicate boolean DEFAULT false,
          duplicate_of_id uuid,
          external_ticket_id varchar(255),
          external_ticket_url varchar(1000),
          import_batch_id varchar(255),
          source_file_name varchar(255),
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Created accessibility_issues table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  accessibility_issues table already exists');
      } else {
        console.log('❌ Error creating accessibility_issues:', error.message);
      }
    }

    // Create issue_comments table
    try {
      await sql`
        CREATE TABLE issue_comments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          issue_id uuid NOT NULL,
          comment_text text NOT NULL,
          comment_type comment_type DEFAULT 'general',
          author_name varchar(255),
          author_role author_role,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('✅ Created issue_comments table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  issue_comments table already exists');
      } else {
        console.log('❌ Error creating issue_comments:', error.message);
      }
    }

    // Step 3: Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');

    const constraints = [
      {
        name: 'test_urls_project_id_projects_id_fk',
        sql: 'ALTER TABLE test_urls ADD CONSTRAINT test_urls_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE'
      },
      {
        name: 'accessibility_issues_project_id_projects_id_fk',
        sql: 'ALTER TABLE accessibility_issues ADD CONSTRAINT accessibility_issues_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE'
      },
      {
        name: 'accessibility_issues_url_id_test_urls_id_fk',
        sql: 'ALTER TABLE accessibility_issues ADD CONSTRAINT accessibility_issues_url_id_test_urls_id_fk FOREIGN KEY (url_id) REFERENCES test_urls(id) ON DELETE CASCADE'
      },
      {
        name: 'issue_comments_issue_id_accessibility_issues_id_fk',
        sql: 'ALTER TABLE issue_comments ADD CONSTRAINT issue_comments_issue_id_accessibility_issues_id_fk FOREIGN KEY (issue_id) REFERENCES accessibility_issues(id) ON DELETE CASCADE'
      }
    ];

    for (const constraint of constraints) {
      try {
        await sql.unsafe(constraint.sql);
        console.log(`✅ Added constraint: ${constraint.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Constraint ${constraint.name} already exists`);
        } else {
          console.log(
            `❌ Error adding constraint ${constraint.name}:`,
            error.message
          );
        }
      }
    }

    // Step 4: Create indexes
    console.log('📝 Creating indexes...');

    const indexes = [
      'CREATE INDEX accessibility_issues_project_url_idx ON accessibility_issues (project_id, url_id)',
      'CREATE INDEX accessibility_issues_type_idx ON accessibility_issues (issue_type)',
      'CREATE INDEX accessibility_issues_severity_idx ON accessibility_issues (severity)',
      'CREATE INDEX accessibility_issues_dev_status_idx ON accessibility_issues (dev_status)',
      'CREATE INDEX accessibility_issues_qa_status_idx ON accessibility_issues (qa_status)',
      'CREATE INDEX accessibility_issues_import_batch_idx ON accessibility_issues (import_batch_id)',
      'CREATE INDEX accessibility_issues_duplicate_of_idx ON accessibility_issues (duplicate_of_id)',
      'CREATE INDEX issue_comments_issue_idx ON issue_comments (issue_id)',
      'CREATE UNIQUE INDEX test_urls_project_url_idx ON test_urls (project_id, url)'
    ];

    for (const indexSQL of indexes) {
      try {
        await sql.unsafe(indexSQL);
        console.log(`✅ Created index`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index already exists`);
        } else {
          console.log(`❌ Error creating index:`, error.message);
        }
      }
    }

    console.log('🎉 Accessibility system setup complete!');
    console.log('📊 Created:');
    console.log('   ✅ 8 enums for type safety');
    console.log(
      '   ✅ 3 tables (test_urls, accessibility_issues, issue_comments)'
    );
    console.log('   ✅ 4 foreign key constraints');
    console.log('   ✅ 9 indexes for performance');
    console.log('');
    console.log('🚀 Your accessibility tracking system is now ready!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await sql.end();
  }
}

createEnumsAndTables();

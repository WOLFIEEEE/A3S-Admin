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

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database data...\n');

    // Check all tables
    const tables = [
      'clients',
      'client_files',
      'client_credentials',
      'projects',
      'project_milestones',
      'project_developers',
      'project_time_entries',
      'project_documents',
      'project_activities',
      'project_staging_credentials',
      'tickets',
      'ticket_comments',
      'ticket_attachments',
      'test_urls',
      'accessibility_issues',
      'issue_comments'
    ];

    const results = {};

    for (const table of tables) {
      try {
        const count = await sql.unsafe(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        results[table] = parseInt(count[0].count);

        const status = results[table] > 0 ? '✅' : '❌';
        console.log(`${status} ${table}: ${results[table]} records`);

        // Show sample data for populated tables
        if (results[table] > 0 && results[table] <= 5) {
          const sample = await sql.unsafe(`SELECT * FROM ${table} LIMIT 3`);
          console.log(
            `   Sample: ${JSON.stringify(sample[0], null, 2).substring(0, 200)}...`
          );
        }
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
        results[table] = 'ERROR';
      }
    }

    console.log('\n📊 Summary:');
    const populated = Object.values(results).filter(
      (count) => count > 0
    ).length;
    const empty = Object.values(results).filter((count) => count === 0).length;
    const errors = Object.values(results).filter(
      (count) => count === 'ERROR'
    ).length;

    console.log(`✅ Populated tables: ${populated}`);
    console.log(`❌ Empty tables: ${empty}`);
    console.log(`🚨 Error tables: ${errors}`);

    // List empty tables
    const emptyTables = Object.entries(results)
      .filter(([table, count]) => count === 0)
      .map(([table]) => table);

    if (emptyTables.length > 0) {
      console.log('\n🔴 Empty tables that need data:');
      emptyTables.forEach((table) => console.log(`   - ${table}`));
    }

    // Check accessibility issues in detail
    if (results.accessibility_issues > 0) {
      console.log('\n🐛 Accessibility Issues Breakdown:');
      const issueTypes = await sql.unsafe(`
        SELECT issue_type, COUNT(*) as count 
        FROM accessibility_issues 
        GROUP BY issue_type 
        ORDER BY count DESC
      `);
      issueTypes.forEach((type) => {
        console.log(`   ${type.issue_type}: ${type.count} issues`);
      });

      const severities = await sql.unsafe(`
        SELECT severity, COUNT(*) as count 
        FROM accessibility_issues 
        GROUP BY severity 
        ORDER BY count DESC
      `);
      console.log('\n📊 Issue Severities:');
      severities.forEach((sev) => {
        console.log(`   ${sev.severity}: ${sev.count} issues`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await sql.end();
  }
}

checkDatabaseData();

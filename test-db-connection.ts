/**
 * Database Connection Test Script
 * Run with: npx tsx test-db-connection.ts
 */

import { db, checkDatabaseConnection } from './src/lib/db/index';
import { clients } from './src/lib/db/schema/clients';
import { projects } from './src/lib/db/schema/projects';
import { accessibilityIssues } from './src/lib/db/schema/accessibility';
import { count } from 'drizzle-orm';

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // 1. Test connection
    console.log('1️⃣  Testing database connection...');
    const connectionResult = await checkDatabaseConnection();
    console.log(
      connectionResult.success ? '✅' : '❌',
      connectionResult.message
    );

    if (!connectionResult.success) {
      console.error(
        '\n❌ Database connection failed. Please check your DATABASE_URL in .env.local'
      );
      process.exit(1);
    }

    // 2. Check for data in clients table
    console.log('\n2️⃣  Checking clients table...');
    const [{ value: clientCount }] = await db
      .select({ value: count() })
      .from(clients);
    console.log(`✅ Found ${clientCount} client(s) in database`);

    if (clientCount > 0) {
      const allClients = await db.select().from(clients).limit(5);
      console.log('\n📋 Sample clients:');
      allClients.forEach((client, index) => {
        console.log(
          `   ${index + 1}. ${client.name} (${client.company}) - ${client.email}`
        );
      });
    }

    // 3. Check for data in projects table
    console.log('\n3️⃣  Checking projects table...');
    const [{ value: projectCount }] = await db
      .select({ value: count() })
      .from(projects);
    console.log(`✅ Found ${projectCount} project(s) in database`);

    if (projectCount > 0) {
      const allProjects = await db.select().from(projects).limit(5);
      console.log('\n📋 Sample projects:');
      allProjects.forEach((project, index) => {
        console.log(
          `   ${index + 1}. ${project.name} - Status: ${project.status}`
        );
      });
    }

    // 4. Check for data in accessibility_issues table
    console.log('\n4️⃣  Checking accessibility_issues table...');
    const [{ value: issueCount }] = await db
      .select({ value: count() })
      .from(accessibilityIssues);
    console.log(`✅ Found ${issueCount} accessibility issue(s) in database`);

    if (issueCount > 0) {
      const allIssues = await db.select().from(accessibilityIssues).limit(5);
      console.log('\n📋 Sample issues:');
      allIssues.forEach((issue, index) => {
        console.log(
          `   ${index + 1}. ${issue.title} - Severity: ${issue.severity}`
        );
      });
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Clients: ${clientCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Accessibility Issues: ${issueCount}`);
    console.log('='.repeat(60));

    if (clientCount === 0 && projectCount === 0 && issueCount === 0) {
      console.log('\n⚠️  WARNING: Database is empty!');
      console.log('');
      console.log('To seed the database with sample data, run:');
      console.log('   pnpm db:seed');
      console.log('');
      console.log("Or create the tables if they don't exist:");
      console.log('   pnpm db:push');
    }

    console.log('\n✅ Database test completed successfully!');
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error instanceof Error ? error.message : error);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if DATABASE_URL is set in .env.local');
    console.error('2. Verify database is running');
    console.error('3. Run migrations: pnpm db:push');
    console.error('4. Check if tables exist in your database');
    process.exit(1);
  }
}

testDatabase();

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

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to projects table...');

    // Add the missing columns
    await sql.unsafe(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS default_testing_month varchar(20),
      ADD COLUMN IF NOT EXISTS default_testing_year integer;
    `);

    console.log(
      '✅ Added default_testing_month and default_testing_year columns'
    );

    console.log('🎉 Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

addMissingColumns();

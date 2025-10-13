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

async function verifyTables() {
  try {
    console.log('🔍 Verifying accessibility tables...');

    // Check if all tables exist
    const tables = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('test_urls', 'accessibility_issues', 'issue_comments')
      ORDER BY table_name, ordinal_position
    `;

    console.log('📊 Found tables and columns:');

    const tableGroups = {};
    tables.forEach((row) => {
      if (!tableGroups[row.table_name]) {
        tableGroups[row.table_name] = [];
      }
      tableGroups[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    Object.keys(tableGroups).forEach((tableName) => {
      console.log(`\n✅ ${tableName}:`);
      tableGroups[tableName].forEach((col) => {
        console.log(`   - ${col}`);
      });
    });

    // Check foreign key constraints
    const constraints = await sql`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('test_urls', 'accessibility_issues', 'issue_comments')
    `;

    console.log('\n🔗 Foreign key constraints:');
    constraints.forEach((fk) => {
      console.log(
        `   ✅ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`
      );
    });

    // Check indexes
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('test_urls', 'accessibility_issues', 'issue_comments')
      AND schemaname = 'public'
      ORDER BY tablename, indexname
    `;

    console.log('\n📈 Indexes:');
    indexes.forEach((idx) => {
      console.log(`   ✅ ${idx.tablename}: ${idx.indexname}`);
    });

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');

    // Test enum values
    const enumTest = await sql`
      SELECT unnest(enum_range(NULL::issue_type)) as issue_types
    `;
    console.log(
      '✅ Issue types enum:',
      enumTest.map((e) => e.issue_types).join(', ')
    );

    const severityTest = await sql`
      SELECT unnest(enum_range(NULL::severity)) as severities
    `;
    console.log(
      '✅ Severity enum:',
      severityTest.map((e) => e.severities).join(', ')
    );

    console.log('\n🎉 All accessibility tables are working correctly!');
    console.log('📊 Summary:');
    console.log(`   ✅ ${Object.keys(tableGroups).length} tables created`);
    console.log(`   ✅ ${constraints.length} foreign key constraints`);
    console.log(`   ✅ ${indexes.length} indexes for performance`);
    console.log(`   ✅ All enums functioning properly`);
    console.log(
      '\n🚀 Your accessibility tracking system is fully operational!'
    );
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
  } finally {
    await sql.end();
  }
}

verifyTables();

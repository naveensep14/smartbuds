#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runMigration(sqlFile, description) {
  console.log(`\n📝 ${description}...`);
  console.log(`   File: ${sqlFile}`);
  
  try {
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`   ${i + 1}. ${statement.substring(0, 60)}...`);
        
        // Use the SQL editor approach - we'll need to run these manually
        console.log(`   ⚠️  Please run this statement manually in Supabase SQL Editor:`);
        console.log(`   ${statement};`);
      }
    }
    
    console.log(`✅ ${description} - SQL statements prepared`);
    return true;
    
  } catch (err) {
    console.log(`❌ Error reading ${sqlFile}:`, err.message);
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Running All Database Migrations');
  console.log('==================================');
  
  const migrations = [
    {
      file: 'add-test-type-column.sql',
      description: 'Adding test type column (coursework/weekly)'
    },
    {
      file: 'add-expiry-date-column.sql', 
      description: 'Adding expiry date column for weekly tests'
    },
    {
      file: 'add-weekly-date-range-columns.sql',
      description: 'Adding start_date and end_date columns for weekly tests'
    }
  ];
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const success = await runMigration(migration.file, migration.description);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total migrations: ${migrations.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${migrations.length - successCount}`);
  
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Go to your Supabase dashboard`);
  console.log(`   2. Navigate to SQL Editor`);
  console.log(`   3. Run the SQL statements shown above`);
  console.log(`   4. Verify columns exist in Table Editor`);
  
  return successCount === migrations.length;
}

// Run all migrations
runAllMigrations()
  .then(success => {
    if (success) {
      console.log('\n🎉 All migrations prepared successfully!');
    } else {
      console.log('\n💥 Some migrations failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.log('\n💥 Unexpected error:', err);
    process.exit(1);
  });

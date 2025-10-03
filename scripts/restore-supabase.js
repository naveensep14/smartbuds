const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('❌ Supabase not configured. Please set up your .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreSupabaseData(backupFile) {
  console.log('🔄 Starting Supabase data restore...');
  console.log(`📁 Restoring from: ${backupFile}`);
  
  // Check if backup file exists
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    process.exit(1);
  }
  
  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📊 Backup info:`);
    console.log(`   - Timestamp: ${backupData.backup_info?.timestamp || 'Unknown'}`);
    console.log(`   - Tests: ${backupData.tests?.length || 0} records`);
    console.log(`   - Results: ${backupData.results?.length || 0} records`);
    
    // Restore tests
    if (backupData.tests && backupData.tests.length > 0) {
      console.log('\n📚 Restoring tests...');
      
      // Clear existing tests (optional - comment out if you want to keep existing data)
      console.log('🗑️  Clearing existing tests...');
      const { error: deleteError } = await supabase
        .from('tests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (deleteError) {
        console.error('❌ Error clearing tests:', deleteError.message);
      } else {
        console.log('✅ Existing tests cleared');
      }
      
      // Insert backup tests
      const { data: insertedTests, error: insertError } = await supabase
        .from('tests')
        .insert(backupData.tests)
        .select();
      
      if (insertError) {
        console.error('❌ Error restoring tests:', insertError.message);
      } else {
        console.log(`✅ Tests restored: ${insertedTests?.length || 0} records`);
      }
    }
    
    // Restore results
    if (backupData.results && backupData.results.length > 0) {
      console.log('\n📊 Restoring results...');
      
      // Clear existing results (optional - comment out if you want to keep existing data)
      console.log('🗑️  Clearing existing results...');
      const { error: deleteError } = await supabase
        .from('results')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (deleteError) {
        console.error('❌ Error clearing results:', deleteError.message);
      } else {
        console.log('✅ Existing results cleared');
      }
      
      // Insert backup results
      const { data: insertedResults, error: insertError } = await supabase
        .from('results')
        .insert(backupData.results)
        .select();
      
      if (insertError) {
        console.error('❌ Error restoring results:', insertError.message);
      } else {
        console.log(`✅ Results restored: ${insertedResults?.length || 0} records`);
      }
    }
    
    console.log('\n🎉 Restore completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Tests restored: ${backupData.tests?.length || 0} records`);
    console.log(`   - Results restored: ${backupData.results?.length || 0} records`);
    console.log(`   - Backup date: ${backupData.backup_info?.timestamp || 'Unknown'}`);
    
  } catch (error) {
    console.error('❌ Unexpected error during restore:', error.message);
    process.exit(1);
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Please specify a backup file to restore:');
  console.log('Usage: node scripts/restore-supabase.js <backup-file>');
  console.log('Example: node scripts/restore-supabase.js backups/latest_backup.json');
  process.exit(1);
}

// Run the restore
restoreSupabaseData(backupFile);

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

async function backupSupabaseData() {
  console.log('🚀 Starting Supabase data backup...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, '..', 'backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Backup tests table
    console.log('📊 Backing up tests table...');
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('*');
    
    if (testsError) {
      console.error('❌ Error fetching tests:', testsError.message);
    } else {
      const testsBackup = {
        table: 'tests',
        timestamp: new Date().toISOString(),
        count: tests.length,
        data: tests
      };
      
      const testsFile = path.join(backupDir, `tests_backup_${timestamp}.json`);
      fs.writeFileSync(testsFile, JSON.stringify(testsBackup, null, 2));
      console.log(`✅ Tests backed up: ${tests.length} records saved to ${testsFile}`);
    }
    
    // Backup results table
    console.log('📊 Backing up results table...');
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*');
    
    if (resultsError) {
      console.error('❌ Error fetching results:', resultsError.message);
    } else {
      const resultsBackup = {
        table: 'results',
        timestamp: new Date().toISOString(),
        count: results.length,
        data: results
      };
      
      const resultsFile = path.join(backupDir, `results_backup_${timestamp}.json`);
      fs.writeFileSync(resultsFile, JSON.stringify(resultsBackup, null, 2));
      console.log(`✅ Results backed up: ${results.length} records saved to ${resultsFile}`);
    }
    
    // Create a combined backup file
    const combinedBackup = {
      backup_info: {
        timestamp: new Date().toISOString(),
        supabase_url: supabaseUrl,
        tables: ['tests', 'results']
      },
      tests: tests || [],
      results: results || []
    };
    
    const combinedFile = path.join(backupDir, `successbuds_backup_${timestamp}.json`);
    fs.writeFileSync(combinedFile, JSON.stringify(combinedBackup, null, 2));
    console.log(`✅ Combined backup saved to ${combinedFile}`);
    
    // Create a latest backup file (always overwrites)
    const latestFile = path.join(backupDir, 'latest_backup.json');
    fs.writeFileSync(latestFile, JSON.stringify(combinedBackup, null, 2));
    console.log(`✅ Latest backup updated: ${latestFile}`);
    
    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup files saved in: ${backupDir}`);
    console.log('\n📋 Summary:');
    console.log(`   - Tests: ${tests?.length || 0} records`);
    console.log(`   - Results: ${results?.length || 0} records`);
    console.log(`   - Total files: 4 backup files created`);
    
  } catch (error) {
    console.error('❌ Unexpected error during backup:', error.message);
    process.exit(1);
  }
}

// Run the backup
backupSupabaseData();

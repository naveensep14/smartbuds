const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...');
    
    // Create timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    
    console.log(`📅 Backup timestamp: ${timestamp}`);
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log('📁 Created backups directory');
    }
    
    // Backup tests table
    console.log('📝 Backing up tests table...');
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .order('createdat', { ascending: false });
    
    if (testsError) {
      console.error('❌ Error backing up tests:', testsError);
      return;
    }
    
    console.log(`✅ Backed up ${tests.length} tests`);
    
    // Backup results table
    console.log('📝 Backing up results table...');
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .order('completedAt', { ascending: false });
    
    if (resultsError) {
      console.error('❌ Error backing up results:', resultsError);
      return;
    }
    
    console.log(`✅ Backed up ${results.length} results`);
    
    // Backup profiles table
    console.log('📝 Backing up profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error backing up profiles:', profilesError);
      return;
    }
    
    console.log(`✅ Backed up ${profiles.length} profiles`);
    
    // Backup test_progress table (if exists)
    console.log('📝 Backing up test_progress table...');
    const { data: testProgress, error: testProgressError } = await supabase
      .from('test_progress')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (testProgressError) {
      console.log('⚠️ test_progress table not found or error:', testProgressError.message);
    } else {
      console.log(`✅ Backed up ${testProgress.length} test progress records`);
    }
    
    // Create comprehensive backup object
    const backupData = {
      timestamp: new Date().toISOString(),
      backupDate: new Date().toLocaleDateString(),
      backupTime: new Date().toLocaleTimeString(),
      summary: {
        tests: tests.length,
        results: results.length,
        profiles: profiles.length,
        testProgress: testProgress ? testProgress.length : 0
      },
      data: {
        tests: tests,
        results: results,
        profiles: profiles,
        testProgress: testProgress || []
      }
    };
    
    // Write individual table backups
    const testsFile = path.join(backupsDir, `tests_backup_${timestamp}.json`);
    const resultsFile = path.join(backupsDir, `results_backup_${timestamp}.json`);
    const profilesFile = path.join(backupsDir, `profiles_backup_${timestamp}.json`);
    const testProgressFile = path.join(backupsDir, `test_progress_backup_${timestamp}.json`);
    const fullBackupFile = path.join(backupsDir, `full_backup_${timestamp}.json`);
    
    // Write individual files
    fs.writeFileSync(testsFile, JSON.stringify(tests, null, 2));
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
    if (testProgress) {
      fs.writeFileSync(testProgressFile, JSON.stringify(testProgress, null, 2));
    }
    
    // Write comprehensive backup
    fs.writeFileSync(fullBackupFile, JSON.stringify(backupData, null, 2));
    
    // Update latest backup reference
    const latestBackupFile = path.join(backupsDir, 'latest_backup.json');
    fs.writeFileSync(latestBackupFile, JSON.stringify({
      timestamp: timestamp,
      filename: `full_backup_${timestamp}.json`,
      date: new Date().toISOString(),
      summary: backupData.summary
    }, null, 2));
    
    console.log('📁 Backup files created:');
    console.log(`   📄 ${testsFile}`);
    console.log(`   📄 ${resultsFile}`);
    console.log(`   📄 ${profilesFile}`);
    if (testProgress) {
      console.log(`   📄 ${testProgressFile}`);
    }
    console.log(`   📄 ${fullBackupFile}`);
    console.log(`   📄 ${latestBackupFile}`);
    
    // Display backup summary
    console.log('\n📊 Backup Summary:');
    console.log(`   🧪 Tests: ${tests.length}`);
    console.log(`   📊 Results: ${results.length}`);
    console.log(`   👤 Profiles: ${profiles.length}`);
    console.log(`   📈 Test Progress: ${testProgress ? testProgress.length : 0}`);
    console.log(`   📅 Date: ${new Date().toLocaleDateString()}`);
    console.log(`   ⏰ Time: ${new Date().toLocaleTimeString()}`);
    
    console.log('\n🎉 Database backup completed successfully!');
    
  } catch (error) {
    console.error('🚨 Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();

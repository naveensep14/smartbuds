#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script migrates the database schema to match the Supabase types.
 * It renames columns from camelCase to snake_case and adds the missing board column.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');

  try {
    // Step 1: Add board column to tests table if it doesn't exist
    console.log('📝 Adding board column to tests table...');
    const { error: boardError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tests' AND column_name = 'board'
          ) THEN
            ALTER TABLE tests ADD COLUMN board TEXT NOT NULL DEFAULT 'ICSE';
          END IF;
        END $$;
      `
    });

    if (boardError) {
      console.log('⚠️  Board column might already exist or RPC not available, trying direct approach...');
      
      // Try direct column addition
      const { error: directBoardError } = await supabase
        .from('tests')
        .select('board')
        .limit(1);
        
      if (directBoardError && directBoardError.message.includes('column "board" does not exist')) {
        console.log('❌ Board column does not exist and cannot be added automatically');
        console.log('Please run this SQL manually in your Supabase dashboard:');
        console.log('ALTER TABLE tests ADD COLUMN board TEXT NOT NULL DEFAULT \'ICSE\';');
      } else {
        console.log('✅ Board column exists or was added successfully');
      }
    } else {
      console.log('✅ Board column added successfully');
    }

    // Step 2: Check current column names in results table
    console.log('🔍 Checking current results table structure...');
    const { data: resultsData, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .limit(1);

    if (resultsError) {
      console.error('❌ Error checking results table:', resultsError.message);
      return;
    }

    if (resultsData && resultsData.length > 0) {
      const columns = Object.keys(resultsData[0]);
      console.log('📊 Current results table columns:', columns);
      
      // Check if we need to migrate from camelCase to snake_case
      const needsMigration = columns.some(col => 
        ['testId', 'studentName', 'completedAt', 'totalQuestions', 'correctAnswers', 'timeTaken'].includes(col)
      );

      if (needsMigration) {
        console.log('⚠️  Migration needed: camelCase to snake_case');
        console.log('Please run these SQL commands manually in your Supabase dashboard:');
        console.log('');
        console.log('-- Rename columns in results table');
        console.log('ALTER TABLE results RENAME COLUMN "testId" TO test_id;');
        console.log('ALTER TABLE results RENAME COLUMN "studentName" TO student_name;');
        console.log('ALTER TABLE results RENAME COLUMN "completedAt" TO completed_at;');
        console.log('ALTER TABLE results RENAME COLUMN "totalQuestions" TO total_questions;');
        console.log('ALTER TABLE results RENAME COLUMN "correctAnswers" TO correct_answers;');
        console.log('ALTER TABLE results RENAME COLUMN "timeTaken" TO time_taken;');
        console.log('');
        console.log('-- Update indexes');
        console.log('DROP INDEX IF EXISTS idx_results_testId;');
        console.log('DROP INDEX IF EXISTS idx_results_studentName;');
        console.log('CREATE INDEX IF NOT EXISTS idx_results_test_id ON results(test_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_results_student_name ON results(student_name);');
        console.log('');
        console.log('After running these commands, test result saving should work properly.');
      } else {
        console.log('✅ Results table already uses snake_case columns');
      }
    } else {
      console.log('📝 Results table is empty, no migration needed');
    }

    // Step 3: Test the current structure
    console.log('🧪 Testing current database structure...');
    
    // Test tests table
    const { data: testsData, error: testsError } = await supabase
      .from('tests')
      .select('id, title, board')
      .limit(1);
      
    if (testsError) {
      console.error('❌ Error testing tests table:', testsError.message);
    } else {
      console.log('✅ Tests table accessible');
      if (testsData && testsData.length > 0) {
        console.log('📊 Sample test data:', testsData[0]);
      }
    }

    // Test results table
    const { data: testResultsData, error: testResultsError } = await supabase
      .from('results')
      .select('id, test_id, student_name, score')
      .limit(1);
      
    if (testResultsError) {
      console.error('❌ Error testing results table:', testResultsError.message);
      console.log('This indicates the migration is needed.');
    } else {
      console.log('✅ Results table accessible with snake_case columns');
      if (testResultsData && testResultsData.length > 0) {
        console.log('📊 Sample result data:', testResultsData[0]);
      }
    }

    console.log('');
    console.log('🎉 Database migration check completed!');
    console.log('If you see any errors above, please run the suggested SQL commands manually.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateDatabase();

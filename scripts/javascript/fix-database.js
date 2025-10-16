#!/usr/bin/env node

/**
 * Fix Database Script
 * 
 * This script provides the exact SQL needed to fix the database schema.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');
  console.log('');
  console.log('📋 Current issue: The results table exists but has no columns.');
  console.log('');
  console.log('🛠️  SOLUTION: Run this SQL in your Supabase dashboard:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/[your-project]/sql');
  console.log('2. Copy and paste the SQL below:');
  console.log('');
  console.log('='.repeat(80));
  console.log('');
  console.log('-- Fix results table schema');
  console.log('DROP TABLE IF EXISTS results CASCADE;');
  console.log('');
  console.log('CREATE TABLE results (');
  console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
  console.log('  "testId" UUID REFERENCES tests(id) ON DELETE CASCADE,');
  console.log('  "studentName" TEXT NOT NULL,');
  console.log('  score INTEGER NOT NULL,');
  console.log('  "totalQuestions" INTEGER NOT NULL,');
  console.log('  "correctAnswers" INTEGER NOT NULL,');
  console.log('  answers JSONB NOT NULL,');
  console.log('  "timeTaken" INTEGER,');
  console.log('  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
  console.log(');');
  console.log('');
  console.log('-- Create indexes');
  console.log('CREATE INDEX IF NOT EXISTS idx_results_testId ON results("testId");');
  console.log('CREATE INDEX IF NOT EXISTS idx_results_studentName ON results("studentName");');
  console.log('');
  console.log('-- Enable RLS');
  console.log('ALTER TABLE results ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Create policies');
  console.log('CREATE POLICY "Allow public insert access to results" ON results');
  console.log('  FOR INSERT WITH CHECK (true);');
  console.log('');
  console.log('CREATE POLICY "Allow public read access to results" ON results');
  console.log('  FOR SELECT USING (true);');
  console.log('');
  console.log('-- Add board column to tests table if missing');
  console.log('DO $$');
  console.log('BEGIN');
  console.log('  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'tests\' AND column_name = \'board\') THEN');
  console.log('    ALTER TABLE tests ADD COLUMN board TEXT NOT NULL DEFAULT \'ICSE\';');
  console.log('  END IF;');
  console.log('END $$;');
  console.log('');
  console.log('='.repeat(80));
  console.log('');
  console.log('3. Click "Run" to execute the SQL');
  console.log('');
  console.log('4. After running the SQL, test with: node scripts/test-database.js');
  console.log('');
  console.log('🎯 This will fix the test result saving issue!');

  // Test current state
  console.log('\n🧪 Testing current database state...');
  
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Results table error:', error.message);
    } else {
      console.log('✅ Results table accessible');
      if (data && data.length > 0) {
        console.log('📊 Sample result:', data[0]);
      } else {
        console.log('📝 Results table is empty');
      }
    }
  } catch (err) {
    console.log('❌ Database test failed:', err.message);
  }
}

// Run the fix
fixDatabase();

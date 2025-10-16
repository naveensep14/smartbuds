#!/usr/bin/env node

/**
 * Setup Results Table Script
 * 
 * This script creates the results table with the correct schema.
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

async function setupResultsTable() {
  console.log('🔧 Setting up results table...');

  try {
    // First, let's try to drop and recreate the results table
    console.log('📝 Creating results table with correct schema...');
    
    // The SQL to create the results table
    const createTableSQL = `
      -- Drop existing results table if it exists
      DROP TABLE IF EXISTS results CASCADE;
      
      -- Create results table with correct schema
      CREATE TABLE results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        testId UUID REFERENCES tests(id) ON DELETE CASCADE,
        studentName TEXT NOT NULL,
        score INTEGER NOT NULL,
        totalQuestions INTEGER NOT NULL,
        correctAnswers INTEGER NOT NULL,
        answers JSONB NOT NULL,
        timeTaken INTEGER,
        completedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_results_testId ON results("testId");
      CREATE INDEX IF NOT EXISTS idx_results_studentName ON results("studentName");
      
      -- Enable Row Level Security (RLS)
      ALTER TABLE results ENABLE ROW LEVEL SECURITY;
      
      -- Create policies for public access
      CREATE POLICY "Allow public insert access to results" ON results
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Allow public read access to results" ON results
        FOR SELECT USING (true);
    `;

    console.log('⚠️  Please run this SQL in your Supabase dashboard:');
    console.log('Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    console.log('');
    console.log('Then run this SQL:');
    console.log('='.repeat(80));
    console.log(createTableSQL);
    console.log('='.repeat(80));
    console.log('');
    console.log('After running the SQL, test the setup with:');
    console.log('node scripts/test-database.js');

    // Try to test if we can access the table after setup
    console.log('\n🧪 Testing current table access...');
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Results table not ready:', error.message);
      console.log('Please run the SQL above first.');
    } else {
      console.log('✅ Results table is accessible');
      
      // Test insertion
      console.log('🧪 Testing result insertion...');
      const { data: testData, error: testError } = await supabase
        .from('results')
        .insert({
          testId: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          studentName: 'test@example.com',
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8,
          timeTaken: 300,
          answers: []
        })
        .select();

      if (testError) {
        console.error('❌ Insert test failed:', testError.message);
      } else {
        console.log('✅ Insert test successful:', testData);
        
        // Clean up
        if (testData && testData.length > 0) {
          await supabase
            .from('results')
            .delete()
            .eq('id', testData[0].id);
          console.log('🧹 Test data cleaned up');
        }
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupResultsTable();

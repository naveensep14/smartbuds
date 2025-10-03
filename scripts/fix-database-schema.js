#!/usr/bin/env node

/**
 * Fix Database Schema Script
 * 
 * This script attempts to fix the database schema by running SQL commands.
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

async function fixDatabaseSchema() {
  console.log('🔧 Attempting to fix database schema...');

  try {
    // First, let's try to check if we can execute SQL directly
    console.log('📝 Attempting to execute SQL commands...');
    
    // Try to drop and recreate the results table
    const sqlCommands = [
      'DROP TABLE IF EXISTS results CASCADE;',
      `CREATE TABLE results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "testId" UUID REFERENCES tests(id) ON DELETE CASCADE,
        "studentName" TEXT NOT NULL,
        score INTEGER NOT NULL,
        "totalQuestions" INTEGER NOT NULL,
        "correctAnswers" INTEGER NOT NULL,
        answers JSONB NOT NULL,
        "timeTaken" INTEGER,
        "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      'CREATE INDEX IF NOT EXISTS idx_results_testId ON results("testId");',
      'CREATE INDEX IF NOT EXISTS idx_results_studentName ON results("studentName");',
      'ALTER TABLE results ENABLE ROW LEVEL SECURITY;',
      `CREATE POLICY "Allow public insert access to results" ON results
        FOR INSERT WITH CHECK (true);`,
      `CREATE POLICY "Allow public read access to results" ON results
        FOR SELECT USING (true);`
    ];

    // Try to execute each SQL command
    for (const sql of sqlCommands) {
      try {
        console.log(`🔄 Executing: ${sql.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.log(`⚠️  SQL execution failed (this is expected for anon key): ${error.message}`);
        } else {
          console.log(`✅ SQL executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  SQL execution error: ${err.message}`);
      }
    }

    // Alternative approach: Try to use the REST API to create the table
    console.log('\n🔄 Trying alternative approach...');
    
    // Check if we can access the results table
    const { data: resultsData, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .limit(1);

    if (resultsError) {
      console.log('❌ Results table error:', resultsError.message);
      
      // Try to create a simple test result to see what columns are expected
      console.log('\n🧪 Testing what columns the database expects...');
      
      const testResult = {
        id: 'test-123',
        testId: 'b840581f-654c-4e2a-bac3-dbe2bcee6615',
        studentName: 'test@example.com',
        score: 85,
        totalQuestions: 5,
        correctAnswers: 4,
        timeTaken: 300,
        answers: []
      };

      const { data: insertData, error: insertError } = await supabase
        .from('results')
        .insert(testResult)
        .select();

      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
        console.log('This confirms the table schema needs to be fixed.');
      } else {
        console.log('✅ Insert test successful:', insertData);
        
        // Clean up
        await supabase
          .from('results')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test data cleaned up');
      }
    } else {
      console.log('✅ Results table is accessible');
      if (resultsData && resultsData.length > 0) {
        console.log('📊 Sample result:', resultsData[0]);
      } else {
        console.log('📝 Results table is empty');
      }
    }

    // Final test
    console.log('\n🧪 Final test - attempting to insert a result...');
    const { data: finalTest, error: finalError } = await supabase
      .from('results')
      .insert({
        testId: 'b840581f-654c-4e2a-bac3-dbe2bcee6615',
        studentName: 'test@example.com',
        score: 90,
        totalQuestions: 5,
        correctAnswers: 4,
        timeTaken: 250,
        answers: []
      })
      .select();

    if (finalError) {
      console.log('❌ Final test failed:', finalError.message);
      console.log('\n📋 MANUAL ACTION REQUIRED:');
      console.log('The database schema needs to be fixed manually in the Supabase dashboard.');
      console.log('Please run the SQL commands provided in the fix-database.js script.');
    } else {
      console.log('✅ Final test successful! Database schema is working.');
      console.log('📊 Inserted result:', finalTest);
      
      // Clean up
      await supabase
        .from('results')
        .delete()
        .eq('id', finalTest[0].id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    console.log('\n📋 MANUAL ACTION REQUIRED:');
    console.log('Please run the SQL commands manually in your Supabase dashboard.');
  }
}

// Run the fix
fixDatabaseSchema();

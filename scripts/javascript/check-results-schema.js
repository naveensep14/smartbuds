#!/usr/bin/env node

/**
 * Check Results Schema Script
 * 
 * This script checks what columns actually exist in the results table.
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

async function checkResultsSchema() {
  console.log('🔍 Checking results table schema...');

  try {
    // Try to get schema information
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .limit(0); // Get 0 rows but still get column info

    if (error) {
      console.error('❌ Error accessing results table:', error.message);
      
      // Try to get information about the table structure
      console.log('\n🔍 Trying alternative approach...');
      
      // Try different column names that might exist
      const possibleColumns = [
        'id', 'testId', 'test_id', 'studentName', 'student_name',
        'score', 'totalQuestions', 'total_questions', 'correctAnswers', 'correct_answers',
        'timeTaken', 'time_taken', 'answers', 'completedAt', 'completed_at',
        'created_at', 'createdAt', 'updated_at', 'updatedAt'
      ];
      
      console.log('🧪 Testing individual columns...');
      for (const column of possibleColumns) {
        try {
          const { error: colError } = await supabase
            .from('results')
            .select(column)
            .limit(1);
          
          if (!colError) {
            console.log(`✅ Column exists: ${column}`);
          }
        } catch (e) {
          // Column doesn't exist
        }
      }
    } else {
      console.log('✅ Results table accessible');
      console.log('📊 This suggests the table exists but has no columns or is empty');
    }

    // Try to create a simple result with minimal fields
    console.log('\n🧪 Testing minimal insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('results')
      .insert({
        id: 'test-123',
        testId: 'test-test',
        studentName: 'test@example.com',
        score: 100
      })
      .select();

    if (insertError) {
      console.error('❌ Minimal insert error:', insertError.message);
    } else {
      console.log('✅ Minimal insert successful:', insertData);
      
      // Clean up
      if (insertData && insertData.length > 0) {
        await supabase
          .from('results')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test data cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

// Run the check
checkResultsSchema();

#!/usr/bin/env node

/**
 * Database Test Script
 * 
 * This script tests the current database structure to see what columns exist.
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

async function testDatabase() {
  console.log('🧪 Testing database structure...');

  try {
    // Test 1: Check tests table structure
    console.log('\n📊 Testing tests table...');
    const { data: testsData, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (testsError) {
      console.error('❌ Tests table error:', testsError.message);
    } else {
      console.log('✅ Tests table accessible');
      if (testsData && testsData.length > 0) {
        const columns = Object.keys(testsData[0]);
        console.log('📋 Tests table columns:', columns);
        console.log('📄 Sample test:', testsData[0]);
      } else {
        console.log('📝 Tests table is empty');
      }
    }

    // Test 2: Check results table structure
    console.log('\n📊 Testing results table...');
    const { data: resultsData, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .limit(1);

    if (resultsError) {
      console.error('❌ Results table error:', resultsError.message);
    } else {
      console.log('✅ Results table accessible');
      if (resultsData && resultsData.length > 0) {
        const columns = Object.keys(resultsData[0]);
        console.log('📋 Results table columns:', columns);
        console.log('📄 Sample result:', resultsData[0]);
      } else {
        console.log('📝 Results table is empty');
      }
    }

    // Test 3: Try to insert a test result
    console.log('\n🧪 Testing result insertion...');
    
    // First, get a test ID
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('id')
      .limit(1);

    if (testError || !testData || testData.length === 0) {
      console.log('⚠️  No tests available for insertion test');
    } else {
      const testId = testData[0].id;
      console.log('📝 Using test ID:', testId);

      // Try to insert a test result
      const { data: insertData, error: insertError } = await supabase
        .from('results')
        .insert({
          testId: testId,
          studentName: 'test@example.com',
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8,
          timeTaken: 300,
          answers: []
        })
        .select();

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ Insert successful:', insertData);
        
        // Clean up - delete the test result
        if (insertData && insertData.length > 0) {
          const { error: deleteError } = await supabase
            .from('results')
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            console.error('⚠️  Cleanup error:', deleteError.message);
          } else {
            console.log('🧹 Test result cleaned up');
          }
        }
      }
    }

    console.log('\n🎉 Database test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDatabase();

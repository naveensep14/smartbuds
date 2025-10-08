#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Please make sure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPdfTests() {
  console.log('🚀 Starting to import PDF-based tests to database...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    // First, check if tests table exists by trying to get all tests
    const { data: existingTests, error: fetchError } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error connecting to database:', fetchError.message);
      console.log('\n🔧 Please make sure:');
      console.log('1. Your Supabase project is set up correctly');
      console.log('2. You have created the "tests" table in your Supabase SQL editor');
      console.log('3. Your environment variables are correct');
      return;
    }

    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${existingTests?.length || 0} existing tests`);

    // Read the combined JSON file
    const jsonFilePath = path.join(__dirname, '..', 'all_grade4_math_tests.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error('❌ JSON file not found:', jsonFilePath);
      console.log('Please run the Python script first to generate the test files.');
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const tests = jsonData.tests;

    console.log(`\n📚 Found ${tests.length} tests to import:`);
    tests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title} (${test.questions.length} questions)`);
    });

    // Add each test
    const importedTests = [];
    for (const test of tests) {
      console.log(`\n📝 Adding: ${test.title}`);
      
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          timelimit: test.duration,
          questions: test.questions
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add "${test.title}":`, error.message);
      } else {
        console.log(`✅ Successfully added: ${test.title} (ID: ${data.id})`);
        console.log(`   - ${test.questions.length} questions`);
        console.log(`   - Duration: ${test.duration} minutes`);
        console.log(`   - Subject: ${test.subject}`);
        console.log(`   - Grade: ${test.grade}`);
        console.log(`   - Board: ${test.board}`);
        importedTests.push(data);
      }
    }

    // Verify the tests were added
    const { data: finalTests, error: finalError } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error verifying tests:', finalError.message);
    } else {
      console.log(`\n🎉 Import completed successfully!`);
      console.log(`📊 Total tests in database: ${finalTests.length}`);
      console.log(`✅ Successfully imported: ${importedTests.length} tests`);
      
      if (importedTests.length > 0) {
        console.log('\n📋 Imported tests:');
        importedTests.forEach((test, index) => {
          console.log(`   ${index + 1}. ${test.title} (ID: ${test.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the import
importPdfTests();

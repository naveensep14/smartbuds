#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function importClass3TestsFromJSON() {
  console.log('📚 Importing Class 3 Tests from JSON files...');
  console.log('============================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const testFiles = [
    'class3_math_test_1.json',
    'class3_math_test_2.json', 
    'class3_math_test_3.json'
  ];
  
  let successCount = 0;
  let totalTests = testFiles.length;
  
  for (const filename of testFiles) {
    console.log(`\n📝 Processing ${filename}...`);
    
    try {
      // Read the JSON file
      const testData = JSON.parse(fs.readFileSync(filename, 'utf8'));
      
      // Convert duration to timelimit for database compatibility
      const dbTestData = {
        title: testData.title,
        description: testData.description,
        subject: testData.subject,
        grade: testData.grade,
        board: testData.board,
        timelimit: testData.duration, // Convert duration to timelimit
        questions: testData.questions
      };
      
      console.log(`   Title: ${dbTestData.title}`);
      console.log(`   Board: ${dbTestData.board}`);
      console.log(`   Duration: ${dbTestData.timelimit} minutes`);
      console.log(`   Questions: ${dbTestData.questions.length}`);
      
      // Insert into database
      const { data, error } = await supabase
        .from('tests')
        .insert(dbTestData)
        .select()
        .single();
      
      if (error) {
        console.log(`❌ Error importing ${filename}:`, error.message);
        continue;
      }
      
      console.log(`✅ Successfully imported ${filename}`);
      console.log(`   Database ID: ${data.id}`);
      successCount++;
      
    } catch (err) {
      console.log(`❌ Error processing ${filename}:`, err.message);
    }
  }
  
  console.log('\n🎉 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount}/${totalTests} tests`);
  
  if (successCount === totalTests) {
    console.log('\n🚀 All Class 3 Math tests are now available in your application!');
  } else {
    console.log('\n⚠️  Some tests failed to import. Check the error messages above.');
  }
}

async function testBoardFieldAfterImport() {
  console.log('\n🧪 Testing Board Field After Import...');
  console.log('======================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if board column exists
    const { data: test, error } = await supabase
      .from('tests')
      .select('id, title, board')
      .limit(1)
      .single();
    
    if (error) {
      console.log('❌ Board column check failed:', error.message);
      return false;
    }
    
    console.log('✅ Board column exists');
    console.log('   Sample board value:', test.board || 'NULL');
    
    // Test filtering by board
    const { data: usTests, error: filterError } = await supabase
      .from('tests')
      .select('id, title, board')
      .eq('board', 'US');
    
    if (filterError) {
      console.log('❌ Board filtering failed:', filterError.message);
      return false;
    }
    
    console.log('✅ Board filtering works');
    console.log(`   Found ${usTests.length} tests with board = US`);
    
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Class 3 Tests Import with Board Field');
  console.log('========================================');
  
  // First test if board field is working
  const boardWorking = await testBoardFieldAfterImport();
  
  if (!boardWorking) {
    console.log('\n❌ Board field is not working yet.');
    console.log('💡 Please run the add-board-field-no-validation.sql script first.');
    return;
  }
  
  // Import the Class 3 tests
  await importClass3TestsFromJSON();
}

main().catch(console.error);

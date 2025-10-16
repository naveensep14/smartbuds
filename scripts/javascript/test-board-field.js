#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testBoardFieldFunctionality() {
  console.log('🧪 Testing Board Field Functionality...');
  console.log('======================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Check if board column exists
  console.log('📝 Test 1: Checking if board column exists');
  try {
    const { data: test, error } = await supabase
      .from('tests')
      .select('id, title, board')
      .limit(1)
      .single();
    
    if (error) {
      console.log('❌ Board column does not exist:', error.message);
      console.log('💡 You need to run the add-board-field.sql script first');
      return false;
    }
    
    console.log('✅ Board column exists');
    console.log('   Sample board value:', test.board || 'NULL');
    
  } catch (err) {
    console.log('❌ Error checking board column:', err.message);
    return false;
  }
  
  // Test 2: Create a test with board field
  console.log('\n📝 Test 2: Creating test with board field');
  const testData = {
    title: 'Board Field Test - US Curriculum',
    description: 'Testing board field functionality',
    subject: 'Mathematics',
    grade: 'Grade 5',
    board: 'US',
    timelimit: 25,
    questions: [
      {
        question: 'What is 5 + 5?',
        options: ['9', '10', '11', '12'],
        correctAnswer: 1,
        explanation: '5 + 5 = 10'
      }
    ]
  };
  
  try {
    const { data: createdTest, error: createError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Failed to create test with board:', createError.message);
      return false;
    }
    
    console.log('✅ Test created successfully with board:', createdTest.board);
    
    // Test 3: Filter by board
    console.log('\n📝 Test 3: Filtering tests by board');
    const { data: usTests, error: filterError } = await supabase
      .from('tests')
      .select('id, title, board')
      .eq('board', 'US');
    
    if (filterError) {
      console.log('❌ Failed to filter by board:', filterError.message);
    } else {
      console.log('✅ Filter by board successful');
      console.log('   Found', usTests.length, 'tests with board = US');
      usTests.forEach(test => {
        console.log('   - ' + test.title + ' (board: ' + test.board + ')');
      });
    }
    
    // Test 4: Try invalid board value
    console.log('\n📝 Test 4: Testing invalid board value');
    const invalidTestData = {
      ...testData,
      title: 'Invalid Board Test',
      board: 'INVALID_BOARD'
    };
    
    const { data: invalidTest, error: invalidError } = await supabase
      .from('tests')
      .insert(invalidTestData)
      .select()
      .single();
    
    if (invalidError) {
      console.log('✅ Invalid board validation working:', invalidError.message);
    } else {
      console.log('❌ Invalid board validation failed - test was created');
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('tests').delete().eq('id', createdTest.id);
    console.log('✅ Cleanup complete');
    
    return true;
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
    return false;
  }
}

async function checkCurrentBoardValues() {
  console.log('\n📊 Current Board Values in Database...');
  console.log('=====================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, board, subject, grade')
      .order('createdat', { ascending: true });
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('📋 All tests and their board values:');
    tests.forEach((test, index) => {
      console.log((index + 1) + '. ' + test.title);
      console.log('   Board: ' + (test.board || 'NULL'));
      console.log('   Subject: ' + test.subject + ', Grade: ' + test.grade);
      console.log('');
    });
    
    // Group by board
    const boardGroups = {};
    tests.forEach(test => {
      const board = test.board || 'NULL';
      if (!boardGroups[board]) {
        boardGroups[board] = [];
      }
      boardGroups[board].push(test.title);
    });
    
    console.log('📊 Tests grouped by board:');
    Object.entries(boardGroups).forEach(([board, titles]) => {
      console.log(board + ': ' + titles.length + ' tests');
      titles.forEach(title => {
        console.log('   - ' + title);
      });
      console.log('');
    });
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

async function main() {
  console.log('🚀 Board Field Functionality Test');
  console.log('=================================');
  
  const boardWorking = await testBoardFieldFunctionality();
  
  if (boardWorking) {
    console.log('\n🎉 Board field is fully functional!');
    await checkCurrentBoardValues();
  } else {
    console.log('\n📋 Next Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy the contents of add-board-field.sql');
    console.log('4. Execute the SQL');
    console.log('5. Run this script again to test');
  }
}

main().catch(console.error);

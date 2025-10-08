#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSimpleImport() {
  console.log('🧪 Testing Simple Import (without constraints)...');
  console.log('===============================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Simple test data that matches the database schema
  const testData = {
    title: 'Simple Board Test',
    description: 'Testing simple import without constraints',
    subject: 'Mathematics',
    grade: 'Class 3',
    board: 'US',
    timelimit: 20,
    questions: [
      {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: '2 + 2 = 4'
      }
    ]
  };
  
  try {
    console.log('📝 Attempting simple import...');
    const { data: createdTest, error: createError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Import failed:', createError.message);
      return false;
    }
    
    console.log('✅ Simple import successful!');
    console.log('   ID:', createdTest.id);
    console.log('   Board:', createdTest.board);
    console.log('   Questions:', createdTest.questions.length);
    
    // Clean up
    await supabase.from('tests').delete().eq('id', createdTest.id);
    console.log('🧹 Cleanup complete');
    
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testClass3Import() {
  console.log('\n📚 Testing Class 3 Test Import...');
  console.log('=================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test data that matches our JSON structure but with correct field names
  const testData = {
    title: 'Class 3 Math - Counting and Basic Number Concepts',
    description: 'Test covering counting methods, basic number recognition, and simple counting problems from Chapter 1',
    subject: 'Mathematics',
    grade: 'Class 3',
    board: 'US',
    timelimit: 20, // Convert from duration to timelimit
    questions: [
      {
        question: "Deba and Deep used marks on the wall to count their cows. If they made 8 marks when leaving home, how many cows did they have?",
        options: ["6 cows", "8 cows", "10 cows", "12 cows"],
        correctAnswer: 1,
        explanation: "Each mark represents one cow, so 8 marks means 8 cows."
      },
      {
        question: "If Deba and Deep had 8 cows and 2 marks were left on the wall when they returned, how many cows reached home?",
        options: ["6 cows", "8 cows", "10 cows", "2 cows"],
        correctAnswer: 0,
        explanation: "If 2 marks are left, it means 2 cows haven't returned yet. So 8 - 2 = 6 cows reached home."
      }
    ]
  };
  
  try {
    console.log('📝 Attempting Class 3 test import...');
    const { data: createdTest, error: createError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Class 3 import failed:', createError.message);
      return false;
    }
    
    console.log('✅ Class 3 test import successful!');
    console.log('   ID:', createdTest.id);
    console.log('   Title:', createdTest.title);
    console.log('   Board:', createdTest.board);
    console.log('   Questions:', createdTest.questions.length);
    
    // Clean up
    await supabase.from('tests').delete().eq('id', createdTest.id);
    console.log('🧹 Cleanup complete');
    
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Board Field Import Test');
  console.log('==========================');
  
  const simpleSuccess = await testSimpleImport();
  const class3Success = await testClass3Import();
  
  if (simpleSuccess && class3Success) {
    console.log('\n🎉 All imports working!');
    console.log('💡 The issue might be with the validation constraints.');
    console.log('📋 Next steps:');
    console.log('1. Apply the board field migration (add-board-field-fixed.sql)');
    console.log('2. Skip the constraints for now');
    console.log('3. Import the Class 3 tests');
    console.log('4. Add constraints later if needed');
  } else {
    console.log('\n❌ Import tests failed');
    console.log('💡 Check the error messages above for details');
  }
}

main().catch(console.error);

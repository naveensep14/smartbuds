#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ Tests table exists');
    
    // Try to insert a simple test to see what columns are available
    const testData = {
      title: 'Test Schema Check',
      description: 'Testing database schema',
      subject: 'Mathematics',
      grade: 'Class 3',
      timelimit: 20,
      questions: [{"question": "Test question", "options": ["A", "B"], "correctAnswer": 0}]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('💡 This tells us what columns are missing or incorrect');
    } else {
      console.log('✅ Test insert successful!');
      console.log('📊 Inserted test:', insertData);
      
      // Clean up the test
      await supabase.from('tests').delete().eq('id', insertData.id);
      console.log('🧹 Cleaned up test data');
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

async function importClass3TestsWithoutBoard() {
  console.log('\n📚 Importing Class 3 Math Tests (without board column)...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Counting and Basic Number Concepts
  const test1 = {
    title: 'Class 3 Math - Counting and Basic Number Concepts',
    description: 'Test covering counting methods, basic number recognition, and simple counting problems from Chapter 1',
    subject: 'Mathematics',
    grade: 'Class 3',
    timelimit: 20,
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
      },
      {
        question: "Hemant has 36 cows and 23 sheep. How many animals does he have in total?",
        options: ["59 animals", "58 animals", "60 animals", "57 animals"],
        correctAnswer: 0,
        explanation: "Total animals = 36 cows + 23 sheep = 59 animals."
      },
      {
        question: "Which method did Deba and Deep use to keep track of their cows?",
        options: ["Writing numbers", "Making marks on the wall", "Using fingers", "Counting aloud"],
        correctAnswer: 1,
        explanation: "They made marks on the wall for each cow that left and struck out marks when cows returned."
      },
      {
        question: "If you have 15 toys and you give away 7 toys, how many toys do you have left?",
        options: ["8 toys", "7 toys", "22 toys", "9 toys"],
        correctAnswer: 0,
        explanation: "15 - 7 = 8 toys left."
      }
    ]
  };

  try {
    const { data, error } = await supabase
      .from('tests')
      .insert(test1)
      .select()
      .single();

    if (error) {
      console.log('❌ Error inserting test 1:', error.message);
      return false;
    }

    console.log('✅ Test 1 imported successfully!');
    console.log('   ID:', data.id);
    console.log('   Title:', data.title);
    console.log('   Questions:', data.questions.length);
    
    return true;
    
  } catch (err) {
    console.log('❌ Error importing test:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 SmartBuds Database Schema Check');
  console.log('==================================');
  
  await checkDatabaseSchema();
  await importClass3TestsWithoutBoard();
}

main().catch(console.error);

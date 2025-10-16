#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('Key:', supabaseKey ? 'SET' : 'NOT SET');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('tests').select('count');
    
    if (error) {
      console.log('❌ Database error:', error.message);
      
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation "tests" does not exist')) {
        console.log('📋 The tests table does not exist yet.');
        console.log('💡 You need to run the database setup SQL first.');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Tests table is accessible');
    return true;
    
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function importClass3Tests() {
  console.log('\n📚 Importing Class 3 Math Tests...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Counting and Basic Number Concepts
  const test1 = {
    title: 'Class 3 Math - Counting and Basic Number Concepts',
    description: 'Test covering counting methods, basic number recognition, and simple counting problems from Chapter 1',
    subject: 'Mathematics',
    grade: 'Class 3',
    board: 'US',
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
  console.log('🚀 SmartBuds Database Setup Test');
  console.log('================================');
  
  const connected = await testSupabaseConnection();
  
  if (connected) {
    console.log('\n📥 Testing test import...');
    await importClass3Tests();
  } else {
    console.log('\n💡 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Run the SQL from database-setup.sql');
    console.log('3. Then try importing tests again');
  }
}

main().catch(console.error);

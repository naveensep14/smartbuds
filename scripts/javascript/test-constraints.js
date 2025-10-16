#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testDatabaseConstraints() {
  console.log('🧪 Testing Database Constraints');
  console.log('================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const testData = {
    title: 'Database Constraint Test',
    description: 'Testing if database constraints are working',
    subject: 'Mathematics',
    grade: 'Class 3',
    timelimit: 20,
    questions: [
      {
        question: 'What is 4 + 4?',
        options: ['7', '8', '9', '10'],
        correctAnswer: 1,
        explanation: '4 + 4 = 8'
      }
    ]
  };
  
  console.log('📝 Test 1: Normal insert (should succeed)');
  try {
    const { data: firstInsert, error: firstError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (firstError) {
      console.log('❌ Normal insert failed:', firstError.message);
      return;
    }
    
    console.log('✅ Normal insert successful');
    
    console.log('\n📝 Test 2: Duplicate insert (should fail)');
    const { data: secondInsert, error: secondError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (secondError) {
      console.log('✅ Duplicate prevention working:', secondError.message);
    } else {
      console.log('❌ Duplicate prevention failed - constraints not active');
      console.log('💡 You need to apply the constraints via Supabase dashboard');
    }
    
    console.log('\n📝 Test 3: Invalid timelimit (should fail)');
    const invalidTimelimitData = {
      ...testData,
      title: 'Invalid Timelimit Test',
      timelimit: -10 // Invalid negative value
    };
    
    const { data: invalidTimelimitInsert, error: invalidTimelimitError } = await supabase
      .from('tests')
      .insert(invalidTimelimitData)
      .select()
      .single();
    
    if (invalidTimelimitError) {
      console.log('✅ Timelimit validation working:', invalidTimelimitError.message);
    } else {
      console.log('❌ Timelimit validation failed - constraints not active');
    }
    
    console.log('\n📝 Test 4: Empty questions (should fail)');
    const invalidQuestionsData = {
      ...testData,
      title: 'Invalid Questions Test',
      questions: [] // Invalid empty array
    };
    
    const { data: invalidQuestionsInsert, error: invalidQuestionsError } = await supabase
      .from('tests')
      .insert(invalidQuestionsData)
      .select()
      .single();
    
    if (invalidQuestionsError) {
      console.log('✅ Questions validation working:', invalidQuestionsError.message);
    } else {
      console.log('❌ Questions validation failed - constraints not active');
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('tests').delete().eq('id', firstInsert.id);
    if (secondInsert) {
      await supabase.from('tests').delete().eq('id', secondInsert.id);
    }
    if (invalidTimelimitInsert) {
      await supabase.from('tests').delete().eq('id', invalidTimelimitInsert.id);
    }
    if (invalidQuestionsInsert) {
      await supabase.from('tests').delete().eq('id', invalidQuestionsInsert.id);
    }
    console.log('✅ Cleanup complete');
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('If you see ❌ for duplicate prevention, data validation, etc.,');
  console.log('it means the constraints are not yet active.');
  console.log('You need to apply the SQL constraints via your Supabase dashboard.');
}

async function main() {
  await testDatabaseConstraints();
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Copy the contents of add-db-constraints.sql');
  console.log('4. Execute the SQL');
  console.log('5. Run this script again to verify constraints are working');
}

main().catch(console.error);

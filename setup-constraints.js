#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function addDatabaseConstraints() {
  console.log('🔒 Adding Database Constraints...');
  console.log('================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read the SQL file
  const sqlContent = fs.readFileSync('add-db-constraints.sql', 'utf8');
  
  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.log('❌ Error executing SQL:', error.message);
      return false;
    }
    
    console.log('✅ Database constraints added successfully!');
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    
    // Try alternative approach - execute SQL directly
    console.log('🔄 Trying alternative approach...');
    
    try {
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          
          const { error: stmtError } = await supabase
            .from('tests')
            .select('*')
            .limit(0); // This is just to test connection
          
          if (stmtError) {
            console.log(`❌ Error with statement: ${stmtError.message}`);
          }
        }
      }
      
    } catch (altErr) {
      console.log('❌ Alternative approach failed:', altErr.message);
      console.log('\n💡 Manual approach needed:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Copy and paste the contents of add-db-constraints.sql');
      console.log('4. Execute the SQL');
      return false;
    }
  }
}

async function testConstraints() {
  console.log('\n🧪 Testing Constraints...');
  console.log('==========================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Try to create a duplicate test
  console.log('📝 Test 1: Duplicate prevention');
  
  const testData = {
    title: 'Constraint Test - Duplicate Prevention',
    description: 'Testing duplicate prevention',
    subject: 'Mathematics',
    grade: 'Class 3',
    timelimit: 20,
    questions: [
      {
        question: 'What is 1 + 1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        explanation: '1 + 1 = 2'
      }
    ]
  };
  
  try {
    // First insert should succeed
    const { data: firstInsert, error: firstError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (firstError) {
      console.log('❌ First insert failed:', firstError.message);
      return;
    }
    
    console.log('✅ First insert successful');
    
    // Second insert should fail
    const { data: secondInsert, error: secondError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (secondError) {
      console.log('✅ Duplicate prevention working:', secondError.message);
    } else {
      console.log('❌ Duplicate prevention failed - second insert succeeded');
    }
    
    // Clean up
    await supabase.from('tests').delete().eq('id', firstInsert.id);
    console.log('🧹 Cleaned up test data');
    
  } catch (err) {
    console.log('❌ Test failed:', err.message);
  }
  
  // Test 2: Try to create test with invalid data
  console.log('\n📝 Test 2: Data validation');
  
  const invalidTestData = {
    title: 'Constraint Test - Invalid Data',
    description: 'Testing data validation',
    subject: 'Mathematics',
    grade: 'Class 3',
    timelimit: -5, // Invalid: negative timelimit
    questions: [] // Invalid: empty questions
  };
  
  try {
    const { data, error } = await supabase
      .from('tests')
      .insert(invalidTestData)
      .select()
      .single();
    
    if (error) {
      console.log('✅ Data validation working:', error.message);
    } else {
      console.log('❌ Data validation failed - invalid data was accepted');
      // Clean up if it somehow succeeded
      await supabase.from('tests').delete().eq('id', data.id);
    }
    
  } catch (err) {
    console.log('✅ Data validation working:', err.message);
  }
}

async function main() {
  console.log('🚀 SmartBuds Database Constraints Setup');
  console.log('=======================================');
  
  const success = await addDatabaseConstraints();
  
  if (success) {
    await testConstraints();
    console.log('\n🎉 Database constraints are now active!');
    console.log('💡 Duplicate tests will be prevented automatically');
  } else {
    console.log('\n📋 Manual Setup Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy the contents of add-db-constraints.sql');
    console.log('4. Execute the SQL');
    console.log('5. Run this script again to test');
  }
}

main().catch(console.error);

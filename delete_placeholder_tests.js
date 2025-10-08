#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function deletePlaceholderTests() {
  console.log('🗑️  Deleting Placeholder Class 3 Math Tests...');
  console.log('===============================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Find all Class 3 CBSE Math tests that were just imported (they have placeholder content)
    const { data: tests, error: fetchError } = await supabase
      .from('tests')
      .select('id, title, createdat')
      .eq('grade', 'Class 3')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics')
      .order('createdat', { ascending: false });
    
    if (fetchError) {
      console.log('❌ Error fetching tests:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${tests.length} Class 3 CBSE Math tests`);
    
    // Filter to only delete the recently imported ones (they have placeholder questions)
    // We'll identify them by checking if they have the placeholder question pattern
    const { data: allTests, error: allTestsError } = await supabase
      .from('tests')
      .select('id, title, questions')
      .eq('grade', 'Class 3')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics');
    
    if (allTestsError) {
      console.log('❌ Error fetching test details:', allTestsError.message);
      return;
    }
    
    // Identify tests with placeholder questions
    const placeholderTests = allTests.filter(test => {
      if (!test.questions || test.questions.length === 0) return true;
      
      // Check if any question has placeholder content
      return test.questions.some(q => 
        q.question && q.question.includes('Sample question') ||
        q.explanation && q.explanation.includes('This is the explanation for question')
      );
    });
    
    console.log(`🎯 Found ${placeholderTests.length} tests with placeholder content`);
    console.log('');
    
    if (placeholderTests.length === 0) {
      console.log('✅ No placeholder tests found to delete');
      return;
    }
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const test of placeholderTests) {
      console.log(`🗑️  Deleting: ${test.title}`);
      
      try {
        const { error: deleteError } = await supabase
          .from('tests')
          .delete()
          .eq('id', test.id);
        
        if (deleteError) {
          console.log(`❌ Error deleting: ${deleteError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Successfully deleted`);
          deletedCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`❌ Error deleting test: ${err.message}`);
        errorCount++;
      }
      
      console.log('');
    }
    
    console.log('🎉 Deletion Summary:');
    console.log('====================');
    console.log(`✅ Successfully deleted: ${deletedCount} tests`);
    console.log(`❌ Failed to delete: ${errorCount} tests`);
    console.log(`📊 Total processed: ${deletedCount + errorCount} tests`);
    
    if (deletedCount > 0) {
      console.log('\n🧹 Cleanup complete! Placeholder tests have been removed.');
    }
    
  } catch (err) {
    console.log('❌ Error during deletion process:', err.message);
  }
}

async function verifyDeletion() {
  console.log('\n🔍 Verifying deletion...');
  console.log('========================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: remainingTests, error } = await supabase
      .from('tests')
      .select('id, title, board, grade, subject')
      .eq('grade', 'Class 3')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics');
    
    if (error) {
      console.log('❌ Error verifying:', error.message);
      return;
    }
    
    console.log(`📊 Remaining Class 3 CBSE Math tests: ${remainingTests.length}`);
    
    if (remainingTests.length > 0) {
      console.log('\n📝 Remaining tests:');
      remainingTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.title}`);
      });
    } else {
      console.log('\n✅ All placeholder tests have been successfully removed!');
    }
    
  } catch (err) {
    console.log('❌ Error during verification:', err.message);
  }
}

async function main() {
  console.log('🧹 Class 3 Math Tests Cleanup');
  console.log('==============================');
  
  await deletePlaceholderTests();
  await verifyDeletion();
}

main().catch(console.error);

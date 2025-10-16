#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function deleteOldTests() {
  console.log('🗑️  Deleting Old Class 3 Math Tests...');
  console.log('=======================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Find all Class 3 CBSE Math tests
    const { data: tests, error: fetchError } = await supabase
      .from('tests')
      .select('id, title')
      .eq('grade', '3rd Grade')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics');
    
    if (fetchError) {
      console.log('❌ Error fetching tests:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${tests.length} Class 3 CBSE Math tests to delete`);
    console.log('');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const test of tests) {
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
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (err) {
        console.log(`❌ Error deleting test: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Deletion Summary:');
    console.log('====================');
    console.log(`✅ Successfully deleted: ${deletedCount} tests`);
    console.log(`❌ Failed to delete: ${errorCount} tests`);
    
  } catch (err) {
    console.log('❌ Error during deletion:', err.message);
  }
}

async function importConceptBasedTests() {
  console.log('\n📚 Importing Concept-Based Tests...');
  console.log('=====================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read the concept-based tests file
    const testsData = JSON.parse(fs.readFileSync('concept_based_class3_math_tests.json', 'utf8'));
    
    console.log(`📊 Found ${testsData.length} concept-based tests to import`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < testsData.length; i++) {
      const test = testsData[i];
      
      console.log(`📝 Importing test ${i + 1}/${testsData.length}: ${test.title}`);
      
      try {
        // Convert the test data to database format
        const dbTestData = {
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          timelimit: test.timelimit || test.duration,
          questions: test.questions.map(q => ({
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        };
        
        // Insert into database
        const { data, error } = await supabase
          .from('tests')
          .insert(dbTestData)
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Successfully imported (ID: ${data.id})`);
          successCount++;
        }
        
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`❌ Error importing test: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Import Summary:');
    console.log('==================');
    console.log(`✅ Successfully imported: ${successCount} concept-based tests`);
    console.log(`❌ Failed to import: ${errorCount} tests`);
    console.log(`📊 Total processed: ${successCount + errorCount} tests`);
    
    if (successCount === testsData.length) {
      console.log('\n🚀 All concept-based tests are now available!');
      console.log('📋 Features:');
      console.log('   ✅ Each test focuses on a specific concept');
      console.log('   ✅ No duplicate tests');
      console.log('   ✅ Flexible number of tests per chapter (2 concepts = 2 tests)');
      console.log('   ✅ Real questions with proper explanations');
    }
    
  } catch (err) {
    console.log('❌ Error reading test file:', err.message);
    console.log('💡 Make sure concept_based_class3_math_tests.json exists in the current directory');
  }
}

async function verifyImport() {
  console.log('\n🔍 Verifying Concept-Based Tests...');
  console.log('====================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check how many Class 3 CBSE tests we have
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, board, grade, subject')
      .eq('grade', '3rd Grade')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics')
      .order('title');
    
    if (error) {
      console.log('❌ Error verifying:', error.message);
      return;
    }
    
    console.log(`📊 Found ${tests.length} Class 3 CBSE Math tests in database`);
    console.log('');
    
    // Group by chapter
    const chapterCounts = {};
    tests.forEach(test => {
      const match = test.title.match(/Chapter (\d+)/);
      if (match) {
        const chapter = match[1];
        chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;
      }
    });
    
    console.log('📋 Tests by Chapter:');
    Object.keys(chapterCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chapter => {
      console.log(`   Chapter ${chapter}: ${chapterCounts[chapter]} tests`);
    });
    
    console.log('');
    console.log('📝 Sample concept-based tests:');
    tests.slice(0, 10).forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title}`);
    });
    
    if (tests.length > 10) {
      console.log(`   ... and ${tests.length - 10} more tests`);
    }
    
  } catch (err) {
    console.log('❌ Error during verification:', err.message);
  }
}

async function main() {
  console.log('🔄 Concept-Based Test Replacement');
  console.log('=================================');
  
  await deleteOldTests();
  await importConceptBasedTests();
  await verifyImport();
}

main().catch(console.error);

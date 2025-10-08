#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function importClass3Tests() {
  console.log('📚 Importing Class 3 Math Tests (3 per chapter)...');
  console.log('================================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read the combined tests file
    const testsData = JSON.parse(fs.readFileSync('all_class3_math_tests_3_per_chapter.json', 'utf8'));
    
    console.log(`📊 Found ${testsData.length} tests to import`);
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
      
      console.log('');
    }
    
    console.log('🎉 Import Summary:');
    console.log('==================');
    console.log(`✅ Successfully imported: ${successCount} tests`);
    console.log(`❌ Failed to import: ${errorCount} tests`);
    console.log(`📊 Total processed: ${successCount + errorCount} tests`);
    
    if (successCount === testsData.length) {
      console.log('\n🚀 All Class 3 Math tests are now available in your application!');
      console.log('📋 You can now:');
      console.log('   - View tests in the admin panel');
      console.log('   - Students can take the tests');
      console.log('   - Filter by CBSE board and Class 3 grade');
    } else {
      console.log('\n⚠️  Some tests failed to import. Check the error messages above.');
    }
    
  } catch (err) {
    console.log('❌ Error reading test file:', err.message);
    console.log('💡 Make sure all_class3_math_tests_3_per_chapter.json exists in the current directory');
  }
}

async function verifyImport() {
  console.log('\n🔍 Verifying imported tests...');
  console.log('==============================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check how many Class 3 CBSE tests we have
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, board, grade, subject')
      .eq('grade', 'Class 3')
      .eq('board', 'CBSE')
      .eq('subject', 'Mathematics')
      .order('createdat', { ascending: false });
    
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
    console.log('📝 Sample tests:');
    tests.slice(0, 5).forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title}`);
    });
    
    if (tests.length > 5) {
      console.log(`   ... and ${tests.length - 5} more tests`);
    }
    
  } catch (err) {
    console.log('❌ Error during verification:', err.message);
  }
}

async function main() {
  console.log('🚀 Class 3 Math Tests Import');
  console.log('============================');
  
  await importClass3Tests();
  await verifyImport();
}

main().catch(console.error);

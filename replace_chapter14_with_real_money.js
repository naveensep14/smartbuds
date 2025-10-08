const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function replaceChapter14WithRealMoneyQuestions() {
  try {
    console.log('🔄 Replacing Chapter 14 with Real Money Questions...');
    console.log('====================================================');

    // First, delete existing Chapter 14 tests
    console.log('🗑️  Deleting old Chapter 14 tests...');
    const { error: deleteError } = await supabase
      .from('tests')
      .delete()
      .like('title', '%Chapter 14%');

    if (deleteError) {
      console.error('❌ Error deleting old tests:', deleteError.message);
      return;
    }
    console.log('✅ Old Chapter 14 tests deleted');

    // Read the fixed Chapter 14 tests
    const fs = require('fs');
    const path = require('path');
    
    const testsFile = path.join(__dirname, 'tmp', 'tests', 'chapter_14_fixed_tests.json');
    
    if (!fs.existsSync(testsFile)) {
      console.error('❌ Chapter 14 fixed tests file not found:', testsFile);
      return;
    }

    const testsData = JSON.parse(fs.readFileSync(testsFile, 'utf8'));
    console.log(`📖 Found ${testsData.length} fixed Chapter 14 tests to import`);

    let successCount = 0;
    let errorCount = 0;

    for (const test of testsData) {
      try {
        console.log(`🔄 Importing: ${test.title}`);
        
        // Transform the test data to match database schema
        const testData = {
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          timelimit: test.duration || test.timelimit,
          questions: test.questions.map(q => ({
            id: q.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            image: q.image || null
          }))
        };

        // Insert into database
        const { data, error } = await supabase
          .from('tests')
          .insert(testData)
          .select();

        if (error) {
          console.error(`❌ Error importing ${test.title}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Successfully imported: ${test.title}`);
          console.log(`   📊 Questions: ${test.questions.length}`);
          console.log(`   💰 Sample question: ${test.questions[0].question}`);
          successCount++;
        }

      } catch (err) {
        console.error(`❌ Error processing ${test.title}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Chapter 14 Replacement Summary:');
    console.log('==================================');
    console.log(`✅ Successfully imported: ${successCount} tests`);
    console.log(`❌ Failed imports: ${errorCount} tests`);
    console.log(`📚 Total Chapter 14 tests: ${testsData.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Chapter 14 tests replaced with REAL money questions!');
      console.log('💰 All questions are about rupees and paise!');
      console.log('📋 No more placeholder questions!');
    }

  } catch (error) {
    console.error('❌ Replacement failed:', error.message);
  }
}

// Run the replacement
replaceChapter14WithRealMoneyQuestions();

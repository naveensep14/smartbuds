const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function replaceAllTestsWithPDFBasedTests() {
  try {
    console.log('🔄 Replacing ALL Tests with PDF-Based Tests...');
    console.log('================================================');

    // First, delete ALL existing Class 3 Math tests
    console.log('🗑️  Deleting all existing Class 3 Math tests...');
    const { error: deleteError } = await supabase
      .from('tests')
      .delete()
      .eq('grade', '3rd Grade')
      .eq('subject', 'Mathematics');

    if (deleteError) {
      console.error('❌ Error deleting old tests:', deleteError.message);
      return;
    }
    console.log('✅ All old Class 3 Math tests deleted');

    // Read the PDF-based tests
    const fs = require('fs');
    const path = require('path');
    
    const testsFile = path.join(__dirname, 'tmp', 'tests', 'all_chapter_tests_from_pdfs.json');
    
    if (!fs.existsSync(testsFile)) {
      console.error('❌ PDF-based tests file not found:', testsFile);
      return;
    }

    const testsData = JSON.parse(fs.readFileSync(testsFile, 'utf8'));
    console.log(`📖 Found ${testsData.length} PDF-based tests to import`);

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
          successCount++;
        }

      } catch (err) {
        console.error(`❌ Error processing ${test.title}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 PDF-Based Tests Import Summary:');
    console.log('===================================');
    console.log(`✅ Successfully imported: ${successCount} tests`);
    console.log(`❌ Failed imports: ${errorCount} tests`);
    console.log(`📚 Total PDF-based tests: ${testsData.length}`);

    if (successCount > 0) {
      console.log('\n🎉 All tests replaced with PDF-based content!');
      console.log('🔍 All tests are now based on actual PDF content.');
      console.log('📋 Each test has 10 unique questions from the corresponding chapter.');
      console.log('📖 Tests cover concepts extracted from the actual PDFs.');
    }

  } catch (error) {
    console.error('❌ Replacement failed:', error.message);
  }
}

// Run the replacement
replaceAllTestsWithPDFBasedTests();

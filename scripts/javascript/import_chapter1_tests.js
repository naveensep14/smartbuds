const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importChapter1Tests() {
  try {
    console.log('📚 Importing Chapter 1 Tests...');
    console.log('=====================================');

    // Read the Chapter 1 tests JSON file
    const fs = require('fs');
    const path = require('path');
    
    const testsFile = path.join(__dirname, 'tmp', 'tests', 'chapter_1_tests.json');
    
    if (!fs.existsSync(testsFile)) {
      console.error('❌ Chapter 1 tests file not found:', testsFile);
      return;
    }

    const testsData = JSON.parse(fs.readFileSync(testsFile, 'utf8'));
    console.log(`📖 Found ${testsData.length} Chapter 1 tests to import`);

    let successCount = 0;
    let errorCount = 0;

    for (const test of testsData) {
      try {
        console.log(`\n🔄 Importing: ${test.title}`);
        
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

    console.log('\n📊 Import Summary:');
    console.log('==================');
    console.log(`✅ Successfully imported: ${successCount} tests`);
    console.log(`❌ Failed imports: ${errorCount} tests`);
    console.log(`📚 Total Chapter 1 tests: ${testsData.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Chapter 1 tests imported successfully!');
      console.log('🔍 You can now view them in the admin panel or tests page.');
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importChapter1Tests();

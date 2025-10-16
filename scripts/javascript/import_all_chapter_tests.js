const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importAllChapterTests() {
  try {
    console.log('📚 Importing All Chapter Tests (2-14)...');
    console.log('==========================================');

    const fs = require('fs');
    const path = require('path');
    
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalTests = 0;

    // Import chapters 2-14
    for (let chapterNum = 2; chapterNum <= 14; chapterNum++) {
      const chapterFile = path.join(__dirname, 'tmp', 'tests', `chapter_${chapterNum}_tests.json`);
      
      if (!fs.existsSync(chapterFile)) {
        console.log(`⚠️  Chapter ${chapterNum} tests file not found: ${chapterFile}`);
        continue;
      }

      console.log(`\n📖 Processing Chapter ${chapterNum}...`);
      console.log('='.repeat(30));

      try {
        const testsData = JSON.parse(fs.readFileSync(chapterFile, 'utf8'));
        console.log(`📚 Found ${testsData.length} tests for Chapter ${chapterNum}`);

        let chapterSuccessCount = 0;
        let chapterErrorCount = 0;

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
              chapterErrorCount++;
            } else {
              console.log(`✅ Successfully imported: ${test.title}`);
              console.log(`   📊 Questions: ${test.questions.length}`);
              chapterSuccessCount++;
            }

          } catch (err) {
            console.error(`❌ Error processing ${test.title}:`, err.message);
            chapterErrorCount++;
          }
        }

        console.log(`\n📊 Chapter ${chapterNum} Summary:`);
        console.log(`✅ Successfully imported: ${chapterSuccessCount} tests`);
        console.log(`❌ Failed imports: ${chapterErrorCount} tests`);

        totalSuccessCount += chapterSuccessCount;
        totalErrorCount += chapterErrorCount;
        totalTests += testsData.length;

      } catch (error) {
        console.error(`❌ Error reading Chapter ${chapterNum} file:`, error.message);
      }
    }

    console.log('\n🎯 Overall Import Summary:');
    console.log('==========================');
    console.log(`✅ Successfully imported: ${totalSuccessCount} tests`);
    console.log(`❌ Failed imports: ${totalErrorCount} tests`);
    console.log(`📚 Total tests processed: ${totalTests}`);
    console.log(`📖 Chapters processed: 2-14`);

    if (totalSuccessCount > 0) {
      console.log('\n🎉 All chapter tests imported successfully!');
      console.log('🔍 You can now view them in the admin panel or tests page.');
      console.log('📋 Use the chapter filter to view tests by specific chapters.');
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importAllChapterTests();

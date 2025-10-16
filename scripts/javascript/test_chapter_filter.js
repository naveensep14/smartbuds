#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testChapterFilter() {
  console.log('🧪 Testing Chapter Filter Functionality...');
  console.log('===========================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Function to extract chapter from test title (same as in the component)
    const extractChapter = (title) => {
      const chapterMatch = title.match(/Chapter (\d+)/);
      return chapterMatch ? `Chapter ${chapterMatch[1]}` : null;
    };
    
    // Get all tests
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, subject, grade, board')
      .order('title');
    
    if (error) {
      console.log('❌ Error fetching tests:', error.message);
      return;
    }
    
    console.log(`📊 Found ${tests.length} tests`);
    console.log('');
    
    // Extract chapters
    const chapters = Array.from(new Set(tests.map(test => extractChapter(test.title)).filter(Boolean))).sort((a, b) => {
      const aNum = parseInt(a?.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b?.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    });
    
    console.log('📚 Available Chapters:');
    chapters.forEach(chapter => {
      const chapterTests = tests.filter(test => extractChapter(test.title) === chapter);
      console.log(`   ${chapter}: ${chapterTests.length} tests`);
      
      // Show sample tests for each chapter
      chapterTests.slice(0, 2).forEach(test => {
        console.log(`      - ${test.title}`);
      });
      if (chapterTests.length > 2) {
        console.log(`      ... and ${chapterTests.length - 2} more tests`);
      }
    });
    
    console.log('');
    
    // Test filtering by chapter
    console.log('🔍 Testing Chapter Filtering:');
    const testChapter = chapters[0]; // Test with first chapter
    if (testChapter) {
      console.log(`📝 Filtering by ${testChapter}:`);
      const filteredTests = tests.filter(test => extractChapter(test.title) === testChapter);
      console.log(`   Found ${filteredTests.length} tests:`);
      filteredTests.forEach(test => {
        console.log(`   - ${test.title} (${test.grade}, ${test.board})`);
      });
    }
    
    console.log('');
    
    // Show tests without chapters
    const testsWithoutChapters = tests.filter(test => !extractChapter(test.title));
    if (testsWithoutChapters.length > 0) {
      console.log('📋 Tests without chapters:');
      testsWithoutChapters.forEach(test => {
        console.log(`   - ${test.title} (${test.grade}, ${test.board})`);
      });
    } else {
      console.log('✅ All tests have chapter information!');
    }
    
  } catch (err) {
    console.log('❌ Error during testing:', err.message);
  }
}

async function main() {
  console.log('🎯 Chapter Filter Test');
  console.log('======================');
  
  await testChapterFilter();
  
  console.log('\n🎉 Chapter filter testing complete!');
  console.log('📋 Features added:');
  console.log('   ✅ Chapter extraction from test titles');
  console.log('   ✅ Chapter filter dropdown');
  console.log('   ✅ Chapter badges on test cards');
  console.log('   ✅ Sorted chapter list (numerical order)');
}

main().catch(console.error);

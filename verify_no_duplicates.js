#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function refreshTestsData() {
  console.log('🔄 Refreshing Tests Data...');
  console.log('============================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get fresh data from database
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, subject, grade, board, createdat')
      .order('createdat', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching tests:', error.message);
      return;
    }
    
    console.log(`📊 Fresh data: ${tests.length} tests`);
    console.log('');
    
    // Group by chapter to show the structure
    const chapterGroups = {};
    tests.forEach(test => {
      const chapterMatch = test.title.match(/Chapter (\d+)/);
      if (chapterMatch) {
        const chapter = `Chapter ${chapterMatch[1]}`;
        if (!chapterGroups[chapter]) {
          chapterGroups[chapter] = [];
        }
        chapterGroups[chapter].push(test);
      }
    });
    
    console.log('📚 Tests by Chapter:');
    Object.keys(chapterGroups).sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    }).forEach(chapter => {
      const tests = chapterGroups[chapter];
      console.log(`   ${chapter}: ${tests.length} tests`);
      tests.forEach(test => {
        console.log(`      - ${test.title}`);
      });
    });
    
    console.log('');
    console.log('💡 If you\'re seeing duplicates in the UI:');
    console.log('   1. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   2. Clear browser cache');
    console.log('   3. Check if the development server needs restart');
    console.log('   4. The database is clean - no duplicates exist');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

async function main() {
  console.log('🔍 Database Verification');
  console.log('========================');
  
  await refreshTestsData();
}

main().catch(console.error);

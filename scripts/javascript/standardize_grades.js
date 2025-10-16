#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function standardizeGrades() {
  console.log('🔄 Standardizing Grade Names...');
  console.log('================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // First, let's see what we have
    const { data: tests, error: fetchError } = await supabase
      .from('tests')
      .select('id, title, grade')
      .order('grade');
    
    if (fetchError) {
      console.log('❌ Error fetching tests:', fetchError.message);
      return;
    }
    
    console.log('📊 Current grade distribution:');
    const gradeCounts = {};
    tests.forEach(test => {
      gradeCounts[test.grade] = (gradeCounts[test.grade] || 0) + 1;
    });
    
    Object.keys(gradeCounts).forEach(grade => {
      console.log(`   ${grade}: ${gradeCounts[grade]} tests`);
    });
    
    console.log('\n🔄 Standardizing grades...');
    
    // Define the mapping from inconsistent to consistent grades
    const gradeMapping = {
      'Class 3': '3rd Grade',
      'Grade 4': '4th Grade',
      '3rd Grade': '3rd Grade', // Already correct
      '4th Grade': '4th Grade', // Already correct
    };
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const test of tests) {
      const newGrade = gradeMapping[test.grade];
      
      if (newGrade && newGrade !== test.grade) {
        console.log(`📝 Updating: "${test.grade}" → "${newGrade}" (${test.title})`);
        
        try {
          const { error: updateError } = await supabase
            .from('tests')
            .update({ grade: newGrade })
            .eq('id', test.id);
          
          if (updateError) {
            console.log(`❌ Error updating: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Successfully updated`);
            updatedCount++;
          }
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (err) {
          console.log(`❌ Error updating test: ${err.message}`);
          errorCount++;
        }
      } else if (newGrade === test.grade) {
        console.log(`✅ Already correct: "${test.grade}" (${test.title})`);
      } else {
        console.log(`⚠️  Unknown grade format: "${test.grade}" (${test.title})`);
      }
    }
    
    console.log('\n🎉 Standardization Summary:');
    console.log('============================');
    console.log(`✅ Successfully updated: ${updatedCount} tests`);
    console.log(`❌ Failed to update: ${errorCount} tests`);
    console.log(`📊 Total processed: ${updatedCount + errorCount} tests`);
    
  } catch (err) {
    console.log('❌ Error during standardization:', err.message);
  }
}

async function verifyStandardization() {
  console.log('\n🔍 Verifying standardized grades...');
  console.log('=====================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, grade')
      .order('grade');
    
    if (error) {
      console.log('❌ Error verifying:', error.message);
      return;
    }
    
    console.log('📊 Final grade distribution:');
    const gradeCounts = {};
    tests.forEach(test => {
      gradeCounts[test.grade] = (gradeCounts[test.grade] || 0) + 1;
    });
    
    Object.keys(gradeCounts).sort().forEach(grade => {
      console.log(`   ${grade}: ${gradeCounts[grade]} tests`);
    });
    
    // Check for any remaining inconsistencies
    const inconsistentGrades = Object.keys(gradeCounts).filter(grade => 
      !grade.match(/^\d+(st|nd|rd|th) Grade$/)
    );
    
    if (inconsistentGrades.length > 0) {
      console.log('\n⚠️  Remaining inconsistent grades:');
      inconsistentGrades.forEach(grade => {
        console.log(`   ${grade}: ${gradeCounts[grade]} tests`);
      });
    } else {
      console.log('\n✅ All grades are now standardized!');
    }
    
    console.log('\n📝 Sample tests by grade:');
    Object.keys(gradeCounts).sort().forEach(grade => {
      const sampleTest = tests.find(t => t.grade === grade);
      if (sampleTest) {
        console.log(`   ${grade}: ${sampleTest.title}`);
      }
    });
    
  } catch (err) {
    console.log('❌ Error during verification:', err.message);
  }
}

async function main() {
  console.log('🎯 Grade Standardization Tool');
  console.log('============================');
  
  await standardizeGrades();
  await verifyStandardization();
}

main().catch(console.error);

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Grade normalization mapping
const gradeMap = {
  'Class 1': '1st Grade',
  'Class 2': '2nd Grade',
  'Class 3': '3rd Grade',
  'Class 4': '4th Grade',
  'Class 5': '5th Grade',
  'Grade 1': '1st Grade',
  'Grade 2': '2nd Grade',
  'Grade 3': '3rd Grade',
  'Grade 4': '4th Grade',
  'Grade 5': '5th Grade',
  '1st': '1st Grade',
  '2nd': '2nd Grade',
  '3rd': '3rd Grade',
  '4th': '4th Grade',
  '5th': '5th Grade',
};

async function standardizeGrades() {
  try {
    console.log('🔄 Standardizing grade values in database...');
    
    // Step 1: Standardize tests table
    console.log('📝 Step 1: Standardizing tests table...');
    
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('id, grade')
      .not('grade', 'is', null);
    
    if (testsError) {
      console.error('❌ Error fetching tests:', testsError);
      return;
    }
    
    console.log(`📊 Found ${tests.length} tests with grades`);
    
    let testsUpdated = 0;
    for (const test of tests) {
      const normalizedGrade = gradeMap[test.grade];
      if (normalizedGrade && normalizedGrade !== test.grade) {
        console.log(`🔄 Updating test ${test.id}: "${test.grade}" → "${normalizedGrade}"`);
        
        const { error: updateError } = await supabase
          .from('tests')
          .update({ grade: normalizedGrade })
          .eq('id', test.id);
        
        if (updateError) {
          console.error(`❌ Error updating test ${test.id}:`, updateError);
        } else {
          testsUpdated++;
        }
      }
    }
    
    console.log(`✅ Updated ${testsUpdated} tests`);
    
    // Step 2: Standardize profiles table
    console.log('📝 Step 2: Standardizing profiles table...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, grade')
      .not('grade', 'is', null);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`📊 Found ${profiles.length} profiles with grades`);
    
    let profilesUpdated = 0;
    for (const profile of profiles) {
      const normalizedGrade = gradeMap[profile.grade];
      if (normalizedGrade && normalizedGrade !== profile.grade) {
        console.log(`🔄 Updating profile ${profile.id}: "${profile.grade}" → "${normalizedGrade}"`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ grade: normalizedGrade })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`❌ Error updating profile ${profile.id}:`, updateError);
        } else {
          profilesUpdated++;
        }
      }
    }
    
    console.log(`✅ Updated ${profilesUpdated} profiles`);
    
    // Step 3: Verify standardization
    console.log('📝 Step 3: Verifying standardization...');
    
    const { data: finalTests, error: finalTestsError } = await supabase
      .from('tests')
      .select('grade')
      .not('grade', 'is', null);
    
    if (finalTestsError) {
      console.error('❌ Error fetching final tests:', finalTestsError);
      return;
    }
    
    const uniqueTestGrades = [...new Set(finalTests.map(t => t.grade))];
    console.log('📊 Final unique grades in tests:', uniqueTestGrades);
    
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('profiles')
      .select('grade')
      .not('grade', 'is', null);
    
    if (finalProfilesError) {
      console.error('❌ Error fetching final profiles:', finalProfilesError);
      return;
    }
    
    const uniqueProfileGrades = [...new Set(finalProfiles.map(p => p.grade))];
    console.log('📊 Final unique grades in profiles:', uniqueProfileGrades);
    
    // Check for any non-standard grades
    const standardGrades = ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'];
    const nonStandardTestGrades = uniqueTestGrades.filter(grade => !standardGrades.includes(grade));
    const nonStandardProfileGrades = uniqueProfileGrades.filter(grade => !standardGrades.includes(grade));
    
    if (nonStandardTestGrades.length > 0) {
      console.log('⚠️ Non-standard grades still in tests:', nonStandardTestGrades);
    }
    
    if (nonStandardProfileGrades.length > 0) {
      console.log('⚠️ Non-standard grades still in profiles:', nonStandardProfileGrades);
    }
    
    if (nonStandardTestGrades.length === 0 && nonStandardProfileGrades.length === 0) {
      console.log('🎉 All grades have been successfully standardized!');
    }
    
  } catch (error) {
    console.error('🚨 Standardization failed:', error);
    process.exit(1);
  }
}

standardizeGrades();

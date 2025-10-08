const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllClass3Tests() {
  try {
    console.log('🗑️  Deleting all Class 3 tests...');
    console.log('=====================================');

    // First, let's see what Class 3 tests exist
    const { data: existingTests, error: fetchError } = await supabase
      .from('tests')
      .select('id, title, grade, subject')
      .eq('grade', '3rd Grade');

    if (fetchError) {
      console.error('❌ Error fetching Class 3 tests:', fetchError.message);
      return;
    }

    if (!existingTests || existingTests.length === 0) {
      console.log('✅ No Class 3 tests found in the database.');
      return;
    }

    console.log(`📊 Found ${existingTests.length} Class 3 tests:`);
    existingTests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.title}`);
    });

    // Delete all Class 3 tests
    const { error: deleteError } = await supabase
      .from('tests')
      .delete()
      .eq('grade', '3rd Grade');

    if (deleteError) {
      console.error('❌ Error deleting Class 3 tests:', deleteError.message);
      return;
    }

    console.log(`\n✅ Successfully deleted ${existingTests.length} Class 3 tests!`);
    console.log('🎯 Database is now clean for testing the PDF upload feature.');

  } catch (error) {
    console.error('❌ Delete operation failed:', error.message);
  }
}

// Run the deletion
deleteAllClass3Tests();
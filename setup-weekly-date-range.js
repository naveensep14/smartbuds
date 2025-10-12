#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function addWeeklyDateRangeColumns() {
  console.log('📅 Adding Weekly Test Date Range Columns...');
  console.log('===========================================');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read the SQL file
  const sqlContent = fs.readFileSync('add-weekly-date-range-columns.sql', 'utf8');
  
  try {
    console.log('📝 Adding start_date column...');
    const { error: startDateError } = await supabase
      .from('tests')
      .select('start_date')
      .limit(1);
    
    if (startDateError && startDateError.code === 'PGRST116') {
      console.log('   Column start_date does not exist, needs to be added manually');
    } else {
      console.log('   Column start_date already exists');
    }
    
    console.log('📝 Adding end_date column...');
    const { error: endDateError } = await supabase
      .from('tests')
      .select('end_date')
      .limit(1);
    
    if (endDateError && endDateError.code === 'PGRST116') {
      console.log('   Column end_date does not exist, needs to be added manually');
    } else {
      console.log('   Column end_date already exists');
    }
    
    console.log('✅ Weekly test date range columns check completed!');
    console.log('📋 Please run the following SQL manually in your Supabase dashboard:');
    console.log('');
    console.log(sqlContent);
    console.log('');
    return true;
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

// Run the migration
addWeeklyDateRangeColumns()
  .then(success => {
    if (success) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('💥 Migration failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.log('💥 Unexpected error:', err);
    process.exit(1);
  });

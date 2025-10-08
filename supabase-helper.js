#!/usr/bin/env node

console.log('🔍 Supabase Setup Helper');
console.log('=======================');
console.log('');
console.log('To get your correct Supabase credentials:');
console.log('');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → API');
console.log('4. Copy these values:');
console.log('');
console.log('   Project URL: https://[your-project-id].supabase.co');
console.log('   anon/public key: eyJ... (starts with eyJ)');
console.log('');
console.log('5. Update your .env.local file with:');
console.log('');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
console.log('');
console.log('Current .env.local contents:');
console.log('============================');

const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log(envContent);
} catch (e) {
  console.log('Could not read .env.local file');
}

console.log('');
console.log('💡 The current URL "mewkusspabjwrzkbbyxrw.supabase.co" seems to be invalid.');
console.log('   Please check your Supabase dashboard for the correct project URL.');

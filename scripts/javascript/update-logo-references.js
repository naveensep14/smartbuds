const fs = require('fs');
const path = require('path');

console.log('🎨 Updating logo references to use local file...\n');

// Define the files to update and their replacements
const updates = [
  {
    file: 'components/NavigationHeader.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  },
  {
    file: 'app/login/page.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  },
  {
    file: 'app/signup/page.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  },
  {
    file: 'app/results/page.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  },
  {
    file: 'app/my-results/page.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  },
  {
    file: 'app/admin/page.tsx',
    old: 'https://i.ibb.co/6RcwZjJr/logo-square.jpg',
    new: '/images/logo-square.jpg'
  }
];

let updatedCount = 0;
let errorCount = 0;

updates.forEach(({ file, old, new: newPath }) => {
  try {
    const filePath = path.join(__dirname, '../..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} - File not found`);
      errorCount++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all occurrences
    content = content.split(old).join(newPath);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const replacements = (originalContent.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      console.log(`✅ ${file} - Updated ${replacements} reference(s)`);
      updatedCount++;
    } else {
      console.log(`ℹ️  ${file} - No changes needed`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Files updated: ${updatedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);

if (updatedCount > 0) {
  console.log('\n🎉 Logo references updated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure logo-square.jpg is in public/images/');
  console.log('   2. Test the app: npm run dev');
  console.log('   3. Commit changes: git add . && git commit -m "Update logo"');
} else {
  console.log('\n⚠️  No files were updated. References may already be using local paths.');
}

// Check if logo file exists
const logoPath = path.join(__dirname, '../..', 'public/images/logo-square.jpg');
if (fs.existsSync(logoPath)) {
  const stats = fs.statSync(logoPath);
  console.log(`\n✅ Logo file found: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.log('\n⚠️  Logo file NOT found at public/images/logo-square.jpg');
  console.log('   Please save your graduation cap image there.');
}


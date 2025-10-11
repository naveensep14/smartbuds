const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const PDFProcessor = require('./lib/pdf-processor');

async function generateChapter4Test() {
  try {
    console.log('🚀 Starting Chapter 4 test generation...');
    
    // Read the Chapter 4 PDF
    const pdfPath = path.join(__dirname, 'tmp', 'cemm104.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('📄 PDF loaded:', pdfPath);
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    
    // Initialize PDF processor
    const processor = new PDFProcessor();
    
    // Process the PDF
    console.log('🔍 Processing PDF with AI...');
    const result = await processor.processPDF(
      pdfBuffer,
      'Mathematics',
      'Class 3',
      'CBSE',
      'Focus on practical applications and word problems. Make questions challenging and analytical.'
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log('✅ Test generation completed successfully!');
    console.log('📚 Generated tests:', result.tests.length);
    console.log('🔍 Concepts identified:', result.concepts.join(', '));
    
    // Save the generated tests
    const outputPath = path.join(__dirname, 'tmp', 'tests', 'chapter_4_cursor_generated.json');
    fs.writeFileSync(outputPath, JSON.stringify(result.tests, null, 2));
    
    console.log('💾 Tests saved to:', outputPath);
    
    // Display summary
    result.tests.forEach((test, index) => {
      console.log(`\n📝 Test ${index + 1}: ${test.title}`);
      console.log(`   Questions: ${test.questions.length}`);
      console.log(`   Duration: ${test.duration} minutes`);
    });
    
    return result.tests;
    
  } catch (error) {
    console.error('❌ Error generating Chapter 4 test:', error);
    throw error;
  }
}

// Run the generation
if (require.main === module) {
  generateChapter4Test()
    .then((tests) => {
      console.log('\n🎉 Chapter 4 test generation completed!');
      console.log(`📊 Total tests generated: ${tests.length}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = generateChapter4Test;

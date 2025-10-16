const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function uploadChapter4Test() {
  try {
    console.log('🚀 Starting Chapter 4 test upload via web interface...');
    
    // Read the Chapter 4 PDF
    const pdfPath = path.join(__dirname, 'tmp', 'cemm104.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('📄 PDF loaded:', pdfPath);
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', pdfBuffer, {
      filename: 'cemm104.pdf',
      contentType: 'application/pdf'
    });
    formData.append('subject', 'Mathematics');
    formData.append('grade', 'Class 3');
    formData.append('board', 'CBSE');
    formData.append('duration', '30');
    formData.append('customPrompt', 'Focus on practical applications and word problems. Make questions challenging and analytical. Generate questions based on Chapter 4: Long and Short concepts.');
    
    console.log('📤 Uploading PDF to web interface...');
    
    // Upload to the web interface
    const response = await fetch('http://localhost:3000/api/admin/upload-pdf', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }
    
    console.log('✅ Test generation completed successfully!');
    console.log('📚 Generated tests:', result.tests.length);
    console.log('🔍 Concepts identified:', result.concepts.join(', '));
    
    // Save the generated tests
    const outputPath = path.join(__dirname, 'tmp', 'tests', 'chapter_4_web_generated.json');
    fs.writeFileSync(outputPath, JSON.stringify(result.tests, null, 2));
    
    console.log('💾 Tests saved to:', outputPath);
    
    // Display summary
    result.tests.forEach((test, index) => {
      console.log(`\n📝 Test ${index + 1}: ${test.title}`);
      console.log(`   Questions: ${test.questions.length}`);
      console.log(`   Duration: ${test.duration} minutes`);
      
      // Show first question as preview
      if (test.questions.length > 0) {
        console.log(`   Preview Q1: ${test.questions[0].question.substring(0, 80)}...`);
      }
    });
    
    return result.tests;
    
  } catch (error) {
    console.error('❌ Error uploading Chapter 4 test:', error);
    throw error;
  }
}

// Run the upload
if (require.main === module) {
  uploadChapter4Test()
    .then((tests) => {
      console.log('\n🎉 Chapter 4 test upload completed!');
      console.log(`📊 Total tests generated: ${tests.length}`);
      console.log('\n📋 Next steps:');
      console.log('1. Go to http://localhost:3000/admin/pdf-upload');
      console.log('2. Review the generated tests');
      console.log('3. Select and save the tests you want');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Upload failed:', error.message);
      process.exit(1);
    });
}

module.exports = uploadChapter4Test;

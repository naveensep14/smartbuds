const { GoogleGenerativeAI } = require('@google/generative-ai');

class PDFProcessor {
  constructor() {
    // Validate API key before initializing
    if (!process.env.GEMINI_API_KEY) {
      console.error('🚨 GEMINI_API_KEY environment variable is not set');
      console.error('🔧 Please add GEMINI_API_KEY to your Vercel environment variables');
      console.error('📖 See VERCEL_DEPLOYMENT_FIX.md for instructions');
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to Vercel environment variables.');
    }
    
    if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
      console.error('🚨 Invalid Gemini API key format');
      console.error('🔧 API key must start with "AIza"');
      throw new Error('Invalid Gemini API key format. Must start with "AIza"');
    }
    
    console.log('🔑 API Key validation passed');
    console.log('🔑 API Key prefix:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async validateAPIKey() {
    try {
      console.log('🔍 Testing API key validity...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Make a simple test request
      const result = await model.generateContent('Test');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ API key is valid');
      return true;
    } catch (error) {
      console.error('❌ API key validation failed:', error.message);
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your API key.');
      }
      throw error;
    }
  }

  async uploadFileToGemini(pdfBuffer) {
    try {
      console.log('📤 Uploading PDF to Gemini File API...');
      
      // Convert PDF buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');
      
      // Upload file to Gemini File API using JSON format
      const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        })
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ File upload failed:', errorText);
        console.error('❌ Response status:', uploadResponse.status);
        console.error('❌ Response headers:', Object.fromEntries(uploadResponse.headers.entries()));
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ File uploaded successfully:', uploadResult.name);
      
      return uploadResult.name; // Return the file URI
      
    } catch (error) {
      console.error('❌ Error uploading file:', error.message);
      throw error;
    }
  }

  async extractTextFromPDF(pdfBuffer) {
    try {
      // Since we're having issues with PDF parsing libraries in Vercel,
      // we'll use a simple approach that works with Gemini's file upload
      return "PDF content will be processed directly by Gemini AI for analysis.";
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  async generateQuestionsForConcept(concept, subject, grade, pdfBuffer, customPrompt = '', numQuestions = 10) {
    const maxRetries = 2;
    let lastError = null;

    console.log('🚀 Starting question generation...');
    console.log('Concept:', concept);
    console.log('Subject:', subject);
    console.log('Grade:', grade);
    console.log('PDF Size:', `${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log('Custom Prompt:', customPrompt ? customPrompt.substring(0, 100) : 'None');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for concept: ${concept}`);
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const basePrompt = `
You are an expert educational content creator specializing in ${subject} for ${grade} students.

Create ${numQuestions} multiple choice questions for the concept: ${concept}

Requirements:
- Questions based on concepts in PDF but need not be directly from PDF.
- Appropriate for ${grade} level
- 4 answer options (A, B, C, D)
- Include explanations
- Educational and accurate
- Do NOT reference page numbers in questions
- Do NOT include "According to page X" or "On page Y" in questions
- Do NOT rely on pictures, images, or visual elements from the PDF
- Do NOT ask questions about what is shown in images or diagrams
- Make questions self-contained and clear using only text content
- Focus on concepts and ideas, not visual elements

QUESTION DISTRIBUTION:
- 70% DIRECT QUESTIONS: Straightforward questions that test basic understanding and recall
  * Simple calculations, definitions, basic facts
  * Direct application of formulas or concepts
  * Clear, unambiguous answers based on PDF content
  * Examples: "What is 25 + 17?", "How many sides does a triangle have?"

- 30% ANALYTICAL QUESTIONS: Complex, tricky questions requiring critical thinking
  * Multi-step problem solving
  * Logical reasoning and analysis
  * Comparison and evaluation of options
  * Real-world application scenarios
  * Questions that test deeper understanding
  * Examples: "If A happens, what would be the most logical next step?", "Which approach would be most efficient?"`;

      const customInstructions = customPrompt ? `

Additional Instructions:
${customPrompt}` : '';

      const prompt = basePrompt + customInstructions + `

IMPORTANT: You must respond with ONLY a valid JSON array. Do not include any other text, explanations, or formatting.

Return ONLY this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Explanation here"
  }
]

Do not include any text before or after the JSON array.`;

      // Convert PDF buffer to base64 for Gemini
      const pdfBase64 = pdfBuffer.toString('base64');
      
      console.log('🔍 GEMINI API CALL DEBUG:');
      console.log('PDF buffer size:', pdfBuffer.length);
      console.log('Base64 length:', pdfBase64.length);
      console.log('Prompt length:', prompt.length);
      console.log('Model:', 'gemini-2.5-flash');
      
      let result;
      let fileUri = null;
      
      try {
        // For larger files (>5MB), use File API
        const pdfSizeMB = pdfBuffer.length / (1024 * 1024);
        if (pdfSizeMB > 5) {
          console.log('📤 Using File API for large PDF...');
          fileUri = await this.uploadFileToGemini(pdfBuffer);
          
          // Use file URI instead of inline data
          result = await model.generateContent([
            prompt,
            {
              fileData: {
                fileUri: fileUri
              }
            }
          ]);
        } else {
          console.log('📤 Using inline data for small PDF...');
          // Use inline data for smaller files
          result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: pdfBase64,
                mimeType: 'application/pdf'
              }
            }
          ]);
        }
        console.log('✅ GEMINI API CALL SUCCESSFUL');
      } catch (apiError) {
        console.error('🚨 GEMINI API CALL FAILED:');
        console.error('API Error:', apiError.message);
        console.error('API Error Type:', apiError.name);
        console.error('Full API Error:', apiError);
        
        // Check for specific error types
        if (apiError.message.includes('Request Entity Too Large') || 
            apiError.message.includes('413') ||
            apiError.message.includes('Request too large')) {
          throw new Error('PDF file is too large for processing. Please use a smaller PDF file.');
        }
        
        if (apiError.message.includes('quota') || apiError.message.includes('limit')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        
        if (apiError.message.includes('API key') || apiError.message.includes('invalid')) {
          throw new Error('Invalid Gemini API key. Please check your configuration.');
        }
        
        if (apiError.message.includes('timeout') || apiError.message.includes('deadline')) {
          throw new Error('Request timeout. Please try again with a smaller file.');
        }
        
        throw apiError;
      }
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('🔍 RAW AI RESPONSE DEBUG:');
      console.log('Response length:', aiResponse.length);
      console.log('Response starts with:', aiResponse.substring(0, 50));
      console.log('Response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
      console.log('Full raw response:', aiResponse);
      console.log('Response type:', typeof aiResponse);
      console.log('Is response empty?', aiResponse.length === 0);
      console.log('Response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));

      // Check if response contains actual error messages (not valid JSON responses)
      if (aiResponse.includes('Request Entity Too Large') || aiResponse.includes('413') || aiResponse.includes('too large') ||
          aiResponse.includes('quota') || aiResponse.includes('limit') || aiResponse.includes('API key') || 
          aiResponse.includes('invalid') || aiResponse.includes('unauthorized') || aiResponse.includes('timeout') ||
          aiResponse.includes('deadline') || aiResponse.includes('Exception') || 
          (aiResponse.includes('Error') && !aiResponse.includes('```json'))) {
        console.error('🚨 AI ERROR DETECTED:');
        console.error('Raw AI Response:', aiResponse);
        console.error('Concept:', concept);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        console.error('Attempt:', attempt);
        
        // Provide more specific error messages
        if (aiResponse.includes('quota') || aiResponse.includes('limit')) {
          throw new Error('Gemini API quota exceeded. Please try again later or check your API usage.');
        } else if (aiResponse.includes('API') || aiResponse.includes('key') || aiResponse.includes('invalid')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (aiResponse.includes('timeout')) {
          throw new Error('Request timeout. Please try again with a smaller PDF file.');
        } else if (aiResponse.includes('Entity Too Large') || aiResponse.includes('413') || aiResponse.includes('too large')) {
          throw new Error('PDF file is too large for processing. Please use a smaller PDF file or try again.');
        } else {
          throw new Error(`Gemini API error: ${aiResponse.substring(0, 200)}`);
        }
      }

      // Clean up the response
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }

      console.log('Cleaned AI response:', aiResponse);

      // Validate that we have a JSON array
      if (!aiResponse.startsWith('[') || !aiResponse.endsWith(']')) {
        console.error('Response is not a JSON array:', aiResponse);
        throw new Error('AI response is not a valid JSON array');
      }

      try {
        console.log('🔍 ATTEMPTING JSON PARSE:');
        console.log('String to parse:', aiResponse);
        console.log('String length:', aiResponse.length);
        
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        const questions = JSON.parse(aiResponse);
        console.log('✅ JSON PARSE SUCCESSFUL');
        console.log('Parsed questions:', questions);
        
        if (!Array.isArray(questions)) {
          throw new Error('Response is not an array');
        }
        
        // Validate question structure
        const validQuestions = questions.filter(q => 
          q && 
          typeof q.question === 'string' && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          typeof q.correctAnswer === 'number' &&
          typeof q.explanation === 'string'
        );

        if (validQuestions.length === 0) {
          throw new Error('No valid questions found in response');
        }

        console.log(`Generated ${validQuestions.length} valid questions`);
        return validQuestions.slice(0, numQuestions);
      } catch (parseError) {
        console.error(`🚨 JSON PARSE ERROR - Attempt ${attempt}:`);
        console.error('Parse Error:', parseError.message);
        console.error('Failed to parse response:', aiResponse);
        console.error('Concept:', concept);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        
        // Check if this is a specific error we should handle
        if (parseError.message.includes('Request Entity Too Large') || 
            parseError.message.includes('413') ||
            parseError.message.includes('too large')) {
          throw new Error('PDF file is too large for processing. Please use a smaller PDF file.');
        }
        
        if (attempt === maxRetries) {
          // Return fallback questions if all attempts fail
          console.log(`All ${maxRetries} attempts failed, using fallback questions`);
          return [
            {
              question: `Sample question for ${concept}: What is the main concept being tested?`,
              options: [
                `Understanding of ${concept}`,
                `Basic knowledge`,
                `Advanced application`,
                `None of the above`
              ],
              correctAnswer: 0,
              explanation: `This is a fallback question generated when AI response parsing failed. The correct answer focuses on understanding of ${concept}.`
            }
          ];
        }
        
        lastError = parseError;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      } catch (error) {
        console.error(`🚨 AI REQUEST ERROR - Attempt ${attempt}:`);
        console.error('Error Message:', error.message);
        console.error('Error Type:', error.name);
        console.error('Concept:', concept);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        console.error('Full Error:', error);
        lastError = error;
        
        if (attempt === maxRetries) {
          throw new Error(`Gemini generation failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError?.message}`);
  }

  async identifyConcepts(pdfBuffer, subject, grade) {
    try {
      console.log('🔍 Starting concept identification...');
      console.log('PDF Size:', `${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      console.log('Subject:', subject);
      console.log('Grade:', grade);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
Analyze the following ${subject} content for ${grade} students and identify 2-3 key concepts that can be tested.

Return ONLY a JSON array of concept names:
["Concept 1", "Concept 2", "Concept 3"]
`;

      // Convert PDF buffer to base64 for Gemini
      const pdfBase64 = pdfBuffer.toString('base64');
      
      let result;
      let fileUri = null;
      
      // For larger files (>5MB), use File API
      const pdfSizeMB = pdfBuffer.length / (1024 * 1024);
      if (pdfSizeMB > 5) {
        console.log('📤 Using File API for large PDF in concept identification...');
        fileUri = await this.uploadFileToGemini(pdfBuffer);
        
        // Use file URI instead of inline data
        result = await model.generateContent([
          prompt,
          {
            fileData: {
              fileUri: fileUri
            }
          }
        ]);
      } else {
        console.log('📤 Using inline data for small PDF in concept identification...');
        // Use inline data for smaller files
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: pdfBase64,
              mimeType: 'application/pdf'
            }
          }
        ]);
      }
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('Raw concepts response:', aiResponse);
      console.log('Concepts response length:', aiResponse.length);
      console.log('Concepts response starts with:', aiResponse.substring(0, 50));
      console.log('Concepts response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
      console.log('Concepts response type:', typeof aiResponse);
      console.log('Concepts response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));

      // Check if response contains actual error messages (not valid JSON responses)
      if (aiResponse.includes('Request Entity Too Large') || aiResponse.includes('413') || aiResponse.includes('too large') ||
          aiResponse.includes('quota') || aiResponse.includes('limit') || aiResponse.includes('API key') || 
          aiResponse.includes('invalid') || aiResponse.includes('unauthorized') || aiResponse.includes('timeout') ||
          aiResponse.includes('deadline') || aiResponse.includes('Exception') || 
          (aiResponse.includes('Error') && !aiResponse.includes('```json'))) {
        console.error('🚨 CONCEPTS AI ERROR DETECTED:');
        console.error('Raw AI Response:', aiResponse);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        
        // Provide more specific error messages
        if (aiResponse.includes('quota') || aiResponse.includes('limit')) {
          throw new Error('Gemini API quota exceeded. Please try again later or check your API usage.');
        } else if (aiResponse.includes('API') || aiResponse.includes('key') || aiResponse.includes('invalid')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (aiResponse.includes('timeout')) {
          throw new Error('Request timeout. Please try again with a smaller PDF file.');
        } else if (aiResponse.includes('Entity Too Large') || aiResponse.includes('413') || aiResponse.includes('too large')) {
          throw new Error('PDF file is too large for processing. Please use a smaller PDF file or try again.');
        } else {
          throw new Error(`Gemini API error: ${aiResponse.substring(0, 200)}`);
        }
      }

      // Clean up the response
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }

      console.log('Cleaned concepts response:', aiResponse);

      try {
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        const concepts = JSON.parse(aiResponse);
        if (!Array.isArray(concepts)) {
          throw new Error('Response is not an array');
        }
        return concepts;
      } catch (parseError) {
        console.error('🚨 CONCEPTS JSON PARSE ERROR:');
        console.error('Parse Error:', parseError.message);
        console.error('Failed to parse concepts response:', aiResponse);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        
        // Check if this is a specific error we should handle
        if (parseError.message.includes('Request Entity Too Large') || 
            parseError.message.includes('413') ||
            parseError.message.includes('too large')) {
          throw new Error('PDF file is too large for processing. Please use a smaller PDF file.');
        }
        
        throw parseError; // Let the catch block handle fallback
      }

    } catch (error) {
      console.error('🚨 CONCEPTS GENERATION FAILED:');
      console.error('Error Message:', error.message);
      console.error('Subject:', subject);
      console.error('Grade:', grade);
      console.error('Using fallback concepts');
      // Fallback to generic concepts
      return [`${subject} Fundamentals`, `${subject} Applications`, `${subject} Problem Solving`];
    }
  }

  async generateTestTitle(concept, grade, subject, chapter) {
    return `${grade} ${subject} - Chapter ${chapter} - ${concept}`;
  }

  async generateTestDescription(concept, grade) {
    return `Test covering ${concept} concepts for ${grade} level students.`;
  }

  async processPDF(pdfBuffer, subject, grade, board, customPrompt = '', chapter = 1) {
    try {
      console.log('🔍 [VERCEL LOG] Starting PDF processing with Gemini AI...');
      console.log('🔍 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
      console.log('🔍 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
      console.log('🔍 [VERCEL LOG] API Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
      
      // Check PDF size (Gemini File API supports up to 2GB per file)
      const pdfSizeMB = pdfBuffer.length / (1024 * 1024);
      console.log(`📄 [VERCEL LOG] PDF size: ${pdfSizeMB.toFixed(2)} MB`);
      console.log(`📄 [VERCEL LOG] PDF buffer length: ${pdfBuffer.length} bytes`);
      
      if (pdfSizeMB > 2000) { // 2GB limit
        throw new Error(`PDF file is too large (${pdfSizeMB.toFixed(2)} MB). Gemini API supports files up to 2GB.`);
      }
      
      if (pdfSizeMB > 10) {
        console.log('⚠️ [VERCEL LOG] Large PDF detected. Using File API for processing.');
      }
      
      // Validate API key first
      console.log('🔑 [VERCEL LOG] Validating API key...');
      await this.validateAPIKey();
      console.log('✅ [VERCEL LOG] API key validation passed');
      
      if (customPrompt) {
        console.log(`📝 [VERCEL LOG] Using custom prompt: ${customPrompt.substring(0, 50)}...`);
      }

      console.log('🔍 [VERCEL LOG] Analyzing PDF content to identify key concepts...');
      const concepts = await this.identifyConcepts(pdfBuffer, subject, grade);
      console.log(`📚 [VERCEL LOG] Identified concepts: ${concepts.join(', ')}`);

      const tests = [];

      for (const concept of concepts) {
        console.log(`🚀 [VERCEL LOG] Generating questions for concept: ${concept}`);
        
        const questions = await this.generateQuestionsForConcept(concept, subject, grade, pdfBuffer, customPrompt);
        console.log(`✅ [VERCEL LOG] Generated ${questions.length} questions for ${concept}`);

        const test = {
          title: await this.generateTestTitle(concept, grade, subject, chapter),
          description: await this.generateTestDescription(concept, grade),
          subject: subject,
          grade: grade,
          board: board,
          duration: 30,
          timelimit: 30,
          questions: questions
        };

        tests.push(test);
      }

      console.log('🎉 [VERCEL LOG] PDF processing completed successfully');
      console.log(`🎉 [VERCEL LOG] Generated ${tests.length} tests with ${tests.reduce((total, test) => total + test.questions.length, 0)} total questions`);

      return {
        success: true,
        tests: tests,
        extractedText: "PDF processed directly by Gemini AI",
        concepts: concepts
      };

    } catch (error) {
      console.error('🚨 [VERCEL LOG] PDF PROCESSING ERROR:');
      console.error('🚨 [VERCEL LOG] Error Message:', error.message);
      console.error('🚨 [VERCEL LOG] Error Type:', error.name);
      console.error('🚨 [VERCEL LOG] Error Stack:', error.stack);
      console.error('🚨 [VERCEL LOG] PDF Size:', pdfBuffer ? `${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB` : 'Unknown');
      console.error('🚨 [VERCEL LOG] Subject:', subject);
      console.error('🚨 [VERCEL LOG] Grade:', grade);
      console.error('🚨 [VERCEL LOG] Board:', board);
      console.error('🚨 [VERCEL LOG] Chapter:', chapter);
      console.error('🚨 [VERCEL LOG] Custom Prompt:', customPrompt ? customPrompt.substring(0, 100) : 'None');
      console.error('🚨 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
      console.error('🚨 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PDFProcessor;

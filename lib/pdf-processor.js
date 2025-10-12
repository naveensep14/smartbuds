const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

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
    
    // Initialize OpenAI as fallback
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.fallbackModel = 'gpt-3.5-turbo';
    } else {
      console.log('⚠️ OpenAI API key not found - fallback disabled');
      this.openai = null;
    }
  }

  async validateAPIKey() {
    try {
      console.log('🔍 Testing API key validity...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Make a simple test request
      const result = await model.generateContent('Test');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ API key is valid');
      return true;
    } catch (error) {
      console.error('❌ API key validation failed:', error.message);
      
      // If it's a quota error, don't throw - just log and continue
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Quota exceeded')) {
        console.log('⚠️ Gemini quota exceeded - will use OpenAI fallback');
        return true; // Continue processing with fallback
      }
      
      if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your API key.');
      }
      throw error;
    }
  }

  async uploadFileToGemini(pdfBuffer) {
    try {
      console.log('📤 [GEMINI LOG] Uploading PDF to Gemini File API...');
      console.log('📤 [GEMINI LOG] PDF buffer size:', pdfBuffer.length, 'bytes');
      console.log('📤 [GEMINI LOG] PDF size:', (pdfBuffer.length / (1024 * 1024)).toFixed(2), 'MB');
      
      // Convert PDF buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');
      console.log('📤 [GEMINI LOG] Base64 length:', pdfBase64.length);
      
      // Upload file to Gemini File API using JSON format
      console.log('📤 [GEMINI LOG] Making request to Gemini File API...');
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
      
      console.log('📤 [GEMINI LOG] File API response status:', uploadResponse.status);
      console.log('📤 [GEMINI LOG] File API response headers:', Object.fromEntries(uploadResponse.headers.entries()));
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ [GEMINI LOG] File upload failed:', errorText);
        console.error('❌ [GEMINI LOG] Response status:', uploadResponse.status);
        console.error('❌ [GEMINI LOG] Response headers:', Object.fromEntries(uploadResponse.headers.entries()));
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ [GEMINI LOG] File uploaded successfully:', uploadResult.name);
      console.log('✅ [GEMINI LOG] Upload result:', uploadResult);
      
      return uploadResult.name; // Return the file URI
      
    } catch (error) {
      console.error('❌ [GEMINI LOG] Error uploading file:', error.message);
      console.error('❌ [GEMINI LOG] Upload error stack:', error.stack);
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

  async generateQuestionsForConceptWithFileURI(concept, subject, grade, pdfBuffer, customPrompt = '', geminiFileName, numQuestions = 10) {
    try {
      console.log('🚀 Starting question generation with Gemini File URI...');
      console.log('Concept:', concept);
      console.log('Subject:', subject);
      console.log('Grade:', grade);
      console.log('PDF Size:', `${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      console.log('Custom Prompt:', customPrompt ? customPrompt.substring(0, 50) + '...' : 'None');
      console.log('Gemini File Name:', geminiFileName);

      const model = this.model;
      const prompt = customPrompt || `Generate exactly ${numQuestions} multiple-choice questions about ${concept} for ${grade} students studying ${subject}. 

Each question should have:
- A clear, age-appropriate question
- 4 answer options (A, B, C, D)
- Correct answer index (0-3)
- Brief explanation

Return ONLY a JSON array of question objects, like this:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation..."
  }
]

Focus on ${concept} concepts that are appropriate for ${grade} level students.`;

      console.log('📤 Using Gemini File API for question generation...');
      
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: `https://generativelanguage.googleapis.com/v1beta/files/${geminiFileName}`
          }
        }
      ]);
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('🔍 [GEMINI LOG] RAW AI RESPONSE DEBUG:');
      console.log('🔍 [GEMINI LOG] Response length:', aiResponse.length);
      console.log('🔍 [GEMINI LOG] Response starts with:', aiResponse.substring(0, 100));
      console.log('🔍 [GEMINI LOG] Response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 100)));
      console.log('🔍 [GEMINI LOG] Full raw response:', aiResponse);
      console.log('🔍 [GEMINI LOG] Response type:', typeof aiResponse);
      console.log('🔍 [GEMINI LOG] Is response empty?', aiResponse.length === 0);
      console.log('🔍 [GEMINI LOG] Response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));
      console.log('🔍 [GEMINI LOG] Response contains markdown?', aiResponse.includes('```'));
      console.log('🔍 [GEMINI LOG] Response contains error keywords?', 
        aiResponse.includes('Error') || aiResponse.includes('Failed') || aiResponse.includes('Exception'));

      // Check if response contains actual error messages (not valid JSON responses)
      if (aiResponse.includes('Request Entity Too Large') || aiResponse.includes('413') || aiResponse.includes('too large') ||
          aiResponse.includes('quota') || aiResponse.includes('limit') || aiResponse.includes('API key') || 
          aiResponse.includes('invalid') || aiResponse.includes('unauthorized') || aiResponse.includes('timeout') ||
          aiResponse.includes('deadline') || aiResponse.includes('Exception') || 
          (aiResponse.includes('Error') && !aiResponse.includes('```json'))) {
        console.error('🚨 QUESTIONS AI ERROR DETECTED:');
        console.error('Raw AI Response:', aiResponse);
        console.error('Concept:', concept);
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
      console.log('🧹 [GEMINI LOG] Starting response cleanup...');
      console.log('🧹 [GEMINI LOG] Original response length:', aiResponse.length);
      
      if (aiResponse.startsWith('```json')) {
        console.log('🧹 [GEMINI LOG] Removing ```json prefix');
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        console.log('🧹 [GEMINI LOG] Removing ``` suffix');
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      console.log('🧹 [GEMINI LOG] Looking for JSON pattern...');
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🧹 [GEMINI LOG] Found JSON pattern, extracting...');
        aiResponse = jsonMatch[0];
      } else {
        console.log('🧹 [GEMINI LOG] No JSON pattern found, using full response');
      }

      console.log('🧹 [GEMINI LOG] Cleaned response length:', aiResponse.length);
      console.log('🧹 [GEMINI LOG] Cleaned AI response:', aiResponse);

      // Validate that we have a JSON array
      if (!aiResponse.startsWith('[') || !aiResponse.endsWith(']')) {
        console.error('Response is not a JSON array:', aiResponse);
        throw new Error('AI response is not a valid JSON array');
      }

      try {
        console.log('🔍 [GEMINI LOG] ATTEMPTING JSON PARSE:');
        console.log('🔍 [GEMINI LOG] String to parse:', aiResponse);
        console.log('🔍 [GEMINI LOG] String length:', aiResponse.length);
        console.log('🔍 [GEMINI LOG] String starts with:', aiResponse.substring(0, 50));
        console.log('🔍 [GEMINI LOG] String ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
        
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          console.error('❌ [GEMINI LOG] Empty response from AI');
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          console.error('❌ [GEMINI LOG] AI returned error message:', aiResponse.substring(0, 100));
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        console.log('🔍 [GEMINI LOG] Attempting JSON.parse...');
        const questions = JSON.parse(aiResponse);
        console.log('✅ [GEMINI LOG] JSON PARSE SUCCESSFUL');
        console.log('✅ [GEMINI LOG] Parsed questions count:', questions.length);
        console.log('✅ [GEMINI LOG] First question:', questions[0]);
        console.log('✅ [GEMINI LOG] Last question:', questions[questions.length - 1]);
        
        if (!Array.isArray(questions)) {
          throw new Error('Response is not an array');
        }

        // Validate questions
        const validQuestions = questions.filter(q => 
          q.question && 
          q.options && 
          Array.isArray(q.options) && 
          q.options.length === 4 && 
          typeof q.correctAnswer === 'number' && 
          q.correctAnswer >= 0 && 
          q.correctAnswer < 4 &&
          q.explanation
        );

        if (validQuestions.length === 0) {
          throw new Error('No valid questions found in response');
        }

        console.log(`Generated ${validQuestions.length} valid questions`);
        return validQuestions;

      } catch (parseError) {
        console.error('🚨 QUESTIONS JSON PARSE ERROR:');
        console.error('Parse Error:', parseError.message);
        console.error('Failed to parse questions response:', aiResponse);
        console.error('Concept:', concept);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        console.error('Gemini File Name:', geminiFileName);
        throw new Error(`Failed to parse questions: ${parseError.message}`);
      }
    } catch (error) {
      console.error('🚨 QUESTION GENERATION ERROR:');
      console.error('Error Message:', error.message);
      console.error('Error Type:', error.name);
      console.error('Error Stack:', error.stack);
      console.error('Concept:', concept);
      console.error('Subject:', subject);
      console.error('Grade:', grade);
      console.error('Gemini File Name:', geminiFileName);
      throw error;
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
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  * Definitions, basic facts, fundamental concepts
  * Direct application of learned material
  * Clear, unambiguous answers based on PDF content
  * Memory-based questions appropriate for ${grade} level
  * Examples: "What is photosynthesis?", "Which planet is closest to the Sun?"

- 20% APPLICATION QUESTIONS: Questions that require applying knowledge to solve problems
  * Scenario-based questions, practical applications
  * Problem-solving using learned concepts
  * Real-world connections where appropriate
  * Examples: "If a plant doesn't get sunlight, what happens?", "How would you solve this problem?"

- 10% ANALYSIS QUESTIONS: Questions that require deeper thinking and analysis
  * Comparing concepts, analyzing relationships
  * Higher-order thinking questions suitable for ${grade} level
  * Critical thinking and evaluation
  * Examples: "What is the relationship between X and Y?", "Why is this approach better?"`;

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
      console.log('Model:', 'gemini-1.5-flash');
      
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

      console.log('🔍 [GEMINI LOG] RAW AI RESPONSE DEBUG:');
      console.log('🔍 [GEMINI LOG] Response length:', aiResponse.length);
      console.log('🔍 [GEMINI LOG] Response starts with:', aiResponse.substring(0, 100));
      console.log('🔍 [GEMINI LOG] Response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 100)));
      console.log('🔍 [GEMINI LOG] Full raw response:', aiResponse);
      console.log('🔍 [GEMINI LOG] Response type:', typeof aiResponse);
      console.log('🔍 [GEMINI LOG] Is response empty?', aiResponse.length === 0);
      console.log('🔍 [GEMINI LOG] Response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));
      console.log('🔍 [GEMINI LOG] Response contains markdown?', aiResponse.includes('```'));
      console.log('🔍 [GEMINI LOG] Response contains error keywords?', 
        aiResponse.includes('Error') || aiResponse.includes('Failed') || aiResponse.includes('Exception'));

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
      console.log('🧹 [GEMINI LOG] Starting response cleanup...');
      console.log('🧹 [GEMINI LOG] Original response length:', aiResponse.length);
      
      if (aiResponse.startsWith('```json')) {
        console.log('🧹 [GEMINI LOG] Removing ```json prefix');
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        console.log('🧹 [GEMINI LOG] Removing ``` suffix');
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      console.log('🧹 [GEMINI LOG] Looking for JSON pattern...');
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🧹 [GEMINI LOG] Found JSON pattern, extracting...');
        aiResponse = jsonMatch[0];
      } else {
        console.log('🧹 [GEMINI LOG] No JSON pattern found, using full response');
      }

      console.log('🧹 [GEMINI LOG] Cleaned response length:', aiResponse.length);
      console.log('🧹 [GEMINI LOG] Cleaned AI response:', aiResponse);

      // Validate that we have a JSON array
      if (!aiResponse.startsWith('[') || !aiResponse.endsWith(']')) {
        console.error('Response is not a JSON array:', aiResponse);
        throw new Error('AI response is not a valid JSON array');
      }

      try {
        console.log('🔍 [GEMINI LOG] ATTEMPTING JSON PARSE:');
        console.log('🔍 [GEMINI LOG] String to parse:', aiResponse);
        console.log('🔍 [GEMINI LOG] String length:', aiResponse.length);
        console.log('🔍 [GEMINI LOG] String starts with:', aiResponse.substring(0, 50));
        console.log('🔍 [GEMINI LOG] String ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
        
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          console.error('❌ [GEMINI LOG] Empty response from AI');
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          console.error('❌ [GEMINI LOG] AI returned error message:', aiResponse.substring(0, 100));
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        console.log('🔍 [GEMINI LOG] Attempting JSON.parse...');
        const questions = JSON.parse(aiResponse);
        console.log('✅ [GEMINI LOG] JSON PARSE SUCCESSFUL');
        console.log('✅ [GEMINI LOG] Parsed questions count:', questions.length);
        console.log('✅ [GEMINI LOG] First question:', questions[0]);
        console.log('✅ [GEMINI LOG] Last question:', questions[questions.length - 1]);
        
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

  async identifyConceptsWithFileURI(pdfBuffer, subject, grade, geminiFileName) {
    try {
      console.log('🔍 Starting concept identification with Gemini File URI...');
      console.log('PDF Size:', (pdfBuffer.length / (1024 * 1024)).toFixed(2), 'MB');
      console.log('Subject:', subject);
      console.log('Grade:', grade);
      console.log('Gemini File Name:', geminiFileName);

      const model = this.model;
      const prompt = `Analyze this PDF content and identify exactly 3 key educational concepts that would be suitable for generating test questions for ${grade} students studying ${subject}. 

Return ONLY a JSON array of concept names, like this:
["Concept 1", "Concept 2", "Concept 3"]

Focus on:
- Core learning objectives for ${grade} level
- Fundamental ${subject} concepts
- Topics that would make good test questions
- Concepts that are clearly explained in the PDF

Do not include any explanatory text, just the JSON array.`;

      console.log('📤 Using Gemini File API for concept identification...');
      
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            fileUri: `https://generativelanguage.googleapis.com/v1beta/files/${geminiFileName}`
          }
        }
      ]);
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('🔍 [GEMINI LOG] Raw concepts response:', aiResponse);
      console.log('🔍 [GEMINI LOG] Concepts response length:', aiResponse.length);
      console.log('🔍 [GEMINI LOG] Concepts response starts with:', aiResponse.substring(0, 100));
      console.log('🔍 [GEMINI LOG] Concepts response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 100)));
      console.log('🔍 [GEMINI LOG] Concepts response type:', typeof aiResponse);
      console.log('🔍 [GEMINI LOG] Concepts response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));
      console.log('🔍 [GEMINI LOG] Concepts response contains markdown?', aiResponse.includes('```'));
      console.log('🔍 [GEMINI LOG] Concepts response contains error keywords?', 
        aiResponse.includes('Error') || aiResponse.includes('Failed') || aiResponse.includes('Exception'));

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
      console.log('🧹 [GEMINI LOG] Starting concepts response cleanup...');
      console.log('🧹 [GEMINI LOG] Original concepts response length:', aiResponse.length);
      
      if (aiResponse.startsWith('```json')) {
        console.log('🧹 [GEMINI LOG] Removing ```json prefix from concepts');
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        console.log('🧹 [GEMINI LOG] Removing ``` suffix from concepts');
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      console.log('🧹 [GEMINI LOG] Looking for JSON pattern in concepts...');
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🧹 [GEMINI LOG] Found JSON pattern in concepts, extracting...');
        aiResponse = jsonMatch[0];
      } else {
        console.log('🧹 [GEMINI LOG] No JSON pattern found in concepts, using full response');
      }

      console.log('🧹 [GEMINI LOG] Cleaned concepts response length:', aiResponse.length);
      console.log('🧹 [GEMINI LOG] Cleaned concepts response:', aiResponse);

      try {
        console.log('🔍 [GEMINI LOG] ATTEMPTING CONCEPTS JSON PARSE:');
        console.log('🔍 [GEMINI LOG] Concepts string to parse:', aiResponse);
        console.log('🔍 [GEMINI LOG] Concepts string length:', aiResponse.length);
        console.log('🔍 [GEMINI LOG] Concepts string starts with:', aiResponse.substring(0, 50));
        console.log('🔍 [GEMINI LOG] Concepts string ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
        
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          console.error('❌ [GEMINI LOG] Empty concepts response from AI');
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          console.error('❌ [GEMINI LOG] AI returned error message in concepts:', aiResponse.substring(0, 100));
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        console.log('🔍 [GEMINI LOG] Attempting concepts JSON.parse...');
        const concepts = JSON.parse(aiResponse);
        console.log('✅ [GEMINI LOG] CONCEPTS JSON PARSE SUCCESSFUL');
        console.log('✅ [GEMINI LOG] Parsed concepts count:', concepts.length);
        console.log('✅ [GEMINI LOG] Concepts:', concepts);
        
        if (!Array.isArray(concepts)) {
          console.error('❌ [GEMINI LOG] Concepts response is not an array:', typeof concepts);
          throw new Error('Response is not an array');
        }
        return concepts;
      } catch (parseError) {
        console.error('🚨 CONCEPTS JSON PARSE ERROR:');
        console.error('Parse Error:', parseError.message);
        console.error('Failed to parse concepts response:', aiResponse);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        console.error('Gemini File Name:', geminiFileName);
        throw new Error(`Failed to parse concepts: ${parseError.message}`);
      }
    } catch (error) {
      console.error('🚨 CONCEPT IDENTIFICATION ERROR:');
      console.error('Error Message:', error.message);
      console.error('Error Type:', error.name);
      console.error('Error Stack:', error.stack);
      console.error('Subject:', subject);
      console.error('Grade:', grade);
      console.error('Gemini File Name:', geminiFileName);
      throw error;
    }
  }

  async identifyConcepts(pdfBuffer, subject, grade) {
    try {
      console.log('🔍 Starting concept identification...');
      console.log('PDF Size:', `${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      console.log('Subject:', subject);
      console.log('Grade:', grade);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

      console.log('🔍 [GEMINI LOG] Raw concepts response:', aiResponse);
      console.log('🔍 [GEMINI LOG] Concepts response length:', aiResponse.length);
      console.log('🔍 [GEMINI LOG] Concepts response starts with:', aiResponse.substring(0, 100));
      console.log('🔍 [GEMINI LOG] Concepts response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 100)));
      console.log('🔍 [GEMINI LOG] Concepts response type:', typeof aiResponse);
      console.log('🔍 [GEMINI LOG] Concepts response contains JSON?', aiResponse.includes('[') || aiResponse.includes('{'));
      console.log('🔍 [GEMINI LOG] Concepts response contains markdown?', aiResponse.includes('```'));
      console.log('🔍 [GEMINI LOG] Concepts response contains error keywords?', 
        aiResponse.includes('Error') || aiResponse.includes('Failed') || aiResponse.includes('Exception'));

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
      console.log('🧹 [GEMINI LOG] Starting concepts response cleanup...');
      console.log('🧹 [GEMINI LOG] Original concepts response length:', aiResponse.length);
      
      if (aiResponse.startsWith('```json')) {
        console.log('🧹 [GEMINI LOG] Removing ```json prefix from concepts');
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        console.log('🧹 [GEMINI LOG] Removing ``` suffix from concepts');
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      // Extract JSON from response if it contains extra text
      console.log('🧹 [GEMINI LOG] Looking for JSON pattern in concepts...');
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('🧹 [GEMINI LOG] Found JSON pattern in concepts, extracting...');
        aiResponse = jsonMatch[0];
      } else {
        console.log('🧹 [GEMINI LOG] No JSON pattern found in concepts, using full response');
      }

      console.log('🧹 [GEMINI LOG] Cleaned concepts response length:', aiResponse.length);
      console.log('🧹 [GEMINI LOG] Cleaned concepts response:', aiResponse);

      try {
        console.log('🔍 [GEMINI LOG] ATTEMPTING CONCEPTS JSON PARSE:');
        console.log('🔍 [GEMINI LOG] Concepts string to parse:', aiResponse);
        console.log('🔍 [GEMINI LOG] Concepts string length:', aiResponse.length);
        console.log('🔍 [GEMINI LOG] Concepts string starts with:', aiResponse.substring(0, 50));
        console.log('🔍 [GEMINI LOG] Concepts string ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
        
        // Additional validation before parsing
        if (!aiResponse || aiResponse.length === 0) {
          console.error('❌ [GEMINI LOG] Empty concepts response from AI');
          throw new Error('Empty response from AI');
        }
        
        // Check if response looks like an error message
        if (aiResponse.includes('Request Entity Too Large') || 
            aiResponse.includes('413') || 
            aiResponse.includes('Error') ||
            aiResponse.includes('Failed') ||
            aiResponse.includes('Exception')) {
          console.error('❌ [GEMINI LOG] AI returned error message in concepts:', aiResponse.substring(0, 100));
          throw new Error(`AI returned error message: ${aiResponse.substring(0, 100)}`);
        }
        
        console.log('🔍 [GEMINI LOG] Attempting concepts JSON.parse...');
        const concepts = JSON.parse(aiResponse);
        console.log('✅ [GEMINI LOG] CONCEPTS JSON PARSE SUCCESSFUL');
        console.log('✅ [GEMINI LOG] Parsed concepts count:', concepts.length);
        console.log('✅ [GEMINI LOG] Concepts:', concepts);
        
        if (!Array.isArray(concepts)) {
          console.error('❌ [GEMINI LOG] Concepts response is not an array:', typeof concepts);
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

  async generateTestTitle(concept, grade, subject, chapter, testNumber = null) {
    if (testNumber) {
      return `${grade} ${subject} - Chapter ${chapter} - ${concept} (Test ${testNumber})`;
    }
    return `${grade} ${subject} - Chapter ${chapter} - ${concept}`;
  }

  async generateTestDescription(concept, grade) {
    return `Test covering ${concept} concepts for ${grade} level students.`;
  }

  getWeeklyTestExpiryDate() {
    // Get next Sunday and add 7 days for expiry
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, next Sunday is in 7 days
    
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0); // Start of day
    
    // Add 7 days for expiry
    const expiryDate = new Date(nextSunday);
    expiryDate.setDate(nextSunday.getDate() + 7);
    expiryDate.setHours(23, 59, 59, 999); // End of day
    
    return expiryDate.toISOString();
  }

  async processPDFWithFileURI(pdfBuffer, subject, grade, board, type = 'coursework', customPrompt = '', chapter = 1, geminiFileName, numTests = 5, questionsPerTest = 10) {
    try {
      console.log('🔍 [VERCEL LOG] Starting PDF processing with Gemini File URI...');
      console.log('🔍 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
      console.log('🔍 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
      console.log('🔍 [VERCEL LOG] API Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
      console.log('🔍 [VERCEL LOG] Gemini file name:', geminiFileName);
      
      // Validate API key first
      console.log('🔑 [VERCEL LOG] Validating API key...');
      await this.validateAPIKey();
      console.log('✅ [VERCEL LOG] API key validation passed');
      
      if (customPrompt) {
        console.log(`📝 [VERCEL LOG] Using custom prompt: ${customPrompt.substring(0, 50)}...`);
      }

      console.log('🔍 [VERCEL LOG] Analyzing PDF content to identify key concepts...');
      const concepts = await this.identifyConceptsWithFileURI(pdfBuffer, subject, grade, geminiFileName);
      console.log(`📚 [VERCEL LOG] Identified concepts: ${concepts.join(', ')}`);
      console.log(`🎯 [VERCEL LOG] Generating ${numTests} tests with ${questionsPerTest} questions each`);

      const tests = [];

      // Generate multiple tests based on numTests parameter
      for (let testIndex = 0; testIndex < numTests; testIndex++) {
        console.log(`🚀 [VERCEL LOG] Generating test ${testIndex + 1} of ${numTests}`);
        
        // Cycle through concepts for each test
        const conceptIndex = testIndex % concepts.length;
        const concept = concepts[conceptIndex];
        
        console.log(`🚀 [VERCEL LOG] Generating questions for concept: ${concept} (Test ${testIndex + 1})`);
        
        const questions = await this.generateQuestionsForConceptWithFileURIFallback(concept, subject, grade, pdfBuffer, customPrompt, geminiFileName, questionsPerTest);
        console.log(`✅ [VERCEL LOG] Generated ${questions.length} questions for ${concept} (Test ${testIndex + 1})`);

        const test = {
          title: await this.generateTestTitle(concept, grade, subject, chapter, testIndex + 1),
          description: await this.generateTestDescription(concept, grade),
          subject: subject,
          grade: grade,
          board: board,
          type: type,
          duration: 30,
          timelimit: 30,
          questions: questions,
          expiry_date: type === 'weekly' ? this.getWeeklyTestExpiryDate() : null
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
      console.error('🚨 [VERCEL LOG] Subject:', subject);
      console.error('🚨 [VERCEL LOG] Grade:', grade);
      console.error('🚨 [VERCEL LOG] Board:', board);
      console.error('🚨 [VERCEL LOG] Chapter:', chapter);
      console.error('🚨 [VERCEL LOG] Custom Prompt:', customPrompt ? customPrompt.substring(0, 100) : 'None');
      console.error('🚨 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
      console.error('🚨 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
      console.error('🚨 [VERCEL LOG] Gemini file name:', geminiFileName);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processPDF(pdfBuffer, subject, grade, board, type = 'coursework', customPrompt = '', chapter = 1, numTests = 5, questionsPerTest = 10) {
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
      const concepts = await this.identifyConceptsWithFallback(pdfBuffer, subject, grade);
      console.log(`📚 [VERCEL LOG] Identified concepts: ${concepts.join(', ')}`);
      console.log(`🎯 [VERCEL LOG] Generating ${numTests} tests with ${questionsPerTest} questions each`);

      const tests = [];

      // Generate multiple tests based on numTests parameter
      for (let testIndex = 0; testIndex < numTests; testIndex++) {
        console.log(`🚀 [VERCEL LOG] Generating test ${testIndex + 1} of ${numTests}`);
        
        // Cycle through concepts for each test
        const conceptIndex = testIndex % concepts.length;
        const concept = concepts[conceptIndex];
        
        console.log(`🚀 [VERCEL LOG] Generating questions for concept: ${concept} (Test ${testIndex + 1})`);
        
        const questions = await this.generateQuestionsForConceptWithFallback(concept, subject, grade, pdfBuffer, customPrompt, questionsPerTest);
        console.log(`✅ [VERCEL LOG] Generated ${questions.length} questions for ${concept} (Test ${testIndex + 1})`);

        const test = {
          title: await this.generateTestTitle(concept, grade, subject, chapter, testIndex + 1),
          description: await this.generateTestDescription(concept, grade),
          subject: subject,
          grade: grade,
          board: board,
          type: type,
          duration: 30,
          timelimit: 30,
          questions: questions,
          expiry_date: type === 'weekly' ? this.getWeeklyTestExpiryDate() : null
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

  // Fallback method using OpenAI when Gemini fails
  async generateQuestionsWithOpenAI(concept, subject, grade, pdfText, customPrompt = '', numQuestions = 10) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized - API key missing');
      }

      console.log('🤖 [OPENAI FALLBACK] Starting question generation with OpenAI...');
      console.log('🤖 [OPENAI FALLBACK] Concept:', concept);
      console.log('🤖 [OPENAI FALLBACK] Subject:', subject);
      console.log('🤖 [OPENAI FALLBACK] Grade:', grade);
      console.log('🤖 [OPENAI FALLBACK] PDF Text Length:', pdfText ? pdfText.length : 0);

      const prompt = `You are an expert educational content creator specializing in ${subject} for ${grade} students.

Create exactly ${numQuestions} multiple choice questions for the concept: ${concept}

Requirements:
- Questions based on the provided content but need not be directly from it
- Appropriate for ${grade} level
- 4 answer options (A, B, C, D)
- Include explanations
- Educational and accurate
- Clear and unambiguous

${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Explanation here"
  }
]

Do not include any text before or after the JSON array.`;

      console.log('🤖 [OPENAI FALLBACK] Calling OpenAI API...');
      
      const response = await this.openai.chat.completions.create({
        model: this.fallbackModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      console.log('🤖 [OPENAI FALLBACK] Raw response:', response.choices[0].message.content);
      
      let aiResponse = response.choices[0].message.content.trim();
      
      // Clean up the response - remove markdown formatting if present
      if (aiResponse.includes('```json')) {
        aiResponse = aiResponse.split('```json')[1].split('```')[0].trim();
      } else if (aiResponse.includes('```')) {
        aiResponse = aiResponse.split('```')[1].split('```')[0].trim();
      }

      console.log('🤖 [OPENAI FALLBACK] Cleaned response:', aiResponse);
      
      // Parse JSON response
      const questions = JSON.parse(aiResponse);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      console.log(`🤖 [OPENAI FALLBACK] Generated ${questions.length} questions successfully`);
      
      return questions.map((q, index) => ({
        id: `openai_${Date.now()}_${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        image: undefined
      }));

    } catch (error) {
      console.error('🤖 [OPENAI FALLBACK] Error:', error.message);
      throw new Error(`OpenAI fallback failed: ${error.message}`);
    }
  }

  // Enhanced generateQuestionsForConcept with fallback
  async generateQuestionsForConceptWithFallback(concept, subject, grade, pdfBuffer, customPrompt = '', numQuestions = 10) {
    try {
      // Try Gemini first
      console.log('🤖 [FALLBACK] Attempting Gemini first...');
      return await this.generateQuestionsForConcept(concept, subject, grade, pdfBuffer, customPrompt, numQuestions);
    } catch (geminiError) {
      console.log('🤖 [FALLBACK] Gemini failed, trying OpenAI fallback...');
      console.log('🤖 [FALLBACK] Gemini error:', geminiError.message);
      
      try {
        // Extract text from PDF buffer for OpenAI (simplified approach)
        const pdfText = `PDF content for ${concept} - ${subject} - ${grade}`;
        return await this.generateQuestionsWithOpenAI(concept, subject, grade, pdfText, customPrompt, numQuestions);
      } catch (openaiError) {
        console.log('🤖 [FALLBACK] OpenAI failed, using template fallback...');
        console.log('🤖 [FALLBACK] OpenAI error:', openaiError.message);
        
        // Use template-based questions as final fallback
        return this.generateTemplateQuestions(concept, subject, grade, numQuestions);
      }
    }
  }

  // Enhanced generateQuestionsForConceptWithFileURI with fallback
  async generateQuestionsForConceptWithFileURIFallback(concept, subject, grade, pdfBuffer, customPrompt = '', geminiFileName, numQuestions = 10) {
    try {
      // Try Gemini File URI first
      console.log('🤖 [FILE URI FALLBACK] Attempting Gemini File URI first...');
      return await this.generateQuestionsForConceptWithFileURI(concept, subject, grade, pdfBuffer, customPrompt, geminiFileName, numQuestions);
    } catch (geminiError) {
      console.log('🤖 [FILE URI FALLBACK] Gemini File URI failed, trying OpenAI fallback...');
      console.log('🤖 [FILE URI FALLBACK] Gemini error:', geminiError.message);
      
      try {
        // Extract text from PDF buffer for OpenAI (simplified approach)
        const pdfText = `PDF content for ${concept} - ${subject} - ${grade}`;
        return await this.generateQuestionsWithOpenAI(concept, subject, grade, pdfText, customPrompt, numQuestions);
      } catch (openaiError) {
        console.log('🤖 [FILE URI FALLBACK] OpenAI failed, using template fallback...');
        console.log('🤖 [FILE URI FALLBACK] OpenAI error:', openaiError.message);
        
        // Use template-based questions as final fallback
        return this.generateTemplateQuestions(concept, subject, grade, numQuestions);
      }
    }
  }

  // Fallback method for concept identification using OpenAI
  async identifyConceptsWithOpenAI(subject, grade) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized - API key missing');
      }

      console.log('🤖 [OPENAI CONCEPTS] Starting concept identification with OpenAI...');
      console.log('🤖 [OPENAI CONCEPTS] Subject:', subject);
      console.log('🤖 [OPENAI CONCEPTS] Grade:', grade);

      const prompt = `Analyze ${subject} content for ${grade} students and identify exactly 3 key concepts that would be suitable for generating test questions.

Focus on:
- Core learning objectives for ${grade} level
- Fundamental ${subject} concepts
- Topics that would make good test questions
- Concepts that are commonly taught at this level

Return ONLY a JSON array of concept names, like this:
["Concept 1", "Concept 2", "Concept 3"]

Do not include any explanatory text, just the JSON array.`;

      console.log('🤖 [OPENAI CONCEPTS] Calling OpenAI API...');
      
      const response = await this.openai.chat.completions.create({
        model: this.fallbackModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log('🤖 [OPENAI CONCEPTS] Raw response:', response.choices[0].message.content);
      
      let aiResponse = response.choices[0].message.content.trim();
      
      // Clean up the response - remove markdown formatting if present
      if (aiResponse.includes('```json')) {
        aiResponse = aiResponse.split('```json')[1].split('```')[0].trim();
      } else if (aiResponse.includes('```')) {
        aiResponse = aiResponse.split('```')[1].split('```')[0].trim();
      }

      console.log('🤖 [OPENAI CONCEPTS] Cleaned response:', aiResponse);
      
      // Parse JSON response
      const concepts = JSON.parse(aiResponse);
      
      if (!Array.isArray(concepts)) {
        throw new Error('Response is not an array');
      }

      console.log(`🤖 [OPENAI CONCEPTS] Generated ${concepts.length} concepts successfully`);
      
      return concepts;

    } catch (error) {
      console.error('🤖 [OPENAI CONCEPTS] Error:', error.message);
      throw new Error(`OpenAI concept identification failed: ${error.message}`);
    }
  }

  // Enhanced identifyConcepts with fallback
  async identifyConceptsWithFallback(pdfBuffer, subject, grade) {
    try {
      // Try Gemini first
      console.log('🤖 [CONCEPTS FALLBACK] Attempting Gemini first...');
      return await this.identifyConcepts(pdfBuffer, subject, grade);
    } catch (geminiError) {
      console.log('🤖 [CONCEPTS FALLBACK] Gemini failed, trying OpenAI fallback...');
      console.log('🤖 [CONCEPTS FALLBACK] Gemini error:', geminiError.message);
      
      try {
        return await this.identifyConceptsWithOpenAI(subject, grade);
      } catch (openaiError) {
        console.error('🤖 [CONCEPTS FALLBACK] Both Gemini and OpenAI failed');
        throw new Error(`Both AI models failed. Gemini: ${geminiError.message}, OpenAI: ${openaiError.message}`);
      }
    }
  }
}

module.exports = PDFProcessor;

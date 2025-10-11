const { GoogleGenerativeAI } = require('@google/generative-ai');

class PDFProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for concept: ${concept}`);
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const basePrompt = `
You are an expert educational content creator specializing in ${subject} for ${grade} students.

Create ${numQuestions} multiple choice questions for the concept: ${concept}

Requirements:
- Questions based on PDF content
- Appropriate for ${grade} level
- 4 answer options (A, B, C, D)
- Include explanations
- Educational and accurate
- HIGH QUALITY: Questions must be challenging, complex, and require analytical thinking
- NOT TOO EASY: Avoid straightforward, simple questions that can be answered without deep understanding
- TRICKY & COMPLEX: Include questions that test logical reasoning and analytical skills
- APTITUDE & LOGICAL REASONING: Questions should require students to think critically and apply concepts
- ANALYTICAL: Students must analyze, compare, evaluate, or synthesize information to answer correctly
- Do NOT reference page numbers in questions
- Do NOT include "According to page X" or "On page Y" in questions
- Do NOT rely on pictures, images, or visual elements from the PDF
- Do NOT ask questions about what is shown in images or diagrams
- Make questions self-contained and clear using only text content
- Focus on concepts and ideas, not visual elements`;

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
      try {
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: pdfBase64,
              mimeType: 'application/pdf'
            }
          }
        ]);
        console.log('✅ GEMINI API CALL SUCCESSFUL');
      } catch (apiError) {
        console.error('🚨 GEMINI API CALL FAILED:');
        console.error('API Error:', apiError.message);
        console.error('API Error Type:', apiError.name);
        console.error('Full API Error:', apiError);
        throw apiError;
      }
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('🔍 RAW AI RESPONSE DEBUG:');
      console.log('Response length:', aiResponse.length);
      console.log('Response starts with:', aiResponse.substring(0, 50));
      console.log('Response ends with:', aiResponse.substring(Math.max(0, aiResponse.length - 50)));
      console.log('Full raw response:', aiResponse);

      // Check if response contains error messages
      if (aiResponse.includes('Request') || aiResponse.includes('Error') || aiResponse.includes('Failed') || 
          aiResponse.includes('exception') || aiResponse.includes('timeout') || aiResponse.includes('quota')) {
        console.error('🚨 AI ERROR DETECTED:');
        console.error('Raw AI Response:', aiResponse);
        console.error('Concept:', concept);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        console.error('Attempt:', attempt);
        throw new Error(`AI returned error: ${aiResponse}`);
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
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
Analyze the following ${subject} content for ${grade} students and identify 2-3 key concepts that can be tested.

Return ONLY a JSON array of concept names:
["Concept 1", "Concept 2", "Concept 3"]
`;

      // Convert PDF buffer to base64 for Gemini
      const pdfBase64 = pdfBuffer.toString('base64');
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        }
      ]);
      
      const response = await result.response;
      let aiResponse = response.text().trim();

      console.log('Raw concepts response:', aiResponse);

      // Check if response contains error messages
      if (aiResponse.includes('Request') || aiResponse.includes('Error') || aiResponse.includes('Failed') || 
          aiResponse.includes('exception') || aiResponse.includes('timeout') || aiResponse.includes('quota')) {
        console.error('🚨 CONCEPTS AI ERROR DETECTED:');
        console.error('Raw AI Response:', aiResponse);
        console.error('Subject:', subject);
        console.error('Grade:', grade);
        throw new Error(`Concepts AI returned error: ${aiResponse}`);
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

  async generateTestTitle(concept, grade, subject) {
    return `${grade} ${subject} - ${concept}`;
  }

  async generateTestDescription(concept, grade) {
    return `Test covering ${concept} concepts for ${grade} level students.`;
  }

  async processPDF(pdfBuffer, subject, grade, board, customPrompt = '') {
    try {
      console.log('🔍 Processing PDF with Gemini AI...');
      if (customPrompt) {
        console.log(`📝 Using custom prompt: ${customPrompt.substring(0, 50)}...`);
      }

      console.log('🔍 Analyzing PDF content to identify key concepts...');
      const concepts = await this.identifyConcepts(pdfBuffer, subject, grade);
      console.log(`📚 Identified concepts: ${concepts.join(', ')}`);

      const tests = [];

      for (const concept of concepts) {
        console.log(`🚀 Generating questions for concept: ${concept}`);
        
        const questions = await this.generateQuestionsForConcept(concept, subject, grade, pdfBuffer, customPrompt);
        console.log(`✅ Generated ${questions.length} questions for ${concept}`);

        const test = {
          title: await this.generateTestTitle(concept, grade, subject),
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

      return {
        success: true,
        tests: tests,
        extractedText: "PDF processed directly by Gemini AI",
        concepts: concepts
      };

    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PDFProcessor;

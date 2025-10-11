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
    try {
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

Return ONLY a valid JSON array:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Explanation here"
  }
]
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

      console.log('Raw AI response:', aiResponse);

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

      try {
        const questions = JSON.parse(aiResponse);
        if (!Array.isArray(questions)) {
          throw new Error('Response is not an array');
        }
        return questions.slice(0, numQuestions);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse response:', aiResponse);
        
        // Return fallback questions if parsing fails
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

    } catch (error) {
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
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
        console.error('Concepts JSON parse error:', parseError);
        console.error('Failed to parse concepts response:', aiResponse);
        throw parseError; // Let the catch block handle fallback
      }

    } catch (error) {
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

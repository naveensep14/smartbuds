const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

class PDFProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  async generateQuestionsForConcept(concept, subject, grade, pdfText, numQuestions = 10) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
You are an expert educational content creator specializing in ${subject} for ${grade} students.

Create ${numQuestions} multiple choice questions for the concept: ${concept}

Requirements:
- Questions based on PDF content
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

      const result = await model.generateContent([prompt, pdfText]);
      const response = await result.response;
      let aiResponse = response.text().trim();

      // Clean up the response
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      const questions = JSON.parse(aiResponse);
      return questions.slice(0, numQuestions);

    } catch (error) {
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  async identifyConcepts(pdfText, subject, grade) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
Analyze the following ${subject} content for ${grade} students and identify 2-3 key concepts that can be tested.

Content: ${pdfText.substring(0, 2000)}...

Return ONLY a JSON array of concept names:
["Concept 1", "Concept 2", "Concept 3"]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let aiResponse = response.text().trim();

      // Clean up the response
      if (aiResponse.startsWith('```json')) {
        aiResponse = aiResponse.substring(7);
      }
      if (aiResponse.endsWith('```')) {
        aiResponse = aiResponse.substring(0, aiResponse.length - 3);
      }

      return JSON.parse(aiResponse);

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

  async processPDF(pdfBuffer, subject, grade, board) {
    try {
      console.log('🔍 Extracting text from PDF...');
      const pdfText = await this.extractTextFromPDF(pdfBuffer);

      console.log('🔍 Analyzing PDF content to identify key concepts...');
      const concepts = await this.identifyConcepts(pdfText, subject, grade);
      console.log(`📚 Identified concepts: ${concepts.join(', ')}`);

      const tests = [];

      for (const concept of concepts) {
        console.log(`🚀 Generating questions for concept: ${concept}`);
        
        const questions = await this.generateQuestionsForConcept(concept, subject, grade, pdfText);
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
        extractedText: pdfText.substring(0, 500) + '...',
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

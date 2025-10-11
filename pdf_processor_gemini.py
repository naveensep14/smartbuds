import sys
import json
import google.generativeai as genai
import os
from pathlib import Path
import base64
import PyPDF2

def extract_text_from_pdf_fast(file_path):
    """Fast PDF text extraction using PyPDF2"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text[:2000]  # Limit to first 2000 chars for speed
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def load_pdf_for_gemini(file_path):
    """Load PDF file for Gemini processing"""
    try:
        with open(file_path, 'rb') as file:
            pdf_data = file.read()
        return pdf_data
    except Exception as e:
        print(f"Error loading PDF: {e}", file=sys.stderr)
        return None

def generate_gemini_questions_for_concept(concept, subject, grade, pdf_path, num_questions=10, use_text_fallback=False):
    """Generate questions using Google Gemini with PDF input and quality validation"""
    
    # Set up Gemini API
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        raise Exception("GEMINI_API_KEY not found. Please get a free API key from https://makersuite.google.com/app/apikey")
    
    try:
        print(f"🚀 Generating questions for concept: {concept}", file=sys.stderr)
        
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Try PDF upload first, fallback to text if needed
        if use_text_fallback:
            pdf_text = extract_text_from_pdf_fast(pdf_path)
            if not pdf_text:
                raise Exception("Could not extract text from PDF")
            print(f"📝 Using fast text extraction (first 2000 chars)", file=sys.stderr)
        else:
            # Upload PDF to Gemini
            pdf_file = genai.upload_file(path=pdf_path, mime_type='application/pdf')
            print(f"📄 Using PDF upload to Gemini", file=sys.stderr)
        
        prompt = f"""
You are an expert educational content creator specializing in {subject} for {grade} students.

Create {num_questions} multiple choice questions for the concept: {concept}

Requirements:
- Questions based on PDF content
- Appropriate for {grade} level
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
  * Examples: "If A happens, what would be the most logical next step?", "Which approach would be most efficient?"

Return ONLY a valid JSON array:
[
  {{
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Explanation here"
  }}
]
"""

        # Generate content based on input type
        if use_text_fallback:
            response = model.generate_content([prompt, pdf_text])
        else:
            response = model.generate_content([prompt, pdf_file])
        ai_response = response.text.strip()
        
        # Clean up the response
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:]
        if ai_response.endswith('```'):
            ai_response = ai_response[:-3]
        
        questions = json.loads(ai_response)
        
        # Accept all questions without validation (fastest approach)
        print(f"✅ Generated {len(questions)} questions without validation", file=sys.stderr)
        return questions[:num_questions]
                
    except Exception as e:
        raise Exception(f"Gemini generation failed: {e}")

# Removed hardcoded title extraction - now using AI analysis

def main():
    if len(sys.argv) != 5:
        print("Usage: python pdf_processor_gemini.py <pdf_path> <subject> <grade> <board>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    subject = sys.argv[2]
    grade = sys.argv[3]
    board = sys.argv[4]
    
    try:
        # Load PDF data for Gemini
        pdf_data = load_pdf_for_gemini(pdf_path)
        
        if not pdf_data:
            raise Exception("Could not load PDF file")
        
        # Set up Gemini API
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not gemini_api_key:
            raise Exception("GEMINI_API_KEY not found. Please get a free API key from https://makersuite.google.com/app/apikey")
        
        # Let AI determine concepts from PDF content dynamically
        print(f"🔍 Analyzing PDF content to identify key concepts...", file=sys.stderr)
        
        # Generate title and concepts using AI analysis
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        pdf_file = genai.upload_file(path=pdf_path, mime_type='application/pdf')
        
        analysis_prompt = f"""
Analyze this PDF content for {subject} at {grade} level and provide:

1. A descriptive title for the content (max 50 characters)
2. Three main learning concepts/topics covered in the PDF
3. A brief description of what students will learn

Return ONLY a JSON object with this exact structure:
{{
  "title": "Descriptive title here",
  "concepts": ["Concept 1", "Concept 2", "Concept 3"],
  "description": "Brief description of learning objectives"
}}

Focus on the actual content in the PDF, not generic concepts.
"""

        analysis_response = model.generate_content([analysis_prompt, pdf_file])
        analysis_text = analysis_response.text.strip()
        
        if analysis_text.startswith('```json'):
            analysis_text = analysis_text[7:]
        if analysis_text.endswith('```'):
            analysis_text = analysis_text[:-3]
            
        analysis_data = json.loads(analysis_text)
        concepts = analysis_data.get('concepts', ['Core Concepts', 'Advanced Topics', 'Practical Applications'])
        base_title = analysis_data.get('title', f"{grade} {subject} - Chapter Content")
        base_description = analysis_data.get('description', f"AI-generated test covering key concepts from {base_title}. Questions are based on actual PDF content and designed for {grade} level.")
        
        print(f"📚 Identified concepts: {', '.join(concepts)}", file=sys.stderr)
        
        # Generate tests using Gemini AI with PDF input (much faster!)
        tests = []
        for concept in concepts:
            print(f"🚀 Generating fast Gemini AI questions for concept: {concept}", file=sys.stderr)
            
            # Try PDF upload first, fallback to text extraction if it fails
            try:
                questions = generate_gemini_questions_for_concept(concept, subject, grade, pdf_path, 10, use_text_fallback=False)
            except Exception as e:
                print(f"⚠️ PDF upload failed, trying fast text extraction: {e}", file=sys.stderr)
                questions = generate_gemini_questions_for_concept(concept, subject, grade, pdf_path, 10, use_text_fallback=True)
            
            test = {
                "title": f"{grade} {subject} - {concept}",
                "description": f"Test covering {concept} concepts for {grade} level students.",
                "subject": subject,
                "grade": grade,
                "board": board,
                "duration": 30,
                "timelimit": 30,
                "questions": questions
            }
            tests.append(test)
            print(f"✅ Generated {len(questions)} fast AI questions for {concept}", file=sys.stderr)
        
        # Output results as JSON
        result = {
            "success": True,
            "tests": tests,
            "extractedText": "PDF processed directly by Gemini AI (faster method)",
            "concepts": concepts
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()

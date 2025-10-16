import sys
import json
import PyPDF2
import re
import openai
from pathlib import Path
import os

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def extract_concepts_from_text(text, subject):
    """Extract concepts from text based on subject"""
    concepts = []
    text_lower = text.lower()
    
    if subject.lower() == 'mathematics':
        if 'add' in text_lower or 'addition' in text_lower or 'plus' in text_lower:
            concepts.append('Addition')
        if 'subtract' in text_lower or 'subtraction' in text_lower or 'minus' in text_lower:
            concepts.append('Subtraction')
        if 'multiply' in text_lower or 'multiplication' in text_lower or 'times' in text_lower:
            concepts.append('Multiplication')
        if 'divide' in text_lower or 'division' in text_lower or 'share' in text_lower:
            concepts.append('Division')
        if 'shape' in text_lower or 'circle' in text_lower or 'square' in text_lower:
            concepts.append('Shapes and Geometry')
        if 'time' in text_lower or 'clock' in text_lower or 'hour' in text_lower:
            concepts.append('Time and Measurement')
        if 'money' in text_lower or 'rupee' in text_lower or 'coin' in text_lower:
            concepts.append('Money and Currency')
        if 'pattern' in text_lower or 'sequence' in text_lower:
            concepts.append('Patterns and Sequences')
        if 'data' in text_lower or 'chart' in text_lower or 'graph' in text_lower:
            concepts.append('Data and Charts')
        if 'length' in text_lower or 'measure' in text_lower or 'long' in text_lower:
            concepts.append('Measurement')
    elif subject.lower() == 'science':
        if 'plant' in text_lower or 'tree' in text_lower or 'leaf' in text_lower:
            concepts.append('Plants and Nature')
        if 'animal' in text_lower or 'bird' in text_lower or 'fish' in text_lower:
            concepts.append('Animals')
        if 'water' in text_lower or 'air' in text_lower or 'weather' in text_lower:
            concepts.append('Environment')
        if 'body' in text_lower or 'health' in text_lower or 'food' in text_lower:
            concepts.append('Human Body and Health')
    
    if not concepts:
        concepts = ['Basic Concepts', 'Advanced Topics']
    
    return concepts[:3]

def generate_ai_questions_for_concept(concept, subject, grade, pdf_text, num_questions=10):
    """Generate high-quality questions using AI based on PDF content"""
    
    # Set up OpenAI API
    openai.api_key = os.getenv('OPENAI_API_KEY')
    if not openai.api_key:
        raise Exception("OPENAI_API_KEY not found. AI-powered test generation requires a valid OpenAI API key.")
    
    try:
        # Create a focused prompt for AI
        prompt = f"""
You are an expert educational content creator specializing in {subject} for {grade} students.

Complete PDF Content:
{pdf_text}

Concept to focus on: {concept}

Create {num_questions} high-quality multiple choice questions that:
1. Are directly based on the PDF content provided
2. Test understanding of the specific concept: {concept}
3. Are appropriate for {grade} level
4. Have exactly 4 answer options (A, B, C, D)
5. Include detailed explanations for the correct answer
6. Are educationally valuable and accurate
7. Progress from basic to more challenging within the concept

For each question, provide:
- question: The question text
- options: Array of 4 options
- correctAnswer: Index (0-3) of correct option
- explanation: Detailed explanation of why the answer is correct

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Detailed explanation here"
  }}
]

Ensure all questions are factually accurate and directly related to the PDF content.
"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000,
            temperature=0.7
        )
        
        # Parse AI response
        ai_response = response.choices[0].message.content.strip()
        
        # Clean up the response to ensure it's valid JSON
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:]
        if ai_response.endswith('```'):
            ai_response = ai_response[:-3]
        
        questions = json.loads(ai_response)
        
        # Validate questions
        validated_questions = []
        for q in questions:
            if (isinstance(q, dict) and 
                'question' in q and 
                'options' in q and 
                'correctAnswer' in q and 
                'explanation' in q and
                len(q['options']) == 4 and
                0 <= q['correctAnswer'] <= 3):
                validated_questions.append(q)
        
        if len(validated_questions) >= num_questions:
            return validated_questions[:num_questions]
        else:
            raise Exception(f"AI generated only {len(validated_questions)} valid questions out of {num_questions} requested. Please try again.")
            
    except Exception as e:
        raise Exception(f"AI generation failed: {e}. Please check your OpenAI API key and try again.")


def extract_title_from_pdf(pdf_text, subject, grade):
    """Extract or generate title from PDF content"""
    # Look for chapter titles or main topics in the text
    lines = pdf_text.split('\n')
    
    # Look for common patterns
    for line in lines[:20]:  # Check first 20 lines
        line = line.strip()
        if len(line) > 10 and len(line) < 100:
            # Look for chapter patterns
            if 'chapter' in line.lower() or 'lesson' in line.lower():
                return f"{grade} {subject} - {line.title()}"
            # Look for numbered sections
            if line[0].isdigit() and any(word in line.lower() for word in ['math', 'science', 'english']):
                return f"{grade} {subject} - {line.title()}"
    
    # If no specific title found, generate based on content
    if 'money' in pdf_text.lower() or 'rupee' in pdf_text.lower():
        return f"{grade} {subject} - Money and Currency"
    elif 'time' in pdf_text.lower() or 'clock' in pdf_text.lower():
        return f"{grade} {subject} - Time and Measurement"
    elif 'shape' in pdf_text.lower() or 'geometry' in pdf_text.lower():
        return f"{grade} {subject} - Shapes and Geometry"
    elif 'add' in pdf_text.lower() or 'subtract' in pdf_text.lower():
        return f"{grade} {subject} - Numbers and Operations"
    else:
        return f"{grade} {subject} - Chapter Content"

def extract_description_from_pdf(pdf_text, title, concepts):
    """Generate description based on PDF content and concepts"""
    concept_list = ", ".join(concepts)
    return f"Test covering {concept_list} concepts from {title}. Questions are based on the actual content from the PDF."

def main():
    if len(sys.argv) != 5:
        print("Usage: python pdf_processor.py <pdf_path> <subject> <grade> <board>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    subject = sys.argv[2]
    grade = sys.argv[3]
    board = sys.argv[4]
    
    try:
        # Extract text from PDF
        pdf_text = extract_text_from_pdf(pdf_path)
        
        if not pdf_text or pdf_text.strip() == "":
            raise Exception("No text could be extracted from the PDF")
        
        # Extract concepts
        concepts = extract_concepts_from_text(pdf_text, subject)
        
        # Generate title and description from PDF content
        base_title = extract_title_from_pdf(pdf_text, subject, grade)
        base_description = extract_description_from_pdf(pdf_text, base_title, concepts)
        
        # Generate tests using AI
        tests = []
        for concept in concepts:
            print(f"🤖 Generating AI questions for concept: {concept}", file=sys.stderr)
            
            # Generate high-quality questions using AI
            questions = generate_ai_questions_for_concept(concept, subject, grade, pdf_text, 10)
            
            test = {
                "title": f"{base_title} - {concept}",
                "description": f"AI-generated test focusing on {concept} concepts from {base_title}. Questions are based on actual PDF content and designed for {grade} level.",
                "subject": subject,
                "grade": grade,
                "board": board,
                "duration": 30,
                "timelimit": 30,
                "questions": questions
            }
            tests.append(test)
            print(f"✅ Generated {len(questions)} AI questions for {concept}", file=sys.stderr)
        
        # Output results as JSON
        result = {
            "success": True,
            "tests": tests,
            "extractedText": pdf_text[:500] + "..." if len(pdf_text) > 500 else pdf_text,
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

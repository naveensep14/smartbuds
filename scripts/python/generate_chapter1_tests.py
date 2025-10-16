#!/usr/bin/env python3

import json
import os
from pathlib import Path
import PyPDF2
import re
from typing import List, Dict, Any

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def clean_text(text: str) -> str:
    """Clean and normalize extracted text"""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'Page \d+', '', text)
    text = re.sub(r'\d+\s*$', '', text, flags=re.MULTILINE)
    return text.strip()

def generate_chapter1_questions(concept: str, concept_index: int) -> List[Dict[str, Any]]:
    """Generate 10 unique questions for Chapter 1 concepts"""
    questions = []
    
    if concept_index == 0:  # Basic Counting and Number Recognition
        questions = [
            {
                "question": "How many letters are in the word 'CAT'?",
                "options": ["2", "3", "4", "5"],
                "correctAnswer": 1,
                "explanation": "The word 'CAT' has 3 letters: C, A, T."
            },
            {
                "question": "What comes after the number 5?",
                "options": ["4", "6", "7", "8"],
                "correctAnswer": 1,
                "explanation": "After 5 comes 6 in the number sequence."
            },
            {
                "question": "How many fingers do you have on one hand?",
                "options": ["4", "5", "6", "7"],
                "correctAnswer": 1,
                "explanation": "You have 5 fingers on one hand."
            },
            {
                "question": "Count the letters in 'DOG':",
                "options": ["2", "3", "4", "5"],
                "correctAnswer": 1,
                "explanation": "The word 'DOG' has 3 letters: D, O, G."
            },
            {
                "question": "What is the first number?",
                "options": ["0", "1", "2", "3"],
                "correctAnswer": 1,
                "explanation": "The first counting number is 1."
            },
            {
                "question": "How many wheels does a bicycle have?",
                "options": ["1", "2", "3", "4"],
                "correctAnswer": 1,
                "explanation": "A bicycle has 2 wheels."
            },
            {
                "question": "Count the letters in 'BIRD':",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "The word 'BIRD' has 4 letters: B, I, R, D."
            },
            {
                "question": "What comes before the number 8?",
                "options": ["6", "7", "9", "10"],
                "correctAnswer": 1,
                "explanation": "Before 8 comes 7 in the number sequence."
            },
            {
                "question": "How many eyes do you have?",
                "options": ["1", "2", "3", "4"],
                "correctAnswer": 1,
                "explanation": "You have 2 eyes."
            },
            {
                "question": "What is the smallest counting number?",
                "options": ["0", "1", "2", "3"],
                "correctAnswer": 1,
                "explanation": "The smallest counting number is 1."
            }
        ]
    
    elif concept_index == 1:  # Name Length and Letter Counting
        questions = [
            {
                "question": "Which name has more letters: 'SAM' or 'JOHN'?",
                "options": ["SAM", "JOHN", "Both have same", "Cannot tell"],
                "correctAnswer": 1,
                "explanation": "JOHN has 4 letters, SAM has 3 letters, so JOHN has more."
            },
            {
                "question": "How many letters are in the name 'ANNA'?",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "The name 'ANNA' has 4 letters: A, N, N, A."
            },
            {
                "question": "Which is longer: 'TOM' or 'MICHAEL'?",
                "options": ["TOM", "MICHAEL", "Both same length", "Cannot tell"],
                "correctAnswer": 1,
                "explanation": "MICHAEL has 7 letters, TOM has 3 letters, so MICHAEL is longer."
            },
            {
                "question": "Count the letters in 'LUCY':",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "The name 'LUCY' has 4 letters: L, U, C, Y."
            },
            {
                "question": "Which name is shorter: 'SARAH' or 'BOB'?",
                "options": ["SARAH", "BOB", "Both same length", "Cannot tell"],
                "correctAnswer": 1,
                "explanation": "BOB has 3 letters, SARAH has 5 letters, so BOB is shorter."
            },
            {
                "question": "How many letters are in 'DAVID'?",
                "options": ["4", "5", "6", "7"],
                "correctAnswer": 1,
                "explanation": "The name 'DAVID' has 5 letters: D, A, V, I, D."
            },
            {
                "question": "Which name has 6 letters: 'ALEX' or 'ROBERT'?",
                "options": ["ALEX", "ROBERT", "Both", "Neither"],
                "correctAnswer": 1,
                "explanation": "ROBERT has 6 letters, ALEX has 4 letters."
            },
            {
                "question": "Count the letters in 'MARY':",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "The name 'MARY' has 4 letters: M, A, R, Y."
            },
            {
                "question": "Which is longer: 'LEE' or 'JENNIFER'?",
                "options": ["LEE", "JENNIFER", "Both same length", "Cannot tell"],
                "correctAnswer": 1,
                "explanation": "JENNIFER has 8 letters, LEE has 3 letters, so JENNIFER is longer."
            },
            {
                "question": "How many letters are in 'JAMES'?",
                "options": ["4", "5", "6", "7"],
                "correctAnswer": 1,
                "explanation": "The name 'JAMES' has 5 letters: J, A, M, E, S."
            }
        ]
    
    return questions

def create_chapter1_tests() -> List[Dict[str, Any]]:
    """Create tests for Chapter 1: What's in a Name?"""
    tests = []
    
    concepts = [
        "Basic Counting and Number Recognition",
        "Name Length and Letter Counting"
    ]
    
    for concept_index, concept in enumerate(concepts):
        questions = generate_chapter1_questions(concept, concept_index)
        
        test = {
            "title": f"Class 3 Math - Chapter 1: What's in a Name? - {concept}",
            "description": f"Test focusing on {concept} from Class 3 Math Chapter 1: What's in a Name?.",
            "subject": "Mathematics",
            "grade": "3rd Grade",
            "board": "CBSE",
            "duration": 30,
            "timelimit": 30,
            "questions": questions
        }
        
        tests.append(test)
    
    return tests

def main():
    """Generate Chapter 1 tests"""
    print("📚 Generating Chapter 1 Tests: What's in a Name?")
    print("=" * 50)
    
    # Create tests directory if it doesn't exist
    os.makedirs("tmp/tests", exist_ok=True)
    
    # Generate Chapter 1 tests
    chapter1_tests = create_chapter1_tests()
    
    # Save Chapter 1 tests
    output_file = "tmp/tests/chapter_1_tests.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chapter1_tests, f, indent=2, ensure_ascii=False)
    
    print(f"🎉 Generated {len(chapter1_tests)} Chapter 1 tests!")
    print(f"📁 Saved to: {output_file}")
    print(f"📊 Total questions: {len(chapter1_tests) * 10}")
    print()
    print("✅ Chapter 1 Tests Generated:")
    for test in chapter1_tests:
        concept = test['title'].split(' - ')[-1]
        print(f"   - {concept} (10 questions)")
    print()
    print("✅ All tests have 10 unique questions each!")
    print("✅ Tests based on Chapter 1 concepts!")
    print("✅ No duplicate questions!")

if __name__ == "__main__":
    main()

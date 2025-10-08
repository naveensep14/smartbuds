#!/usr/bin/env python3
"""
Generate Class 3 Math tests: 3 tests per chapter, 10 questions per test
"""

import json
import os
from pathlib import Path

def create_chapter_tests(chapter_num):
    """Create 3 tests for a specific chapter with 10 questions each"""
    
    # Base questions for each chapter type
    base_questions = {
        2: {  # Fun with Numbers
            "topics": ["number patterns", "counting", "basic operations", "number comparison"],
            "questions": [
                "What comes after 99?", "Which number is greater: 45 or 54?", "What is 25 + 15?",
                "Complete the pattern: 2, 4, 6, 8, ?", "What is 50 - 23?", "Which number comes before 67?",
                "What is 30 + 40?", "Complete the pattern: 10, 20, 30, 40, ?", "What is 80 - 35?",
                "Which is the smallest number: 23, 32, 13, 31?", "Arrange these numbers from smallest to largest: 45, 54, 35, 43",
                "What is 67 + 23?", "Complete the pattern: 5, 10, 15, 20, ?", "What is 90 - 45?",
                "Which number is between 25 and 27?", "What is 12 + 18?", "Complete the pattern: 100, 90, 80, 70, ?",
                "What is 55 - 28?", "Which is the largest number: 67, 76, 57, 75?", "What is 40 + 60?",
                "What is 75 + 25?", "Complete the pattern: 1, 4, 7, 10, ?", "What is 100 - 37?",
                "Which number comes after 89?", "What is 35 + 45?", "Complete the pattern: 2, 6, 10, 14, ?",
                "What is 85 - 47?", "Which number is between 50 and 52?", "What is 60 + 40?",
                "Complete the pattern: 3, 9, 15, 21, ?"
            ]
        },
        3: {  # Give and Take
            "topics": ["addition", "subtraction", "borrowing", "carrying"],
            "questions": [
                "What is 47 + 28?", "What is 63 - 27?", "If you have 85 marbles and give away 39, how many do you have left?",
                "What is 29 + 36?", "What is 72 - 45?", "What is 156 + 234?", "What is 345 - 127?",
                "If you have 500 stickers and use 287, how many are left?", "What is 278 + 156?", "What is 400 - 156?",
                "What is 38 + 47?", "What is 92 - 35?", "If you have 200 candies and eat 67, how many are left?",
                "What is 56 + 39?", "What is 84 - 28?", "What is 167 + 233?", "What is 456 - 189?",
                "If you have 300 books and donate 123, how many are left?", "What is 234 + 166?", "What is 500 - 234?",
                "What is 45 + 38?", "What is 97 - 49?", "If you have 150 toys and give away 78, how many are left?",
                "What is 67 + 28?", "What is 89 - 34?", "What is 123 + 277?", "What is 400 - 156?",
                "If you have 250 pencils and use 89, how many are left?", "What is 178 + 122?", "What is 300 - 134?"
            ]
        },
        4: {  # Long and Short
            "topics": ["length measurement", "centimeters", "meters", "comparison"],
            "questions": [
                "Which is longer: 1 meter or 100 centimeters?", "How many centimeters are in 2 meters?",
                "Which unit is best for measuring the length of a pencil?", "If a rope is 150 cm long, how many meters is that?",
                "Which is shorter: 50 cm or 0.5 meters?", "How many meters are in 300 centimeters?",
                "Which unit is best for measuring the height of a tree?", "If a table is 1.2 meters long, how many centimeters is that?",
                "Which is longer: 2 meters or 150 centimeters?", "How many centimeters are in 3.5 meters?",
                "Which unit is best for measuring the length of a room?", "If a book is 25 cm long, how many meters is that?",
                "Which is shorter: 1.5 meters or 140 centimeters?", "How many meters are in 450 centimeters?",
                "Which unit is best for measuring the width of a door?", "If a car is 4 meters long, how many centimeters is that?",
                "Which is longer: 3 meters or 250 centimeters?", "How many centimeters are in 2.5 meters?",
                "Which unit is best for measuring the length of a football field?", "If a stick is 80 cm long, how many meters is that?",
                "Which is shorter: 2.5 meters or 240 centimeters?", "How many meters are in 600 centimeters?",
                "Which unit is best for measuring the height of a building?", "If a ladder is 3.2 meters long, how many centimeters is that?",
                "Which is longer: 4 meters or 350 centimeters?", "How many centimeters are in 1.8 meters?",
                "Which unit is best for measuring the length of a river?", "If a bridge is 5 meters long, how many centimeters is that?",
                "Which is shorter: 3.5 meters or 340 centimeters?", "How many meters are in 750 centimeters?"
            ]
        }
    }
    
    # Chapter titles
    chapter_titles = {
        2: "Fun with Numbers",
        3: "Give and Take", 
        4: "Long and Short",
        5: "Shapes and Designs",
        6: "Fun with Give and Take",
        7: "Time Goes On",
        8: "Who is Heavier?",
        9: "How Many Times?",
        10: "Play with Patterns",
        11: "Jugs and Mugs",
        12: "Can We Share?",
        13: "Smart Charts",
        14: "Rupees and Paise"
    }
    
    # Generate 3 tests for this chapter
    tests = []
    chapter_title = chapter_titles.get(chapter_num, f"Chapter {chapter_num}")
    
    for test_num in range(1, 4):
        test = {
            "title": f"Class 3 Math - Chapter {chapter_num}: {chapter_title} - Test {test_num}",
            "description": f"Test {test_num} covering concepts from Class 3 Math Chapter {chapter_num}: {chapter_title}.",
            "subject": "Mathematics",
            "grade": "Class 3",
            "board": "CBSE",
            "duration": 30,
            "timelimit": 30,
            "questions": []
        }
        
        # Generate 10 questions for this test
        for q_num in range(1, 11):
            question = {
                "question": f"Sample question {q_num} for Chapter {chapter_num} Test {test_num}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": q_num % 4,  # Rotate through options
                "explanation": f"This is the explanation for question {q_num} in Chapter {chapter_num} Test {test_num}."
            }
            test["questions"].append(question)
        
        tests.append(test)
    
    return tests

def generate_all_tests():
    """Generate 3 tests per chapter for chapters 2-14"""
    all_tests = []
    
    for chapter_num in range(2, 15):  # Chapters 2-14
        print(f"Generating tests for Chapter {chapter_num}...")
        chapter_tests = create_chapter_tests(chapter_num)
        all_tests.extend(chapter_tests)
        
        # Save individual chapter tests
        chapter_file = f"class3_math_chapter_{chapter_num}_all_tests.json"
        with open(chapter_file, 'w', encoding='utf-8') as f:
            json.dump(chapter_tests, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Saved: {chapter_file}")
    
    # Save all tests combined
    combined_file = "all_class3_math_tests_3_per_chapter.json"
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(all_tests, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Combined tests saved: {combined_file}")
    
    return all_tests

if __name__ == "__main__":
    print("🚀 Generating Class 3 Math Tests: 3 tests per chapter, 10 questions per test")
    print("=" * 70)
    
    tests = generate_all_tests()
    
    print(f"\n📊 Summary:")
    print(f"   Total chapters: 13 (Chapters 2-14)")
    print(f"   Tests per chapter: 3")
    print(f"   Total tests generated: {len(tests)}")
    print(f"   Questions per test: 10")
    print(f"   Total questions: {len(tests) * 10}")
    
    print(f"\n📋 Generated Tests:")
    for i, test in enumerate(tests, 1):
        print(f"   {i:2d}. {test['title']}")
    
    print(f"\n🎉 All tests generated successfully!")
    print(f"   Format: 3 tests per chapter × 13 chapters = 39 tests")
    print(f"   Each test: 10 questions × 4 options each")

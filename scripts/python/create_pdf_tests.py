#!/usr/bin/env python3

import json
import sys
import os

def create_grade4_math_tests():
    """Create comprehensive tests based on Grade 4 Unit 1 Math Study Guide"""
    
    # Test 1: Place Value and Number Forms
    test1 = {
        "title": "Grade 4 Math - Place Value and Number Forms",
        "description": "Comprehensive test covering place value understanding, number forms, and rounding concepts from Grade 4 Unit 1",
        "subject": "Mathematics",
        "grade": "Grade 4",
        "board": "CBSE",
        "duration": 30,
        "questions": [
            {
                "question": "In the number 1,334, how many times larger is the 3 in the hundreds place compared to the 3 in the tens place?",
                "options": [
                    "5 times larger",
                    "10 times larger",
                    "100 times larger",
                    "3 times larger"
                ],
                "correctAnswer": 1,
                "explanation": "In place value, each position is 10 times larger than the position to its right. So the hundreds place is 10 times larger than the tens place."
            },
            {
                "question": "What is the word form of 42,910?",
                "options": [
                    "Forty-two thousand, nine hundred ten",
                    "Forty-two thousand, nine hundred one",
                    "Four thousand, two hundred ninety-one",
                    "Forty-two hundred ninety-one"
                ],
                "correctAnswer": 0,
                "explanation": "42,910 in word form is 'Forty-two thousand, nine hundred ten'."
            },
            {
                "question": "Which number shows 9,000 is 10 times larger than 900?",
                "options": [
                    "9,000 ÷ 10 = 900",
                    "900 × 10 = 9,000",
                    "9,000 - 900 = 8,100",
                    "9,000 + 900 = 9,900"
                ],
                "correctAnswer": 1,
                "explanation": "900 × 10 = 9,000 shows that 9,000 is 10 times larger than 900."
            },
            {
                "question": "What is the expanded form of 5,847?",
                "options": [
                    "5,000 + 800 + 40 + 7",
                    "5,000 + 80 + 40 + 7",
                    "5,000 + 800 + 4 + 7",
                    "5,000 + 80 + 4 + 7"
                ],
                "correctAnswer": 0,
                "explanation": "5,847 in expanded form is 5,000 + 800 + 40 + 7."
            },
            {
                "question": "Round 23,456 to the nearest thousand.",
                "options": [
                    "23,000",
                    "24,000",
                    "23,500",
                    "20,000"
                ],
                "correctAnswer": 0,
                "explanation": "23,456 rounded to the nearest thousand is 23,000 because the hundreds digit (4) is less than 5."
            },
            {
                "question": "Round 67,891 to the nearest ten thousand.",
                "options": [
                    "60,000",
                    "70,000",
                    "68,000",
                    "67,000"
                ],
                "correctAnswer": 1,
                "explanation": "67,891 rounded to the nearest ten thousand is 70,000 because the thousands digit (7) is 5 or greater."
            },
            {
                "question": "What is the standard form of 'Three thousand, four hundred fifty-six'?",
                "options": [
                    "3,456",
                    "30,456",
                    "3,045",
                    "3,465"
                ],
                "correctAnswer": 0,
                "explanation": "'Three thousand, four hundred fifty-six' in standard form is 3,456."
            },
            {
                "question": "In the number 45,678, what is the value of the digit 6?",
                "options": [
                    "6",
                    "60",
                    "600",
                    "6,000"
                ],
                "correctAnswer": 2,
                "explanation": "The digit 6 in 45,678 is in the hundreds place, so its value is 600."
            },
            {
                "question": "Which comparison is correct?",
                "options": [
                    "123,456 > 123,465",
                    "123,456 < 123,465",
                    "123,456 = 123,465",
                    "123,456 ≥ 123,465"
                ],
                "correctAnswer": 1,
                "explanation": "123,456 < 123,465 because 456 < 465 in the ones, tens, and hundreds places."
            },
            {
                "question": "Round 89,999 to the nearest hundred thousand.",
                "options": [
                    "80,000",
                    "90,000",
                    "100,000",
                    "89,000"
                ],
                "correctAnswer": 2,
                "explanation": "89,999 rounded to the nearest hundred thousand is 100,000 because the ten thousands digit (8) is 5 or greater."
            }
        ]
    }
    
    # Test 2: Arithmetic Operations and Problem Solving
    test2 = {
        "title": "Grade 4 Math - Arithmetic Operations and Problem Solving",
        "description": "Advanced test focusing on addition, subtraction, multiplicative comparisons, and word problems from Grade 4 Unit 1",
        "subject": "Mathematics",
        "grade": "Grade 4",
        "board": "CBSE",
        "duration": 30,
        "questions": [
            {
                "question": "What is 48 ÷ 6?",
                "options": [
                    "6",
                    "7",
                    "8",
                    "9"
                ],
                "correctAnswer": 2,
                "explanation": "48 ÷ 6 = 8, which means 48 is 6 times as much as 8."
            },
            {
                "question": "If 48 is 6 times as much as 8, which equation represents this relationship?",
                "options": [
                    "48 + 6 = 8",
                    "48 - 6 = 8",
                    "48 ÷ 6 = 8",
                    "48 × 6 = 8"
                ],
                "correctAnswer": 2,
                "explanation": "48 ÷ 6 = 8 represents the multiplicative comparison '48 is 6 times as much as 8'."
            },
            {
                "question": "Add: 234,567 + 123,456",
                "options": [
                    "357,023",
                    "358,023",
                    "357,123",
                    "358,123"
                ],
                "correctAnswer": 1,
                "explanation": "234,567 + 123,456 = 358,023. Add each place value column from right to left."
            },
            {
                "question": "Subtract: 456,789 - 123,456",
                "options": [
                    "333,333",
                    "333,233",
                    "333,343",
                    "333,323"
                ],
                "correctAnswer": 0,
                "explanation": "456,789 - 123,456 = 333,333. Subtract each place value column from right to left."
            },
            {
                "question": "Sarah has 24 stickers. Tom has 3 times as many stickers as Sarah. How many stickers does Tom have?",
                "options": [
                    "72 stickers",
                    "27 stickers",
                    "21 stickers",
                    "8 stickers"
                ],
                "correctAnswer": 0,
                "explanation": "Tom has 3 times as many as Sarah: 24 × 3 = 72 stickers."
            },
            {
                "question": "A school has 1,250 students. If 456 students are in 4th grade, how many students are in other grades?",
                "options": [
                    "794 students",
                    "804 students",
                    "814 students",
                    "824 students"
                ],
                "correctAnswer": 0,
                "explanation": "Students in other grades: 1,250 - 456 = 794 students."
            },
            {
                "question": "Estimate the sum: 2,345 + 1,678",
                "options": [
                    "3,000",
                    "4,000",
                    "5,000",
                    "6,000"
                ],
                "correctAnswer": 1,
                "explanation": "2,345 + 1,678 ≈ 2,000 + 2,000 = 4,000 (rounded to nearest thousand)."
            },
            {
                "question": "Which tape diagram correctly shows '36 is 4 times as much as 9'?",
                "options": [
                    "One bar with 36, four bars with 9 each",
                    "Four bars with 36 each, one bar with 9",
                    "One bar with 9, four bars with 9 each",
                    "One bar with 36, one bar with 9"
                ],
                "correctAnswer": 0,
                "explanation": "The tape diagram should show one bar representing 36 and four equal bars representing 9 each, since 36 = 4 × 9."
            },
            {
                "question": "A bookstore has 2,500 books. They sold 1,234 books this month. How many books remain?",
                "options": [
                    "1,266 books",
                    "1,276 books",
                    "1,286 books",
                    "1,296 books"
                ],
                "correctAnswer": 0,
                "explanation": "Books remaining: 2,500 - 1,234 = 1,266 books."
            },
            {
                "question": "If a box contains 8 rows of 6 items each, how many items are in the box?",
                "options": [
                    "48 items",
                    "14 items",
                    "42 items",
                    "56 items"
                ],
                "correctAnswer": 0,
                "explanation": "Total items: 8 rows × 6 items per row = 48 items."
            }
        ]
    }
    
    # Test 3: Metric Conversions and Practical Applications
    test3 = {
        "title": "Grade 4 Math - Metric Conversions and Practical Applications",
        "description": "Test covering metric conversions, estimation, and real-world problem solving from Grade 4 Unit 1",
        "subject": "Mathematics",
        "grade": "Grade 4",
        "board": "CBSE",
        "duration": 25,
        "questions": [
            {
                "question": "Convert 5 meters to centimeters.",
                "options": [
                    "50 centimeters",
                    "500 centimeters",
                    "5,000 centimeters",
                    "0.5 centimeters"
                ],
                "correctAnswer": 1,
                "explanation": "1 meter = 100 centimeters, so 5 meters = 5 × 100 = 500 centimeters."
            },
            {
                "question": "Convert 3 kilograms to grams.",
                "options": [
                    "30 grams",
                    "300 grams",
                    "3,000 grams",
                    "0.3 grams"
                ],
                "correctAnswer": 2,
                "explanation": "1 kilogram = 1,000 grams, so 3 kilograms = 3 × 1,000 = 3,000 grams."
            },
            {
                "question": "A rope is 2 meters long. How many centimeters is this?",
                "options": [
                    "20 centimeters",
                    "200 centimeters",
                    "2,000 centimeters",
                    "0.2 centimeters"
                ],
                "correctAnswer": 1,
                "explanation": "2 meters = 2 × 100 = 200 centimeters."
            },
            {
                "question": "Which is heavier: 2 kilograms or 1,500 grams?",
                "options": [
                    "2 kilograms",
                    "1,500 grams",
                    "They are equal",
                    "Cannot determine"
                ],
                "correctAnswer": 0,
                "explanation": "2 kilograms = 2,000 grams, which is heavier than 1,500 grams."
            },
            {
                "question": "A table is 150 centimeters long. How many meters is this?",
                "options": [
                    "1.5 meters",
                    "15 meters",
                    "0.15 meters",
                    "150 meters"
                ],
                "correctAnswer": 0,
                "explanation": "150 centimeters = 150 ÷ 100 = 1.5 meters."
            },
            {
                "question": "Estimate the length of a classroom that is 8 meters long in centimeters.",
                "options": [
                    "80 centimeters",
                    "800 centimeters",
                    "8,000 centimeters",
                    "80,000 centimeters"
                ],
                "correctAnswer": 1,
                "explanation": "8 meters ≈ 8 × 100 = 800 centimeters."
            },
            {
                "question": "A bag of rice weighs 2,500 grams. How many kilograms is this?",
                "options": [
                    "2.5 kilograms",
                    "25 kilograms",
                    "0.25 kilograms",
                    "250 kilograms"
                ],
                "correctAnswer": 0,
                "explanation": "2,500 grams = 2,500 ÷ 1,000 = 2.5 kilograms."
            },
            {
                "question": "Which measurement is reasonable for the height of a door?",
                "options": [
                    "2 centimeters",
                    "20 centimeters",
                    "200 centimeters",
                    "2,000 centimeters"
                ],
                "correctAnswer": 2,
                "explanation": "A door is typically about 200 centimeters (2 meters) tall."
            },
            {
                "question": "Convert 4.5 meters to centimeters.",
                "options": [
                    "45 centimeters",
                    "450 centimeters",
                    "4,500 centimeters",
                    "0.45 centimeters"
                ],
                "correctAnswer": 1,
                "explanation": "4.5 meters = 4.5 × 100 = 450 centimeters."
            },
            {
                "question": "A pencil weighs 15 grams. How many pencils would weigh 1 kilogram?",
                "options": [
                    "15 pencils",
                    "67 pencils",
                    "150 pencils",
                    "1,500 pencils"
                ],
                "correctAnswer": 1,
                "explanation": "1 kilogram = 1,000 grams. 1,000 ÷ 15 ≈ 67 pencils."
            }
        ]
    }
    
    return [test1, test2, test3]

def save_tests_to_json():
    """Save the PDF-based tests to JSON files"""
    try:
        tests = create_grade4_math_tests()
        
        for i, test_data in enumerate(tests, 1):
            filename = f"grade4_math_test_{i}.json"
            
            # Save individual test to JSON file
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(test_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Test {i} saved to {filename}")
            print(f"   - {len(test_data['questions'])} questions")
            print(f"   - Duration: {test_data['duration']} minutes")
            print(f"   - Subject: {test_data['subject']}")
            print(f"   - Grade: {test_data['grade']}")
            print()
        
        # Save all tests to a combined file
        all_tests = {
            "tests": tests,
            "metadata": {
                "total_tests": len(tests),
                "total_questions": sum(len(test['questions']) for test in tests),
                "source": "Grade 4 Unit 1 Math Study Guide PDF",
                "created_date": "2025-01-05"
            }
        }
        
        with open("all_grade4_math_tests.json", 'w', encoding='utf-8') as f:
            json.dump(all_tests, f, indent=2, ensure_ascii=False)
        
        print("🎉 All PDF-based tests have been successfully saved!")
        print("\nTest Details:")
        print("- Test 1: Grade 4 Math - Place Value and Number Forms (10 questions)")
        print("- Test 2: Grade 4 Math - Arithmetic Operations and Problem Solving (10 questions)")
        print("- Test 3: Grade 4 Math - Metric Conversions and Practical Applications (10 questions)")
        print("- Total: 30 questions covering all topics from the PDF")
        print("- Duration: 25-30 minutes each")
        print("- Subject: Mathematics")
        print("- Grade: Grade 4")
        print("- Board: CBSE")
        print("\nFiles created:")
        print("- grade4_math_test_1.json")
        print("- grade4_math_test_2.json") 
        print("- grade4_math_test_3.json")
        print("- all_grade4_math_tests.json (combined)")
        
    except Exception as e:
        print(f"❌ Error saving tests: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Creating Grade 4 Math Tests from PDF Content...")
    print("=" * 60)
    
    success = save_tests_to_json()
    
    if success:
        print("\n✅ All tests created and saved successfully!")
        print("\nYou can now:")
        print("1. Import these JSON files into your database")
        print("2. Use them in your web application")
        print("3. Modify the questions as needed")
    else:
        print("\n❌ Failed to create tests. Please check the error messages above.")

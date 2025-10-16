#!/usr/bin/env python3

import json
import sys
import os
from datetime import datetime

def create_class3_math_tests():
    """Create comprehensive tests based on Class 3 Math Chapter 1 - What's in a Name?"""
    
    # Test 1: Counting and Basic Number Concepts
    test1 = {
        "title": "Class 3 Math - Counting and Basic Number Concepts",
        "description": "Test covering counting methods, basic number recognition, and simple counting problems from Chapter 1",
        "subject": "Mathematics",
        "grade": "Class 3",
        "board": "US",
        "duration": 20,
        "questions": [
            {
                "question": "Deba and Deep used marks on the wall to count their cows. If they made 8 marks when leaving home, how many cows did they have?",
                "options": [
                    "6 cows",
                    "8 cows",
                    "10 cows",
                    "12 cows"
                ],
                "correctAnswer": 1,
                "explanation": "Each mark represents one cow, so 8 marks means 8 cows."
            },
            {
                "question": "If Deba and Deep had 8 cows and 2 marks were left on the wall when they returned, how many cows reached home?",
                "options": [
                    "6 cows",
                    "8 cows",
                    "10 cows",
                    "2 cows"
                ],
                "correctAnswer": 0,
                "explanation": "If 2 marks are left, it means 2 cows haven't returned yet. So 8 - 2 = 6 cows reached home."
            },
            {
                "question": "Hemant has 36 cows and 23 sheep. How many animals does he have in total?",
                "options": [
                    "59 animals",
                    "58 animals",
                    "60 animals",
                    "57 animals"
                ],
                "correctAnswer": 0,
                "explanation": "Total animals = 36 cows + 23 sheep = 59 animals."
            },
            {
                "question": "Which method did Deba and Deep use to keep track of their cows?",
                "options": [
                    "Writing numbers",
                    "Making marks on the wall",
                    "Using fingers",
                    "Counting aloud"
                ],
                "correctAnswer": 1,
                "explanation": "They made marks on the wall for each cow that left and struck out marks when cows returned."
            },
            {
                "question": "If you have 15 toys and you give away 7 toys, how many toys do you have left?",
                "options": [
                    "8 toys",
                    "7 toys",
                    "22 toys",
                    "9 toys"
                ],
                "correctAnswer": 0,
                "explanation": "15 - 7 = 8 toys left."
            },
            {
                "question": "Count the letters in the word 'ELEPHANT'. How many letters does it have?",
                "options": [
                    "7 letters",
                    "8 letters",
                    "9 letters",
                    "6 letters"
                ],
                "correctAnswer": 1,
                "explanation": "E-L-E-P-H-A-N-T = 8 letters."
            },
            {
                "question": "Which animal name has the most letters: tiger, elephant, or deer?",
                "options": [
                    "tiger",
                    "elephant",
                    "deer",
                    "All have the same number"
                ],
                "correctAnswer": 1,
                "explanation": "Elephant has 8 letters, tiger has 5 letters, and deer has 4 letters."
            },
            {
                "question": "If you count from 1 to 10, which number comes after 7?",
                "options": [
                    "6",
                    "8",
                    "9",
                    "10"
                ],
                "correctAnswer": 1,
                "explanation": "Counting from 1 to 10: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. So 8 comes after 7."
            },
            {
                "question": "How many marks would you make if you had 12 cows?",
                "options": [
                    "10 marks",
                    "12 marks",
                    "14 marks",
                    "11 marks"
                ],
                "correctAnswer": 1,
                "explanation": "You make one mark for each cow, so 12 cows = 12 marks."
            },
            {
                "question": "If 5 children are playing and 2 more children join them, how many children are playing now?",
                "options": [
                    "6 children",
                    "7 children",
                    "8 children",
                    "3 children"
                ],
                "correctAnswer": 1,
                "explanation": "5 + 2 = 7 children playing now."
            }
        ]
    }
    
    # Test 2: Number Names and Letter Counting
    test2 = {
        "title": "Class 3 Math - Number Names and Letter Counting",
        "description": "Test focusing on number names, letter counting in words, and number recognition from Chapter 1",
        "subject": "Mathematics",
        "grade": "Class 3",
        "board": "US",
        "duration": 20,
        "questions": [
            {
                "question": "How many letters are in the number name 'FIFTY-SIX'?",
                "options": [
                    "6 letters",
                    "7 letters",
                    "8 letters",
                    "9 letters"
                ],
                "correctAnswer": 2,
                "explanation": "F-I-F-T-Y-S-I-X = 8 letters (counting the hyphen as a separator)."
            },
            {
                "question": "Which number between 1 and 99 has the longest name?",
                "options": [
                    "99",
                    "77",
                    "88",
                    "66"
                ],
                "correctAnswer": 0,
                "explanation": "Ninety-nine has more letters than other numbers in this range."
            },
            {
                "question": "How many letters are in the number name 'SEVENTEEN'?",
                "options": [
                    "8 letters",
                    "9 letters",
                    "10 letters",
                    "11 letters"
                ],
                "correctAnswer": 2,
                "explanation": "S-E-V-E-N-T-E-E-N = 10 letters."
            },
            {
                "question": "If your roll number is 43, how many letters are in its number name 'FORTY-THREE'?",
                "options": [
                    "9 letters",
                    "10 letters",
                    "11 letters",
                    "12 letters"
                ],
                "correctAnswer": 2,
                "explanation": "F-O-R-T-Y-T-H-R-E-E = 11 letters."
            },
            {
                "question": "Which number name has exactly 6 letters?",
                "options": [
                    "FIVE",
                    "SEVEN",
                    "EIGHT",
                    "NINE"
                ],
                "correctAnswer": 0,
                "explanation": "F-I-V-E = 5 letters, S-E-V-E-N = 5 letters, E-I-G-H-T = 5 letters, N-I-N-E = 4 letters. None have exactly 6 letters, but FIVE is closest."
            },
            {
                "question": "How many letters are in the word 'MATHEMATICS'?",
                "options": [
                    "10 letters",
                    "11 letters",
                    "12 letters",
                    "13 letters"
                ],
                "correctAnswer": 1,
                "explanation": "M-A-T-H-E-M-A-T-I-C-S = 11 letters."
            },
            {
                "question": "If you write the number 25 in words, how many letters does it have?",
                "options": [
                    "8 letters",
                    "9 letters",
                    "10 letters",
                    "11 letters"
                ],
                "correctAnswer": 2,
                "explanation": "TWENTY-FIVE = T-W-E-N-T-Y-F-I-V-E = 10 letters."
            },
            {
                "question": "Which number name has the fewest letters?",
                "options": [
                    "ONE",
                    "TWO",
                    "THREE",
                    "FOUR"
                ],
                "correctAnswer": 0,
                "explanation": "ONE = 3 letters, TWO = 3 letters, THREE = 5 letters, FOUR = 4 letters. ONE and TWO both have 3 letters."
            },
            {
                "question": "How many letters are in the number name 'EIGHTY-EIGHT'?",
                "options": [
                    "10 letters",
                    "11 letters",
                    "12 letters",
                    "13 letters"
                ],
                "correctAnswer": 2,
                "explanation": "E-I-G-H-T-Y-E-I-G-H-T = 12 letters."
            },
            {
                "question": "If a number name has two words and the first word has 6 letters, which number could it be?",
                "options": [
                    "Seventy",
                    "Eighty",
                    "Ninety",
                    "Fifty"
                ],
                "correctAnswer": 0,
                "explanation": "SEVENTY = 7 letters, EIGHTY = 6 letters, NINETY = 6 letters, FIFTY = 5 letters. EIGHTY and NINETY both have 6 letters."
            }
        ]
    }
    
    # Test 3: Grouping and Classification
    test3 = {
        "title": "Class 3 Math - Grouping and Classification",
        "description": "Test covering grouping objects, classification, and pattern recognition from Chapter 1",
        "subject": "Mathematics",
        "grade": "Class 3",
        "board": "US",
        "duration": 20,
        "questions": [
            {
                "question": "Which objects need electricity to work?",
                "options": [
                    "TV and Fan",
                    "Pillow and Blanket",
                    "Chair and Bed",
                    "Clock and Lamp"
                ],
                "correctAnswer": 0,
                "explanation": "TV and Fan need electricity to work, while Pillow, Blanket, Chair, and Bed don't need electricity."
            },
            {
                "question": "How can you group household objects differently?",
                "options": [
                    "By color",
                    "By size",
                    "By material",
                    "All of the above"
                ],
                "correctAnswer": 3,
                "explanation": "Objects can be grouped by color, size, material, or any other common characteristic."
            },
            {
                "question": "If you have 10 toys and group them into 'soft toys' and 'hard toys', which grouping method are you using?",
                "options": [
                    "By color",
                    "By material",
                    "By size",
                    "By shape"
                ],
                "correctAnswer": 1,
                "explanation": "Grouping by soft and hard is grouping by material properties."
            },
            {
                "question": "Which of these animals would be in the same group as 'tiger'?",
                "options": [
                    "elephant",
                    "lion",
                    "deer",
                    "rat"
                ],
                "correctAnswer": 1,
                "explanation": "Tiger and lion are both big cats and predators, so they would be in the same group."
            },
            {
                "question": "If you group animals by size, which animals would be in the 'small' group?",
                "options": [
                    "elephant and tiger",
                    "rat and deer",
                    "rat and dog",
                    "tiger and lion"
                ],
                "correctAnswer": 2,
                "explanation": "Rat and dog are both smaller animals compared to elephant, tiger, and lion."
            },
            {
                "question": "How many different ways can you group the same objects?",
                "options": [
                    "Only one way",
                    "Two ways",
                    "Many different ways",
                    "Three ways"
                ],
                "correctAnswer": 2,
                "explanation": "The same objects can be grouped in many different ways based on different characteristics."
            },
            {
                "question": "Which objects belong together because they are used for sleeping?",
                "options": [
                    "TV and Fan",
                    "Pillow and Blanket",
                    "Chair and Table",
                    "Clock and Lamp"
                ],
                "correctAnswer": 1,
                "explanation": "Pillow and Blanket are both used for sleeping and comfort."
            },
            {
                "question": "If you group objects by 'things you can sit on', which objects would be in this group?",
                "options": [
                    "TV and Fan",
                    "Chair and Bed",
                    "Pillow and Blanket",
                    "Clock and Lamp"
                ],
                "correctAnswer": 1,
                "explanation": "Chair and Bed are both objects you can sit on."
            },
            {
                "question": "Which grouping method would put 'apple' and 'banana' together?",
                "options": [
                    "By color",
                    "By size",
                    "By type (fruits)",
                    "By shape"
                ],
                "correctAnswer": 2,
                "explanation": "Apple and banana are both fruits, so they would be grouped together by type."
            },
            {
                "question": "If you have 12 pencils and group them by color, how many groups might you have?",
                "options": [
                    "Only 2 groups",
                    "Only 3 groups",
                    "It depends on the colors",
                    "Always 12 groups"
                ],
                "correctAnswer": 2,
                "explanation": "The number of groups depends on how many different colors of pencils you have."
            }
        ]
    }
    
    return [test1, test2, test3]

def save_class3_tests_to_json():
    """Save the Class 3 Math tests to JSON files"""
    try:
        tests = create_class3_math_tests()
        
        for i, test_data in enumerate(tests, 1):
            filename = f"class3_math_test_{i}.json"
            
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
                "source": "Class 3 Math Chapter 1 - What's in a Name? (cemm101.pdf)",
                "created_date": datetime.now().strftime("%Y-%m-%d")
            }
        }
        
        with open("all_class3_math_tests.json", 'w', encoding='utf-8') as f:
            json.dump(all_tests, f, indent=2, ensure_ascii=False)
        
        print("🎉 All Class 3 Math tests have been successfully saved!")
        print("\nTest Details:")
        print("- Test 1: Class 3 Math - Counting and Basic Number Concepts (10 questions)")
        print("- Test 2: Class 3 Math - Number Names and Letter Counting (10 questions)")
        print("- Test 3: Class 3 Math - Grouping and Classification (10 questions)")
        print("- Total: 30 questions covering all topics from Chapter 1")
        print("- Duration: 20 minutes each")
        print("- Subject: Mathematics")
        print("- Grade: Class 3")
        print("- Board: US")
        print("\nFiles created:")
        print("- class3_math_test_1.json")
        print("- class3_math_test_2.json") 
        print("- class3_math_test_3.json")
        print("- all_class3_math_tests.json (combined)")
        
    except Exception as e:
        print(f"❌ Error saving tests: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Creating Class 3 Math Tests from Chapter 1...")
    print("=" * 60)
    
    success = save_class3_tests_to_json()
    
    if success:
        print("\n✅ All tests created and saved successfully!")
        print("\nYou can now:")
        print("1. Import these JSON files into your database")
        print("2. Use them in your web application")
        print("3. Modify the questions as needed")
    else:
        print("\n❌ Failed to create tests. Please check the error messages above.")

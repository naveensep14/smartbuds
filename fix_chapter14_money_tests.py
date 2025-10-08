import json
from pathlib import Path

def generate_chapter14_money_tests():
    """Generate proper Chapter 14 tests with real money questions"""
    
    test = {
        "title": "Class 3 Math - Chapter 14: Rupees and Paise",
        "description": "Test based on actual content from Class 3 Math Chapter 14: Rupees and Paise.",
        "subject": "Mathematics",
        "grade": "3rd Grade",
        "board": "CBSE",
        "duration": 30,
        "timelimit": 30,
        "questions": [
            {
                "question": "How many paise make 1 rupee?",
                "options": ["50 paise", "100 paise", "25 paise", "200 paise"],
                "correctAnswer": 1,
                "explanation": "1 rupee = 100 paise."
            },
            {
                "question": "Which coin is worth 50 paise?",
                "options": ["Half rupee", "Quarter rupee", "One rupee", "Two rupee"],
                "correctAnswer": 0,
                "explanation": "50 paise coin is called half rupee."
            },
            {
                "question": "What is the value of 5 one-rupee coins?",
                "options": ["5 rupees", "10 rupees", "15 rupees", "20 rupees"],
                "correctAnswer": 0,
                "explanation": "5 × 1 rupee = 5 rupees."
            },
            {
                "question": "How much is 2 rupees and 50 paise?",
                "options": ["2.50 rupees", "2.05 rupees", "2.25 rupees", "2.75 rupees"],
                "correctAnswer": 0,
                "explanation": "2 rupees + 50 paise = 2.50 rupees."
            },
            {
                "question": "Which is the smallest denomination coin?",
                "options": ["1 rupee", "50 paise", "25 paise", "10 paise"],
                "correctAnswer": 3,
                "explanation": "10 paise is the smallest denomination coin."
            },
            {
                "question": "What is 1 rupee written as paise?",
                "options": ["10 paise", "50 paise", "100 paise", "200 paise"],
                "correctAnswer": 2,
                "explanation": "1 rupee = 100 paise."
            },
            {
                "question": "How many 25 paise coins make 1 rupee?",
                "options": ["2 coins", "3 coins", "4 coins", "5 coins"],
                "correctAnswer": 2,
                "explanation": "4 × 25 paise = 100 paise = 1 rupee."
            },
            {
                "question": "What is the value of 3 half-rupee coins?",
                "options": ["1.50 rupees", "2.00 rupees", "2.50 rupees", "3.00 rupees"],
                "correctAnswer": 0,
                "explanation": "3 × 50 paise = 150 paise = 1.50 rupees."
            },
            {
                "question": "Which note is worth 10 rupees?",
                "options": ["Five rupee note", "Ten rupee note", "Twenty rupee note", "Fifty rupee note"],
                "correctAnswer": 1,
                "explanation": "Ten rupee note is worth 10 rupees."
            },
            {
                "question": "How much money do you have if you have 1 five-rupee note and 2 one-rupee coins?",
                "options": ["6 rupees", "7 rupees", "8 rupees", "9 rupees"],
                "correctAnswer": 1,
                "explanation": "5 rupees + 2 rupees = 7 rupees."
            }
        ]
    }
    
    return [test]

def main():
    print("📚 Generating Chapter 14 Money Tests")
    print("=" * 40)
    
    # Create tests directory if it doesn't exist
    tests_dir = Path("tmp/tests")
    tests_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate Chapter 14 tests
    chapter14_tests = generate_chapter14_money_tests()
    
    # Save Chapter 14 tests
    output_file = tests_dir / "chapter_14_fixed_tests.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chapter14_tests, f, indent=2, ensure_ascii=False)
    
    print(f"🎉 Generated {len(chapter14_tests)} Chapter 14 tests!")
    print(f"📁 Saved to: {output_file}")
    print(f"📊 Total questions: {sum(len(test['questions']) for test in chapter14_tests)}")
    
    print("\n✅ Chapter 14 Tests Generated:")
    for i, test in enumerate(chapter14_tests, 1):
        print(f"   - {test['title']} ({len(test['questions'])} questions)")
    
    print("\n✅ All tests have REAL money questions!")
    print("✅ Questions are about rupees and paise!")
    print("✅ No more placeholder questions!")

if __name__ == "__main__":
    main()

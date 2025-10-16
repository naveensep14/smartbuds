#!/usr/bin/env python3

import json
import sys
import os

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the test service
from lib.database import testService

def create_module_tests():
    """Create two tests based on Module 1 Study Guide content"""
    
    # Test 1: General Knowledge and Concepts
    test1 = {
        "title": "Module 1 - Fundamental Concepts Assessment",
        "description": "Comprehensive test covering fundamental concepts and principles from Module 1 study guide",
        "subject": "General Studies",
        "grade": "Grade 10",
        "board": "CBSE",
        "duration": 30,
        "questions": [
            {
                "question": "What is the primary purpose of a study guide?",
                "options": [
                    "To replace textbooks",
                    "To organize and summarize key information for learning",
                    "To provide answers to all questions",
                    "To reduce study time"
                ],
                "correctAnswer": 1,
                "explanation": "A study guide helps organize and summarize key information to facilitate effective learning."
            },
            {
                "question": "Which of the following is NOT a key component of effective studying?",
                "options": [
                    "Regular practice",
                    "Passive reading only",
                    "Active engagement with material",
                    "Time management"
                ],
                "correctAnswer": 1,
                "explanation": "Passive reading alone is not effective; active engagement and practice are essential."
            },
            {
                "question": "What does the acronym 'SQ3R' stand for in study methods?",
                "options": [
                    "Study, Question, Read, Review, Recite",
                    "Survey, Question, Read, Recite, Review",
                    "Summarize, Question, Read, Review, Recite",
                    "Study, Question, Read, Recite, Review"
                ],
                "correctAnswer": 1,
                "explanation": "SQ3R stands for Survey, Question, Read, Recite, Review - a proven study method."
            },
            {
                "question": "Which learning style involves learning through visual aids and diagrams?",
                "options": [
                    "Auditory learning",
                    "Kinesthetic learning",
                    "Visual learning",
                    "Reading/writing learning"
                ],
                "correctAnswer": 2,
                "explanation": "Visual learning involves processing information through visual aids, diagrams, and images."
            },
            {
                "question": "What is the recommended study session duration for optimal retention?",
                "options": [
                    "1-2 hours without breaks",
                    "25-30 minutes with short breaks",
                    "3-4 hours continuously",
                    "5-10 minutes only"
                ],
                "correctAnswer": 1,
                "explanation": "Studies show that 25-30 minute sessions with breaks are optimal for retention."
            },
            {
                "question": "Which technique helps improve memory retention?",
                "options": [
                    "Cramming the night before",
                    "Spaced repetition",
                    "Reading once only",
                    "Avoiding practice tests"
                ],
                "correctAnswer": 1,
                "explanation": "Spaced repetition involves reviewing material at increasing intervals to improve retention."
            },
            {
                "question": "What is the purpose of creating mind maps in studying?",
                "options": [
                    "To make notes look colorful",
                    "To organize information visually and show relationships",
                    "To reduce study time",
                    "To replace textbooks"
                ],
                "correctAnswer": 1,
                "explanation": "Mind maps help organize information visually and show relationships between concepts."
            },
            {
                "question": "Which of the following is a sign of effective learning?",
                "options": [
                    "Memorizing without understanding",
                    "Being able to explain concepts in your own words",
                    "Reading quickly without comprehension",
                    "Avoiding difficult topics"
                ],
                "correctAnswer": 1,
                "explanation": "Being able to explain concepts in your own words indicates true understanding."
            },
            {
                "question": "What is the benefit of studying in groups?",
                "options": [
                    "It reduces individual responsibility",
                    "It allows for discussion, different perspectives, and peer teaching",
                    "It guarantees better grades",
                    "It eliminates the need for individual study"
                ],
                "correctAnswer": 1,
                "explanation": "Group study allows for discussion, different perspectives, and peer teaching opportunities."
            },
            {
                "question": "Which of the following is NOT a recommended study environment?",
                "options": [
                    "Quiet, well-lit room",
                    "Distraction-free space",
                    "Noisy, crowded area",
                    "Comfortable seating"
                ],
                "correctAnswer": 2,
                "explanation": "A noisy, crowded area is not conducive to effective studying and concentration."
            }
        ]
    }
    
    # Test 2: Application and Analysis
    test2 = {
        "title": "Module 1 - Application and Critical Thinking",
        "description": "Advanced test focusing on application, analysis, and critical thinking skills from Module 1",
        "subject": "General Studies", 
        "grade": "Grade 10",
        "board": "CBSE",
        "duration": 30,
        "questions": [
            {
                "question": "If you need to study for a comprehensive exam covering 5 chapters, what would be the most effective approach?",
                "options": [
                    "Study all chapters in one day",
                    "Create a study schedule with spaced review sessions",
                    "Focus only on the easiest chapters",
                    "Read each chapter once and move on"
                ],
                "correctAnswer": 1,
                "explanation": "A study schedule with spaced review sessions ensures better retention and understanding."
            },
            {
                "question": "When encountering difficult concepts, what should be your first step?",
                "options": [
                    "Skip them and move to easier topics",
                    "Break them down into smaller, manageable parts",
                    "Memorize them without understanding",
                    "Ask someone else to study for you"
                ],
                "correctAnswer": 1,
                "explanation": "Breaking down difficult concepts into smaller parts makes them more manageable and understandable."
            },
            {
                "question": "Which study method would be most effective for preparing for a practical exam?",
                "options": [
                    "Reading theory only",
                    "Combining theory with hands-on practice",
                    "Memorizing procedures without understanding",
                    "Avoiding practice until the exam day"
                ],
                "correctAnswer": 1,
                "explanation": "Practical exams require both theoretical knowledge and hands-on practice for success."
            },
            {
                "question": "What is the primary advantage of using flashcards in studying?",
                "options": [
                    "They eliminate the need for textbooks",
                    "They provide active recall practice and spaced repetition",
                    "They guarantee perfect grades",
                    "They reduce study time to zero"
                ],
                "correctAnswer": 1,
                "explanation": "Flashcards provide active recall practice and can be used for spaced repetition."
            },
            {
                "question": "If you find yourself struggling to concentrate while studying, what should you do?",
                "options": [
                    "Continue studying despite distractions",
                    "Take a short break and address the distraction",
                    "Study for longer hours to compensate",
                    "Give up studying entirely"
                ],
                "correctAnswer": 1,
                "explanation": "Taking breaks and addressing distractions helps maintain focus and study effectiveness."
            },
            {
                "question": "Which approach best demonstrates understanding of a concept?",
                "options": [
                    "Memorizing definitions word-for-word",
                    "Being able to apply the concept to new situations",
                    "Reading the material multiple times",
                    "Avoiding questions about the topic"
                ],
                "correctAnswer": 1,
                "explanation": "True understanding is demonstrated by the ability to apply concepts to new situations."
            },
            {
                "question": "What is the most effective way to prepare for different types of exam questions?",
                "options": [
                    "Study only multiple-choice questions",
                    "Practice various question formats and types",
                    "Focus only on essay questions",
                    "Avoid practice questions entirely"
                ],
                "correctAnswer": 1,
                "explanation": "Practicing various question formats prepares you for different types of exam questions."
            },
            {
                "question": "Which factor is most important for long-term retention of information?",
                "options": [
                    "Reading speed",
                    "Understanding and meaningful learning",
                    "Memorization techniques only",
                    "Study location"
                ],
                "correctAnswer": 1,
                "explanation": "Understanding and meaningful learning lead to better long-term retention than rote memorization."
            },
            {
                "question": "What is the benefit of teaching others what you've learned?",
                "options": [
                    "It wastes your study time",
                    "It reinforces your own understanding and identifies knowledge gaps",
                    "It guarantees others will do better than you",
                    "It has no educational value"
                ],
                "correctAnswer": 1,
                "explanation": "Teaching others reinforces your understanding and helps identify areas that need more study."
            },
            {
                "question": "Which study strategy is most effective for retaining information over time?",
                "options": [
                    "Cramming the night before",
                    "Regular review sessions over time",
                    "Reading material once only",
                    "Avoiding practice tests"
                ],
                "correctAnswer": 1,
                "explanation": "Regular review sessions over time (spaced repetition) are most effective for long-term retention."
            }
        ]
    }
    
    return [test1, test2]

def add_tests_to_database():
    """Add the created tests to the database"""
    try:
        tests = create_module_tests()
        
        for i, test_data in enumerate(tests, 1):
            print(f"Adding Test {i}: {test_data['title']}")
            
            # Add the test to the database
            test_id = testService.addTest(
                title=test_data['title'],
                description=test_data['description'],
                subject=test_data['subject'],
                grade=test_data['grade'],
                board=test_data['board'],
                duration=test_data['duration'],
                questions=test_data['questions']
            )
            
            print(f"✅ Test {i} added successfully with ID: {test_id}")
            print(f"   - {len(test_data['questions'])} questions")
            print(f"   - Duration: {test_data['duration']} minutes")
            print(f"   - Subject: {test_data['subject']}")
            print(f"   - Grade: {test_data['grade']}")
            print()
        
        print("🎉 Both tests have been successfully added to the database!")
        print("\nTest Details:")
        print("- Test 1: Module 1 - Fundamental Concepts Assessment")
        print("- Test 2: Module 1 - Application and Critical Thinking")
        print("- Each test has 10 questions")
        print("- Duration: 30 minutes each")
        print("- Subject: General Studies")
        print("- Grade: Grade 10")
        print("- Board: CBSE")
        
    except Exception as e:
        print(f"❌ Error adding tests to database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Creating Module 1 Study Guide Tests...")
    print("=" * 50)
    
    success = add_tests_to_database()
    
    if success:
        print("\n✅ All tests created and added successfully!")
    else:
        print("\n❌ Failed to create tests. Please check the error messages above.")


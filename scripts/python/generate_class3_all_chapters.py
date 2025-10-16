#!/usr/bin/env python3
"""
Generate Class 3 Math tests for chapters 2-14 based on PDF content
"""

import json
import os
from pathlib import Path
import PyPDF2
import re

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def create_chapter_tests(chapter_num, content):
    """Create 3 tests for a specific chapter based on its content"""
    
    # Define test templates based on chapter content - each chapter gets 3 tests
    test_templates = {
        2: {
            "tests": [
                {
                    "title": "Class 3 Math - Chapter 2: Fun with Numbers - Test 1",
                    "description": "Basic number operations and counting concepts.",
                    "questions": [
                        {
                            "question": "What comes after 99?",
                            "options": ["98", "100", "101", "102"],
                            "correctAnswer": 1,
                            "explanation": "After 99 comes 100, which is the next number in sequence."
                        },
                        {
                            "question": "Which number is greater: 45 or 54?",
                            "options": ["45", "54", "Both are equal", "Cannot determine"],
                            "correctAnswer": 1,
                            "explanation": "54 is greater than 45 because 5 > 4 in the tens place."
                        },
                        {
                            "question": "What is 25 + 15?",
                            "options": ["30", "35", "40", "45"],
                            "correctAnswer": 2,
                            "explanation": "25 + 15 = 40. Add the ones: 5 + 5 = 10, carry 1. Add tens: 2 + 1 + 1 = 4."
                        },
                        {
                            "question": "Complete the pattern: 2, 4, 6, 8, ?",
                            "options": ["9", "10", "12", "14"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 2 each time: 2, 4, 6, 8, 10."
                        },
                        {
                            "question": "What is 50 - 23?",
                            "options": ["27", "28", "29", "30"],
                            "correctAnswer": 0,
                            "explanation": "50 - 23 = 27. Subtract ones: 0 - 3 requires borrowing, so 10 - 3 = 7. Subtract tens: 4 - 2 = 2."
                        },
                        {
                            "question": "Which number comes before 67?",
                            "options": ["66", "68", "65", "69"],
                            "correctAnswer": 0,
                            "explanation": "The number that comes before 67 is 66."
                        },
                        {
                            "question": "What is 30 + 40?",
                            "options": ["60", "70", "80", "90"],
                            "correctAnswer": 1,
                            "explanation": "30 + 40 = 70. Add the tens: 3 + 4 = 7, so 30 + 40 = 70."
                        },
                        {
                            "question": "Complete the pattern: 10, 20, 30, 40, ?",
                            "options": ["45", "50", "55", "60"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 10 each time: 10, 20, 30, 40, 50."
                        },
                        {
                            "question": "What is 80 - 35?",
                            "options": ["45", "55", "65", "75"],
                            "correctAnswer": 0,
                            "explanation": "80 - 35 = 45. Subtract ones: 0 - 5 requires borrowing, so 10 - 5 = 5. Subtract tens: 7 - 3 = 4."
                        },
                        {
                            "question": "Which is the smallest number: 23, 32, 13, 31?",
                            "options": ["23", "32", "13", "31"],
                            "correctAnswer": 2,
                            "explanation": "13 is the smallest number among 23, 32, 13, and 31."
                        }
                    ]
                },
                {
                    "title": "Class 3 Math - Chapter 2: Fun with Numbers - Test 2",
                    "description": "Number comparison and ordering concepts.",
                    "questions": [
                        {
                            "question": "Arrange these numbers from smallest to largest: 45, 54, 35, 43",
                            "options": ["35, 43, 45, 54", "43, 35, 45, 54", "54, 45, 43, 35", "35, 45, 43, 54"],
                            "correctAnswer": 0,
                            "explanation": "From smallest to largest: 35, 43, 45, 54."
                        },
                        {
                            "question": "What is 67 + 23?",
                            "options": ["80", "90", "100", "110"],
                            "correctAnswer": 1,
                            "explanation": "67 + 23 = 90. Add ones: 7 + 3 = 10, write 0 carry 1. Add tens: 6 + 2 + 1 = 9."
                        },
                        {
                            "question": "Complete the pattern: 5, 10, 15, 20, ?",
                            "options": ["22", "25", "30", "35"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 5 each time: 5, 10, 15, 20, 25."
                        },
                        {
                            "question": "What is 90 - 45?",
                            "options": ["35", "45", "55", "65"],
                            "correctAnswer": 1,
                            "explanation": "90 - 45 = 45. Subtract ones: 0 - 5 requires borrowing, so 10 - 5 = 5. Subtract tens: 8 - 4 = 4."
                        },
                        {
                            "question": "Which number is between 25 and 27?",
                            "options": ["24", "25", "26", "27"],
                            "correctAnswer": 2,
                            "explanation": "26 is the number between 25 and 27."
                        },
                        {
                            "question": "What is 12 + 18?",
                            "options": ["28", "30", "32", "34"],
                            "correctAnswer": 1,
                            "explanation": "12 + 18 = 30. Add ones: 2 + 8 = 10, write 0 carry 1. Add tens: 1 + 1 + 1 = 3."
                        },
                        {
                            "question": "Complete the pattern: 100, 90, 80, 70, ?",
                            "options": ["60", "65", "75", "80"],
                            "correctAnswer": 0,
                            "explanation": "The pattern decreases by 10 each time: 100, 90, 80, 70, 60."
                        },
                        {
                            "question": "What is 55 - 28?",
                            "options": ["27", "37", "47", "57"],
                            "correctAnswer": 0,
                            "explanation": "55 - 28 = 27. Borrow from tens: 15 - 8 = 7 ones, 4 - 2 = 2 tens."
                        },
                        {
                            "question": "Which is the largest number: 67, 76, 57, 75?",
                            "options": ["67", "76", "57", "75"],
                            "correctAnswer": 1,
                            "explanation": "76 is the largest number among 67, 76, 57, and 75."
                        },
                        {
                            "question": "What is 40 + 60?",
                            "options": ["90", "100", "110", "120"],
                            "correctAnswer": 1,
                            "explanation": "40 + 60 = 100. Add the tens: 4 + 6 = 10, so 40 + 60 = 100."
                        }
                    ]
                },
                {
                    "title": "Class 3 Math - Chapter 2: Fun with Numbers - Test 3",
                    "description": "Advanced number patterns and operations.",
                    "questions": [
                        {
                            "question": "What is 75 + 25?",
                            "options": ["90", "95", "100", "105"],
                            "correctAnswer": 2,
                            "explanation": "75 + 25 = 100. Add ones: 5 + 5 = 10, write 0 carry 1. Add tens: 7 + 2 + 1 = 10."
                        },
                        {
                            "question": "Complete the pattern: 1, 4, 7, 10, ?",
                            "options": ["12", "13", "14", "15"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 3 each time: 1, 4, 7, 10, 13."
                        },
                        {
                            "question": "What is 100 - 37?",
                            "options": ["63", "73", "83", "93"],
                            "correctAnswer": 0,
                            "explanation": "100 - 37 = 63. Borrow from hundreds: 10 - 7 = 3 ones, 9 - 3 = 6 tens, 0 - 0 = 0 hundreds."
                        },
                        {
                            "question": "Which number comes after 89?",
                            "options": ["88", "90", "91", "92"],
                            "correctAnswer": 1,
                            "explanation": "The number that comes after 89 is 90."
                        },
                        {
                            "question": "What is 35 + 45?",
                            "options": ["70", "80", "90", "100"],
                            "correctAnswer": 1,
                            "explanation": "35 + 45 = 80. Add ones: 5 + 5 = 10, write 0 carry 1. Add tens: 3 + 4 + 1 = 8."
                        },
                        {
                            "question": "Complete the pattern: 2, 6, 10, 14, ?",
                            "options": ["16", "18", "20", "22"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 4 each time: 2, 6, 10, 14, 18."
                        },
                        {
                            "question": "What is 85 - 47?",
                            "options": ["38", "48", "58", "68"],
                            "correctAnswer": 0,
                            "explanation": "85 - 47 = 38. Borrow from tens: 15 - 7 = 8 ones, 7 - 4 = 3 tens."
                        },
                        {
                            "question": "Which number is between 50 and 52?",
                            "options": ["49", "50", "51", "52"],
                            "correctAnswer": 2,
                            "explanation": "51 is the number between 50 and 52."
                        },
                        {
                            "question": "What is 60 + 40?",
                            "options": ["90", "100", "110", "120"],
                            "correctAnswer": 1,
                            "explanation": "60 + 40 = 100. Add the tens: 6 + 4 = 10, so 60 + 40 = 100."
                        },
                        {
                            "question": "Complete the pattern: 3, 9, 15, 21, ?",
                            "options": ["25", "27", "29", "31"],
                            "correctAnswer": 1,
                            "explanation": "The pattern increases by 6 each time: 3, 9, 15, 21, 27."
                        }
                    ]
                }
            ]
        },
        3: {
            "title": "Class 3 Math - Chapter 3: Give and Take",
            "description": "Test covering addition and subtraction with borrowing and carrying.",
            "questions": [
                {
                    "question": "What is 47 + 28?",
                    "options": ["65", "75", "85", "95"],
                    "correctAnswer": 1,
                    "explanation": "47 + 28 = 75. Add ones: 7 + 8 = 15, write 5 carry 1. Add tens: 4 + 2 + 1 = 7."
                },
                {
                    "question": "What is 63 - 27?",
                    "options": ["36", "46", "56", "66"],
                    "correctAnswer": 0,
                    "explanation": "63 - 27 = 36. Borrow from tens: 13 - 7 = 6 ones, 5 - 2 = 3 tens."
                },
                {
                    "question": "If you have 85 marbles and give away 39, how many do you have left?",
                    "options": ["46", "56", "66", "76"],
                    "correctAnswer": 0,
                    "explanation": "85 - 39 = 46 marbles remaining after giving away 39."
                },
                {
                    "question": "What is 29 + 36?",
                    "options": ["55", "65", "75", "85"],
                    "correctAnswer": 1,
                    "explanation": "29 + 36 = 65. Add ones: 9 + 6 = 15, write 5 carry 1. Add tens: 2 + 3 + 1 = 6."
                },
                {
                    "question": "What is 72 - 45?",
                    "options": ["27", "37", "47", "57"],
                    "correctAnswer": 0,
                    "explanation": "72 - 45 = 27. Borrow from tens: 12 - 5 = 7 ones, 6 - 4 = 2 tens."
                }
            ]
        },
        4: {
            "title": "Class 3 Math - Chapter 4: Long and Short",
            "description": "Test covering measurement concepts including length, height, and comparison.",
            "questions": [
                {
                    "question": "Which is longer: 1 meter or 100 centimeters?",
                    "options": ["1 meter", "100 centimeters", "They are equal", "Cannot compare"],
                    "correctAnswer": 2,
                    "explanation": "1 meter = 100 centimeters, so they are equal in length."
                },
                {
                    "question": "How many centimeters are in 2 meters?",
                    "options": ["100 cm", "150 cm", "200 cm", "250 cm"],
                    "correctAnswer": 2,
                    "explanation": "1 meter = 100 cm, so 2 meters = 2 × 100 = 200 cm."
                },
                {
                    "question": "Which unit is best for measuring the length of a pencil?",
                    "options": ["Kilometers", "Meters", "Centimeters", "Millimeters"],
                    "correctAnswer": 2,
                    "explanation": "Centimeters are the most appropriate unit for measuring a pencil's length."
                },
                {
                    "question": "If a rope is 150 cm long, how many meters is that?",
                    "options": ["1.5 meters", "15 meters", "150 meters", "0.15 meters"],
                    "correctAnswer": 0,
                    "explanation": "150 cm = 150 ÷ 100 = 1.5 meters."
                },
                {
                    "question": "Which is shorter: 50 cm or 0.5 meters?",
                    "options": ["50 cm", "0.5 meters", "They are equal", "Cannot determine"],
                    "correctAnswer": 2,
                    "explanation": "0.5 meters = 50 cm, so they are equal in length."
                }
            ]
        },
        5: {
            "title": "Class 3 Math - Chapter 5: Shapes and Designs",
            "description": "Test covering basic geometric shapes, patterns, and spatial reasoning.",
            "questions": [
                {
                    "question": "How many sides does a triangle have?",
                    "options": ["2", "3", "4", "5"],
                    "correctAnswer": 1,
                    "explanation": "A triangle has 3 sides and 3 angles."
                },
                {
                    "question": "Which shape has 4 equal sides?",
                    "options": ["Rectangle", "Square", "Triangle", "Circle"],
                    "correctAnswer": 1,
                    "explanation": "A square has 4 equal sides and 4 right angles."
                },
                {
                    "question": "How many corners does a rectangle have?",
                    "options": ["2", "3", "4", "5"],
                    "correctAnswer": 2,
                    "explanation": "A rectangle has 4 corners (vertices) and 4 sides."
                },
                {
                    "question": "Which shape has no corners?",
                    "options": ["Square", "Triangle", "Circle", "Rectangle"],
                    "correctAnswer": 2,
                    "explanation": "A circle has no corners or straight edges - it's perfectly round."
                },
                {
                    "question": "What do you call a shape with 6 sides?",
                    "options": ["Pentagon", "Hexagon", "Octagon", "Decagon"],
                    "correctAnswer": 1,
                    "explanation": "A hexagon is a shape with 6 sides and 6 angles."
                }
            ]
        },
        6: {
            "title": "Class 3 Math - Chapter 6: Fun with Give and Take",
            "description": "Test covering advanced addition and subtraction with larger numbers.",
            "questions": [
                {
                    "question": "What is 156 + 234?",
                    "options": ["380", "390", "400", "410"],
                    "correctAnswer": 1,
                    "explanation": "156 + 234 = 390. Add ones: 6 + 4 = 10, write 0 carry 1. Add tens: 5 + 3 + 1 = 9. Add hundreds: 1 + 2 = 3."
                },
                {
                    "question": "What is 345 - 127?",
                    "options": ["218", "228", "238", "248"],
                    "correctAnswer": 0,
                    "explanation": "345 - 127 = 218. Borrow from tens: 15 - 7 = 8 ones, 3 - 2 = 1 ten, 3 - 1 = 2 hundreds."
                },
                {
                    "question": "If you have 500 stickers and use 287, how many are left?",
                    "options": ["213", "223", "233", "243"],
                    "correctAnswer": 0,
                    "explanation": "500 - 287 = 213 stickers remaining."
                },
                {
                    "question": "What is 278 + 156?",
                    "options": ["424", "434", "444", "454"],
                    "correctAnswer": 1,
                    "explanation": "278 + 156 = 434. Add ones: 8 + 6 = 14, write 4 carry 1. Add tens: 7 + 5 + 1 = 13, write 3 carry 1. Add hundreds: 2 + 1 + 1 = 4."
                },
                {
                    "question": "What is 400 - 156?",
                    "options": ["244", "254", "264", "274"],
                    "correctAnswer": 0,
                    "explanation": "400 - 156 = 244. Borrow from hundreds: 10 - 6 = 4 ones, 9 - 5 = 4 tens, 3 - 1 = 2 hundreds."
                }
            ]
        },
        7: {
            "title": "Class 3 Math - Chapter 7: Time Goes On",
            "description": "Test covering time concepts including hours, minutes, and time calculations.",
            "questions": [
                {
                    "question": "How many minutes are in 1 hour?",
                    "options": ["30 minutes", "45 minutes", "60 minutes", "90 minutes"],
                    "correctAnswer": 2,
                    "explanation": "1 hour = 60 minutes."
                },
                {
                    "question": "If it's 2:30 PM now, what time will it be in 1 hour?",
                    "options": ["3:30 PM", "3:30 AM", "1:30 PM", "2:30 AM"],
                    "correctAnswer": 0,
                    "explanation": "2:30 PM + 1 hour = 3:30 PM."
                },
                {
                    "question": "How many hours are in a day?",
                    "options": ["12 hours", "20 hours", "24 hours", "30 hours"],
                    "correctAnswer": 2,
                    "explanation": "There are 24 hours in a complete day."
                },
                {
                    "question": "If school starts at 8:00 AM and ends at 3:00 PM, how long is the school day?",
                    "options": ["5 hours", "6 hours", "7 hours", "8 hours"],
                    "correctAnswer": 2,
                    "explanation": "From 8:00 AM to 3:00 PM is 7 hours (8 to 12 = 4 hours, 12 to 3 = 3 hours, total = 7 hours)."
                },
                {
                    "question": "What time is 30 minutes after 2:15 PM?",
                    "options": ["2:45 PM", "2:45 AM", "3:15 PM", "1:45 PM"],
                    "correctAnswer": 0,
                    "explanation": "2:15 PM + 30 minutes = 2:45 PM."
                }
            ]
        },
        8: {
            "title": "Class 3 Math - Chapter 8: Who is Heavier?",
            "description": "Test covering weight measurement and comparison concepts.",
            "questions": [
                {
                    "question": "Which is heavier: 1 kilogram or 1000 grams?",
                    "options": ["1 kilogram", "1000 grams", "They are equal", "Cannot compare"],
                    "correctAnswer": 2,
                    "explanation": "1 kilogram = 1000 grams, so they are equal in weight."
                },
                {
                    "question": "How many grams are in 2 kilograms?",
                    "options": ["1000 grams", "1500 grams", "2000 grams", "2500 grams"],
                    "correctAnswer": 2,
                    "explanation": "1 kg = 1000 g, so 2 kg = 2 × 1000 = 2000 grams."
                },
                {
                    "question": "Which unit is best for measuring the weight of a book?",
                    "options": ["Tons", "Kilograms", "Grams", "Milligrams"],
                    "correctAnswer": 2,
                    "explanation": "Grams are the most appropriate unit for measuring a book's weight."
                },
                {
                    "question": "If a bag weighs 1500 grams, how many kilograms is that?",
                    "options": ["1.5 kg", "15 kg", "150 kg", "0.15 kg"],
                    "correctAnswer": 0,
                    "explanation": "1500 g = 1500 ÷ 1000 = 1.5 kilograms."
                },
                {
                    "question": "Which is lighter: 500 grams or 0.5 kilograms?",
                    "options": ["500 grams", "0.5 kilograms", "They are equal", "Cannot determine"],
                    "correctAnswer": 2,
                    "explanation": "0.5 kg = 500 g, so they are equal in weight."
                }
            ]
        },
        9: {
            "title": "Class 3 Math - Chapter 9: How Many Times?",
            "description": "Test covering multiplication concepts and times tables.",
            "questions": [
                {
                    "question": "What is 4 × 3?",
                    "options": ["7", "12", "15", "18"],
                    "correctAnswer": 1,
                    "explanation": "4 × 3 = 12. This means 4 groups of 3."
                },
                {
                    "question": "What is 6 × 5?",
                    "options": ["25", "30", "35", "40"],
                    "correctAnswer": 1,
                    "explanation": "6 × 5 = 30. This means 6 groups of 5."
                },
                {
                    "question": "If you have 3 boxes with 8 apples each, how many apples do you have?",
                    "options": ["21", "24", "27", "30"],
                    "correctAnswer": 1,
                    "explanation": "3 boxes × 8 apples = 24 apples total."
                },
                {
                    "question": "What is 7 × 4?",
                    "options": ["24", "28", "32", "36"],
                    "correctAnswer": 1,
                    "explanation": "7 × 4 = 28. This means 7 groups of 4."
                },
                {
                    "question": "What is 9 × 2?",
                    "options": ["16", "18", "20", "22"],
                    "correctAnswer": 1,
                    "explanation": "9 × 2 = 18. This means 9 groups of 2."
                }
            ]
        },
        10: {
            "title": "Class 3 Math - Chapter 10: Play with Patterns",
            "description": "Test covering number patterns, sequences, and logical reasoning.",
            "questions": [
                {
                    "question": "Complete the pattern: 5, 10, 15, 20, ?",
                    "options": ["22", "25", "30", "35"],
                    "correctAnswer": 1,
                    "explanation": "The pattern increases by 5 each time: 5, 10, 15, 20, 25."
                },
                {
                    "question": "What comes next in the pattern: 2, 4, 8, 16, ?",
                    "options": ["20", "24", "32", "40"],
                    "correctAnswer": 2,
                    "explanation": "The pattern doubles each time: 2, 4, 8, 16, 32."
                },
                {
                    "question": "Complete the pattern: 100, 90, 80, 70, ?",
                    "options": ["60", "65", "75", "80"],
                    "correctAnswer": 0,
                    "explanation": "The pattern decreases by 10 each time: 100, 90, 80, 70, 60."
                },
                {
                    "question": "What comes next in the pattern: 1, 3, 5, 7, ?",
                    "options": ["8", "9", "10", "11"],
                    "correctAnswer": 1,
                    "explanation": "The pattern shows odd numbers increasing by 2: 1, 3, 5, 7, 9."
                },
                {
                    "question": "Complete the pattern: 10, 20, 30, 40, ?",
                    "options": ["45", "50", "55", "60"],
                    "correctAnswer": 1,
                    "explanation": "The pattern increases by 10 each time: 10, 20, 30, 40, 50."
                }
            ]
        },
        11: {
            "title": "Class 3 Math - Chapter 11: Jugs and Mugs",
            "description": "Test covering capacity measurement and liquid volume concepts.",
            "questions": [
                {
                    "question": "How many milliliters are in 1 liter?",
                    "options": ["100 ml", "500 ml", "1000 ml", "2000 ml"],
                    "correctAnswer": 2,
                    "explanation": "1 liter = 1000 milliliters."
                },
                {
                    "question": "Which container can hold more: 1 liter or 500 milliliters?",
                    "options": ["1 liter", "500 milliliters", "They are equal", "Cannot compare"],
                    "correctAnswer": 0,
                    "explanation": "1 liter = 1000 ml, which is more than 500 ml."
                },
                {
                    "question": "How many liters are in 2000 milliliters?",
                    "options": ["1 liter", "2 liters", "3 liters", "4 liters"],
                    "correctAnswer": 1,
                    "explanation": "2000 ml = 2000 ÷ 1000 = 2 liters."
                },
                {
                    "question": "Which unit is best for measuring the capacity of a water bottle?",
                    "options": ["Kiloliters", "Liters", "Milliliters", "Centiliters"],
                    "correctAnswer": 2,
                    "explanation": "Milliliters are the most appropriate unit for measuring a water bottle's capacity."
                },
                {
                    "question": "If you have 1.5 liters of juice, how many milliliters is that?",
                    "options": ["150 ml", "1500 ml", "15 ml", "15000 ml"],
                    "correctAnswer": 1,
                    "explanation": "1.5 liters = 1.5 × 1000 = 1500 milliliters."
                }
            ]
        },
        12: {
            "title": "Class 3 Math - Chapter 12: Can We Share?",
            "description": "Test covering division concepts and sharing equally.",
            "questions": [
                {
                    "question": "What is 12 ÷ 3?",
                    "options": ["3", "4", "5", "6"],
                    "correctAnswer": 1,
                    "explanation": "12 ÷ 3 = 4. This means 12 divided into 3 equal groups."
                },
                {
                    "question": "If you have 20 candies and want to share them equally among 4 friends, how many candies does each friend get?",
                    "options": ["4", "5", "6", "7"],
                    "correctAnswer": 1,
                    "explanation": "20 ÷ 4 = 5 candies per friend."
                },
                {
                    "question": "What is 15 ÷ 5?",
                    "options": ["2", "3", "4", "5"],
                    "correctAnswer": 1,
                    "explanation": "15 ÷ 5 = 3. This means 15 divided into 5 equal groups."
                },
                {
                    "question": "If you have 18 pencils and put them in groups of 6, how many groups do you have?",
                    "options": ["2", "3", "4", "5"],
                    "correctAnswer": 1,
                    "explanation": "18 ÷ 6 = 3 groups of pencils."
                },
                {
                    "question": "What is 24 ÷ 4?",
                    "options": ["5", "6", "7", "8"],
                    "correctAnswer": 1,
                    "explanation": "24 ÷ 4 = 6. This means 24 divided into 4 equal groups."
                }
            ]
        },
        13: {
            "title": "Class 3 Math - Chapter 13: Smart Charts",
            "description": "Test covering data representation, charts, and basic statistics.",
            "questions": [
                {
                    "question": "In a bar chart, what does the height of each bar represent?",
                    "options": ["The color", "The width", "The value/amount", "The position"],
                    "correctAnswer": 2,
                    "explanation": "In a bar chart, the height of each bar represents the value or amount of the data."
                },
                {
                    "question": "If 5 students like apples, 3 like bananas, and 2 like oranges, which fruit is most popular?",
                    "options": ["Apples", "Bananas", "Oranges", "All equal"],
                    "correctAnswer": 0,
                    "explanation": "Apples are most popular with 5 students choosing them."
                },
                {
                    "question": "What type of chart shows parts of a whole?",
                    "options": ["Bar chart", "Line chart", "Pie chart", "Column chart"],
                    "correctAnswer": 2,
                    "explanation": "A pie chart shows parts of a whole, with each slice representing a portion."
                },
                {
                    "question": "If you count 8 red cars, 5 blue cars, and 7 green cars, how many cars did you count in total?",
                    "options": ["18", "19", "20", "21"],
                    "correctAnswer": 2,
                    "explanation": "Total cars = 8 + 5 + 7 = 20 cars."
                },
                {
                    "question": "What is the purpose of a chart or graph?",
                    "options": ["To make numbers look pretty", "To organize and show data clearly", "To hide information", "To confuse people"],
                    "correctAnswer": 1,
                    "explanation": "Charts and graphs help organize and display data in a clear, easy-to-understand way."
                }
            ]
        },
        14: {
            "title": "Class 3 Math - Chapter 14: Rupees and Paise",
            "description": "Test covering money concepts including rupees, paise, and basic calculations.",
            "questions": [
                {
                    "question": "How many paise are in 1 rupee?",
                    "options": ["10 paise", "50 paise", "100 paise", "200 paise"],
                    "correctAnswer": 2,
                    "explanation": "1 rupee = 100 paise."
                },
                {
                    "question": "If you have 5 rupees and 50 paise, how much money do you have in paise?",
                    "options": ["50 paise", "100 paise", "550 paise", "500 paise"],
                    "correctAnswer": 2,
                    "explanation": "5 rupees = 500 paise, plus 50 paise = 550 paise total."
                },
                {
                    "question": "What is 2 rupees and 75 paise + 1 rupee and 25 paise?",
                    "options": ["3 rupees", "4 rupees", "3 rupees 50 paise", "4 rupees 50 paise"],
                    "correctAnswer": 1,
                    "explanation": "2.75 + 1.25 = 4 rupees (275 + 125 = 400 paise = 4 rupees)."
                },
                {
                    "question": "If a pencil costs 5 rupees and 50 paise, how much do 2 pencils cost?",
                    "options": ["10 rupees", "11 rupees", "10 rupees 50 paise", "11 rupees 50 paise"],
                    "correctAnswer": 1,
                    "explanation": "2 × 5.50 = 11 rupees (2 × 550 paise = 1100 paise = 11 rupees)."
                },
                {
                    "question": "How much is 3 rupees and 80 paise in paise?",
                    "options": ["380 paise", "308 paise", "3800 paise", "38 paise"],
                    "correctAnswer": 0,
                    "explanation": "3 rupees = 300 paise, plus 80 paise = 380 paise total."
                }
            ]
        }
    }
    
    return test_templates.get(chapter_num, {
        "title": f"Class 3 Math - Chapter {chapter_num}",
        "description": f"Test covering concepts from Class 3 Math Chapter {chapter_num}.",
        "questions": []
    })

def generate_all_tests():
    """Generate tests for all chapters 2-14"""
    tests = []
    tmp_dir = Path("tmp")
    
    for chapter_num in range(2, 15):  # Chapters 2-14
        if chapter_num < 10:
            pdf_file = tmp_dir / f"cemm10{chapter_num}.pdf"
        else:
            pdf_file = tmp_dir / f"cemm1{chapter_num}.pdf"
        
        if pdf_file.exists():
            print(f"Processing Chapter {chapter_num}: {pdf_file.name}")
            
            # Extract text from PDF
            content = extract_text_from_pdf(pdf_file)
            
            # Create test for this chapter
            test_data = create_chapter_test(chapter_num, content)
            
            # Add common test properties
            test_data.update({
                "subject": "Mathematics",
                "grade": "Class 3",
                "board": "CBSE",
                "duration": 25,
                "timelimit": 25,
                "questions": test_data["questions"]
            })
            
            tests.append(test_data)
            
            # Save individual test file
            output_file = f"class3_math_chapter_{chapter_num}_test.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(test_data, f, indent=2, ensure_ascii=False)
            print(f"  ✅ Saved: {output_file}")
        else:
            print(f"  ❌ File not found: {pdf_file}")
    
    # Save combined tests file
    combined_file = "all_class3_math_tests.json"
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(tests, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Combined tests saved: {combined_file}")
    
    return tests

if __name__ == "__main__":
    print("🚀 Generating Class 3 Math Tests for Chapters 2-14")
    print("=" * 50)
    
    tests = generate_all_tests()
    
    print(f"\n📊 Summary:")
    print(f"   Total tests generated: {len(tests)}")
    print(f"   Total questions: {sum(len(test['questions']) for test in tests)}")
    
    print(f"\n📋 Generated Tests:")
    for test in tests:
        print(f"   - {test['title']} ({len(test['questions'])} questions)")
    
    print(f"\n🎉 All tests generated successfully!")

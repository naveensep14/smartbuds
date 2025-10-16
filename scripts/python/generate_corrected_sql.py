#!/usr/bin/env python3

import json
import sys
import os
from datetime import datetime

def generate_corrected_sql():
    """Generate SQL INSERT statements matching the actual database schema"""
    try:
        # Read the combined JSON file
        with open('all_grade4_math_tests.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        tests = data['tests']
        
        print("-- SQL INSERT statements for Grade 4 Math Tests from PDF")
        print("-- Generated on:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        print("-- Total tests:", len(tests))
        print("-- Total questions:", sum(len(test['questions']) for test in tests))
        print("-- Schema: title, description, subject, grade, timelimit, questions")
        print()
        
        for i, test in enumerate(tests, 1):
            print(f"-- Test {i}: {test['title']}")
            print("INSERT INTO tests (title, description, subject, grade, timelimit, questions) VALUES (")
            title_escaped = test['title'].replace("'", "''")
            description_escaped = test['description'].replace("'", "''")
            print(f"  '{title_escaped}',")
            print(f"  '{description_escaped}',")
            print(f"  '{test['subject']}',")
            print(f"  '{test['grade']}',")
            print(f"  {test['duration']},")
            
            # Convert questions to SQL format
            questions_json = json.dumps(test['questions']).replace("'", "''")
            print(f"  '{questions_json}'")
            print(");")
            print()
        
        print("-- Verify the tests were inserted:")
        print("SELECT COUNT(*) as total_tests FROM tests WHERE subject = 'Mathematics' AND grade = 'Grade 4';")
        print()
        print("-- View all Grade 4 Math tests:")
        print("SELECT id, title, timelimit, jsonb_array_length(questions) as question_count FROM tests WHERE subject = 'Mathematics' AND grade = 'Grade 4';")
        
    except FileNotFoundError:
        print("❌ Error: all_grade4_math_tests.json not found!")
        print("Please run 'python create_pdf_tests.py' first to generate the test files.")
        return False
    except Exception as e:
        print(f"❌ Error generating SQL: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Generating corrected SQL INSERT statements...")
    print("=" * 60)
    
    success = generate_corrected_sql()
    
    if success:
        print("\n✅ Corrected SQL generation completed!")
        print("This SQL uses the correct column names: title, description, subject, grade, timelimit, questions")
    else:
        print("\n❌ Failed to generate corrected SQL statements.")

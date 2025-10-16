#!/usr/bin/env python3

import json
import sys
import os
from datetime import datetime

def generate_class3_sql():
    """Generate SQL INSERT statements for Class 3 Math tests"""
    try:
        # Read the combined JSON file
        with open('all_class3_math_tests.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        tests = data['tests']
        
        print("-- SQL INSERT statements for Class 3 Math Tests from Chapter 1")
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
        print("SELECT COUNT(*) as total_tests FROM tests WHERE subject = 'Mathematics' AND grade = 'Class 3';")
        print()
        print("-- View all Class 3 Math tests:")
        print("SELECT id, title, timelimit, jsonb_array_length(questions) as question_count FROM tests WHERE subject = 'Mathematics' AND grade = 'Class 3';")
        
    except FileNotFoundError:
        print("❌ Error: all_class3_math_tests.json not found!")
        print("Please run 'python create_class3_tests.py' first to generate the test files.")
        return False
    except Exception as e:
        print(f"❌ Error generating SQL: {e}")
        return False
    
    return True

def save_class3_sql_to_file():
    """Save SQL statements to a file"""
    try:
        # Read the combined JSON file
        with open('all_class3_math_tests.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        tests = data['tests']
        
        sql_content = []
        sql_content.append("-- SQL INSERT statements for Class 3 Math Tests from Chapter 1")
        sql_content.append(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        sql_content.append(f"-- Total tests: {len(tests)}")
        sql_content.append(f"-- Total questions: {sum(len(test['questions']) for test in tests)}")
        sql_content.append("-- Schema: title, description, subject, grade, timelimit, questions")
        sql_content.append("")
        
        for i, test in enumerate(tests, 1):
            sql_content.append(f"-- Test {i}: {test['title']}")
            sql_content.append("INSERT INTO tests (title, description, subject, grade, timelimit, questions) VALUES (")
            title_escaped = test['title'].replace("'", "''")
            description_escaped = test['description'].replace("'", "''")
            sql_content.append(f"  '{title_escaped}',")
            sql_content.append(f"  '{description_escaped}',")
            sql_content.append(f"  '{test['subject']}',")
            sql_content.append(f"  '{test['grade']}',")
            sql_content.append(f"  {test['duration']},")
            
            # Convert questions to SQL format
            questions_json = json.dumps(test['questions']).replace("'", "''")
            sql_content.append(f"  '{questions_json}'")
            sql_content.append(");")
            sql_content.append("")
        
        sql_content.append("-- Verify the tests were inserted:")
        sql_content.append("SELECT COUNT(*) as total_tests FROM tests WHERE subject = 'Mathematics' AND grade = 'Class 3';")
        sql_content.append("")
        sql_content.append("-- View all Class 3 Math tests:")
        sql_content.append("SELECT id, title, timelimit, jsonb_array_length(questions) as question_count FROM tests WHERE subject = 'Mathematics' AND grade = 'Class 3';")
        
        # Save to file
        with open('import_class3_math_tests.sql', 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_content))
        
        print("✅ SQL statements saved to: import_class3_math_tests.sql")
        print("\nTo import the tests:")
        print("1. Copy the contents of import_class3_math_tests.sql")
        print("2. Go to your Supabase SQL Editor")
        print("3. Paste and run the SQL statements")
        print("4. Verify the tests were imported successfully")
        
        return True
        
    except FileNotFoundError:
        print("❌ Error: all_class3_math_tests.json not found!")
        print("Please run 'python create_class3_tests.py' first to generate the test files.")
        return False
    except Exception as e:
        print(f"❌ Error generating SQL file: {e}")
        return False

if __name__ == "__main__":
    print("Generating SQL INSERT statements for Class 3 Math tests...")
    print("=" * 60)
    
    # Generate and display SQL
    success = generate_class3_sql()
    
    if success:
        print("\n" + "=" * 60)
        print("Saving SQL to file...")
        save_class3_sql_to_file()
        print("\n✅ SQL generation completed successfully!")
    else:
        print("\n❌ Failed to generate SQL statements.")

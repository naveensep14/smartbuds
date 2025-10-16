# Scripts Directory

This directory contains all scripts organized by type.

## 📁 Directory Structure

```
scripts/
├── sql/          # SQL migration and setup scripts (19 files)
├── python/       # Python scripts for data processing (24 files)
├── javascript/   # JavaScript utility and database scripts (46 files)
└── README.md     # This file
```

---

## 📊 SQL Scripts (`scripts/sql/`)

Database migration, setup, and maintenance scripts.

### Key Scripts:
- **`migrate-add-user-id-to-results.sql`** - Migration to add user_id foreign key to results table
- **`setup-test-progress-table.sql`** - Create test_progress table
- **`setup-question-reports.sql`** - Create question_reports table
- **`setup-student-profiles.sql`** - Create profiles table
- **`database-setup.sql`** - Initial database setup
- **`database-setup-corrected.sql`** - Corrected database schema

### Migration Scripts:
- `add-test-type-column.sql` - Add test type (coursework/weekly)
- `add-weekly-date-range-columns.sql` - Add date range for weekly tests
- `add-expiry-date-column.sql` - Add expiry date for weekly tests
- `add-board-field*.sql` - Add board field to tests table
- `add-db-constraints*.sql` - Add database constraints

### Import Scripts:
- `import_class3_math_tests.sql` - Import Class 3 math tests
- `import_grade4_math_tests.sql` - Import Grade 4 math tests

### Utility Scripts:
- `clear-results.sql` - Clear all results from database

---

## 🐍 Python Scripts (`scripts/python/`)

Python scripts for test generation, PDF processing, and data manipulation.

### Test Generation:
- **`generate_real_class3_tests.py`** - Generate real Class 3 tests from PDFs
- **`generate_all_tests_from_pdfs.py`** - Generate tests from all PDF chapters
- **`generate_real_tests_from_pdfs.py`** - Generate tests from PDF content
- **`generate_concept_based_tests.py`** - Generate concept-based tests
- **`generate_class3_all_chapters.py`** - Generate all chapters for Class 3
- **`generate_class3_3_tests_per_chapter.py`** - Generate 3 tests per chapter
- **`generate_chapter1_tests.py`** - Generate Chapter 1 specific tests
- **`generate_chapter14_from_pdf.py`** - Generate Chapter 14 tests

### PDF Processing:
- **`pdf_processor.py`** - Main PDF processor (uses OpenAI)
- **`pdf_processor_free.py`** - Free version using open-source models
- **`pdf_processor_gemini.py`** - Version using Google Gemini
- **`extract_pdf.py`** - Extract text from PDFs

### PDF Download & Processing:
- **`download_viva_ebook.py`** - Download ebook pages
- **`download_viva_pages.py`** - Download individual pages
- **`create_chapter_pdfs.py`** - Create PDFs per chapter
- **`split_chapters.py`** - Split ebook into chapters

### Fixes & Corrections:
- **`fix_chapter14_money_tests.py`** - Fix Chapter 14 money questions
- **`fix_chapter14_tests.py`** - General Chapter 14 fixes

### SQL Generation:
- **`generate_sql_import.py`** - Generate SQL import statements
- **`generate_class3_sql.py`** - Generate Class 3 SQL
- **`generate_corrected_sql.py`** - Generate corrected SQL

### Test Creation:
- **`create_class3_tests.py`** - Create Class 3 tests
- **`create_pdf_tests.py`** - Create tests from PDFs
- **`create_module_tests.py`** - Create module-based tests

---

## 📜 JavaScript Scripts (`scripts/javascript/`)

Node.js scripts for database operations, imports, and utilities.

### Database Operations:
- **`backup-database.js`** - Backup entire database (in root, not moved)
- **`backup-supabase.js`** - Backup Supabase data
- **`restore-supabase.js`** - Restore from backup

### Database Setup & Migration:
- **`fix-database-schema.js`** - Fix database schema issues
- **`fix-database.js`** - General database fixes
- **`migrate-database.js`** - Run database migrations
- **`run-all-migrations.js`** - Run all pending migrations
- **`setup-results-table.js`** - Setup results table
- **`setup-constraints.js`** - Setup database constraints
- **`setup-question-reports-direct.js`** - Setup question reports table
- **`setup-question-reports-manual.js`** - Manual setup for question reports
- **`setup-question-reports-sql.js`** - SQL-based setup
- **`setup-weekly-date-range.js`** - Setup weekly date range fields

### Test Import Scripts:
- **`import-pdf-tests.js`** - Import tests from PDFs
- **`import_all_chapter_tests.js`** - Import all chapters
- **`import_chapter1_tests.js`** - Import Chapter 1 tests
- **`import_class3_tests_3_per_chapter.js`** - Import 3 tests per chapter
- **`import_real_class3_tests.js`** - Import real Class 3 tests
- **`import-class3-from-json.js`** - Import from JSON
- **`import-class3-tests.js`** - Import Class 3 tests
- **`add-module-tests.js`** - Add module tests
- **`add-sample-tests.js`** - Add sample tests

### Test Generation:
- **`generate_chapter4_test.js`** - Generate Chapter 4 test

### Test Management:
- **`delete_all_class3_tests.js`** - Delete all Class 3 tests
- **`delete_placeholder_tests.js`** - Delete placeholder tests
- **`replace_all_tests_with_pdf_based.js`** - Replace with PDF-based tests
- **`replace_chapter14_tests.js`** - Replace Chapter 14 tests
- **`replace_chapter14_with_real_money.js`** - Replace with real money questions
- **`replace_with_concept_tests.js`** - Replace with concept tests

### Testing & Verification:
- **`test-database.js`** - Test database connection
- **`test-supabase.js`** - Test Supabase integration
- **`check-results-schema.js`** - Check results table schema
- **`check-schema.js`** - Check database schema
- **`test-simple-import.js`** - Test simple import
- **`test-board-field.js`** - Test board field
- **`test-constraints.js`** - Test database constraints
- **`test_chapter_filter.js`** - Test chapter filtering
- **`test_grade_validation.js`** - Test grade validation
- **`test-features.js`** - Test app features

### Verification Scripts:
- **`verify_no_duplicates.js`** - Verify no duplicate tests
- **`verify-question-reports-table.js`** - Verify question reports table
- **`verify-test-progress-table.js`** - Verify test progress table

### View & Utility:
- **`view-reports.js`** - View question reports
- **`upload_chapter4_test.js`** - Upload Chapter 4 test
- **`standardize_grades.js`** - Standardize grade formats
- **`supabase-helper.js`** - Supabase utility functions
- **`create-question-reports-table.js`** - Create question reports table

---

## 🚀 Quick Start

### Running SQL Scripts
Execute in Supabase SQL Editor:
```sql
-- Copy and paste content from scripts/sql/[script-name].sql
```

### Running Python Scripts
```bash
python scripts/python/[script-name].py
```

### Running JavaScript Scripts
```bash
node scripts/javascript/[script-name].js
```

---

## 📝 Notes

- All scripts assume they're run from the project root directory
- Environment variables should be set in `.env.local`
- Python scripts may require: `pip install -r requirements.txt`
- JavaScript scripts use dependencies from `package.json`

---

## 🔒 Important Scripts for Migration

Before running database migrations, always:
1. **Backup:** Run `node backup-database.js` (in root)
2. **Review:** Check the SQL script content
3. **Test:** Run on a test environment first
4. **Migrate:** Execute the migration
5. **Verify:** Run verification queries

---

**Last Updated:** October 16, 2025
**Total Scripts:** 89 (19 SQL + 24 Python + 46 JavaScript)


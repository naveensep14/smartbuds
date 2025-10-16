# Documentation Index

Complete documentation for the SmartBuds educational testing platform.

## 📖 Table of Contents

- [Setup & Configuration](#setup--configuration)
- [Features & Functionality](#features--functionality)
- [Database & Migrations](#database--migrations)
- [Development Guides](#development-guides)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Setup & Configuration

### [setup-instructions.md](setup-instructions.md)
Basic setup instructions for getting started with the project.

### [FREE_AI_SETUP.md](FREE_AI_SETUP.md)
Guide for setting up free AI models for test generation instead of paid OpenAI API.

### [HELP_EMAIL_SETUP.md](HELP_EMAIL_SETUP.md)
Configure the help email system for user support inquiries.
- Email integration setup
- Contact form configuration
- Support ticket handling

---

## ✨ Features & Functionality

### [TEST_PROGRESS_FEATURE.md](TEST_PROGRESS_FEATURE.md)
**Test Progress Tracking & Resume Functionality**
- Automatic progress saving
- Resume tests from where you left off
- Timer continuation
- In-progress tests section
- Database schema and implementation details

### [REPORT_FEATURE_FIX.md](REPORT_FEATURE_FIX.md)
**Question Reporting System**
- Report incorrect answers, typos, or issues
- Admin review interface
- Status tracking (pending/reviewed/resolved)
- Database schema for question_reports table

### [DELETE_ACCOUNT_SETUP.md](DELETE_ACCOUNT_SETUP.md)
**Account Deletion Feature**
- Complete data cleanup
- User profile settings page
- Cascade deletion across all tables
- Security considerations
- Implementation guide

### [mobile-features-demo.md](mobile-features-demo.md)
**Mobile Experience Features**
- Responsive design patterns
- Mobile navigation menu
- Touch-friendly interfaces
- Mobile-specific optimizations

### [test-features.md](test-features.md)
Feature testing guide and checklist for quality assurance.

### [test-results.md](test-results.md)
Test results system documentation including scoring, analytics, and display.

---

## 🗄️ Database & Migrations

### [MIGRATION_USER_ID.md](MIGRATION_USER_ID.md)
**Critical: User ID Foreign Key Migration**
- Replaces email-based tracking with proper foreign keys
- Migration from `studentName` to `user_id`
- Complete code changes and SQL scripts
- Backward compatibility during migration
- Testing checklist

**Impact:** 
- Results table gets proper foreign key to auth.users
- Better referential integrity
- Automatic cascade deletion
- Improved query performance

### [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md)
Security improvements and best practices:
- Row Level Security (RLS) policies
- Authentication hardening
- Data access controls
- SQL injection prevention

---

## 💻 Development Guides

### [AI_TEST_GENERATION_PROMPT.md](AI_TEST_GENERATION_PROMPT.md)
**AI-Powered Test Generation**
- Prompts for generating educational test questions
- Quality standards and validation
- Subject-specific guidelines
- Integration with OpenAI/Gemini/other AI models

### [chapter_4_mindmap.md](chapter_4_mindmap.md)
Example mindmap and structure for Chapter 4 content organization.

### [viva_ebook_instructions.md](viva_ebook_instructions.md)
Instructions for downloading and processing Viva ebook pages for test generation.

---

## 🚀 Deployment

### [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
**Production Deployment Guide**
- Vercel deployment (recommended)
- Environment variables setup
- Database migration in production
- Build optimization
- Monitoring and logging

### [VERCEL_DEPLOYMENT_FIX.md](VERCEL_DEPLOYMENT_FIX.md)
Common Vercel deployment issues and fixes:
- Build errors
- Environment variable issues
- API route problems
- Middleware configuration

---

## 📋 Quick Reference

### Essential Documents for New Developers
1. **Start here:** [setup-instructions.md](setup-instructions.md)
2. **Understand features:** [TEST_PROGRESS_FEATURE.md](TEST_PROGRESS_FEATURE.md)
3. **Database structure:** [MIGRATION_USER_ID.md](MIGRATION_USER_ID.md)
4. **Deploy:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Essential Documents for Database Changes
1. **Read first:** [MIGRATION_USER_ID.md](MIGRATION_USER_ID.md)
2. **Security:** [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md)
3. **Run migrations:** See `/scripts/sql/` folder

### Essential Documents for Feature Development
1. **Test generation:** [AI_TEST_GENERATION_PROMPT.md](AI_TEST_GENERATION_PROMPT.md)
2. **Progress tracking:** [TEST_PROGRESS_FEATURE.md](TEST_PROGRESS_FEATURE.md)
3. **Quality assurance:** [REPORT_FEATURE_FIX.md](REPORT_FEATURE_FIX.md)

---

## 🔍 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| MIGRATION_USER_ID.md | ✅ Current | Oct 16, 2025 |
| DELETE_ACCOUNT_SETUP.md | ✅ Current | Oct 16, 2025 |
| TEST_PROGRESS_FEATURE.md | ✅ Current | Oct 11, 2025 |
| REPORT_FEATURE_FIX.md | ✅ Current | Oct 11, 2025 |
| DEPLOYMENT_GUIDE.md | ✅ Current | Oct 2, 2025 |
| AI_TEST_GENERATION_PROMPT.md | ✅ Current | Oct 11, 2025 |
| SECURITY_REMEDIATION.md | ✅ Current | Oct 11, 2025 |
| HELP_EMAIL_SETUP.md | ✅ Current | Oct 4, 2025 |

---

## 🛠️ Troubleshooting Guide

### Common Issues

**Problem: Database connection fails**
- Check `.env.local` has correct Supabase credentials
- Verify Supabase project is active
- See [SECURITY_REMEDIATION.md](SECURITY_REMEDIATION.md)

**Problem: Test progress not saving**
- Verify `test_progress` table exists
- Check RLS policies
- See [TEST_PROGRESS_FEATURE.md](TEST_PROGRESS_FEATURE.md)

**Problem: Account deletion fails**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check foreign key constraints
- See [DELETE_ACCOUNT_SETUP.md](DELETE_ACCOUNT_SETUP.md)

**Problem: Deployment fails on Vercel**
- Check build logs
- Verify environment variables
- See [VERCEL_DEPLOYMENT_FIX.md](VERCEL_DEPLOYMENT_FIX.md)

**Problem: Question reports not working**
- Verify `question_reports` table exists
- Check user authentication
- See [REPORT_FEATURE_FIX.md](REPORT_FEATURE_FIX.md)

---

## 📝 Contributing to Documentation

When adding new features, please:
1. Create or update relevant documentation
2. Add entry to this README
3. Include code examples and screenshots
4. Document database changes
5. Update troubleshooting guide

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Document all environment variables
- Provide troubleshooting steps

---

## 📞 Support

For additional help:
- Review relevant documentation above
- Check `/scripts/README.md` for script documentation
- See main [README.md](../README.md) for project overview

---

**Documentation maintained by the SmartBuds development team**
**Last updated: October 16, 2025**

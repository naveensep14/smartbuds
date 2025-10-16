# Report Issue Feature - Fix Documentation

## Problem
Users were getting a "Failed to submit report. Please try again." error when trying to report issues with test questions.

## Root Cause
The issue was caused by Row Level Security (RLS) policies in Supabase. The API route was using the anonymous key to insert reports, but the RLS policy required `auth.uid()` to match the `user_id`. When manually verifying users with a Bearer token, the RLS context wasn't properly set, causing insertions to fail.

## Solution
The fix involves using the **service role key** in the API route after verifying the user's identity. This approach:
1. ✅ Verifies the user with the anon key + Bearer token
2. ✅ Uses the service role key to bypass RLS for the insert (after verification)
3. ✅ Maintains security by still validating user identity first

## Changes Made

### 1. API Route (`app/api/reports/submit/route.ts`)
**Changes:**
- Split client creation into two phases:
  - `anonClient`: For user authentication
  - `supabase`: Using service role key for database operations
- Added comprehensive error logging with emojis for easy debugging
- Return detailed error messages including `details` and `code` fields
- Added validation for empty responses

**Key Code:**
```typescript
// Verify user with anon client
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

// Use service role client to insert (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### 2. Test Page (`app/tests/[id]/page.tsx`)
**Changes:**
- Enhanced `handleSubmitReport` function with detailed logging
- Better error handling for session retrieval
- Display specific error messages from API responses
- Auto-hide success message after 5 seconds
- Added session error checking before submission

**Key Features:**
```typescript
// Better error extraction
if (!response.ok) {
  throw new Error(result.details || result.error || 'Failed to submit report');
}

// Auto-hide success message
setTimeout(() => {
  setReportSubmitted(false);
}, 5000);
```

### 3. Modal Component (`components/ReportQuestionModal.tsx`)
**Changes:**
- Display actual error messages from thrown exceptions
- Better error type handling with TypeScript
- More specific error display to users

### 4. Verification Script (`verify-question-reports-table.js`)
**New File:**
- Checks if `question_reports` table exists
- Validates table accessibility
- Shows current report count
- Provides SQL script to create table if missing

## How to Test

### 1. Verify Table Exists
```bash
node verify-question-reports-table.js
```

Expected output:
```
✅ Table question_reports exists!
✅ Table is accessible
✅ Current reports in database: X
✨ Question reports table is properly configured!
```

### 2. Test Report Submission
1. Navigate to any test: `http://localhost:3000/tests/[test-id]`
2. Click on any question
3. Click "Report Issue" button
4. Select an issue type (e.g., "Incorrect Answer")
5. Optionally add a description
6. Click "Submit Report"

### 3. Expected Behavior
**Success:**
- Modal closes immediately
- Green success message appears: "Report submitted successfully!"
- Message auto-hides after 5 seconds
- Console shows: `✅ [TEST PAGE] Report submitted successfully`

**Failure (if any):**
- Error message displayed in modal with specific details
- Console shows detailed error logs with emoji prefixes
- User can retry or cancel

### 4. Verify in Database
Check Supabase dashboard:
```sql
SELECT * FROM question_reports ORDER BY reported_at DESC LIMIT 10;
```

## Debug Logs

The feature now includes comprehensive logging at each step:

### Test Page Logs
- 📤 Getting session
- 📤 Submitting report
- 📤 Response status
- 📤 Response data
- ✅ Report submitted successfully
- ❌ Session error / Auth error

### API Route Logs
- 🔍 Starting report submission
- 🔍 Auth header present
- 🔍 Token length
- ✅ User authenticated
- 🔍 Fetching test details
- ✅ Test found
- 🔍 Creating report
- ✅ Report created successfully
- ❌ Error details with code and message

### Modal Logs
- 🔍 Form submitted
- 🔍 Starting submission
- 🔍 Calling onSubmit with data
- ✅ onSubmit completed successfully
- ❌ Error in handleSubmit

## Security Considerations

1. **User Verification First**: The API always verifies the user's identity before performing any operations
2. **Service Role Key**: Used only after verification and only for database operations
3. **RLS Still Active**: RLS policies remain active for other operations
4. **No Direct User Input**: All user IDs come from verified session tokens, not from request body
5. **Audit Trail**: All reports store `user_id`, `reported_at`, and other tracking information

## Environment Variables Required

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Common Issues & Solutions

### Issue: "No active session"
**Solution**: User needs to log in again. Clear cookies and re-authenticate.

### Issue: "Unauthorized" error
**Solution**: Check if session token is valid and not expired.

### Issue: "Table does not exist"
**Solution**: Run the SQL script provided by `verify-question-reports-table.js`

### Issue: Still getting generic errors
**Solution**: 
1. Check browser console for detailed logs
2. Check Vercel/server logs for API route errors
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in production environment variables

## Deployment Notes

### Vercel/Production
Make sure to add `SUPABASE_SERVICE_ROLE_KEY` to your environment variables:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key from Supabase
5. Redeploy the application

### Database
The `question_reports` table should already exist. If not, run the SQL from `verify-question-reports-table.js` in your Supabase SQL Editor.

## Testing Checklist

- [x] Table exists and is accessible
- [x] User can open report modal
- [x] User can select issue type
- [x] User can add description
- [x] Report submits successfully
- [x] Success message appears and auto-hides
- [x] Report appears in database with correct user_id
- [x] Error messages are specific and helpful
- [x] Logs are comprehensive and easy to follow
- [x] Works in development environment
- [ ] Works in production environment (test after deployment)

## Admin Panel

Reports can be viewed in the admin panel at `/admin/reports`. Admins can:
- View all submitted reports
- See question details and user answers
- Mark reports as reviewed/resolved/dismissed
- Add admin notes

## Future Improvements

1. Add email notifications to admins when reports are submitted
2. Allow users to see status of their submitted reports
3. Add bulk actions for admins (resolve multiple reports)
4. Add statistics dashboard for report types
5. Add ability to directly edit questions from reports

---

**Last Updated:** October 12, 2025
**Author:** AI Assistant
**Status:** ✅ Fixed and Tested


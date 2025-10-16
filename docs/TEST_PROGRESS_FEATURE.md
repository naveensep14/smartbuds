# Test Progress Feature

## Overview
Automatically saves test progress and allows users to resume tests from where they left off, including timer continuation.

## Features

### 1. **Automatic Progress Saving**
- Saves progress every time a user answers a question
- Debounced to avoid excessive database calls (2 second delay)
- Tracks:
  - Current question index
  - Selected answers for all questions
  - Start time
  - Time spent
  - Completion status

### 2. **Resume From Where You Left Off**
- When a user returns to a partially completed test:
  - Restores their position in the test
  - Restores all their previous answers
  - **Continues timer from where it was left off**
  - Shows "Resuming Test" notification

### 3. **In-Progress Tests Section**
- Displays prominently on the tests page
- Shows all partially completed tests
- For each test displays:
  - Test name, subject, and grade
  - Progress bar showing questions answered
  - Time since last update
  - "Resume" button to continue
  - Delete button to start fresh

### 4. **Timer Continuation**
- Calculates elapsed time based on start time
- Subtracts elapsed time from total test duration
  - Example: 30 min test, user spent 10 mins → Resume with 20 mins remaining
- Timer continues counting down from remaining time
- Prevents cheating by tracking actual time spent

## Database Setup

### Required Table: `test_progress`

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- See setup-test-progress-table.sql for the complete SQL
\`\`\`

Or use the verification script:
\`\`\`bash
node verify-test-progress-table.js
\`\`\`

### Table Schema
- **id**: UUID (Primary Key)
- **user_email**: TEXT (User's email)
- **test_id**: UUID (References tests table)
- **current_question_index**: INTEGER (Current question position)
- **selected_answers**: JSONB (All answered questions)
- **start_time**: TIMESTAMP (When test started)
- **last_updated**: TIMESTAMP (Last progress save)
- **is_completed**: BOOLEAN (Test completion status)
- **time_spent**: INTEGER (Seconds spent on test)

**Unique Constraint**: (user_email, test_id) - One progress record per user per test

## How It Works

### 1. Starting a New Test
1. User clicks "Take Test" on any test
2. Progress record created with:
   - start_time = current time
   - current_question_index = 0
   - selected_answers = {}
   - is_completed = false

### 2. During the Test
1. User answers questions
2. After each answer (with 2s debounce):
   - Progress record updated via `upsert`
   - current_question_index updated
   - selected_answers updated
   - time_spent calculated

3. Navigation between questions:
   - Progress saved (with debounce)
   - Position tracked

### 3. Leaving Without Submitting
1. Progress remains in database
2. Test marked as "in progress"
3. Appears in "Continue Learning" section

### 4. Resuming a Test
1. User clicks "Resume" button
2. System loads progress record
3. Restores:
   - Question position
   - All answered questions
   - Start time (original)
4. Calculates remaining time:
   \`\`\`
   timeSpent = now - startTime
   remainingTime = testDuration - timeSpent
   \`\`\`
5. Timer continues from remainingTime
6. Shows "Resuming Test" notification

### 5. Submitting the Test
1. Progress record marked as completed
2. Test result saved to results table
3. No longer appears in "Continue Learning"

### 6. Deleting Progress
1. User can delete progress to start fresh
2. Confirmation required
3. Progress record removed from database
4. Next attempt starts from beginning

## Components

### **TestProgressService** (`lib/test-progress.ts`)
- `saveProgress()` - Save/update progress
- `getProgress()` - Get progress for specific test
- `getIncompleteTests()` - Get all in-progress tests for user
- `markCompleted()` - Mark test as completed
- `deleteProgress()` - Delete progress record
- `calculateTimeSpent()` - Calculate elapsed time

### **InProgressTests** (`components/InProgressTests.tsx`)
- Displays list of in-progress tests
- Shows progress bars
- Resume and delete buttons
- Auto-refreshes on mount

### **Test Page** (`app/tests/[id]/page.tsx`)
- Auto-saves progress during test
- Loads existing progress on mount
- Restores state and timer
- Shows resume notification

## User Experience

### Good UX Features
- ✅ **Non-intrusive**: Progress saves automatically in background
- ✅ **Clear indication**: "Resuming Test" message when continuing
- ✅ **Visual progress**: Progress bars show completion percentage
- ✅ **Time awareness**: Shows "time ago" for last update
- ✅ **Easy cleanup**: Delete button to start fresh
- ✅ **Fair timing**: Timer continues accurately from pause point

### User Flow
1. **Start Test** → System begins tracking automatically
2. **Answer Questions** → Progress saved silently
3. **Navigate Away** → Progress preserved
4. **Return Later** → See test in "Continue Learning"
5. **Click Resume** → Back to exact same spot
6. **Complete Test** → Progress archived

## Security & Data Integrity

### Row Level Security (RLS)
- Users can only see their own progress
- Users can only modify their own progress
- Email-based isolation

### Data Validation
- Unique constraint prevents duplicate progress records
- Foreign key ensures test exists
- Boolean flag for completion status

### Timer Integrity
- Server-side time calculation prevents tampering
- Based on original start_time (immutable)
- Remaining time calculated on each resume

## Testing

### Manual Testing Steps
1. **Start a test**
   - Verify progress appears in "Continue Learning"
   
2. **Answer some questions**
   - Leave the test (don't submit)
   - Check progress is saved
   
3. **Resume the test**
   - Verify you're at the right question
   - Verify all previous answers are restored
   - Verify timer shows reduced time
   
4. **Wait some time**
   - Resume again
   - Verify timer reduced further
   
5. **Delete progress**
   - Confirm deletion works
   - Verify test no longer in "Continue Learning"
   
6. **Complete a test**
   - Verify it no longer shows as in-progress

### Database Verification
\`\`\`bash
# Check table exists
node verify-test-progress-table.js

# View all progress records
node view-progress.js  # (if you create this helper)
\`\`\`

## Future Enhancements

### Potential Improvements
1. **Offline support**: Save to localStorage, sync when online
2. **Auto-submit**: Submit test when timer expires
3. **Multiple devices**: Sync progress across devices
4. **Progress analytics**: Show time spent per question
5. **Pause button**: Explicit pause/resume functionality
6. **Progress export**: Download progress history
7. **Admin view**: See all users' progress for monitoring

## Troubleshooting

### Issue: Progress not saving
- **Check**: Is test_progress table created?
- **Run**: `node verify-test-progress-table.js`
- **Check**: Browser console for errors

### Issue: Timer not resuming correctly
- **Check**: start_time is being preserved correctly
- **Check**: timeSpent calculation matches reality
- **Debug**: Add console.logs in timer restoration logic

### Issue: In-Progress Tests not showing
- **Check**: User is logged in
- **Check**: is_completed is false in database
- **Check**: RLS policies allow user to read their records

## Implementation Summary

This feature provides a seamless experience for users who:
- Need to take breaks during tests
- Accidentally navigate away
- Want to spread test-taking over multiple sessions
- Need to ensure fairtime tracking

The implementation is simple, reliable, and fair - automatically preserving progress while maintaining test integrity through accurate time tracking.


# Migration: Using user_id Foreign Key in Results Table

## 🎯 Overview

This migration fixes a critical database design issue where the `results` table was using `studentName` (email) instead of a proper foreign key relationship to track users.

### **Before (❌ Bad Design)**
```sql
results.studentName = 'user@example.com'  -- Text field with email
```

### **After (✅ Proper Design)**
```sql
results.user_id = 'uuid-of-user'  -- Foreign key to auth.users(id)
```

---

## 🗄️ Database Migration

### Step 1: Run the Migration SQL

Execute this SQL in your Supabase SQL Editor:

**File:** `migrate-add-user-id-to-results.sql`

```sql
-- Migration: Add user_id foreign key to results table

-- Step 1: Add user_id column (nullable initially)
ALTER TABLE results 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data (match email to user_id)
UPDATE results r
SET user_id = (
  SELECT id 
  FROM auth.users u 
  WHERE u.email = r."studentName"
)
WHERE user_id IS NULL AND "studentName" IS NOT NULL;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);

-- Step 4: Drop the old studentName index
DROP INDEX IF EXISTS idx_results_student_name;
DROP INDEX IF EXISTS idx_results_studentName;

-- Step 5: Add NOT NULL constraint (run after verifying data)
ALTER TABLE results ALTER COLUMN user_id SET NOT NULL;

-- Step 6: (Optional) Drop studentName column after confirming everything works
-- ALTER TABLE results DROP COLUMN IF EXISTS "studentName";
```

### Step 2: Verify Migration

Run this query to check if migration worked:

```sql
SELECT 
  r.id,
  r.user_id,
  r."studentName",
  u.email as user_email,
  CASE 
    WHEN r.user_id IS NULL THEN '❌ Missing user_id'
    WHEN r."studentName" = u.email THEN '✅ Matched'
    ELSE '⚠️ Mismatch'
  END as status
FROM results r
LEFT JOIN auth.users u ON r.user_id = u.id
LIMIT 20;
```

All rows should show ✅ Matched status.

---

## 💻 Code Changes

### 1. TypeScript Types (`types/index.ts`)

**Updated TestResult interface:**
```typescript
export interface TestResult {
  id: string;
  testId: string;
  user_id: string; // ✅ NEW: Foreign key to auth.users
  studentName?: string; // Deprecated: kept for backward compatibility
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  completedAt: Date;
}
```

### 2. Database Service (`lib/database.ts`)

**Added new method:**
```typescript
// ✅ NEW: Query by user_id (preferred)
resultService.getByUserId(userId: string)

// ⚠️ DEPRECATED: Query by email (keep for backward compatibility)
resultService.getByStudent(studentName: string)
```

**Updated all methods to include `user_id`:**
- `create()` - Now saves `user_id` + `studentName` (for migration)
- `getAll()` - Returns `user_id` in results
- `getByTestId()` - Returns `user_id` in results
- `getByUserId()` - NEW method to query by `user_id`

### 3. Test Submission (`app/tests/[id]/page.tsx`)

**Before:**
```typescript
const resultData = {
  testId: test.id,
  studentName: user.email || 'Anonymous',  // ❌ Using email
  score,
  // ...
};
```

**After:**
```typescript
const resultData = {
  testId: test.id,
  user_id: user.id,  // ✅ Using user_id foreign key
  studentName: user.email,  // Keep for migration period
  score,
  // ...
};
```

### 4. Activity Service (`lib/activity.ts`)

**Before:**
```typescript
.eq('studentName', userId)  // ❌ Querying by email
```

**After:**
```typescript
.eq('user_id', userId)  // ✅ Querying by user_id
```

### 5. Delete Account Route (`app/api/account/delete/route.ts`)

**Before:**
```typescript
.eq('studentName', userEmail)  // ❌ Deleting by email
```

**After:**
```typescript
.eq('user_id', userId)  // ✅ Deleting by user_id foreign key
```

### 6. Results Pages

**Updated all result queries:**

- `app/my-results/page.tsx`: `.eq('user_id', user.id)`
- `app/tests/page.tsx`: `.eq('user_id', user.id)`

---

## 🎯 Benefits

### 1. **Referential Integrity**
- Database enforces relationship with `FOREIGN KEY` constraint
- Prevents orphaned records
- Automatic cascade deletion when user is deleted

### 2. **Performance**
- Indexed UUID lookups faster than text email searches
- Proper join relationships for complex queries

### 3. **Data Consistency**
- User changes email → results still linked via UUID
- No need to update multiple rows when email changes

### 4. **Security**
- Row Level Security (RLS) works better with foreign keys
- Proper user isolation

### 5. **Database Design Best Practices**
- Uses primary key relationships instead of text matching
- Follows normal form principles

---

## ⚠️ Migration Period

During the migration period, both fields exist:

- **`user_id`** (UUID) - Primary identifier (preferred)
- **`studentName`** (TEXT) - Email (deprecated, kept for backward compatibility)

### Timeline:

1. **Phase 1**: Both fields exist (current state)
   - New records save both `user_id` and `studentName`
   - All queries use `user_id`
   - Old data migrated via SQL

2. **Phase 2**: After verification (1-2 weeks)
   - Set `user_id` to NOT NULL
   - Remove any fallback `studentName` queries

3. **Phase 3**: Full migration complete
   - Drop `studentName` column (optional)
   - Update TypeScript types to remove `studentName?`

---

## 🧪 Testing Checklist

- [ ] Run migration SQL in Supabase
- [ ] Verify all existing results have `user_id`
- [ ] Create new test result → check both fields saved
- [ ] View "My Results" page → results load correctly
- [ ] View "Tests" page → completed tests show correctly  
- [ ] View "Dashboard" → activity history displays
- [ ] Delete account → verify all results deleted
- [ ] Sign up with same email → no old results appear

---

## 📝 Developer Notes

### Adding New Features

When querying results, always use `user_id`:

```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('results')
  .select('*')
  .eq('user_id', user.id);

// ❌ WRONG
const { data } = await supabase
  .from('results')
  .select('*')
  .eq('studentName', user.email);
```

### Creating Results

Always include both fields during migration period:

```typescript
const result = await resultService.create({
  testId: test.id,
  user_id: user.id,  // Required
  studentName: user.email,  // Optional (for migration)
  // ... other fields
});
```

---

## 🚀 Deployment Steps

1. **Backup database** (Supabase auto-backups, but verify)
2. **Run migration SQL** in Supabase SQL Editor
3. **Verify migration** with test queries
4. **Deploy code changes** (already updated in repo)
5. **Monitor for errors** in production logs
6. **Test key user flows** (create result, view results, delete account)
7. **After 1-2 weeks**: Add NOT NULL constraint and drop `studentName` column

---

## 📊 Impact Analysis

### Tables Affected:
- ✅ **`results`** - Added `user_id` column, updated queries

### Files Changed:
- ✅ `types/index.ts` - Updated TestResult interface
- ✅ `lib/database.ts` - Updated result service methods
- ✅ `lib/activity.ts` - Updated query to use user_id
- ✅ `app/tests/[id]/page.tsx` - Updated result creation
- ✅ `app/my-results/page.tsx` - Updated query
- ✅ `app/tests/page.tsx` - Updated query
- ✅ `app/api/account/delete/route.ts` - Updated deletion query

### Backward Compatibility:
- ✅ Old results migrated automatically via SQL
- ✅ `studentName` field kept during migration period
- ✅ No breaking changes for existing users

---

## 🔍 Troubleshooting

### Issue: Results not showing after migration

**Solution:**
```sql
-- Check if user_id is populated
SELECT user_id, "studentName", score FROM results LIMIT 10;

-- If NULL, re-run migration step 2
UPDATE results r
SET user_id = (SELECT id FROM auth.users WHERE email = r."studentName")
WHERE user_id IS NULL;
```

### Issue: Cannot create new results

**Solution:**
```typescript
// Ensure you're passing user_id
const result = {
  user_id: user.id,  // Make sure user object has id property
  // ...
};
```

### Issue: Activity not displaying

**Solution:**
```typescript
// Check that activity service is using user.id, not user.email
ActivityService.getUserActivities(user.id, 5);  // ✅ Correct
ActivityService.getUserActivities(user.email, 5);  // ❌ Wrong
```

---

## ✅ Success Criteria

Migration is complete when:

1. All existing results have `user_id` populated
2. New results automatically save with `user_id`
3. All queries use `user_id` instead of `studentName`
4. Delete account properly removes all user results
5. No linter errors related to TestResult type
6. All user-facing features work correctly

---

**Status:** ✅ Code changes complete, database migration ready to run
**Next Step:** Run the migration SQL in Supabase dashboard


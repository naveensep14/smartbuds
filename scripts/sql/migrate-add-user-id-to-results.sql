-- Migration: Add user_id foreign key to results table
-- This replaces the studentName (email) field with a proper foreign key relationship

-- Step 1: Add user_id column (nullable initially)
ALTER TABLE results 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data (match email to user_id)
-- This updates existing records by matching studentName (email) with auth.users.email
UPDATE results r
SET user_id = (
  SELECT id 
  FROM auth.users u 
  WHERE u.email = r."studentName"
)
WHERE user_id IS NULL AND "studentName" IS NOT NULL;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);

-- Step 4: Drop the old studentName index (we'll keep the column for now for backward compatibility)
DROP INDEX IF EXISTS idx_results_student_name;
DROP INDEX IF EXISTS idx_results_studentName;

-- Step 5: Add NOT NULL constraint to user_id (uncomment after verifying all data migrated)
-- ALTER TABLE results ALTER COLUMN user_id SET NOT NULL;

-- Step 6: (Optional) Drop studentName column after confirming everything works
-- ALTER TABLE results DROP COLUMN IF EXISTS "studentName";

-- Verification query - Run this to check if migration worked:
-- SELECT 
--   r.id,
--   r.user_id,
--   r."studentName",
--   u.email as user_email,
--   CASE 
--     WHEN r.user_id IS NULL THEN '❌ Missing user_id'
--     WHEN r."studentName" = u.email THEN '✅ Matched'
--     ELSE '⚠️ Mismatch'
--   END as status
-- FROM results r
-- LEFT JOIN auth.users u ON r.user_id = u.id
-- LIMIT 20;


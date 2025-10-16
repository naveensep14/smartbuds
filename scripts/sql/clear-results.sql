-- Clear all results from the database
-- Run this in your Supabase SQL Editor

DELETE FROM results;

-- Verify the table is empty
SELECT COUNT(*) as remaining_results FROM results;

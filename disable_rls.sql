-- Disable Row Level Security for user_game_statistics table
-- This will allow all operations on the table without authentication checks

-- First, disable RLS on the table
ALTER TABLE user_game_statistics DISABLE ROW LEVEL SECURITY;

-- Optional: Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view own game statistics" ON user_game_statistics;
DROP POLICY IF EXISTS "Users can insert own game statistics" ON user_game_statistics;
DROP POLICY IF EXISTS "Users can update own game statistics" ON user_game_statistics;
DROP POLICY IF EXISTS "Users can delete own game statistics" ON user_game_statistics;
DROP POLICY IF EXISTS "Users can manage their own game statistics" ON user_game_statistics;

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_game_statistics';

-- The rowsecurity column should show 'f' (false) indicating RLS is disabled

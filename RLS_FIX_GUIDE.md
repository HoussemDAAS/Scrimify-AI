# RLS Policy Issue Fix Guide

## Problem
The `user_game_statistics` table has Row Level Security (RLS) enabled, but our Supabase operations are failing because the RLS policy expects an authenticated user context.

## Solution Options

### Option 1: Add Service Role Key (Recommended)
1. Go to your Supabase dashboard
2. Navigate to Settings > API  
3. Copy the `service_role` key (NOT the anon key)
4. Add it to your environment variables:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Option 2: Update RLS Policy
If you have access to your Supabase SQL editor, run this query to create a policy that works with our user structure:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own game statistics" ON user_game_statistics;

-- Create a new policy that allows operations based on user_id
CREATE POLICY "Users can manage their own game statistics" ON user_game_statistics
FOR ALL USING (
  user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  )
) WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  )
);

-- Alternative: Temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE user_game_statistics DISABLE ROW LEVEL SECURITY;
```

### Option 3: Server-Side API Route
Use a server-side API route that bypasses RLS using the service role key.

## Current Implementation
The code has been updated to use the service role key when available, falling back to the regular client if not configured.

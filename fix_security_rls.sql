-- =============================================================================
-- CRITICAL SECURITY FIX: Enable RLS and Create Proper Security Policies
-- =============================================================================

-- 1. ENABLE RLS on all match tables
ALTER TABLE "public"."match_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_results" ENABLE ROW LEVEL SECURITY;

-- 2. MATCH REQUESTS POLICIES
-- Users can only see match requests where they are challenger or opponent
CREATE POLICY "Users can view their own match requests" ON "public"."match_requests"
FOR SELECT USING (
  auth.uid()::text IN (
    SELECT clerk_id FROM users WHERE id = challenger_user_id
    UNION
    SELECT clerk_id FROM users WHERE id = opponent_user_id
  )
);

-- Users can only create match requests for teams they own
CREATE POLICY "Users can create match requests for owned teams" ON "public"."match_requests"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE id = challenger_team_id 
    AND owner_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  )
);

-- Users can only update match requests where they are the opponent (accept/decline)
CREATE POLICY "Users can update received match requests" ON "public"."match_requests"
FOR UPDATE USING (
  auth.uid()::text = (SELECT clerk_id FROM users WHERE id = opponent_user_id)
);

-- 3. MATCH CHAT POLICIES
-- Users can only see chat for matches they're involved in
CREATE POLICY "Users can view match chat for their matches" ON "public"."match_chat"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM match_requests 
    WHERE id = match_request_id 
    AND (
      challenger_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      OR 
      opponent_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  )
);

-- Users can only send messages in matches they're involved in
CREATE POLICY "Users can send messages in their matches" ON "public"."match_chat"
FOR INSERT WITH CHECK (
  sender_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  AND EXISTS (
    SELECT 1 FROM match_requests 
    WHERE id = match_request_id 
    AND (
      challenger_user_id = sender_user_id
      OR 
      opponent_user_id = sender_user_id
    )
  )
);

-- 4. MATCH RESULTS POLICIES
-- Users can only see results for their matches
CREATE POLICY "Users can view results for their matches" ON "public"."match_results"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM match_requests 
    WHERE id = match_request_id 
    AND (
      challenger_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      OR 
      opponent_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  )
);

-- Users can only create/update results for their matches
CREATE POLICY "Users can report results for their matches" ON "public"."match_results"
FOR INSERT WITH CHECK (
  reporter_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  AND EXISTS (
    SELECT 1 FROM match_requests 
    WHERE id = match_request_id 
    AND (
      challenger_user_id = reporter_user_id
      OR 
      opponent_user_id = reporter_user_id
    )
  )
);

CREATE POLICY "Users can update results for their matches" ON "public"."match_results"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM match_requests 
    WHERE id = match_request_id 
    AND (
      challenger_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
      OR 
      opponent_user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    )
  )
);

-- =============================================================================
-- VERIFICATION QUERIES (Run these to test)
-- =============================================================================

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('match_requests', 'match_chat', 'match_results');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('match_requests', 'match_chat', 'match_results');

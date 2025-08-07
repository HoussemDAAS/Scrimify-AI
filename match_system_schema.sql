-- =============================================================================
-- MATCH SYSTEM DATABASE SCHEMA
-- =============================================================================
-- Complete match flow: Request → Accept → Chat → Complete → Report → Verify → Update Stats

-- 1. Match Requests Table (similar to team_join_requests)
CREATE TABLE IF NOT EXISTS "public"."match_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "challenger_team_id" UUID NOT NULL REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    "opponent_team_id" UUID NOT NULL REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    "challenger_user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "opponent_user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "message" TEXT,
    "match_type" TEXT NOT NULL DEFAULT 'scrim', -- 'scrim', 'practice', 'challenge', 'tournament'
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("id")
);

-- 2. Match Chat Table (simple chat for organizing)
CREATE TABLE IF NOT EXISTS "public"."match_chat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_request_id" UUID NOT NULL REFERENCES "public"."match_requests"("id") ON DELETE CASCADE,
    "sender_user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("id")
);

-- 3. Match Results Table (stores completed match data)
CREATE TABLE IF NOT EXISTS "public"."match_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_request_id" UUID NOT NULL REFERENCES "public"."match_requests"("id") ON DELETE CASCADE,
    "reporter_user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "winner_team_id" UUID REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    "match_duration" INTEGER, -- in minutes
    "best_player_name" TEXT,
    "best_player_team_id" UUID REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    "challenger_feedback" TEXT, -- feedback about opponent team
    "opponent_feedback" TEXT, -- feedback about challenger team
    "challenger_score" INTEGER DEFAULT 0,
    "opponent_score" INTEGER DEFAULT 0,
    "is_verified" BOOLEAN DEFAULT FALSE,
    "verifier_user_id" UUID REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "verified_at" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY ("id")
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_match_requests_challenger" ON "public"."match_requests"("challenger_team_id");
CREATE INDEX IF NOT EXISTS "idx_match_requests_opponent" ON "public"."match_requests"("opponent_team_id");
CREATE INDEX IF NOT EXISTS "idx_match_requests_status" ON "public"."match_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_match_chat_request" ON "public"."match_chat"("match_request_id");
CREATE INDEX IF NOT EXISTS "idx_match_results_request" ON "public"."match_results"("match_request_id");

-- 5. Disable RLS for easier development (can be enabled later with proper policies)
ALTER TABLE "public"."match_requests" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_chat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."match_results" DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Test match request (uncomment to add sample data)
-- INSERT INTO "public"."match_requests" 
-- ("challenger_team_id", "opponent_team_id", "challenger_user_id", "opponent_user_id", "message", "match_type")
-- VALUES 
-- ('your-team-id', 'opponent-team-id', 'your-user-id', 'opponent-user-id', 'Good luck! Looking forward to a great match!', 'scrim');

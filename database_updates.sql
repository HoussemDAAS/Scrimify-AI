-- ========================================
-- SCRIMIFY AI DATABASE SCHEMA UPDATES
-- ========================================

-- 1. Add missing columns to users table for complete profile management
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS competitive_level TEXT DEFAULT 'casual';
ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for_team BOOLEAN DEFAULT TRUE;

-- 2. Enhanced Riot Games integration columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS riot_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS riot_tagline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS riot_account_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS riot_puuid TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS riot_region TEXT;

-- 3. Create comprehensive game statistics storage table
CREATE TABLE IF NOT EXISTS user_game_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    
    -- Profile Information
    profile_icon_url TEXT,
    summoner_level INTEGER,
    account_level INTEGER,
    
    -- Rank Information
    current_rank TEXT,
    rank_points TEXT, -- LP for LoL, RR for Valorant
    rank_icon_url TEXT,
    flex_rank TEXT,
    
    -- Performance Statistics
    main_role TEXT,
    main_agent TEXT,
    win_rate DECIMAL(5,2),
    games_played INTEGER,
    wins INTEGER,
    losses INTEGER,
    total_matches INTEGER,
    average_kda DECIMAL(4,2),
    
    -- Match History
    last_played TIMESTAMP,
    recent_form TEXT, -- e.g., "WWLWW"
    
    -- Additional Data (JSON for flexibility)
    additional_stats JSONB,
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(user_id, game_id)
);

-- 4. Create match history storage for detailed analysis
CREATE TABLE IF NOT EXISTS user_match_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    
    -- Match Details
    match_date TIMESTAMP,
    queue_type TEXT,
    game_duration INTEGER, -- in seconds
    
    -- Player Performance
    champion_played TEXT,
    role_played TEXT,
    kills INTEGER,
    deaths INTEGER,
    assists INTEGER,
    win BOOLEAN,
    
    -- Additional match data
    match_data JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate matches
    UNIQUE(user_id, game_id, match_id)
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_riot_puuid ON users(riot_puuid);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_game ON user_game_statistics(user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_match_history_user_game ON user_match_history(user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_match_history_date ON user_match_history(match_date DESC);

-- 6. Add constraints for data integrity
ALTER TABLE users ADD CONSTRAINT check_competitive_level 
    CHECK (competitive_level IN ('casual', 'competitive', 'semi-pro', 'professional'));

-- 7. Update existing users to have default values where needed
UPDATE users SET 
    competitive_level = 'casual' 
WHERE competitive_level IS NULL;

UPDATE users SET 
    looking_for_team = TRUE 
WHERE looking_for_team IS NULL;

-- 8. Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_stats_updated_at ON user_game_statistics;
CREATE TRIGGER update_game_stats_updated_at 
    BEFORE UPDATE ON user_game_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE POLICIES (if using RLS)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE user_game_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_match_history ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own game statistics
CREATE POLICY user_game_statistics_policy ON user_game_statistics
    FOR ALL USING (auth.uid() = user_id);

-- Allow users to manage their own match history
CREATE POLICY user_match_history_policy ON user_match_history
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- FIX: Add missing updated_at column and trigger
-- ========================================

-- Add updated_at column if it doesn't exist
ALTER TABLE user_game_statistics 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_user_game_statistics_updated_at ON user_game_statistics;
CREATE TRIGGER update_user_game_statistics_updated_at
    BEFORE UPDATE ON user_game_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_game_statistics'
ORDER BY ordinal_position;

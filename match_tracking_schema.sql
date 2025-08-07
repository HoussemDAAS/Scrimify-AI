-- ========================================
-- MATCH TRACKING SYSTEM FOR SCRIMIFY AI
-- ========================================

-- 1. Update teams table with new LoL-specific columns
ALTER TABLE teams ADD COLUMN IF NOT EXISTS playstyle TEXT; -- aggressive, defensive, balanced, objective-focused
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_goal TEXT; -- casual, competitive, tournament, professional
ALTER TABLE teams ADD COLUMN IF NOT EXISTS communication_style TEXT; -- voice, text, both, flexible
ALTER TABLE teams ADD COLUMN IF NOT EXISTS preferred_roles TEXT[]; -- array of roles
ALTER TABLE teams ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;

-- 2. Create team_matches table for tracking scrimmages between teams
CREATE TABLE IF NOT EXISTS team_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Match participants
    team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Match details
    match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    game TEXT NOT NULL,
    match_type TEXT DEFAULT 'scrim', -- scrim, practice, tournament
    
    -- Results (to be filled by team owners)
    winner_team_id UUID REFERENCES teams(id),
    team_a_score INTEGER,
    team_b_score INTEGER,
    
    -- Match reports from both teams
    team_a_report JSONB, -- {best_player: "", feedback: "", verified: false}
    team_b_report JSONB, -- {best_player: "", feedback: "", verified: false}
    
    -- Status tracking
    status TEXT DEFAULT 'pending', -- pending, reported_a, reported_b, completed
    verified BOOLEAN DEFAULT FALSE, -- true when both teams have reported
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create match_reports table for individual team reports
CREATE TABLE IF NOT EXISTS match_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES team_matches(id) ON DELETE CASCADE,
    reporting_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Report details
    result TEXT NOT NULL, -- 'win' or 'loss'
    opponent_team_rating INTEGER CHECK (opponent_team_rating >= 1 AND opponent_team_rating <= 5),
    best_player_name TEXT,
    feedback TEXT,
    playstyle_observed TEXT, -- what playstyle they observed from opponent
    
    -- Ratings
    teamwork_rating INTEGER CHECK (teamwork_rating >= 1 AND teamwork_rating <= 5),
    skill_rating INTEGER CHECK (skill_rating >= 1 AND skill_rating <= 5),
    sportsmanship_rating INTEGER CHECK (sportsmanship_rating >= 1 AND sportsmanship_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_matches_teams ON team_matches(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_team_matches_date ON team_matches(match_date);
CREATE INDEX IF NOT EXISTS idx_team_matches_status ON team_matches(status);
CREATE INDEX IF NOT EXISTS idx_match_reports_match ON match_reports(match_id);
CREATE INDEX IF NOT EXISTS idx_match_reports_team ON match_reports(reporting_team_id);

-- 5. Create function to update team win rates
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update team A stats
    UPDATE teams 
    SET 
        total_matches = (
            SELECT COUNT(*) FROM team_matches 
            WHERE (team_a_id = NEW.team_a_id OR team_b_id = NEW.team_a_id) 
            AND verified = TRUE
        ),
        wins = (
            SELECT COUNT(*) FROM team_matches 
            WHERE winner_team_id = NEW.team_a_id AND verified = TRUE
        ),
        losses = (
            SELECT COUNT(*) FROM team_matches 
            WHERE (team_a_id = NEW.team_a_id OR team_b_id = NEW.team_a_id) 
            AND winner_team_id != NEW.team_a_id AND verified = TRUE
        )
    WHERE id = NEW.team_a_id;
    
    -- Update team B stats
    UPDATE teams 
    SET 
        total_matches = (
            SELECT COUNT(*) FROM team_matches 
            WHERE (team_a_id = NEW.team_b_id OR team_b_id = NEW.team_b_id) 
            AND verified = TRUE
        ),
        wins = (
            SELECT COUNT(*) FROM team_matches 
            WHERE winner_team_id = NEW.team_b_id AND verified = TRUE
        ),
        losses = (
            SELECT COUNT(*) FROM team_matches 
            WHERE (team_a_id = NEW.team_b_id OR team_b_id = NEW.team_b_id) 
            AND winner_team_id != NEW.team_b_id AND verified = TRUE
        )
    WHERE id = NEW.team_b_id;
    
    -- Calculate win rates
    UPDATE teams 
    SET win_rate = CASE 
        WHEN total_matches > 0 THEN (wins::DECIMAL / total_matches::DECIMAL) * 100 
        ELSE 0 
    END
    WHERE id IN (NEW.team_a_id, NEW.team_b_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-update team stats when matches are verified
DROP TRIGGER IF EXISTS update_team_stats_trigger ON team_matches;
CREATE TRIGGER update_team_stats_trigger
    AFTER UPDATE OF verified ON team_matches
    FOR EACH ROW
    WHEN (NEW.verified = TRUE)
    EXECUTE FUNCTION update_team_stats();

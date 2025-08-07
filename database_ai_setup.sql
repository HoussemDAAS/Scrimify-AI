-- Enable vector extension for AI team matching
CREATE EXTENSION IF NOT EXISTS vector;

-- Team performance vectors for AI matching
CREATE TABLE team_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  embedding vector(384), -- Smaller dimension for faster processing
  skill_level FLOAT NOT NULL DEFAULT 5.0, -- 1-10 scale
  region_weight FLOAT NOT NULL DEFAULT 1.0,
  activity_score FLOAT NOT NULL DEFAULT 5.0, -- How active the team is
  playstyle_aggression FLOAT NOT NULL DEFAULT 5.0, -- 1-10 scale
  playstyle_teamwork FLOAT NOT NULL DEFAULT 5.0,
  availability_hours TEXT, -- JSON array of available hours
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id)
);

-- Index for fast similarity search
CREATE INDEX team_vectors_embedding_idx ON team_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for filtering
CREATE INDEX team_vectors_skill_idx ON team_vectors (skill_level);
CREATE INDEX team_vectors_region_idx ON team_vectors (region_weight);

-- AI recommendations tracking
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommended_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  reason TEXT,
  recommendation_type TEXT DEFAULT 'scrim', -- 'scrim', 'practice', 'challenge'
  created_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  result TEXT -- 'accepted', 'rejected', 'no_response'
);

-- Function to calculate team skill level based on members
CREATE OR REPLACE FUNCTION calculate_team_skill_level(team_id_param UUID)
RETURNS FLOAT AS $$
DECLARE
  avg_skill FLOAT;
  rank_mapping JSONB;
BEGIN
  -- Rank to numeric mapping (simplified)
  rank_mapping := '{
    "iron": 1, "bronze": 2, "silver": 3, "gold": 4, 
    "platinum": 5, "diamond": 6, "master": 7, "grandmaster": 8, "challenger": 9,
    "unranked": 3, "casual": 3
  }'::jsonb;
  
  SELECT AVG(
    COALESCE(
      (rank_mapping->LOWER(COALESCE(u.competitive_level, 'casual')))::float, 
      3.0
    )
  ) INTO avg_skill
  FROM team_memberships tm
  JOIN users u ON tm.user_id = u.id
  WHERE tm.team_id = team_id_param;
  
  RETURN COALESCE(avg_skill, 5.0);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate team vectors when team is created/updated
CREATE OR REPLACE FUNCTION generate_team_vector()
RETURNS TRIGGER AS $$
DECLARE
  skill_level_calc FLOAT;
  region_weight_calc FLOAT;
  activity_calc FLOAT;
  embedding_vec vector(384);
BEGIN
  -- Calculate skill level
  skill_level_calc := calculate_team_skill_level(NEW.id);
  
  -- Calculate region weight (simplified)
  region_weight_calc := CASE 
    WHEN NEW.region = 'NA' THEN 1.0
    WHEN NEW.region = 'EU' THEN 2.0
    WHEN NEW.region = 'ASIA' THEN 3.0
    ELSE 1.5
  END;
  
  -- Calculate activity score based on recent activity
  activity_calc := LEAST(10.0, GREATEST(1.0, 
    5.0 + EXTRACT(EPOCH FROM (NOW() - NEW.updated_at)) / 86400.0 * -0.1
  ));
  
  -- Generate simple embedding based on team characteristics
  embedding_vec := array_fill(0, ARRAY[384])::vector(384);
  
  -- Upsert team vector
  INSERT INTO team_vectors (
    team_id, 
    embedding, 
    skill_level, 
    region_weight, 
    activity_score,
    playstyle_aggression,
    playstyle_teamwork,
    availability_hours
  ) VALUES (
    NEW.id,
    embedding_vec,
    skill_level_calc,
    region_weight_calc,
    activity_calc,
    5.0 + RANDOM() * 3.0, -- Random playstyle for now
    5.0 + RANDOM() * 3.0,
    '["18","19","20","21"]'::text -- Default evening hours
  )
  ON CONFLICT (team_id) DO UPDATE SET
    skill_level = skill_level_calc,
    region_weight = region_weight_calc,
    activity_score = activity_calc,
    last_updated = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate vectors
CREATE TRIGGER team_vector_trigger
  AFTER INSERT OR UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION generate_team_vector();

-- Populate vectors for existing teams
INSERT INTO team_vectors (team_id, embedding, skill_level, region_weight, activity_score, playstyle_aggression, playstyle_teamwork, availability_hours)
SELECT 
  t.id,
  array_fill(0, ARRAY[384])::vector(384),
  calculate_team_skill_level(t.id),
  CASE 
    WHEN t.region = 'NA' THEN 1.0
    WHEN t.region = 'EU' THEN 2.0
    WHEN t.region = 'ASIA' THEN 3.0
    ELSE 1.5
  END,
  LEAST(10.0, GREATEST(1.0, 5.0 + EXTRACT(EPOCH FROM (NOW() - t.updated_at)) / 86400.0 * -0.1)),
  5.0 + RANDOM() * 3.0,
  5.0 + RANDOM() * 3.0,
  '["18","19","20","21"]'::text
FROM teams t
ON CONFLICT (team_id) DO NOTHING;

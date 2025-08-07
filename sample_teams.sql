-- Insert sample teams for testing AI recommendations
INSERT INTO teams (
  id, name, description, game, region, rank_requirement, 
  max_members, current_members, owner_id, created_at, updated_at
) VALUES 
-- League of Legends teams
(
  gen_random_uuid(),
  'Shadow Wolves',
  'Competitive LoL team looking for skilled players. We practice daily and compete in tournaments.',
  'league-of-legends',
  'NA',
  'Gold',
  5,
  3,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Nexus Raiders',
  'Casual but dedicated team. Perfect for improving your skills in a friendly environment.',
  'league-of-legends',
  'EU',
  'Silver',
  5,
  2,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Diamond Crushers',
  'High-level team seeking experienced players. Diamond+ rank required.',
  'league-of-legends',
  'NA',
  'Diamond',
  5,
  4,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),

-- Valorant teams
(
  gen_random_uuid(),
  'Phantom Squad',
  'Tactical Valorant team with great communication. We focus on strategy and teamwork.',
  'valorant',
  'NA',
  'Platinum',
  5,
  3,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Spike Hunters',
  'Looking for dedicated Valorant players who want to climb the ranks together.',
  'valorant',
  'EU',
  'Gold',
  5,
  2,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),

-- CS2 teams
(
  gen_random_uuid(),
  'Headshot Heroes',
  'Competitive CS2 team with years of experience. Looking for skilled riflers and AWPers.',
  'cs2',
  'NA',
  'Global Elite',
  5,
  4,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Bomb Defusers',
  'Casual CS2 team perfect for learning and having fun. All skill levels welcome.',
  'cs2',
  'EU',
  'Gold Nova',
  5,
  1,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
);

-- Update team IDs and insert some team memberships for realism
DO $$
DECLARE
    team_record RECORD;
    sample_user_id UUID;
BEGIN
    -- Get a sample user ID
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Insert team memberships for the team owners
    FOR team_record IN SELECT id, owner_id FROM teams WHERE created_at > NOW() - INTERVAL '1 minute'
    LOOP
        INSERT INTO team_memberships (team_id, user_id, role, joined_at)
        VALUES (team_record.id, team_record.owner_id, 'owner', NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

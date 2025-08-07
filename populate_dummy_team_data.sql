-- ========================================
-- POPULATE DUMMY DATA FOR EXISTING TEAMS
-- ========================================

-- This script adds dummy data for the new LoL-specific fields
-- for any existing teams that don't have these values set

-- Update existing teams with dummy playstyle data
UPDATE teams 
SET playstyle = CASE 
    WHEN RANDOM() < 0.25 THEN 'aggressive'
    WHEN RANDOM() < 0.5 THEN 'defensive' 
    WHEN RANDOM() < 0.75 THEN 'balanced'
    ELSE 'objective-focused'
END
WHERE playstyle IS NULL OR playstyle = '';

-- Update existing teams with dummy primary_goal data
UPDATE teams 
SET primary_goal = CASE 
    WHEN RANDOM() < 0.3 THEN 'casual'
    WHEN RANDOM() < 0.6 THEN 'competitive'
    WHEN RANDOM() < 0.85 THEN 'tournament'
    ELSE 'professional'
END
WHERE primary_goal IS NULL OR primary_goal = '';

-- Update existing teams with dummy communication_style data
UPDATE teams 
SET communication_style = CASE 
    WHEN RANDOM() < 0.4 THEN 'voice'
    WHEN RANDOM() < 0.7 THEN 'text'
    WHEN RANDOM() < 0.9 THEN 'both'
    ELSE 'flexible'
END
WHERE communication_style IS NULL OR communication_style = '';

-- Update existing teams with dummy preferred_roles data
UPDATE teams 
SET preferred_roles = CASE 
    WHEN RANDOM() < 0.2 THEN ARRAY['top', 'jungle']
    WHEN RANDOM() < 0.4 THEN ARRAY['mid', 'adc']
    WHEN RANDOM() < 0.6 THEN ARRAY['support', 'jungle']
    WHEN RANDOM() < 0.8 THEN ARRAY['top', 'mid', 'adc']
    ELSE ARRAY['top', 'jungle', 'mid', 'adc', 'support']
END
WHERE preferred_roles IS NULL OR array_length(preferred_roles, 1) IS NULL;

-- Initialize match statistics for existing teams (if not already set)
UPDATE teams 
SET 
    wins = FLOOR(RANDOM() * 20)::INTEGER,
    losses = FLOOR(RANDOM() * 15)::INTEGER,
    total_matches = 0
WHERE wins IS NULL OR losses IS NULL;

-- Calculate total_matches and win_rate for updated teams
UPDATE teams 
SET 
    total_matches = wins + losses,
    win_rate = CASE 
        WHEN (wins + losses) > 0 THEN ROUND((wins::DECIMAL / (wins + losses)::DECIMAL) * 100, 2)
        ELSE 0
    END
WHERE total_matches IS NULL OR total_matches = 0;

-- Add some sample team data with realistic LoL information
-- First, let's get some existing user IDs to use as owners
DO $$
DECLARE
    user_ids UUID[];
    user_count INTEGER;
BEGIN
    -- Get existing user IDs
    SELECT ARRAY(SELECT id FROM users LIMIT 10) INTO user_ids;
    user_count := array_length(user_ids, 1);
    
    -- Only insert if we have users to assign as owners
    IF user_count > 0 THEN
        INSERT INTO teams (
            name, 
            description, 
            game, 
            region, 
            rank_requirement, 
            max_members, 
            current_members, 
            practice_schedule,
            playstyle,
            primary_goal,
            communication_style,
            preferred_roles,
            wins,
            losses,
            total_matches,
            win_rate,
            owner_id
        ) VALUES 
        (
            'Rift Guardians',
            'Competitive League of Legends team focused on climbing the ranked ladder and participating in tournaments.',
            'league-of-legends',
            'NA',
            'Diamond',
            5,
            4,
            'Weekdays 7-10 PM EST',
            'aggressive',
            'competitive',
            'voice',
            ARRAY['top', 'jungle', 'mid'],
            15,
            8,
            23,
            65.22,
            user_ids[1 % user_count + 1]
        ),
        (
            'Shadow Nexus',
            'Strategic team looking for skilled players to dominate the Rift with coordinated plays.',
            'league-of-legends',
            'EU',
            'Platinum',
            5,
            3,
            'Weekends 2-6 PM CET',
            'defensive',
            'tournament',
            'both',
            ARRAY['mid', 'adc', 'support'],
            12,
            10,
            22,
            54.55,
            user_ids[2 % user_count + 1]
        ),
        (
            'Iron Wolves',
            'Casual but dedicated team focused on improving together and having fun.',
            'league-of-legends',
            'NA',
            'Gold',
            5,
            5,
            'Tuesday/Thursday 8-10 PM EST',
            'balanced',
            'casual',
            'flexible',
            ARRAY['jungle', 'support'],
            8,
            12,
            20,
            40.00,
            user_ids[3 % user_count + 1]
        ),
        (
            'Apex Legends',
            'Professional esports organization seeking top-tier talent for competitive play.',
            'league-of-legends',
            'KR',
            'Grandmaster',
            5,
            2,
            'Daily 6-10 PM KST',
            'objective-focused',
            'professional',
            'voice',
            ARRAY['top', 'jungle', 'mid', 'adc', 'support'],
            25,
            5,
            30,
            83.33,
            user_ids[4 % user_count + 1]
        ),
        (
            'Storm Breakers',
            'Mid-tier team looking to break into higher divisions through strategic gameplay.',
            'league-of-legends',
            'EU',
            'Platinum',
            5,
            4,
            'Monday/Wednesday/Friday 7-9 PM CET',
            'aggressive',
            'competitive',
            'voice',
            ARRAY['top', 'mid', 'adc'],
            18,
            14,
            32,
            56.25,
            user_ids[5 % user_count + 1]
        ),
        (
            'Mystic Realm',
            'Friendly team focused on learning and improving together in a supportive environment.',
            'league-of-legends',
            'NA',
            'Silver',
            5,
            3,
            'Weekends 1-4 PM EST',
            'balanced',
            'casual',
            'text',
            ARRAY['jungle', 'support'],
            6,
            8,
            14,
            42.86,
            user_ids[6 % user_count + 1]
        ),
        (
            'Elite Squadron',
            'High-level competitive team preparing for major tournaments and championships.',
            'league-of-legends',
            'EU',
            'Master',
            5,
            5,
            'Daily 5-9 PM CET',
            'objective-focused',
            'tournament',
            'voice',
            ARRAY['top', 'jungle', 'mid', 'adc', 'support'],
            22,
            7,
            29,
            75.86,
            user_ids[7 % user_count + 1]
        ),
        (
            'Neon Knights',
            'Dynamic team that adapts playstyles based on meta and opponent strategies.',
            'league-of-legends',
            'NA',
            'Diamond',
            5,
            4,
            'Tuesday/Thursday/Sunday 8-11 PM EST',
            'balanced',
            'competitive',
            'both',
            ARRAY['mid', 'jungle', 'adc'],
            14,
            11,
            25,
            56.00,
            user_ids[8 % user_count + 1]
        );
        
        RAISE NOTICE 'Successfully inserted % sample teams', 8;
    ELSE
        RAISE NOTICE 'No users found - skipping sample team creation. Please create some users first.';
    END IF;
END $$;

-- Verify the updates
SELECT 
    name,
    playstyle,
    primary_goal,
    communication_style,
    preferred_roles,
    wins,
    losses,
    total_matches,
    win_rate
FROM teams 
WHERE game = 'league-of-legends'
ORDER BY win_rate DESC;

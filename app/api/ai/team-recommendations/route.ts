import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { getUserByClerkId, getUserTeamsForGame, supabase, trackAIRecommendation, Team } from '@/lib/supabase'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Extended team interface with LoL-specific fields
interface ExtendedTeam extends Team {
  playstyle?: string
  primary_goal?: string
  communication_style?: string
  preferred_roles?: string[]
  wins?: number
  losses?: number
  win_rate?: number
}

interface AITeamRecommendation {
  team: {
    id: string
    name: string
    game: string
    description?: string
    region: string
    current_members: number
    max_members: number
    rank_requirement?: string
    practice_schedule?: string
    playstyle?: string
    primary_goal?: string
    communication_style?: string
    preferred_roles?: string[]
    wins?: number
    losses?: number
    win_rate?: number
    logo_url?: string
  }
  score: number
  reason: string
  challengeType: 'scrim' | 'practice' | 'challenge' | 'coaching'
  skillGap: 'easier' | 'equal' | 'harder'
  compatibilityFactors: {
    skillMatch: number
    regionMatch: number
    activityMatch: number
    playstyleMatch: number
  }
}

// Game name conversion helper
function normalizeGameName(game: string): string[] {
  const gameNameMappings: Record<string, string[]> = {
    'league-of-legends': ['league-of-legends', 'League of Legends', 'LoL', 'lol'],
    'valorant': ['valorant', 'Valorant', 'VALORANT'],
    'counter-strike-2': ['counter-strike-2', 'Counter-Strike 2', 'CS2', 'cs2'],
    'overwatch-2': ['overwatch-2', 'Overwatch 2', 'OW2', 'ow2'],
    'rocket-league': ['rocket-league', 'Rocket League', 'RL', 'rl']
  }
  
  // Return all possible variations for the game
  return gameNameMappings[game] || [game]
}

// AI-powered team matching function
async function getAITeamRecommendations(
  clerkId: string, 
  game: string, 
  selectedTeamId?: string,
  limit: number = 5
): Promise<AITeamRecommendation[]> {
  let myTeam = null
  
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    console.log(`🔍 AI Recommendations Debug for user ${clerkId}:`)
    console.log(`📝 Input game format: "${game}"`)

    // Normalize game name to handle multiple formats
    const gameVariations = normalizeGameName(game)
    console.log(`🔄 Checking game variations: ${gameVariations.join(', ')}`)

    // Get user's teams for this game (try all variations)
    let userTeams: any[] = []
    for (const gameVariation of gameVariations) {
      const teams = await getUserTeamsForGame(clerkId, gameVariation)
      if (teams.length > 0) {
        userTeams = teams
        console.log(`✅ Found ${teams.length} user teams with game format: "${gameVariation}"`)
        break
      }
    }
    
    console.log(`- User has ${userTeams.length} teams for ${game}`)
    
    // Select the team to analyze (either specified or first team)
    if (selectedTeamId) {
      myTeam = userTeams.find(ut => ut.teams.id === selectedTeamId)?.teams
      console.log(`- Selected team: ${myTeam?.name || 'Not found'}`)
    } else if (userTeams.length > 0) {
      myTeam = userTeams[0]?.teams
      console.log(`- Using first team: ${myTeam?.name}`)
    } else {
      console.log('- No user teams found, looking for teams to join')
    }

    // Get all available teams for this game with LoL-specific fields
    // Use OR condition to check all game name variations
    let query = supabase
      .from('teams')
      .select(`
        *,
        playstyle,
        primary_goal,
        communication_style,
        preferred_roles,
        wins,
        losses,
        win_rate
      `)
    
    // Add OR conditions for all game variations
    if (gameVariations.length === 1) {
      query = query.eq('game', gameVariations[0])
    } else {
      query = query.in('game', gameVariations)
    }
    
    const { data: availableTeams, error } = await query
      .order('current_members', { ascending: false })
      .limit(limit * 3) // Get more candidates

    if (error) {
      console.error('Error fetching available teams:', error)
      return []
    }

    console.log(`- Found ${availableTeams?.length || 0} total teams in database`)

    if (!availableTeams || availableTeams.length === 0) {
      console.log('❌ No teams found in database for game:', game)
      return []
    }

    // For OPPONENT MATCHING: Include ALL teams (including user's teams for potential challenges)
    // But prioritize teams that are NOT user's teams for better variety
    let candidateTeams = availableTeams
    let userTeamIds: string[] = []
    
    if (userTeams.length > 0) {
      userTeamIds = userTeams.map(ut => ut.teams.id)
      console.log(`- User owns ${userTeamIds.length} teams, looking for opponents to play against`)
    }

    console.log(`✅ Proceeding with ${candidateTeams.length} potential opponent teams for AI analysis`)

    // Use OpenAI to analyze team matchup compatibility (focus on balanced/competitive matches)
    const recommendations = await analyzeTeamMatchups(myTeam, candidateTeams, userTeamIds, game, limit)
    
    console.log(`✅ AI returned ${recommendations.length} recommendations`)
    
    return recommendations

  } catch (error) {
    console.error('❌ Error in getAITeamRecommendations:', error)
    
    // Enhanced fallback - try to get ANY teams for this game using all variations
    try {
      console.log(`🔄 Attempting fallback with game variations: ${gameVariations.join(', ')}`)
      
      let fallbackQuery = supabase
        .from('teams')
        .select('*')
      
      if (gameVariations.length === 1) {
        fallbackQuery = fallbackQuery.eq('game', gameVariations[0])
      } else {
        fallbackQuery = fallbackQuery.in('game', gameVariations)
      }
      
      const { data: fallbackTeams } = await fallbackQuery.limit(limit)
      
      if (fallbackTeams && fallbackTeams.length > 0) {
        console.log(`🔄 Using fallback recommendations with ${fallbackTeams.length} teams`)
        return generateFallbackRecommendations(fallbackTeams, myTeam)
      } else {
        console.log('❌ No teams available even for fallback')
        console.log(`🔍 Tried game formats: ${gameVariations.join(', ')}`)
        return []
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      return []
    }
  }
}

// OpenAI-powered team matchup analysis for finding opponents
async function analyzeTeamMatchups(
  myTeam: { 
    name: string; 
    description?: string; 
    region: string; 
    rank_requirement?: string; 
    practice_schedule?: string; 
    game_specific_data?: Record<string, string>; 
    current_members: number; 
    max_members: number; 
    playstyle?: string;
    primary_goal?: string;
    wins?: number;
    losses?: number;
    win_rate?: string;
  } | null,
  candidateTeams: { 
    id: string; 
    name: string; 
    description?: string; 
    region: string; 
    rank_requirement?: string; 
    practice_schedule?: string; 
    game_specific_data?: Record<string, string>; 
    current_members: number; 
    max_members: number; 
    game: string; 
    logo_url?: string; 
    playstyle?: string;
    primary_goal?: string;
    wins?: number;
    losses?: number;
    win_rate?: string;
  }[],
  userTeamIds: string[],
  game: string,
  limit: number
): Promise<AITeamRecommendation[]> {
  try {
    console.log(`🥊 Starting OPPONENT MATCHUP analysis with OpenAI...`)
    console.log(`- My team: ${myTeam?.name || 'None (finding opponents for general play)'}`)
    console.log(`- Analyzing ${candidateTeams.length} potential opponents`)
    console.log(`- User owns ${userTeamIds.length} teams`)
    console.log(`- Game: ${game}, Limit: ${limit}`)

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not found, using fallback opponent recommendations')
      return generateFallbackOpponentRecommendations(candidateTeams, userTeamIds, limit)
    }

    const myTeamData = myTeam ? {
      name: myTeam.name,
      description: myTeam.description,
      region: myTeam.region,
      rank_requirement: myTeam.rank_requirement,
      practice_schedule: myTeam.practice_schedule,
      current_members: myTeam.current_members,
      max_members: myTeam.max_members,
      playstyle: myTeam.playstyle,
      primary_goal: myTeam.primary_goal,
      wins: myTeam.wins || 0,
      losses: myTeam.losses || 0,
      win_rate: myTeam.win_rate || "0%"
    } : null

    // Filter out owned teams for priority, but keep them as potential opponents
    const nonOwnedTeams = candidateTeams.filter(team => !userTeamIds.includes(team.id))
    const ownedTeams = candidateTeams.filter(team => userTeamIds.includes(team.id))
    
    // Prioritize non-owned teams but include owned teams for variety
    const prioritizedTeams = [...nonOwnedTeams, ...ownedTeams].slice(0, limit * 2)

    const aiPrompt = `
You are an esports matchmaking AI. Your job is to find the BEST OPPONENT TEAMS for a ${game} team to play against in scrimmages, challenges, or competitive matches.

My Team Info:
${myTeamData ? JSON.stringify(myTeamData, null, 2) : 'User has no teams yet - recommend opponents for general play'}

Available Opponent Teams:
${JSON.stringify(prioritizedTeams.slice(0, Math.min(10, prioritizedTeams.length)), null, 2)}

IMPORTANT: Focus on OPPONENT MATCHING, not team joining. Consider:

1. **Competitive Balance**: Teams of similar skill levels make the best matches
2. **Regional Compatibility**: Same/close regions for better connection
3. **Schedule Alignment**: Teams that practice at similar times can scrim
4. **Skill Gap**: Slight skill differences create growth opportunities
5. **Team Goals**: Competitive teams vs casual teams for appropriate matches
6. **Win Rates**: Balanced win rates indicate good competitive matches

Return exactly ${limit} recommendations as JSON array with this format:
[
  {
    "team_id": "team-uuid",
    "score": 85,
    "reason": "Excellent matchup - similar skill and region",
    "challengeType": "scrim",
    "skillGap": "equal",
    "compatibilityFactors": {
      "skillMatch": 9,
      "regionMatch": 10,
      "activityMatch": 8,
      "playstyleMatch": 7
    }
  }
]

challengeType options: "scrim", "practice", "challenge", "tournament"
skillGap options: "easier", "equal", "harder"
Scores 1-10 for compatibility factors.
Overall score 1-100.

Focus on creating COMPETITIVE, BALANCED matches that will be fun and help teams improve.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      console.log('⚠️  No AI response received, using fallback')
      return generateFallbackOpponentRecommendations(candidateTeams, userTeamIds, limit)
    }

    console.log('🤖 OpenAI Response received, parsing...')

    // Parse AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.log('⚠️  Could not parse AI JSON response, using fallback')
      return generateFallbackOpponentRecommendations(candidateTeams, userTeamIds, limit)
    }

    const aiRecommendations = JSON.parse(jsonMatch[0])
    console.log(`✅ Parsed ${aiRecommendations.length} AI recommendations`)

    // Convert AI recommendations to full team data
    const recommendations: AITeamRecommendation[] = []
    
    for (const aiRec of aiRecommendations) {
      const team = candidateTeams.find(t => t.id === aiRec.team_id)
      if (team) {
        recommendations.push({
          team: {
            id: team.id,
            name: team.name,
            game: team.game,
            description: team.description,
            region: team.region,
            current_members: team.current_members,
            max_members: team.max_members,
            rank_requirement: team.rank_requirement,
            practice_schedule: team.practice_schedule,
            playstyle: team.playstyle,
            primary_goal: team.primary_goal,
            wins: team.wins,
            losses: team.losses,
            win_rate: team.win_rate,
            logo_url: team.logo_url,
          },
          score: aiRec.score,
          reason: aiRec.reason,
          challengeType: aiRec.challengeType,
          skillGap: aiRec.skillGap,
          compatibilityFactors: aiRec.compatibilityFactors
        })
      }
    }

    console.log(`✅ Generated ${recommendations.length} opponent recommendations`)
    return recommendations

  } catch (error) {
    console.error('❌ Error in AI matchup analysis:', error)
    return generateFallbackOpponentRecommendations(candidateTeams, userTeamIds, limit)
  }
}

// Legacy function for compatibility
async function analyzeTeamCompatibility(
  myTeam: { 
    name: string; 
    description?: string; 
    region: string; 
    rank_requirement?: string; 
    practice_schedule?: string; 
    game_specific_data?: Record<string, string>; 
    current_members: number; 
    max_members: number; 
  } | null,
  candidateTeams: { 
    id: string; 
    name: string; 
    description?: string; 
    region: string; 
    rank_requirement?: string; 
    practice_schedule?: string; 
    game_specific_data?: Record<string, string>; 
    current_members: number; 
    max_members: number; 
    game: string; 
    logo_url?: string; 
  }[],
  game: string,
  limit: number
): Promise<AITeamRecommendation[]> {
  try {
    console.log(`🤖 Starting AI analysis with OpenAI...`)
    console.log(`- My team: ${myTeam?.name || 'None (finding teams to join)'}`)
    console.log(`- Analyzing ${candidateTeams.length} candidate teams`)
    console.log(`- Game: ${game}, Limit: ${limit}`)

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not found, using fallback recommendations')
      return generateFallbackRecommendations(candidateTeams.slice(0, limit), myTeam)
    }

    const myTeamData = myTeam ? {
      name: myTeam.name,
      description: myTeam.description,
      region: myTeam.region,
      rank_requirement: myTeam.rank_requirement,
      practice_schedule: myTeam.practice_schedule,
      current_members: myTeam.current_members,
      max_members: myTeam.max_members,
      playstyle: (myTeam as ExtendedTeam).playstyle,
      primary_goal: (myTeam as ExtendedTeam).primary_goal,
      communication_style: (myTeam as ExtendedTeam).communication_style,
      preferred_roles: (myTeam as ExtendedTeam).preferred_roles,
      wins: (myTeam as ExtendedTeam).wins || 0,
      losses: (myTeam as ExtendedTeam).losses || 0,
      win_rate: (myTeam as ExtendedTeam).win_rate || 0
    } : null

    const candidateData = candidateTeams.slice(0, limit).map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      region: team.region,
      rank_requirement: team.rank_requirement,
      practice_schedule: team.practice_schedule,
      current_members: team.current_members,
      max_members: team.max_members,
      playstyle: (team as ExtendedTeam).playstyle,
      primary_goal: (team as ExtendedTeam).primary_goal,
      communication_style: (team as ExtendedTeam).communication_style,
      preferred_roles: (team as ExtendedTeam).preferred_roles,
      wins: (team as ExtendedTeam).wins || 0,
      losses: (team as ExtendedTeam).losses || 0,
      win_rate: (team as ExtendedTeam).win_rate || 0
    }))

    const prompt = `As an expert League of Legends esports analyst and team matchmaker, analyze team compatibility for competitive play using advanced LoL-specific criteria.

${myTeam ? `MY TEAM ANALYSIS:
===================
Team: ${myTeamData.name}
Description: ${myTeamData.description || 'No description provided'}
Region: ${myTeamData.region}
Rank Requirement: ${myTeamData.rank_requirement || 'No rank requirement'}
Practice Schedule: ${myTeamData.practice_schedule || 'Flexible schedule'}
Team Size: ${myTeamData.current_members}/${myTeamData.max_members} members

🎮 LEAGUE OF LEGENDS PROFILE:
• Playstyle: ${myTeamData.playstyle || 'Not specified'} 
• Primary Goal: ${myTeamData.primary_goal || 'Not specified'}
• Communication: ${myTeamData.communication_style || 'Not specified'}
• Preferred Roles: ${Array.isArray(myTeamData.preferred_roles) && myTeamData.preferred_roles.length > 0 ? myTeamData.preferred_roles.join(', ') : 'All roles'}
• Match Record: ${myTeamData.wins}W - ${myTeamData.losses}L (${myTeamData.win_rate}% win rate)

FIND COMPATIBLE TEAMS FOR: Scrimmages, practice matches, tournaments, or coaching opportunities based on skill synergy, strategic compatibility, and competitive goals.` : 'FIND THE BEST TEAMS: For a new player to join or compete against in League of Legends.'}

CANDIDATE TEAMS TO ANALYZE:
============================
${candidateData.map((team, i) => `
🏆 TEAM ${i + 1}: ${team.name}
Basic Info:
• Description: ${team.description || 'No description'}
• Region: ${team.region}
• Rank Requirement: ${team.rank_requirement || 'No requirement'}
• Practice Schedule: ${team.practice_schedule || 'Flexible'}
• Team Size: ${team.current_members}/${team.max_members} members

🎮 LoL Profile:
• Playstyle: ${team.playstyle || 'Not specified'}
• Primary Goal: ${team.primary_goal || 'Not specified'}
• Communication: ${team.communication_style || 'Not specified'}
• Preferred Roles: ${Array.isArray(team.preferred_roles) && team.preferred_roles.length > 0 ? team.preferred_roles.join(', ') : 'All roles'}
• Match Record: ${team.wins}W - ${team.losses}L (${team.win_rate}% win rate)
`).join('')}

🧠 ADVANCED ANALYSIS CRITERIA:
===============================
1. STRATEGIC COMPATIBILITY:
   - Playstyle synergy (aggressive vs defensive, objective-focused vs skirmish-heavy)
   - Meta adaptation and champion pool diversity
   - Team composition preferences and role coverage

2. COMPETITIVE ALIGNMENT:
   - Skill level matching based on rank requirements and win rates
   - Goal alignment (casual vs competitive vs professional)
   - Tournament experience and competitive mindset

3. COMMUNICATION SYNERGY:
   - Voice chat vs text preferences
   - Language and communication style compatibility
   - Leadership structures and shot-calling approaches

4. OPERATIONAL COMPATIBILITY:
   - Practice schedule alignment and time zone considerations
   - Regional proximity for potential LAN events
   - Team availability and commitment levels

5. DEVELOPMENT POTENTIAL:
   - Learning opportunities and skill development paths
   - Coaching potential and strategic growth
   - Long-term partnership possibilities

🎯 PROVIDE DETAILED ANALYSIS FOR EACH TEAM:
===========================================
For each candidate team, analyze compatibility and provide:

1. COMPATIBILITY SCORE (0-100): Overall match quality
2. DETAILED REASONING: Specific LoL factors driving the recommendation
3. CHALLENGE TYPE: 
   - "scrim" = Regular practice matches
   - "practice" = Casual training sessions  
   - "challenge" = Competitive test matches
   - "coaching" = Learning/teaching opportunities
4. SKILL GAP ASSESSMENT:
   - "easier" = Lower skill level (teaching opportunity)
   - "equal" = Similar skill level (ideal competition)
   - "harder" = Higher skill level (learning opportunity)
5. COMPATIBILITY BREAKDOWN (0-100 each):
   - skillMatch: Rank and performance compatibility
   - regionMatch: Geographic and timezone alignment
   - activityMatch: Schedule and commitment compatibility  
   - playstyleMatch: Strategic and tactical synergy

RETURN ONLY VALID JSON ARRAY:
============================
[
  {
    "teamIndex": 0,
    "score": 85,
    "reason": "Excellent strategic match with complementary aggressive playstyles. Both teams focus on early game dominance and objective control. Similar competitive goals and voice communication preferences create ideal scrim partnership. Practice schedules align perfectly for regular training sessions.",
    "challengeType": "scrim",
    "skillGap": "equal",
    "compatibilityFactors": {
      "skillMatch": 90,
      "regionMatch": 100,
      "activityMatch": 85,
      "playstyleMatch": 88
    }
  }
]`

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using more powerful model for better analysis
      messages: [
        {
          role: "system",
          content: "You are a world-class League of Legends esports analyst and strategic consultant with deep expertise in team dynamics, competitive meta, and player psychology. You specialize in analyzing team compatibility for optimal competitive matchmaking. Your analysis is precise, strategic, and considers all aspects of competitive LoL including champion pools, macro strategy, communication styles, and long-term development potential."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000, // Increased for more detailed analysis
      temperature: 0.2, // Lower temperature for more consistent, analytical responses
    })

    const aiResponse = response.choices[0]?.message?.content
    console.log(`✅ OpenAI response received (${aiResponse?.length || 0} characters)`)
    
    if (!aiResponse) {
      console.log('❌ No response content from OpenAI')
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    let aiRecommendations
    try {
      console.log(`🔍 Parsing AI response...`)
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        console.log(`📄 Found JSON in response: ${jsonMatch[0].substring(0, 200)}...`)
        aiRecommendations = JSON.parse(jsonMatch[0])
        console.log(`✅ Parsed ${aiRecommendations.length} AI recommendations`)
      } else {
        console.log('❌ No JSON array found in AI response')
        console.log('First 500 chars of response:', aiResponse.substring(0, 500))
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError)
      console.log('AI Response:', aiResponse)
      throw parseError
    }

    // Convert AI recommendations to our format
    const recommendations: AITeamRecommendation[] = aiRecommendations
      .filter((rec: { teamIndex: number }) => rec.teamIndex < candidateTeams.length)
      .map((rec: { 
        teamIndex: number; 
        score?: number; 
        reason?: string; 
        challengeType?: string; 
        skillGap?: string; 
        compatibilityFactors?: {
          skillMatch?: number;
          regionMatch?: number;
          activityMatch?: number;
          playstyleMatch?: number;
        }
      }) => {
        const team = candidateTeams[rec.teamIndex]
        return {
          team: {
            id: team.id,
            name: team.name,
            game: team.game,
            description: team.description,
            region: team.region,
            current_members: team.current_members,
            max_members: team.max_members,
            rank_requirement: team.rank_requirement,
            logo_url: team.logo_url
          },
          score: Math.min(100, Math.max(0, rec.score || 75)),
          reason: rec.reason || `Recommended ${team.name} for ${game} competition`,
          challengeType: rec.challengeType || 'practice',
          skillGap: rec.skillGap || 'equal',
          compatibilityFactors: {
            skillMatch: Math.min(100, Math.max(0, rec.compatibilityFactors?.skillMatch || 75)),
            regionMatch: Math.min(100, Math.max(0, rec.compatibilityFactors?.regionMatch || 75)),
            activityMatch: Math.min(100, Math.max(0, rec.compatibilityFactors?.activityMatch || 75)),
            playstyleMatch: Math.min(100, Math.max(0, rec.compatibilityFactors?.playstyleMatch || 75))
          }
        }
      })
      .sort((a, b) => b.score - a.score)

    console.log(`✅ Converted to ${recommendations.length} final recommendations`)
    console.log(`🎯 Top recommendation: ${recommendations[0]?.team?.name} (score: ${recommendations[0]?.score})`)

    return recommendations

  } catch (error) {
    console.error('❌ Error in OpenAI analysis:', error)
    console.log('🔄 Using fallback recommendations instead')
    // Fallback to simple recommendations
    return generateFallbackRecommendations(candidateTeams.slice(0, limit), myTeam)
  }
}

// Fallback function if OpenAI fails
function generateFallbackRecommendations(teams: { 
  id: string; 
  name: string; 
  game: string; 
  region: string; 
  current_members: number; 
  max_members: number; 
  rank_requirement?: string; 
  description?: string; 
  logo_url?: string; 
}[], myTeam?: { 
  region: string; 
  rank_requirement?: string; 
}): AITeamRecommendation[] {
  return teams.map((team) => {
    let score = 70 + Math.random() * 25 // 70-95 range
    const reasons = []

    // Boost score for same region
    if (myTeam && team.region === myTeam.region) {
      score += 5
      reasons.push("Same region")
    }

    // Boost score for similar ranks
    if (myTeam && team.rank_requirement === myTeam.rank_requirement) {
      score += 5
      reasons.push("Similar skill level")
    }

    // Boost score for open spots
    const openSpots = team.max_members - team.current_members
    if (openSpots > 0) {
      score += openSpots * 2
      reasons.push(`${openSpots} open spots`)
    }

    return {
      team: {
        id: team.id,
        name: team.name,
        game: team.game,
        description: team.description,
        region: team.region,
        current_members: team.current_members,
        max_members: team.max_members,
        rank_requirement: team.rank_requirement,
        logo_url: team.logo_url
      },
      score: Math.round(Math.min(95, score)),
      reason: reasons.length > 0 ? reasons.join(" • ") : `Active ${team.game} team with good potential for practice matches`,
      challengeType: (['scrim', 'practice', 'challenge'] as const)[Math.floor(Math.random() * 3)],
      skillGap: (['easier', 'equal', 'harder'] as const)[Math.floor(Math.random() * 3)],
      compatibilityFactors: {
        skillMatch: Math.round(70 + Math.random() * 25),
        regionMatch: myTeam && team.region === myTeam.region ? 100 : Math.round(40 + Math.random() * 30),
        activityMatch: Math.round(65 + Math.random() * 30),
        playstyleMatch: Math.round(60 + Math.random() * 35)
      }
    }
  })
}

// Fallback function for opponent matching if OpenAI fails
function generateFallbackOpponentRecommendations(
  teams: { 
    id: string; 
    name: string; 
    game: string; 
    region: string; 
    current_members: number; 
    max_members: number; 
    rank_requirement?: string; 
    description?: string; 
    logo_url?: string; 
    playstyle?: string;
    primary_goal?: string;
    wins?: number;
    losses?: number;
    win_rate?: string;
  }[], 
  userTeamIds: string[],
  limit: number
): AITeamRecommendation[] {
  console.log(`🎯 Generating fallback opponent recommendations`)
  
  // Prioritize non-owned teams but include owned teams for variety
  const nonOwnedTeams = teams.filter(team => !userTeamIds.includes(team.id))
  const ownedTeams = teams.filter(team => userTeamIds.includes(team.id))
  
  // Mix them with priority to non-owned
  const prioritizedTeams = [...nonOwnedTeams, ...ownedTeams].slice(0, limit)
  
  return prioritizedTeams.map((team, index) => {
    let score = 70 + Math.random() * 25 // 70-95 range
    const reasons = []

    // Boost score for good opponent characteristics
    if (team.current_members >= 3) {
      score += 5
      reasons.push("Active team")
    }

    // Boost for competitive teams
    if (team.primary_goal === 'competitive' || team.primary_goal === 'tournament') {
      score += 5
      reasons.push("Competitive focus")
    }

    // Boost for teams with good win rates
    const winRate = parseFloat(team.win_rate || "0")
    if (winRate > 50) {
      score += 5
      reasons.push("Strong win rate")
    }

    // Boost for balanced team size
    if (team.current_members >= 3 && team.current_members < team.max_members) {
      score += 3
      reasons.push("Good team size")
    }

    // Check if this is user's own team
    const isOwnTeam = userTeamIds.includes(team.id)
    if (isOwnTeam) {
      score -= 10 // Slightly lower priority for own teams
      reasons.push("Your team (internal scrim)")
    }

    return {
      team: {
        id: team.id,
        name: team.name,
        game: team.game,
        description: team.description,
        region: team.region,
        current_members: team.current_members,
        max_members: team.max_members,
        rank_requirement: team.rank_requirement,
        playstyle: team.playstyle,
        primary_goal: team.primary_goal,
        wins: team.wins,
        losses: team.losses,
        win_rate: team.win_rate,
        logo_url: team.logo_url
      },
      score: Math.round(Math.min(95, Math.max(50, score))),
      reason: reasons.length > 0 ? reasons.join(" • ") : `Good opponent team for competitive practice`,
      challengeType: (['scrim', 'practice', 'challenge'] as const)[index % 3],
      skillGap: (['easier', 'equal', 'harder'] as const)[Math.floor(Math.random() * 3)],
      compatibilityFactors: {
        skillMatch: Math.round(70 + Math.random() * 25),
        regionMatch: Math.round(60 + Math.random() * 35),
        activityMatch: Math.round(65 + Math.random() * 30),
        playstyleMatch: Math.round(60 + Math.random() * 35)
      }
    }
  }).sort((a, b) => b.score - a.score)
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const game = searchParams.get('game')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!game) {
      return NextResponse.json({ error: 'Game parameter is required' }, { status: 400 })
    }

    console.log(`🚀 AI Recommendations API called for game: ${game}, user: ${clerkId}`)
    console.log(`🔍 Server Debug - Starting AI recommendation process...`)

    const recommendations = await getAITeamRecommendations(clerkId, game, undefined, limit)
    
    console.log(`📊 Final result: ${recommendations.length} recommendations`)
    
    // Enhanced server logging for debugging
    if (recommendations.length === 0) {
      console.log(`❌ SERVER DEBUG: No recommendations returned for game "${game}"`)
      console.log(`❌ Possible issues:`)
      console.log(`   1. No teams found in database with game format variations`)
      console.log(`   2. All teams are owned by current user`)
      console.log(`   3. All teams are full (current_members >= max_members)`)
      console.log(`   4. OpenAI API error or fallback failed`)
      console.log(`❌ Check the detailed logs above for specific failure point`)
    } else {
      console.log(`✅ SERVER SUCCESS: Returning ${recommendations.length} recommendations`)
      recommendations.forEach((rec, i) => {
        console.log(`   ${i+1}. ${rec.team.name} (${rec.score}% match, ${rec.team.region})`)
      })
    }

    return NextResponse.json({ 
      recommendations,
      success: true,
      timestamp: new Date().toISOString(),
      debug: {
        clerkId,
        game,
        limit,
        recommendationsCount: recommendations.length
      }
    })

  } catch (error) {
    console.error('❌ AI recommendations API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get AI recommendations',
        recommendations: [],
        success: false,
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        }
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, score, reason, type, action } = body

    if (!teamId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await trackAIRecommendation(clerkId, teamId, score, reason, type, action)

    return NextResponse.json({ 
      success: true,
      message: 'Interaction tracked successfully'
    })

  } catch (error) {
    console.error('AI tracking API error:', error)
    return NextResponse.json(
      { error: 'Failed to track interaction' }, 
      { status: 500 }
    )
  }
}

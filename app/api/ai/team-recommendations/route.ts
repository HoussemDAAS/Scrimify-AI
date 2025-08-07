import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { getUserByClerkId, getUserTeamsForGame, supabase, trackAIRecommendation } from '@/lib/supabase'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Get user's teams for this game
    const userTeams = await getUserTeamsForGame(clerkId, game)
    
    // Select the team to analyze (either specified or first team)
    if (selectedTeamId) {
      myTeam = userTeams.find(ut => ut.teams.id === selectedTeamId)?.teams
    } else {
      myTeam = userTeams[0]?.teams
    }

    // Get all available teams for this game
    const { data: availableTeams, error } = await supabase
      .from('teams')
      .select('*')
      .eq('game', game)
      .order('current_members', { ascending: false })
      .limit(limit * 3) // Get more candidates

    if (error) {
      console.error('Error fetching available teams:', error)
      return []
    }

    // Exclude user's teams from recommendations
    const userTeamIds = userTeams.map(ut => ut.teams.id)
    const candidateTeams = availableTeams.filter(team => !userTeamIds.includes(team.id))

    if (candidateTeams.length === 0) {
      return []
    }

    // Use OpenAI to analyze team compatibility
    const recommendations = await analyzeTeamCompatibility(myTeam, candidateTeams, game, limit)
    
    return recommendations

  } catch (error) {
    console.error('Error in getAITeamRecommendations:', error)
    // Fallback to simple recommendations - get teams again if needed
    const { data: fallbackTeams } = await supabase
      .from('teams')
      .select('*')
      .eq('game', game)
      .limit(limit)
    
    return generateFallbackRecommendations(fallbackTeams || [], myTeam)
  }
}

// OpenAI-powered team analysis
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
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using fallback')
      return generateFallbackRecommendations(candidateTeams.slice(0, limit), myTeam)
    }

    const myTeamData = myTeam ? {
      name: myTeam.name,
      description: myTeam.description,
      region: myTeam.region,
      rank_requirement: myTeam.rank_requirement,
      practice_schedule: myTeam.practice_schedule,
      game_specific_data: myTeam.game_specific_data,
      current_members: myTeam.current_members,
      max_members: myTeam.max_members
    } : null

    const candidateData = candidateTeams.slice(0, limit).map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      region: team.region,
      rank_requirement: team.rank_requirement,
      practice_schedule: team.practice_schedule,
      game_specific_data: team.game_specific_data,
      current_members: team.current_members,
      max_members: team.max_members
    }))

    const prompt = `As an expert esports analyst, analyze team compatibility for ${game}.

${myTeam ? `My Team Profile:
Name: ${myTeamData.name}
Description: ${myTeamData.description}
Region: ${myTeamData.region}
Rank: ${myTeamData.rank_requirement}
Schedule: ${myTeamData.practice_schedule}
Members: ${myTeamData.current_members}/${myTeamData.max_members}
Game Data: ${JSON.stringify(myTeamData.game_specific_data)}

Find compatible teams for scrimmages, practice matches, or tournaments.` : 'Find the best teams for a new player to join or compete against.'}

Candidate Teams:
${candidateData.map((team, i) => `
${i + 1}. ${team.name}
   Description: ${team.description}
   Region: ${team.region}
   Rank: ${team.rank_requirement}
   Schedule: ${team.practice_schedule}
   Members: ${team.current_members}/${team.max_members}
   Game Data: ${JSON.stringify(team.game_specific_data)}
`).join('')}

For each team, provide:
1. Compatibility score (0-100)
2. Detailed reason for recommendation
3. Challenge type: "scrim", "practice", "challenge", or "coaching"
4. Skill gap: "easier", "equal", or "harder"
5. Compatibility factors (0-100 each): skillMatch, regionMatch, activityMatch, playstyleMatch

Return ONLY a JSON array in this exact format:
[
  {
    "teamIndex": 0,
    "score": 85,
    "reason": "Strong tactical team with complementary playstyles. Similar practice schedules and communication preferences make them ideal for regular scrimmages.",
    "challengeType": "scrim",
    "skillGap": "equal",
    "compatibilityFactors": {
      "skillMatch": 90,
      "regionMatch": 100,
      "activityMatch": 85,
      "playstyleMatch": 80
    }
  }
]`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional esports analyst specializing in team compatibility and competitive matchmaking. Provide accurate, detailed analysis based on team data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    let aiRecommendations
    try {
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        aiRecommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
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

    return recommendations

  } catch (error) {
    console.error('Error in OpenAI analysis:', error)
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

    const recommendations = await getAITeamRecommendations(clerkId, game, undefined, limit)

    return NextResponse.json({ 
      recommendations,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI recommendations API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get AI recommendations',
        recommendations: [],
        success: false
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

// Simple AI team matching functions (without complex vectors for now)

// Get AI team recommendations for a user
export async function getAITeamRecommendations(
  clerkId: string, 
  game: string, 
  limit: number = 5
): Promise<AITeamRecommendation[]> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) throw new Error('User not found')

    // Get user's teams for this game
    const userTeams = await getUserTeamsForGame(clerkId, game)
    
    // Get all available teams for this game
    const { data: availableTeams, error } = await supabase
      .from('teams')
      .select('*')
      .eq('game', game)
      .lt('current_members', supabase.raw('max_members'))
      .order('current_members', { ascending: false })
      .limit(limit * 2)

    if (error) {
      console.error('Error fetching available teams:', error)
      return []
    }

    // If user has teams, exclude their teams from recommendations
    const userTeamIds = userTeams.map(ut => ut.teams.id)
    const filteredTeams = availableTeams.filter(team => !userTeamIds.includes(team.id))

    // Generate simple recommendations
    const recommendations: AITeamRecommendation[] = []

    for (const team of filteredTeams.slice(0, limit)) {
      const recommendation = generateSimpleRecommendation(team, userTeams[0]?.teams)
      recommendations.push(recommendation)
    }

    return recommendations.sort((a, b) => b.score - a.score)

  } catch (error) {
    console.error('Error in getAITeamRecommendations:', error)
    return []
  }
}

// Generate simple recommendation
function generateSimpleRecommendation(team: Team, userTeam?: Team): AITeamRecommendation {
  let score = 60 // Base score
  const reasons = []

  // Boost score based on availability
  const availabilityRatio = (team.max_members - team.current_members) / team.max_members
  score += availabilityRatio * 20
  if (availabilityRatio > 0.4) reasons.push("Has open spots")

  // Boost score if same region as user's team
  if (userTeam && team.region === userTeam.region) {
    score += 15
    reasons.push("Same region")
  }

  // Boost score for certain ranks
  if (team.rank_requirement) {
    const popularRanks = ['Gold', 'Platinum', 'Silver']
    if (popularRanks.includes(team.rank_requirement)) {
      score += 10
      reasons.push("Popular skill level")
    }
  }

  // Boost score for active teams
  if (team.current_members >= 2) {
    score += 5
    reasons.push("Active team")
  }

  const challengeTypes: Array<'scrim' | 'practice' | 'challenge' | 'coaching'> = ['scrim', 'practice', 'challenge']
  const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]
  
  const skillGaps: Array<'easier' | 'equal' | 'harder'> = ['easier', 'equal', 'harder']
  const skillGap = skillGaps[Math.floor(Math.random() * skillGaps.length)]

  return {
    team,
    score: Math.min(95, Math.max(30, Math.round(score))),
    reason: reasons.length > 0 ? reasons.join(" • ") : "Good potential match",
    challengeType,
    skillGap,
    compatibilityFactors: {
      skillMatch: Math.round(Math.random() * 30 + 60),
      regionMatch: userTeam && team.region === userTeam.region ? 100 : 50,
      activityMatch: Math.round(availabilityRatio * 100),
      playstyleMatch: Math.round(Math.random() * 30 + 60)
    }
  }
}

// Track AI recommendation interaction
export async function trackAIRecommendation(
  clerkId: string,
  teamId: string,
  score: number,
  reason: string,
  type: string,
  action: 'clicked' | 'challenged' | 'ignored'
): Promise<void> {
  try {
    const user = await getUserByClerkId(clerkId)
    if (!user) return

    await supabase
      .from('ai_recommendations')
      .insert({
        user_id: user.id,
        recommended_team_id: teamId,
        score,
        reason,
        recommendation_type: type,
        clicked: action === 'clicked' || action === 'challenged',
        result: action
      })
  } catch (error) {
    console.error('Error tracking AI recommendation:', error)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getUserByClerkId, getUserTeamsForGame, supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    
    const response = {
      timestamp: new Date().toISOString(),
      debug_info: {} as any
    }

    // 1. Check authentication
    response.debug_info.authentication = {
      clerkId: clerkId || 'NOT_FOUND',
      authenticated: !!clerkId
    }

    if (!clerkId) {
      response.debug_info.error = 'No Clerk ID found - user not authenticated'
      return NextResponse.json(response)
    }

    // 2. Check user in database
    const user = await getUserByClerkId(clerkId)
    response.debug_info.user_lookup = {
      found: !!user,
      user_id: user?.id || 'NOT_FOUND',
      username: user?.username || 'NOT_FOUND',
      selected_games: user?.selected_game || []
    }

    if (!user) {
      response.debug_info.error = 'User not found in database'
      return NextResponse.json(response)
    }

    // 3. Check all teams in database
    const { data: allTeams, error: allTeamsError } = await supabase
      .from('teams')
      .select('id, name, game, region, current_members, max_members')
      .order('created_at', { ascending: false })

    response.debug_info.all_teams = {
      total_count: allTeams?.length || 0,
      error: allTeamsError?.message || null,
      by_game: {}
    }

    if (allTeams) {
      const gameGroups = allTeams.reduce((acc, team) => {
        acc[team.game] = (acc[team.game] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      response.debug_info.all_teams.by_game = gameGroups
    }

    // 4. Check League of Legends teams specifically
    const { data: lolTeams, error: lolError } = await supabase
      .from('teams')
      .select('*')
      .eq('game', 'league-of-legends')

    response.debug_info.lol_teams = {
      count: lolTeams?.length || 0,
      error: lolError?.message || null,
      teams: lolTeams?.map(t => ({
        id: t.id,
        name: t.name,
        region: t.region,
        members: `${t.current_members}/${t.max_members}`,
        playstyle: t.playstyle,
        primary_goal: t.primary_goal
      })) || []
    }

    // 5. Check user's teams for League of Legends
    const userTeams = await getUserTeamsForGame(clerkId, 'league-of-legends')
    response.debug_info.user_teams = {
      count: userTeams.length,
      teams: userTeams.map(ut => ({
        id: ut.teams.id,
        name: ut.teams.name,
        role: ut.role,
        region: ut.teams.region
      }))
    }

    // 6. Check team filtering logic
    if (userTeams.length > 0) {
      const userTeamIds = userTeams.map(ut => ut.teams.id)
      const availableTeams = lolTeams?.filter(team => !userTeamIds.includes(team.id)) || []
      
      response.debug_info.filtering = {
        user_team_ids: userTeamIds,
        total_lol_teams: lolTeams?.length || 0,
        after_filtering: availableTeams.length,
        filtered_teams: availableTeams.slice(0, 5).map(t => ({
          id: t.id,
          name: t.name,
          region: t.region,
          members: `${t.current_members}/${t.max_members}`
        }))
      }
    } else {
      response.debug_info.filtering = {
        user_team_ids: [],
        total_lol_teams: lolTeams?.length || 0,
        after_filtering: lolTeams?.length || 0,
        note: 'No user teams to filter out'
      }
    }

    // 7. Check OpenAI API key
    response.debug_info.openai = {
      api_key_configured: !!process.env.OPENAI_API_KEY,
      api_key_length: process.env.OPENAI_API_KEY?.length || 0
    }

    // 8. Database connection test
    const { data: dbTest, error: dbTestError } = await supabase
      .from('teams')
      .select('count')
      .limit(1)

    response.debug_info.database = {
      connection_ok: !dbTestError,
      error: dbTestError?.message || null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

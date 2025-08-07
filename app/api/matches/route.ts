import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

interface MatchReport {
  matchId?: string
  opponentTeamId: string
  result: 'win' | 'loss'
  opponentRating: number
  bestPlayer: string
  feedback: string
  playstyleObserved: string
  teamworkRating: number
  skillRating: number
  sportsmanshipRating: number
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: MatchReport = await request.json()

    // Get user's team ID
    const { data: teamMembership } = await supabase
      .from('team_memberships')
      .select('team_id, teams!inner(id, name)')
      .eq('user_clerk_id', userId)
      .eq('role', 'owner')
      .single()

    if (!teamMembership) {
      return NextResponse.json({ error: 'Only team owners can report matches' }, { status: 403 })
    }

    const reportingTeamId = teamMembership.team_id

    if (body.matchId) {
      // Existing match - add report
      const { data: existingMatch } = await supabase
        .from('team_matches')
        .select('*')
        .eq('id', body.matchId)
        .single()

      if (!existingMatch) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }

      // Add match report
      await supabase.from('match_reports').insert({
        match_id: body.matchId,
        reporting_team_id: reportingTeamId,
        result: body.result,
        opponent_team_rating: body.opponentRating,
        best_player_name: body.bestPlayer,
        feedback: body.feedback,
        playstyle_observed: body.playstyleObserved,
        teamwork_rating: body.teamworkRating,
        skill_rating: body.skillRating,
        sportsmanship_rating: body.sportsmanshipRating
      })

      // Check if both teams have reported
      const { count } = await supabase
        .from('match_reports')
        .select('*', { count: 'exact' })
        .eq('match_id', body.matchId)

      if (count === 2) {
        // Both teams reported - mark as verified and determine winner
        const { data: reports } = await supabase
          .from('match_reports')
          .select('*')
          .eq('match_id', body.matchId)

        const winningReports = reports?.filter(r => r.result === 'win') || []
        const winnerId = winningReports.length === 1 ? 
          reports?.find(r => r.result === 'win')?.reporting_team_id : null

        await supabase
          .from('team_matches')
          .update({ 
            verified: true,
            winner_team_id: winnerId,
            status: 'completed'
          })
          .eq('id', body.matchId)
      }

    } else {
      // New match report - create match first
      const { data: newMatch } = await supabase
        .from('team_matches')
        .insert({
          team_a_id: reportingTeamId,
          team_b_id: body.opponentTeamId,
          game: 'league-of-legends',
          match_type: 'scrim',
          status: 'reported_a'
        })
        .select()
        .single()

      if (newMatch) {
        // Add the report
        await supabase.from('match_reports').insert({
          match_id: newMatch.id,
          reporting_team_id: reportingTeamId,
          result: body.result,
          opponent_team_rating: body.opponentRating,
          best_player_name: body.bestPlayer,
          feedback: body.feedback,
          playstyle_observed: body.playstyleObserved,
          teamwork_rating: body.teamworkRating,
          skill_rating: body.skillRating,
          sportsmanship_rating: body.sportsmanshipRating
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error reporting match:', error)
    return NextResponse.json({ error: 'Failed to report match' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    // Get pending matches that need reports
    const { data: pendingMatches } = await supabase
      .from('team_matches')
      .select(`
        id,
        team_a_id,
        team_b_id,
        match_date,
        status,
        team_a:teams!team_matches_team_a_id_fkey(id, name),
        team_b:teams!team_matches_team_b_id_fkey(id, name)
      `)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .neq('status', 'completed')
      .order('match_date', { ascending: false })

    // Get completed matches for this team
    const { data: completedMatches } = await supabase
      .from('team_matches')
      .select(`
        id,
        team_a_id,
        team_b_id,
        match_date,
        winner_team_id,
        team_a:teams!team_matches_team_a_id_fkey(id, name),
        team_b:teams!team_matches_team_b_id_fkey(id, name),
        match_reports!inner(
          reporting_team_id,
          opponent_team_rating,
          feedback,
          teamwork_rating,
          skill_rating,
          sportsmanship_rating
        )
      `)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .eq('verified', true)
      .order('match_date', { ascending: false })
      .limit(10)

    return NextResponse.json({
      pendingMatches: pendingMatches || [],
      completedMatches: completedMatches || []
    })

  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

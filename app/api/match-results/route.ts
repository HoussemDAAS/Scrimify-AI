import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getUserByClerkId, supabase } from '@/lib/supabase'

// POST: Submit match results (first report)
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      matchRequestId, 
      winnerTeamId, 
      matchDuration, 
      bestPlayerName, 
      bestPlayerTeamId,
      challengerScore, 
      opponentScore,
      feedback 
    } = body

    if (!matchRequestId || !winnerTeamId) {
      return NextResponse.json({ error: 'Match request ID and winner team ID are required' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify match exists and is completed
    const { data: matchRequest, error: matchError } = await supabase
      .from('match_requests')
      .select('*')
      .eq('id', matchRequestId)
      .eq('status', 'completed')
      .single()

    if (matchError || !matchRequest) {
      return NextResponse.json({ error: 'Completed match not found' }, { status: 404 })
    }

    // Verify user is part of this match
    if (matchRequest.challenger_user_id !== user.id && matchRequest.opponent_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to report this match' }, { status: 403 })
    }

    // Check if results already exist
    const { data: existingResult } = await supabase
      .from('match_results')
      .select('id')
      .eq('match_request_id', matchRequestId)
      .single()

    if (existingResult) {
      return NextResponse.json({ error: 'Match results already submitted' }, { status: 400 })
    }

    // Create the match result
    const { data: matchResult, error: createError } = await supabase
      .from('match_results')
      .insert([{
        match_request_id: matchRequestId,
        reporter_user_id: user.id,
        winner_team_id: winnerTeamId,
        match_duration: matchDuration || null,
        best_player_name: bestPlayerName || null,
        best_player_team_id: bestPlayerTeamId || null,
        challenger_score: challengerScore || 0,
        opponent_score: opponentScore || 0,
        challenger_feedback: matchRequest.challenger_user_id === user.id ? feedback : null,
        opponent_feedback: matchRequest.opponent_user_id === user.id ? feedback : null,
        is_verified: false
      }])
      .select(`
        *,
        winner_team:teams!winner_team_id(id, name),
        best_player_team:teams!best_player_team_id(id, name)
      `)
      .single()

    if (createError) {
      console.error('Error creating match result:', createError)
      return NextResponse.json({ error: 'Failed to create match result' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      matchResult,
      message: 'Match results submitted! Waiting for verification from the other team.'
    })

  } catch (error) {
    console.error('Error in match results POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Verify and complete match results
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { matchResultId, verified, feedback } = body

    if (!matchResultId || verified === undefined) {
      return NextResponse.json({ error: 'Match result ID and verification status are required' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the match result and verify authorization
    const { data: matchResult, error: resultError } = await supabase
      .from('match_results')
      .select(`
        *,
        match_request:match_requests!match_request_id(challenger_user_id, opponent_user_id)
      `)
      .eq('id', matchResultId)
      .eq('is_verified', false)
      .single()

    if (resultError || !matchResult) {
      return NextResponse.json({ error: 'Match result not found or already verified' }, { status: 404 })
    }

    // Verify user is the OTHER user (not the reporter)
    const isChallenger = matchResult.match_request.challenger_user_id === user.id
    const isOpponent = matchResult.match_request.opponent_user_id === user.id
    const isReporter = matchResult.reporter_user_id === user.id

    if (!isChallenger && !isOpponent) {
      return NextResponse.json({ error: 'Unauthorized to verify this match' }, { status: 403 })
    }

    if (isReporter) {
      return NextResponse.json({ error: 'Cannot verify your own report' }, { status: 400 })
    }

    // Update the match result with verification
    const updateData: any = {
      is_verified: verified,
      verifier_user_id: user.id,
      verified_at: new Date().toISOString()
    }

    // Add feedback from the verifier
    if (feedback) {
      if (isChallenger) {
        updateData.challenger_feedback = feedback
      } else {
        updateData.opponent_feedback = feedback
      }
    }

    const { data: updatedResult, error: updateError } = await supabase
      .from('match_results')
      .update(updateData)
      .eq('id', matchResultId)
      .select(`
        *,
        winner_team:teams!winner_team_id(id, name),
        match_request:match_requests!match_request_id(
          challenger_team_id, 
          opponent_team_id,
          challenger_team:teams!challenger_team_id(id, name),
          opponent_team:teams!opponent_team_id(id, name)
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating match result:', updateError)
      return NextResponse.json({ error: 'Failed to verify match result' }, { status: 500 })
    }

    // If verified, update team statistics
    if (verified) {
      await updateTeamStatistics(updatedResult)
    }

    return NextResponse.json({ 
      success: true, 
      matchResult: updatedResult,
      message: verified ? 'Match results verified and team stats updated!' : 'Match results disputed.'
    })

  } catch (error) {
    console.error('Error in match results PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Get match results for verification
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchRequestId = searchParams.get('matchRequestId')

    if (!matchRequestId) {
      return NextResponse.json({ error: 'Match request ID required' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the match result
    const { data: matchResult, error } = await supabase
      .from('match_results')
      .select(`
        *,
        winner_team:teams!winner_team_id(id, name),
        best_player_team:teams!best_player_team_id(id, name),
        match_request:match_requests!match_request_id(
          challenger_user_id,
          opponent_user_id,
          challenger_team:teams!challenger_team_id(id, name),
          opponent_team:teams!opponent_team_id(id, name)
        )
      `)
      .eq('match_request_id', matchRequestId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Match result not found' }, { status: 404 })
    }

    // Verify user is part of this match
    if (matchResult.match_request.challenger_user_id !== user.id && 
        matchResult.match_request.opponent_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this result' }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true, 
      matchResult
    })

  } catch (error) {
    console.error('Error in match results GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update team statistics
async function updateTeamStatistics(matchResult: any) {
  try {
    const challengerTeamId = matchResult.match_request.challenger_team_id
    const opponentTeamId = matchResult.match_request.opponent_team_id
    const winnerTeamId = matchResult.winner_team_id

    // Update both teams
    const teams = [challengerTeamId, opponentTeamId]
    
    for (const teamId of teams) {
      const isWinner = teamId === winnerTeamId
      
      // Get current team stats
      const { data: team } = await supabase
        .from('teams')
        .select('wins, losses, total_matches')
        .eq('id', teamId)
        .single()

      if (team) {
        const newWins = (team.wins || 0) + (isWinner ? 1 : 0)
        const newLosses = (team.losses || 0) + (isWinner ? 0 : 1)
        const newTotal = (team.total_matches || 0) + 1
        const newWinRate = newTotal > 0 ? ((newWins / newTotal) * 100).toFixed(2) : "0.00"

        // Update team stats
        await supabase
          .from('teams')
          .update({
            wins: newWins,
            losses: newLosses,
            total_matches: newTotal,
            win_rate: newWinRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId)
      }
    }

    console.log('Team statistics updated successfully')
  } catch (error) {
    console.error('Error updating team statistics:', error)
  }
}

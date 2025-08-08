import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getUserByClerkId, supabaseAdmin } from '@/lib/supabase'

// POST: Create a new match request
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { opponentTeamId, challengerTeamId, message, matchType = 'scrim' } = body

    if (!opponentTeamId || !challengerTeamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get opponent team owner
    const { data: opponentTeam, error: opponentError } = await supabaseAdmin
      .from('teams')
      .select('id, name, owner_id')
      .eq('id', opponentTeamId)
      .single()

    if (opponentError || !opponentTeam) {
      return NextResponse.json({ error: 'Opponent team not found' }, { status: 404 })
    }

    // Get challenger team info and verify ownership
    const { data: challengerTeam, error: challengerError } = await supabaseAdmin
      .from('teams')
      .select('id, name, owner_id')
      .eq('id', challengerTeamId)
      .single()

    if (challengerError || !challengerTeam) {
      return NextResponse.json({ error: 'Challenger team not found' }, { status: 404 })
    }

    if (challengerTeam.owner_id !== user.id) {
      return NextResponse.json({ error: 'You are not the owner of this team' }, { status: 403 })
    }

    // Check if there's already a pending request between these teams
    const { data: existingRequest } = await supabaseAdmin
      .from('match_requests')
      .select('id')
      .eq('challenger_team_id', challengerTeamId)
      .eq('opponent_team_id', opponentTeamId)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: 'A match request already exists between these teams' }, { status: 400 })
    }

    // Create the match request
    const { data: matchRequest, error: createError } = await supabaseAdmin
      .from('match_requests')
      .insert([{
        challenger_team_id: challengerTeamId,
        opponent_team_id: opponentTeamId,
        challenger_user_id: user.id,
        opponent_user_id: opponentTeam.owner_id,
        message: message || `${challengerTeam.name} challenges you to a ${matchType}!`,
        match_type: matchType,
        status: 'pending'
      }])
      .select(`
        *,
        challenger_team:teams!challenger_team_id(id, name),
        opponent_team:teams!opponent_team_id(id, name)
      `)
      .single()

    if (createError) {
      console.error('Error creating match request:', createError)
      return NextResponse.json({ error: 'Failed to create match request' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      matchRequest,
      message: 'Match request sent successfully!' 
    })

  } catch (error) {
    console.error('Error in match requests API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Get match requests for a user's teams
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabaseAdmin
      .from('match_requests')
      .select(`
        *,
        challenger_team:teams!challenger_team_id(id, name, logo_url),
        opponent_team:teams!opponent_team_id(id, name, logo_url),
        challenger_user:users!challenger_user_id(id, username),
        opponent_user:users!opponent_user_id(id, username)
      `)
      .order('created_at', { ascending: false })

    // Filter based on type
    if (type === 'sent') {
      query = query.eq('challenger_user_id', user.id)
    } else if (type === 'received') {
      query = query.eq('opponent_user_id', user.id)
    } else {
      query = query.or(`challenger_user_id.eq.${user.id},opponent_user_id.eq.${user.id}`)
    }

    const { data: matchRequests, error } = await query

    if (error) {
      console.error('Error fetching match requests:', error)
      return NextResponse.json({ error: 'Failed to fetch match requests' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      matchRequests: matchRequests || [],
      count: matchRequests?.length || 0
    })

  } catch (error) {
    console.error('Error in match requests GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Respond to a match request (accept/decline)
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, action } = body // action: 'accept' | 'decline' | 'complete'

    if (!requestId || !action || !['accept', 'decline', 'complete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the match request and verify authorization
    let query = supabaseAdmin
      .from('match_requests')
      .select('*')
      .eq('id', requestId)

    if (action === 'complete') {
      // Both users can mark as complete
      query = query.or(`challenger_user_id.eq.${user.id},opponent_user_id.eq.${user.id}`)
      query = query.eq('status', 'accepted')
    } else {
      // Only opponent can accept/decline
      query = query.eq('opponent_user_id', user.id)
      query = query.eq('status', 'pending')
    }

    const { data: matchRequest, error: fetchError } = await query.single()

    if (fetchError || !matchRequest) {
      return NextResponse.json({ error: 'Match request not found or unauthorized' }, { status: 404 })
    }

    // Update the match request status
    let newStatus = 'declined'
    if (action === 'accept') newStatus = 'accepted'
    else if (action === 'complete') newStatus = 'completed'

    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('match_requests')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select(`
        *,
        challenger_team:teams!challenger_team_id(id, name),
        opponent_team:teams!opponent_team_id(id, name)
      `)
      .single()

    if (updateError) {
      console.error('Error updating match request:', updateError)
      return NextResponse.json({ error: 'Failed to update match request' }, { status: 500 })
    }

    const actionMessage = action === 'complete' ? 'completed' : `${action}ed`
    
    return NextResponse.json({ 
      success: true, 
      matchRequest: updatedRequest,
      message: `Match request ${actionMessage} successfully!`
    })

  } catch (error) {
    console.error('Error in match requests PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

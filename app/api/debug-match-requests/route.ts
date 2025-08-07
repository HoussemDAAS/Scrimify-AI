import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getUserByClerkId, supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all match requests related to this user
    const { data: allRequests, error: allError } = await supabase
      .from('match_requests')
      .select(`
        *,
        challenger_team:teams!challenger_team_id(id, name, owner_id),
        opponent_team:teams!opponent_team_id(id, name, owner_id),
        challenger_user:users!challenger_user_id(id, username, clerk_id),
        opponent_user:users!opponent_user_id(id, username, clerk_id)
      `)
      .or(`challenger_user_id.eq.${user.id},opponent_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    // Get pending requests where user is opponent
    const { data: pendingAsOpponent, error: pendingError } = await supabase
      .from('match_requests')
      .select(`
        *,
        challenger_team:teams!challenger_team_id(id, name, owner_id),
        opponent_team:teams!opponent_team_id(id, name, owner_id),
        challenger_user:users!challenger_user_id(id, username, clerk_id),
        opponent_user:users!opponent_user_id(id, username, clerk_id)
      `)
      .eq('opponent_user_id', user.id)
      .eq('status', 'pending')

    // Get all teams owned by this user
    const { data: ownedTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, owner_id')
      .eq('owner_id', user.id)

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          clerk_id: user.clerk_id,
          username: user.username
        },
        ownedTeams: ownedTeams || [],
        allMatchRequests: allRequests || [],
        pendingAsOpponent: pendingAsOpponent || [],
        counts: {
          total: allRequests?.length || 0,
          pending: pendingAsOpponent?.length || 0,
          ownedTeams: ownedTeams?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

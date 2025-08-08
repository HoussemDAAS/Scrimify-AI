import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const game = searchParams.get('game')
    
    let query = supabase
      .from('teams')
      .select('id, name, game, region, current_members, max_members, created_at')
    
    if (game) {
      query = query.eq('game', game)
    }
    
    const { data: teams, error } = await query
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }
    
    // Debug: Show unique game names
    const uniqueGames = [...new Set(teams?.map(t => t.game) || [])]
    
    return NextResponse.json({ 
      teams: teams || [],
      count: teams?.length || 0,
      uniqueGames, // Include this in response for debugging
      success: true
    })
    
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

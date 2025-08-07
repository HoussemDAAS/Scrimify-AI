import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { clerkUserId, gameId, stats } = await request.json()
    
    if (!clerkUserId || !gameId || !stats) {
      return NextResponse.json(
        { error: 'Missing required fields: clerkUserId, gameId, stats' }, 
        { status: 400 }
      )
    }
    
    console.log('💾 Saving game statistics via API for Clerk user:', clerkUserId)
    
    // Get the internal database user ID from Clerk ID
    const userData = await getUserByClerkId(clerkUserId)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in database' }, 
        { status: 404 }
      )
    }
    
    console.log('💾 Using internal database user ID:', userData.id)
    
    // Ensure current_rank is always present as it's required
    const safeStats = {
      current_rank: 'Unranked',
      ...stats
    }
    
    const statisticsData = {
      user_id: userData.id,
      game_id: gameId,
      ...safeStats,
      last_updated: new Date().toISOString()
    }
    
    console.log('📊 Final statistics data to save:', statisticsData)
    
    // Save the statistics using direct supabase client
    const { data, error } = await supabase
      .from('user_game_statistics')
      .upsert(statisticsData, {
        onConflict: 'user_id,game_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase save error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // If RLS error, provide specific guidance
      if (error.message.includes('row-level security')) {
        return NextResponse.json({
          error: 'Database security policy error. Please check your Supabase RLS settings.',
          hint: 'You may need to update the RLS policy for user_game_statistics table.'
        }, { status: 403 })
      }
      
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        details: error.details
      }, { status: 500 })
    }
    
    console.log('✅ Game statistics saved successfully:', data)
    
    return NextResponse.json({ 
      success: true, 
      data: data 
    })
    
  } catch (error) {
    console.error('❌ Error saving game statistics:', error)
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    
    return NextResponse.json(
      { error: `Failed to save statistics: ${message}` }, 
      { status: 500 }
    )
  }
}

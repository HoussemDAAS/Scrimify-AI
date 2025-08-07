import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getAITeamRecommendations, trackAIRecommendation } from '@/lib/supabase'

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

    const recommendations = await getAITeamRecommendations(clerkId, game, limit)

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

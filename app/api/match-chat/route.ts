import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getUserByClerkId, supabaseAdmin } from '@/lib/supabase'

// GET: Get chat messages for a match
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

    // Verify user is part of this match
    const { data: matchRequest, error: matchError } = await supabaseAdmin
      .from('match_requests')
      .select('challenger_user_id, opponent_user_id, status')
      .eq('id', matchRequestId)
      .single()

    if (matchError || !matchRequest) {
      return NextResponse.json({ error: 'Match request not found' }, { status: 404 })
    }

    if (matchRequest.challenger_user_id !== user.id && matchRequest.opponent_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this chat' }, { status: 403 })
    }

    const normalizedStatus = (matchRequest.status || '').toString().trim().toLowerCase()
    const chatAllowed = normalizedStatus === 'accepted' || normalizedStatus === 'completed'
    if (!chatAllowed) {
      return NextResponse.json({ error: 'Match must be accepted to access chat' }, { status: 400 })
    }

    // Get chat messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('match_chat')
      .select(`
        *,
        sender_user:users!sender_user_id(id, username)
      `)
      .eq('match_request_id', matchRequestId)
      .order('sent_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching chat messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      messages: messages || [],
      matchStatus: matchRequest.status
    })

  } catch (error) {
    console.error('Error in match chat GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send a chat message
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = getAuth(request)
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { matchRequestId, message } = body

    if (!matchRequestId || !message?.trim()) {
      return NextResponse.json({ error: 'Match request ID and message are required' }, { status: 400 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user is part of this match and it's accepted
    const { data: matchRequest, error: matchError } = await supabaseAdmin
      .from('match_requests')
      .select('challenger_user_id, opponent_user_id, status')
      .eq('id', matchRequestId)
      .single()

    if (matchError || !matchRequest) {
      return NextResponse.json({ error: 'Match request not found' }, { status: 404 })
    }

    if (matchRequest.challenger_user_id !== user.id && matchRequest.opponent_user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to send messages in this chat' }, { status: 403 })
    }

    const normalizedStatus = (matchRequest.status || '').toString().trim().toLowerCase()
    const chatAllowed = normalizedStatus === 'accepted' || normalizedStatus === 'completed'
    if (!chatAllowed) {
      return NextResponse.json({ error: 'Match must be accepted to send messages' }, { status: 400 })
    }

    // Send the message
    const { data: newMessage, error: sendError } = await supabaseAdmin
      .from('match_chat')
      .insert([{
        match_request_id: matchRequestId,
        sender_user_id: user.id,
        message: message.trim()
      }])
      .select(`
        *,
        sender_user:users!sender_user_id(id, username)
      `)
      .single()

    if (sendError) {
      console.error('Error sending message:', sendError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: newMessage
    })

  } catch (error) {
    console.error('Error in match chat POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

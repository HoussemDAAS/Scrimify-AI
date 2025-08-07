/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { getTeamJoinRequests, respondToJoinRequest, getPendingMatchRequests, respondToMatchRequest, MatchRequestWithDetails } from '@/lib/supabase'

interface JoinRequestWithUser {
  id: string
  team_id: string
  user_id: string
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    email: string
    clerk_id: string
  }
  teams: {
    id: string
    name: string
  }
}

export function useTeamNotifications(clerkId: string) {
  const [notifications, setNotifications] = useState<JoinRequestWithUser[]>([])
  const [matchRequests, setMatchRequests] = useState<MatchRequestWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = async () => {
    if (!clerkId) return
    
    try {
      setIsLoading(true)
      // Get all owned teams and their join requests
      const { getUserOwnedTeams } = await import('@/lib/supabase')
      const ownedTeams = await getUserOwnedTeams(clerkId)
      
      const allRequests: JoinRequestWithUser[] = []
      
      for (const team of ownedTeams) {
        try {
          const requests = await getTeamJoinRequests(team.id, clerkId)
          const requestsWithTeam = requests.map(req => ({
            ...req,
            teams: { id: team.id, name: team.name }
          }))
          allRequests.push(...requestsWithTeam)
        } catch (error) {
          console.error(`Error loading requests for team ${team.id}:`, error)
        }
      }
      
      // Get pending match requests
      console.log('🔔 Loading pending match requests for user:', clerkId)
      const pendingMatchRequests = await getPendingMatchRequests(clerkId)
      console.log('📨 Pending match requests found:', pendingMatchRequests.length)
      console.log('📋 Match requests details:', pendingMatchRequests)
      
      setNotifications(allRequests)
      setMatchRequests(pendingMatchRequests)
      setUnreadCount(allRequests.length + pendingMatchRequests.length)
      
      console.log('🔢 Total notifications:', allRequests.length)
      console.log('🎮 Total match requests:', pendingMatchRequests.length)
      console.log('📊 Total unread count:', allRequests.length + pendingMatchRequests.length)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotifications([])
      setMatchRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await respondToJoinRequest(requestId, clerkId, action)
      
      // Remove the request from notifications
      setNotifications(prev => prev.filter(req => req.id !== requestId))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      return { success: true }
    } catch (error: any) {
      console.error(`Error ${action}ing request:`, error)
      return { success: false, error: error.message }
    }
  }

  const handleMatchRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await respondToMatchRequest(requestId, clerkId, action)
      
      // Remove the match request from notifications
      setMatchRequests(prev => prev.filter(req => req.id !== requestId))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      return { success: true }
    } catch (error: any) {
      console.error(`Error ${action}ing match request:`, error)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [clerkId])

  return {
    notifications,
    matchRequests,
    unreadCount,
    isLoading,
    handleRequest,
    handleMatchRequest,
    refreshNotifications: loadNotifications
  }
}
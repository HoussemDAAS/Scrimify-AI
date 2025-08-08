'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Input } from '@/components/ui/input'
import DashboardBackground from '@/components/dashboard/DashboardBackground'
import { 
  MessageSquare, 
  Users, 
  Trophy, 
  Clock,
  Send,
  CheckCircle,
  
} from 'lucide-react'

interface MatchRequest {
  id: string
  challenger_team_id: string
  opponent_team_id: string
  challenger_user_id: string
  opponent_user_id: string
  message?: string
  match_type: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  created_at: string
  updated_at: string
  challenger_team: {
    id: string
    name: string
    logo_url?: string
  }
  opponent_team: {
    id: string
    name: string
    logo_url?: string
  }
  challenger_user: {
    id: string
    username: string
  }
  opponent_user: {
    id: string
    username: string
  }
}

interface ChatMessage {
  id: string
  match_request_id: string
  sender_user_id: string
  message: string
  sent_at: string
  sender_user: {
    id: string
    username: string
  }
}

export default function MatchesPage() {
  const { user } = useUser()
  const [matches, setMatches] = useState<MatchRequest[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchRequest | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (user) {
      loadMatches()
    }
  }, [user])

  useEffect(() => {
    if (selectedMatch) {
      loadChatMessages(selectedMatch.id)
      // Set up polling for new messages
      const interval = setInterval(() => {
        loadChatMessages(selectedMatch.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedMatch])

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/match-requests?type=all')
      const data = await response.json()
      
      if (data.success) {
        // Filter for accepted and completed matches
        const activeMatches = data.matchRequests.filter((match: MatchRequest) => 
          match.status === 'accepted' || match.status === 'completed'
        )
        setMatches(activeMatches)
        
        // Auto-select first match
        if (activeMatches.length > 0 && !selectedMatch) {
          setSelectedMatch(activeMatches[0])
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatMessages = async (matchId: string) => {
    try {
      const response = await fetch(`/api/match-chat?matchRequestId=${matchId}`)
      const data = await response.json()
      
      if (data.success) {
        setChatMessages(data.messages)
      } else {
        console.error('Failed to load chat messages:', data.error)
        setChatMessages([])
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
      setChatMessages([])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || isSending) return

    try {
      setIsSending(true)
      const response = await fetch('/api/match-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchRequestId: selectedMatch.id,
          message: newMessage.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setChatMessages(prev => [...prev, data.message])
        setNewMessage('')
      } else {
        console.error('Failed to send message:', data.error)
        alert('Failed to send message: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const markMatchCompleted = async (matchId: string) => {
    try {
      const response = await fetch('/api/match-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: matchId,
          action: 'complete'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Match marked as completed! You can now report the results.')
        loadMatches()
      } else {
        alert('Failed to mark match as completed: ' + data.error)
      }
    } catch (error) {
      console.error('Error marking match completed:', error)
      alert('Failed to mark match as completed')
    }
  }

  if (!user) {
    return <div className="p-8 text-center text-gray-400">Please sign in to view matches</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <DashboardBackground />
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-red-500" />
            Active Matches
          </h1>
          <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Loading matches...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DashboardBackground />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-red-500" />
          Active Matches
        </h1>

        {matches.length === 0 ? (
          <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Matches</h3>
              <p className="text-gray-400 mb-6">
                You don't have any accepted matches yet. Use the AI Opponent Finder to challenge teams!
              </p>
              <PrimaryButton onClick={() => window.location.href = '/dashboard'}>
                Find Opponents
              </PrimaryButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match List */}
            <div className="lg:col-span-1">
              <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Matches ({matches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-800">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedMatch?.id === match.id
                            ? 'bg-red-500/10 border-l-2 border-red-500'
                            : 'hover:bg-gray-800/50'
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1">
                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                              {match.match_type}
                            </Badge>
                            <Badge className={match.status === 'completed' 
                              ? "bg-green-600/20 text-green-400 border-green-500/30"
                              : "bg-blue-600/20 text-blue-400 border-blue-500/30"
                            }>
                              {match.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-white font-medium">
                          <span className="text-blue-400">{match.challenger_team.name}</span>
                          <span className="text-gray-400 mx-2">vs</span>
                          <span className="text-red-400">{match.opponent_team.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat & Match Details */}
            <div className="lg:col-span-2">
              {selectedMatch ? (
                <div className="space-y-6">
                  {/* Match Header */}
                  <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            {selectedMatch.challenger_team.name} vs {selectedMatch.opponent_team.name}
                          </CardTitle>
                          <p className="text-gray-400 text-sm mt-1">
                            {selectedMatch.match_type.charAt(0).toUpperCase() + selectedMatch.match_type.slice(1)} Match
                          </p>
                        </div>
                        {selectedMatch.status === 'accepted' ? (
                          <PrimaryButton
                            onClick={() => markMatchCompleted(selectedMatch.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Completed
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton
                            onClick={() => window.location.href = `/matches/report/${selectedMatch.id}`}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Report Results
                          </PrimaryButton>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Chat Section */}
                  <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Match Organization Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3 border border-gray-800">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                            <p>No messages yet. Start organizing your match!</p>
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${
                              msg.sender_user_id === user.id ? 'justify-end' : 'justify-start'
                            }`}>
                              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                                msg.sender_user_id === user.id
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-700 text-gray-100'
                              }`}>
                                <div className="text-xs opacity-75 mb-1">
                                  {msg.sender_user.username}
                                </div>
                                <div className="text-sm">{msg.message}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message to organize the match..."
                          className="bg-gray-800 border-gray-700 text-white"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                        />
                        <SecondaryButton
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="px-4"
                        >
                          <Send className="w-4 h-4" />
                        </SecondaryButton>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Select a Match</h3>
                    <p className="text-gray-400">Choose a match from the list to view details and chat</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { 
  Users, 
  UserPlus, 
  UserX, 
  Clock, 
  MessageSquare, 
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { getTeamJoinRequests, respondToJoinRequest, TeamJoinRequest } from '@/lib/supabase'

interface JoinRequestWithUser extends TeamJoinRequest {
  users: {
    id: string
    username: string
    email: string
    clerk_id: string
  }
}

interface TeamJoinRequestsProps {
  teamId: string
  clerkId: string
  onRequestHandled?: () => void
}

export default function TeamJoinRequests({ teamId, clerkId, onRequestHandled }: TeamJoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequestWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    loadJoinRequests()
  }, [teamId, clerkId])

  const loadJoinRequests = async () => {
    try {
      setIsLoading(true)
      const joinRequests = await getTeamJoinRequests(teamId, clerkId)
      setRequests(joinRequests)
    } catch (error) {
      console.error('Error loading join requests:', error)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingRequest(requestId)
      await respondToJoinRequest(requestId, clerkId, action)
      
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Notify parent component
      onRequestHandled?.()
      
      // Show success message
      const actionText = action === 'accept' ? 'accepted' : 'declined'
      alert(`Join request ${actionText} successfully!`)
    } catch (error: any) {
      console.error(`Error ${action}ing request:`, error)
      alert(error.message || `Failed to ${action} request`)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            JOIN REQUESTS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-8 h-8 text-gray-400 animate-pulse mx-auto mb-2" />
              <p className="text-gray-400">Loading requests...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            JOIN REQUESTS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-white text-lg font-bold mb-2">No Pending Requests</h3>
            <p className="text-gray-400">Your team doesn't have any pending join requests at the moment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            JOIN REQUESTS
          </CardTitle>
          <Badge className="bg-red-600 text-white">
            {requests.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-gray-800/50 border border-red-500/20 rounded-lg p-4 transition-all duration-300 hover:border-red-500/40"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {request.users.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-bold">{request.users.username}</h4>
                  <p className="text-gray-400 text-xs">{request.users.email}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-yellow-600/20 text-yellow-400 text-xs mb-1">
                  <Clock className="w-3 h-3 mr-1" />
                  PENDING
                </Badge>
                <p className="text-gray-500 text-xs">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {request.message && (
              <div className="mb-4 p-3 bg-gray-700/50 border border-gray-600/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-bold">Message:</span>
                </div>
                <p className="text-gray-300 text-sm italic">"{request.message}"</p>
              </div>
            )}

            <div className="flex gap-2">
              <PrimaryButton
                size="sm"
                className="flex-1"
                disabled={processingRequest === request.id}
                onClick={() => handleRequest(request.id, 'accept')}
              >
                {processingRequest === request.id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-pulse" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ACCEPT
                  </>
                )}
              </PrimaryButton>
              
              <SecondaryButton
                size="sm"
                className="flex-1"
                disabled={processingRequest === request.id}
                onClick={() => handleRequest(request.id, 'decline')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                DECLINE
              </SecondaryButton>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
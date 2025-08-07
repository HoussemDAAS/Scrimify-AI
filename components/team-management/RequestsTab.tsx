'use client'

import { JoinRequestCard } from './JoinRequestCard'
import { Badge } from '@/components/ui/badge'
import { Bell, UserCheck } from 'lucide-react'

interface JoinRequest {
  id: string
  user_id: string
  team_id: string
  message: string
  created_at: string
  users: {
    username: string
    avatar_url?: string
    competitive_level?: string
    riot_account_verified?: boolean
  }
  teams: {
    id: string
    name: string
  }
}

interface RequestsTabProps {
  joinRequests: JoinRequest[]
  onAcceptRequest: (requestId: string) => void
  onRejectRequest: (requestId: string) => void
  actionLoading: string | null
}

export function RequestsTab({ joinRequests, onAcceptRequest, onRejectRequest, actionLoading }: RequestsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">RECRUITMENT CENTER</h2>
            <p className="text-gray-400 text-sm">Review and process join requests</p>
          </div>
        </div>
        {joinRequests.length > 0 && (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2 font-bold animate-pulse">
            {joinRequests.length} PENDING
          </Badge>
        )}
      </div>

      {joinRequests.length === 0 ? (
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-orange-500/30 rounded-2xl p-12 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-3xl flex items-center justify-center mx-auto border-2 border-orange-500/40">
                <UserCheck className="w-10 h-10 text-orange-400" />
              </div>
              <div className="absolute -inset-3 bg-orange-500/20 rounded-3xl blur-xl"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">NO PENDING RECRUITS</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              All clear! When players apply to join your team, their requests will appear here for your review and approval.
            </p>
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {joinRequests.map((request) => (
            <JoinRequestCard
              key={request.id}
              request={request}
              onAccept={onAcceptRequest}
              onReject={onRejectRequest}
              isLoading={actionLoading === request.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

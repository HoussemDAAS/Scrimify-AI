'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Users, Shield, Check, X, Mail, Clock } from 'lucide-react'

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

interface JoinRequestCardProps {
  request: JoinRequest
  onAccept: (requestId: string) => void
  onReject: (requestId: string) => void
  isLoading?: boolean
}

export function JoinRequestCard({ request, onAccept, onReject, isLoading }: JoinRequestCardProps) {
  const getCompetitiveLevelBadge = (level: string) => {
    switch (level) {
      case 'professional':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">PRO</Badge>
      case 'semi-pro':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">SEMI-PRO</Badge>
      case 'competitive':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">COMPETITIVE</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">CASUAL</Badge>
    }
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border-2 border-orange-500/30 hover:border-orange-500/60 rounded-xl p-4 md:p-6 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-orange-500/30">
                {request.users.avatar_url ? (
                  <Image
                    src={request.users.avatar_url}
                    alt={request.users.username}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute -inset-1 bg-orange-500/20 rounded-xl blur-sm"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">{request.users.username}</h3>
                {request.users.riot_account_verified && (
                  <div className="relative">
                    <Shield className="w-4 h-4 text-green-400" />
                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm"></div>
                  </div>
                )}
                {request.users.competitive_level && getCompetitiveLevelBadge(request.users.competitive_level)}
              </div>
              
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Applied {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              {request.message && (
                <div className="bg-gradient-to-br from-gray-800/50 to-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wide">Recruit Message</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{request.message}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <SecondaryButton
              size="sm"
              onClick={() => onReject(request.id)}
              disabled={isLoading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50 transition-all duration-300 hover:scale-105"
            >
              <X className="w-4 h-4 mr-2" />
              REJECT
            </SecondaryButton>
            <PrimaryButton
              size="sm"
              onClick={() => onAccept(request.id)}
              disabled={isLoading}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50 transition-all duration-300 hover:scale-105"
            >
              <Check className="w-4 h-4 mr-2" />
              ACCEPT
            </PrimaryButton>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
      </div>
    </div>
  )
}

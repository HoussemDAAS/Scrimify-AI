'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { AccentButton } from '@/components/ui/accent-button'
import { Users, Shield, UserMinus, Crown, Star } from 'lucide-react'

interface TeamMember {
  id: string
  username: string
  avatar_url?: string
  role: string
  joined_at: string
  competitive_level?: string
  riot_account_verified?: boolean
}

interface MemberCardProps {
  member: TeamMember
  onRemove?: (memberId: string) => void
  isLoading?: boolean
  canRemove?: boolean
}

export function MemberCard({ member, onRemove, isLoading, canRemove }: MemberCardProps) {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'captain':
        return <Star className="w-4 h-4 text-orange-400" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs font-bold">COMMANDER</Badge>
      case 'captain':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs font-bold">CAPTAIN</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">SOLDIER</Badge>
    }
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/60 rounded-xl p-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-red-500/30">
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={member.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute -inset-1 bg-red-500/20 rounded-xl blur-sm"></div>
              {getRoleIcon(member.role) && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/50 rounded-full flex items-center justify-center">
                  {getRoleIcon(member.role)}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-lg">{member.username}</h3>
                {member.riot_account_verified && (
                  <div className="relative">
                    <Shield className="w-4 h-4 text-green-400" />
                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm"></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getRoleBadge(member.role)}
                {member.competitive_level && getCompetitiveLevelBadge(member.competitive_level)}
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
          
          {canRemove && member.role !== 'owner' && onRemove && (
            <div className="flex items-center gap-2">
              <AccentButton
                size="sm"
                onClick={() => onRemove(member.id)}
                disabled={isLoading}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50 transition-all duration-300 hover:scale-105"
              >
                <UserMinus className="w-4 h-4" />
                REMOVE
              </AccentButton>
            </div>
          )}
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
      </div>
    </div>
  )
}

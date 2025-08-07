'use client'

import { MemberCard } from './MemberCard'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus } from 'lucide-react'

interface TeamMember {
  id: string
  username: string
  avatar_url?: string
  role: string
  joined_at: string
  competitive_level?: string
  riot_account_verified?: boolean
}

interface MembersTabProps {
  teamMembers: TeamMember[]
  maxMembers: number
  onRemoveMember: (memberId: string) => void
  actionLoading: string | null
}

export function MembersTab({ teamMembers, maxMembers, onRemoveMember, actionLoading }: MembersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">SQUAD ROSTER</h2>
            <p className="text-gray-400 text-sm">Manage your elite team members</p>
          </div>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2 font-bold">
          {teamMembers.length}/{maxMembers} SOLDIERS
        </Badge>
      </div>

      {teamMembers.length === 0 ? (
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
          
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-blue-500/30 rounded-2xl p-12 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-3xl flex items-center justify-center mx-auto border-2 border-blue-500/40">
                <UserPlus className="w-10 h-10 text-blue-400" />
              </div>
              <div className="absolute -inset-3 bg-blue-500/20 rounded-3xl blur-xl"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">NO SQUAD MEMBERS</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Your team is empty. Members will appear here once they join your squad or when you invite players.
            </p>
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onRemove={onRemoveMember}
              isLoading={actionLoading === member.id}
              canRemove={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

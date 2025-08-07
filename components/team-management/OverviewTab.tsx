'use client'

import { useState } from 'react'
import Image from 'next/image'
import { StatCard } from './StatCard'
import { QuickActionCard } from './QuickActionCard'
import { MatchReportForm } from './MatchReportForm'
import { Badge } from '@/components/ui/badge'
import { Users, Bell, Target, MapPin, Shield, Clock, Eye, Trophy } from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  game: string
  region: string
  rank_requirement: string
  max_members: number
  current_members: number
  practice_schedule: string
  logo_url?: string
  created_at: string
  // LoL-specific fields
  playstyle?: string
  primary_goal?: string
  communication_style?: string
  preferred_roles?: string[]
  wins?: number
  losses?: number
  total_matches?: number
  win_rate?: number
}

interface OverviewTabProps {
  team: Team
  teamMembersCount: number
  joinRequestsCount: number
  onTabChange: (tab: string) => void
}

export function OverviewTab({ team, teamMembersCount, joinRequestsCount, onTabChange }: OverviewTabProps) {
  const [showMatchForm, setShowMatchForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Match Report Form Modal */}
      {showMatchForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MatchReportForm
              teamId={team.id}
              onClose={() => setShowMatchForm(false)}
            />
          </div>
        </div>
      )}
      {/* Team Header */}
      <div className="group relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/60 rounded-2xl p-6 md:p-8 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              {team.logo_url ? (
                <div className="relative">
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={80}
                    height={80}
                    className="rounded-2xl"
                  />
                  <div className="absolute -inset-2 bg-red-500/20 rounded-2xl blur-lg"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-red-600/30 to-red-800/30 flex items-center justify-center border-2 border-red-500/40">
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                  </div>
                  <div className="absolute -inset-2 bg-red-500/20 rounded-2xl blur-lg"></div>
                </div>
              )}
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{team.name}</h2>
                <p className="text-gray-300 text-sm md:text-base max-w-md">
                  {team.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold">
                    {team.game.toUpperCase()}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {team.region}
                  </Badge>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-600/20 to-green-700/20 text-green-400 border-green-500/40 px-4 py-2 font-bold">
              <Shield className="w-4 h-4 mr-2" />
              COMMANDER
            </Badge>
          </div>
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <StatCard
          icon={<Users className="w-full h-full" />}
          value={teamMembersCount}
          label="SQUAD SIZE"
          color="blue"
        />
        
        <StatCard
          icon={<Bell className="w-full h-full" />}
          value={joinRequestsCount}
          label="RECRUITS"
          color="orange"
        />
        
        <StatCard
          icon={<Target className="w-full h-full" />}
          value={team.rank_requirement || 'ANY'}
          label="MIN RANK"
          color="red"
        />
        
        <StatCard
          icon={<MapPin className="w-full h-full" />}
          value={team.region}
          label="BATTLEFIELD"
          color="purple"
        />

        <StatCard
          icon={<Trophy className="w-full h-full" />}
          value={`${team.wins || 0}W`}
          label="VICTORIES"
          color="green"
        />

        <StatCard
          icon={<Trophy className="w-full h-full" />}
          value={`${Math.round(team.win_rate || 0)}%`}
          label="WIN RATE"
          color="green"
        />
      </div>

      {/* LoL Team Profile Section */}
      {team.game === 'league-of-legends' && (team.playstyle || team.primary_goal || team.communication_style || team.preferred_roles) && (
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-800/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500"></div>
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border-2 border-blue-500/30 group-hover:border-blue-500/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-lg font-bold text-blue-400">LEAGUE OF LEGENDS PROFILE</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.playstyle && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Playstyle</h4>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 capitalize">
                    {team.playstyle}
                  </Badge>
                </div>
              )}
              
              {team.primary_goal && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Primary Goal</h4>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 capitalize">
                    {team.primary_goal}
                  </Badge>
                </div>
              )}
              
              {team.communication_style && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Communication</h4>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 capitalize">
                    {team.communication_style}
                  </Badge>
                </div>
              )}
              
              {team.preferred_roles && team.preferred_roles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Preferred Roles</h4>
                  <div className="flex flex-wrap gap-1">
                    {team.preferred_roles.map((role) => (
                      <Badge key={role} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 capitalize text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          
      {/* Training Schedule */}
      {team.practice_schedule && (
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500"></div>
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-lg border-2 border-green-500/30 group-hover:border-green-500/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-lg font-bold text-green-400">TRAINING SCHEDULE</span>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed">{team.practice_schedule}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          href={`/teams/${team.id}`}
          icon={<Eye className="w-full h-full" />}
          title="VIEW PROFILE"
          description="See how others view your team"
          color="blue"
        />
        
        <QuickActionCard
          onClick={() => onTabChange('members')}
          icon={<Users className="w-full h-full" />}
          title="MANAGE SQUAD"
          description="Add, remove, and assign roles"
          color="green"
        />
        
        <QuickActionCard
          onClick={() => onTabChange('requests')}
          icon={<Bell className="w-full h-full" />}
          title="REVIEW RECRUITS"
          description="Accept or decline join requests"
          color="orange"
        />

        <QuickActionCard
          onClick={() => setShowMatchForm(true)}
          icon={<Trophy className="w-full h-full" />}
          title="REPORT MATCH"
          description="Submit scrim or match results"
          color="red"
        />
      </div>
    </div>
  )
}

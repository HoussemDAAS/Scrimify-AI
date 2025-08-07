import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { 
  Star, 
  Users, 
  Crown, 
  Shield, 
  MapPin, 
  Calendar,
  ChevronRight,
  Settings,
  Eye
} from 'lucide-react'
import { Team, TeamMembership } from '@/lib/supabase'

interface TeamCardProps {
  team: Team
  membership?: TeamMembership
  onClick?: () => void
  className?: string
}

export default function TeamCard({ team, membership, onClick, className = '' }: TeamCardProps) {
  const isOwner = membership?.role === 'owner'
  const isCaptain = membership?.role === 'captain'

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="absolute -inset-2 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <Card 
        className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/60 transition-all duration-300 cursor-pointer group-hover:scale-105"
        onClick={onClick}
      >
        <CardHeader className="p-5">
          {/* Team Header with Logo */}
          <div className="flex items-start gap-3 mb-4">
            {/* Team Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gray-800/50 border-2 border-red-500/30 rounded-xl flex items-center justify-center overflow-hidden group-hover:border-red-500/60 transition-colors duration-300">
                {team.logo_url ? (
                  <Image 
                    src={team.logo_url} 
                    alt={`${team.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                )}
              </div>
              
              {/* Role Badge */}
              {membership && (isOwner || isCaptain) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                  {isOwner ? (
                    <Crown className="w-3 h-3 text-white" />
                  ) : (
                    <Star className="w-3 h-3 text-white" />
                  )}
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white text-lg font-bold truncate pr-2">
                  {team.name}
                </CardTitle>
                <ChevronRight className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
              </div>
              
              {membership && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs font-bold px-2 py-1">
                  {membership.role.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Team Description */}
          <CardDescription className="text-gray-400 text-sm mb-4 line-clamp-2">
            {team.description || 'Elite competitive team seeking victory'}
          </CardDescription>

          {/* Team Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Members */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                <Users className="w-3 h-3 text-red-500" />
              </div>
              <span className="text-gray-300 text-xs font-medium">
                {team.current_members}/{team.max_members}
              </span>
            </div>

            {/* Region */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-red-500" />
              </div>
              <span className="text-gray-300 text-xs font-medium">
                {team.region}
              </span>
            </div>

            {/* Rank Requirement */}
            {team.rank_requirement && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 text-red-500" />
                </div>
                <span className="text-gray-300 text-xs font-medium truncate">
                  {team.rank_requirement}
                </span>
              </div>
            )}

            {/* Practice Schedule */}
            {team.practice_schedule && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 text-red-500" />
                </div>
                <span className="text-gray-300 text-xs font-medium truncate">
                  Schedule
                </span>
              </div>
            )}
          </div>

          {/* Status Indicator and Actions */}
          <div className="pt-3 border-t border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  team.current_members < team.max_members 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-gray-400 text-xs">
                  {team.current_members < team.max_members 
                    ? 'Recruiting' 
                    : 'Full Roster'
                  }
                </span>
              </div>
              
              <span className="text-gray-500 text-xs">
                {team.game.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            {/* Action Buttons */}
            {membership && (
              <div className="flex gap-2">
                {isOwner && (
                  <Link href="/teams/manage" onClick={handleManageClick} className="flex-1">
                    <SecondaryButton size="sm" className="w-full text-xs bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white">
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </SecondaryButton>
                  </Link>
                )}
                <Link href={`/teams/${team.id}`} onClick={handleViewClick} className={isOwner ? "flex-1" : "w-full"}>
                  <SecondaryButton size="sm" className="w-full text-xs bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </SecondaryButton>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Card>
    </div>
  )
}
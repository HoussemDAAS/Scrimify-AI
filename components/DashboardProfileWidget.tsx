import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Crown, Shield, Trophy, Target, Star, ChevronRight } from 'lucide-react'

interface UserProfile {
  username: string
  avatar_url?: string
  bio?: string
  competitive_level: string
  selected_game: string[]
  riot_account_verified?: boolean
  riot_username?: string
  looking_for_team?: boolean
}

interface GameStats {
  rank?: string
  winRate?: string
  mainRole?: string
  summonerLevel?: number
  profileIcon?: string
}

interface DashboardProfileWidgetProps {
  user: UserProfile
  gameStats?: Record<string, GameStats>
  teamCount?: number
}

export default function DashboardProfileWidget({ user, gameStats }: DashboardProfileWidgetProps) {
  const getCompetitiveLevelInfo = (level: string) => {
    switch (level) {
      case 'professional':
        return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pro' }
      case 'semi-pro':
        return { icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Semi-Pro' }
      case 'competitive':
        return { icon: Target, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Competitive' }
      default:
        return { icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Casual' }
    }
  }

  const levelInfo = getCompetitiveLevelInfo(user.competitive_level)
  const LevelIcon = levelInfo.icon
  const lolStats = gameStats?.['league-of-legends']
  const hasLoLData = lolStats && (lolStats.rank || lolStats.profileIcon)

  return (
    <Link href="/profile" className="group block">
      <div className="bg-gray-900/50 border border-red-500/20 rounded-lg p-3 hover:border-red-500/40 transition-all duration-200 hover:bg-gray-900/70">
        <div className="flex items-center gap-2">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-500/30 bg-gray-700">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-500/20">
                  <User className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -top-0.5 -right-0.5">
              <div className={`w-3 h-3 ${levelInfo.bg} rounded-full flex items-center justify-center border border-gray-900`}>
                <LevelIcon className={`w-2 h-2 ${levelInfo.color}`} />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium text-sm truncate group-hover:text-red-300 transition-colors">
                {user.username}
              </h3>
              {user.riot_account_verified && (
                <Shield className="w-3 h-3 text-green-400 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{levelInfo.label}</span>
              {hasLoLData && lolStats.rank && (
                <>
                  <span>•</span>
                  <span className="text-yellow-400">{lolStats.rank}</span>
                </>
              )}
              {user.looking_for_team && (
                <>
                  <span>•</span>
                  <span className="text-green-400">LFT</span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-red-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}

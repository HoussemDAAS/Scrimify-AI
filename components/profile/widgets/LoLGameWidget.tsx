import React from 'react'
import Image from 'next/image'
import { Trophy, TrendingUp } from 'lucide-react'

interface LoLGameWidgetProps {
  summonerName?: string
  profileIcon?: string
  rank?: string
  winRate?: string
  isVerified?: boolean
}

/**
 * Compact League of Legends game widget
 * Shows summoner info, rank, and win rate in an attractive gaming style
 */
export default function LoLGameWidget({ 
  summonerName, 
  profileIcon, 
  rank, 
  winRate,
  isVerified = false 
}: LoLGameWidgetProps) {
  if (!isVerified || !summonerName) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Profile Icon */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50">
            {profileIcon ? (
              <Image
                src={profileIcon}
                alt="Summoner Icon"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-bold text-sm truncate">{summonerName}</h4>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <span className="text-blue-400 text-xs font-medium">LoL</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            {rank && (
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">{rank}</span>
              </div>
            )}
            
            {winRate && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs font-medium">{winRate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rank Badge */}
        <div className="text-right">
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30">
            <span className="text-yellow-400 text-xs font-bold">RANKED</span>
          </div>
        </div>
      </div>
    </div>
  )
}

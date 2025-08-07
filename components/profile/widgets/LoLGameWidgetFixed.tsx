import React from 'react'
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
const LoLGameWidget: React.FC<LoLGameWidgetProps> = ({ 
  summonerName, 
  profileIcon, 
  rank, 
  winRate,
  isVerified = false 
}) => {
  if (!isVerified || !summonerName) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 min-w-56">
      <div className="flex items-center gap-3">
        {/* Profile Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-400/40 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-blue-400" />
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white text-sm font-bold truncate">{summonerName}</h4>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-300">{rank || 'Unranked'}</span>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>{winRate || 'N/A'}</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30">
              <span className="text-yellow-400 text-xs font-bold">RANKED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoLGameWidget

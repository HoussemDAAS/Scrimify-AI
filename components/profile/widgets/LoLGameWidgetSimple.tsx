import React from 'react'

interface LoLGameWidgetProps {
  summonerName?: string
  profileIcon?: string
  rank?: string
  winRate?: string
  isVerified?: boolean
}

/**
 * Simple LoL Game Widget for testing
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
    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-3 min-w-48">
      <div className="text-center">
        <div className="text-xs text-blue-400 font-medium mb-1">League of Legends</div>
        <div className="text-white text-sm font-bold">{summonerName}</div>
        <div className="text-gray-300 text-xs">{rank || 'Unranked'}</div>
        <div className="text-green-400 text-xs">{winRate || 'N/A'} WR</div>
      </div>
    </div>
  )
}

export default LoLGameWidget

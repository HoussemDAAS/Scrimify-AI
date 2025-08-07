import React from 'react'
import { Gamepad2, Users, Brain } from 'lucide-react'

interface DashboardStatsProps {
  selectedGamesCount: number
  userTeamsCount: number
}

export default function DashboardStats({ selectedGamesCount, userTeamsCount }: DashboardStatsProps) {
  return (
    <div className="mt-12 md:mt-16 text-center">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Gamepad2 className="w-4 h-4 text-red-500" />
          <span className="font-bold">{selectedGamesCount} Active Games</span>
        </div>
        <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4 text-red-500" />
          <span className="font-bold">{userTeamsCount} Teams Joined</span>
        </div>
        <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
        <div className="flex items-center gap-2 text-gray-400">
          <Brain className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-bold">AI-Enhanced Platform</span>
        </div>
      </div>
    </div>
  )
}

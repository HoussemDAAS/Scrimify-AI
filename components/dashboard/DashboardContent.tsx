import React from 'react'
import DashboardBackground from './DashboardBackground'
import DashboardTopActions from './DashboardTopActions'
import DashboardHero from './DashboardHero'
import GameSelector from './GameSelector'
import CurrentGameDisplay from './CurrentGameDisplay'
import { AITeamMatcher } from './AITeamMatcher'
import TeamActions from './TeamActions'
import UserTeamsSection from './UserTeamsSection'
import DashboardStats from './DashboardStats'
import { TeamMembership, Team } from '@/lib/supabase'

interface Game {
  name: string
  players: string
  rank: string
  color: string
  logo: string
  id: string
}

interface DashboardContentProps {
  selectedGames: string[]
  currentGame: string
  userTeams: (TeamMembership & { teams: Team })[]
  games: Game[]
  onGameSelect: (gameId: string) => void
}

export default function DashboardContent({ 
  selectedGames, 
  currentGame, 
  userTeams, 
  games, 
  onGameSelect 
}: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DashboardBackground />
      <DashboardTopActions />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        <DashboardHero />
        
        <GameSelector 
          selectedGames={selectedGames}
          currentGame={currentGame}
          games={games}
          onGameSelect={onGameSelect}
        />

        <CurrentGameDisplay 
          currentGame={currentGame}
          games={games}
        />

        <AITeamMatcher 
          currentGame={currentGame}
          userTeams={userTeams}
        />

        <TeamActions 
          currentGame={currentGame}
          games={games}
        />

        <UserTeamsSection 
          userTeams={userTeams}
          currentGame={currentGame}
          games={games}
        />

        <DashboardStats 
          selectedGamesCount={selectedGames.length}
          userTeamsCount={userTeams.length}
        />
      </div>
    </div>
  )
}

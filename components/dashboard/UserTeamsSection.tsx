import React from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import TeamCard from '@/components/TeamCard'
import { Trophy, Users, Plus, Search } from 'lucide-react'
import { Team, TeamMembership } from '@/lib/supabase'

interface Game {
  name: string
  players: string
  rank: string
  color: string
  logo: string
  id: string
}

interface UserTeamsSectionProps {
  userTeams: (TeamMembership & { teams: Team })[]
  currentGame: string
  games: Game[]
}

export default function UserTeamsSection({ userTeams, currentGame, games }: UserTeamsSectionProps) {
  const router = useRouter()

  const getGameDisplayName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.name || gameId.toUpperCase()
  }

  if (!currentGame) return null

  if (userTeams.length > 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          YOUR {getGameDisplayName(currentGame)} TEAMS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {userTeams.map((membership) => (
            <TeamCard
              key={membership.id}
              team={membership.teams}
              membership={membership}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6 md:p-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">No Teams Yet</h3>
        <p className="text-gray-400 mb-6">
          You haven&apos;t joined any teams for {getGameDisplayName(currentGame)} yet. 
          Create your own squad or join an existing team to get started!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton 
            onClick={() => router.push(`/create-team?game=${currentGame}`)}
            className="px-6 py-3"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </PrimaryButton>
          <SecondaryButton 
            onClick={() => router.push(`/join-team?game=${currentGame}`)}
            className="px-6 py-3"
          >
            <Search className="mr-2 h-4 w-4" />
            Find Teams
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}

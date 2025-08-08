import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { UserPlus, Plus, Search, Target, Crown } from 'lucide-react'

interface Game {
  name: string
  players: string
  rank: string
  color: string
  logo: string
  id: string
}

interface TeamActionsProps {
  currentGame: string
  games: Game[]
}

export default function TeamActions({ currentGame, games }: TeamActionsProps) {
  const router = useRouter()

  const getGameDisplayName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.name || gameId.toUpperCase()
  }

  if (!currentGame) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mt-8 md:mt-12 mb-8">
      <div className="group relative">
        <div className="absolute -inset-4 md:-inset-6 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        
        <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/70 transition-all duration-500 h-full group-hover:scale-105">
          <CardHeader className="text-center p-6 md:p-8">
            <div className="relative mx-auto mb-4 md:mb-6">
              <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-red-500/30 rounded-2xl animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl font-black mb-3 md:mb-4">
              JOIN TEAM
            </CardTitle>
            
            <CardDescription className="text-gray-400 text-base md:text-lg mb-6 px-2">
              Find and join existing teams for {getGameDisplayName(currentGame)}. Get AI-matched with teams that fit your playstyle.
            </CardDescription>
            
            <PrimaryButton 
              className="w-full py-3 md:py-4 text-base md:text-lg font-bold"
              onClick={() => router.push(`/join-team?game=${currentGame}`)}
            >
              <Search className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
              FIND TEAMS
              <Target className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5" />
            </PrimaryButton>
          </CardHeader>
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </Card>
      </div>

      <div className="group relative">
        <div className="absolute -inset-4 md:-inset-6 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        
        <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/70 transition-all duration-500 h-full group-hover:scale-105">
          <CardHeader className="text-center p-6 md:p-8">
            <div className="relative mx-auto mb-4 md:mb-6">
              <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-red-500/30 rounded-2xl animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl font-black mb-3 md:mb-4">
              CREATE TEAM
            </CardTitle>
            
            <CardDescription className="text-gray-400 text-base md:text-lg mb-6 px-2">
              Build your own elite squad for {getGameDisplayName(currentGame)}. Use AI to recruit the perfect teammates.
            </CardDescription>
            
            <SecondaryButton 
              className="w-full py-3 md:py-4 text-base md:text-lg font-bold"
              onClick={() => router.push(`/create-team?game=${currentGame}`)}
            >
              <Plus className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
              BUILD TEAM
              <Crown className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5" />
            </SecondaryButton>
          </CardHeader>
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </Card>
      </div>
    </div>
  )
}

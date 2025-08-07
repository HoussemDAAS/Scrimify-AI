import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Target, Flame } from 'lucide-react'

interface Game {
  name: string
  players: string
  rank: string
  color: string
  logo: string
  id: string
}

interface CurrentGameDisplayProps {
  currentGame: string
  games: Game[]
}

export default function CurrentGameDisplay({ currentGame, games }: CurrentGameDisplayProps) {
  const getGameDisplayName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.name || gameId.toUpperCase()
  }

  const getGameLogo = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.logo || '/logos/valorant-logo.png'
  }

  if (!currentGame) return null

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex justify-center mb-6">
        <div className="relative group">
          <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative">
            <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 border-4 border-red-500/30 rounded-full animate-spin-slow"></div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 rounded-full"></div>
              <Image 
                src={getGameLogo(currentGame)} 
                alt={getGameDisplayName(currentGame)}
                width={64}
                height={64}
                className="relative z-10 md:w-20 md:h-20 object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5)) brightness(1.1) contrast(1.1)' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <Badge className="bg-red-600 text-white font-bold px-6 py-3 text-lg md:text-xl border-2 border-red-500 shadow-xl shadow-red-500/30">
          <Target className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
          {getGameDisplayName(currentGame)}
          <Flame className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
        </Badge>
      </div>
    </div>
  )
}

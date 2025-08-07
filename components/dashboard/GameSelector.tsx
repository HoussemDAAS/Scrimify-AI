import React from 'react'
import Image from 'next/image'
import { Gamepad2, ChevronRight } from 'lucide-react'

interface Game {
  name: string
  players: string
  rank: string
  color: string
  logo: string
  id: string
}

interface GameSelectorProps {
  selectedGames: string[]
  currentGame: string
  games: Game[]
  onGameSelect: (gameId: string) => void
}

export default function GameSelector({ selectedGames, currentGame, games, onGameSelect }: GameSelectorProps) {
  const getGameDisplayName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.name || gameId.toUpperCase()
  }

  const getGameLogo = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.logo || '/logos/valorant-logo.png'
  }

  const getGameColor = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.color || 'from-red-600 to-red-800'
  }

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
        <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
        SELECT BATTLEFIELD
      </h2>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {selectedGames.map((gameId) => (
          <button
            key={gameId}
            onClick={() => onGameSelect(gameId)}
            className={`group relative flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-xl border-2 transition-all duration-300 ${
              currentGame === gameId
                ? 'border-red-500 bg-red-500/20 text-white'
                : 'border-red-500/30 bg-gray-900/60 text-gray-300 hover:border-red-500/60 hover:bg-red-500/10'
            }`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${getGameColor(gameId)} flex items-center justify-center`}>
              <Image 
                src={getGameLogo(gameId)} 
                alt={getGameDisplayName(gameId)}
                width={20}
                height={20}
                className="md:w-6 md:h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <span className="font-bold text-sm md:text-base">{getGameDisplayName(gameId)}</span>
            {currentGame === gameId && (
              <ChevronRight className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

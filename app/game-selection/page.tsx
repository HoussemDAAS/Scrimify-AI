'use client'

import { useState, useEffect } from 'react'
import DashboardBackground from '@/components/dashboard/DashboardBackground'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Badge } from '@/components/ui/badge'
import { 
  Crosshair, 
  Users, 
  Brain,
  Target,
  Gamepad2,
  Crown,
  Flame,
  Plus,
  Check,
  Clock
} from 'lucide-react'
import { getUserByClerkId, createUser, addUserGame, removeUserGame } from '@/lib/supabase'

export default function GameSelectionPage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const games = [
    { 
      name: "LEAGUE OF LEGENDS", 
      players: "1.8M", 
      rank: "#1", 
      color: "from-red-500 to-red-700",
      logo: "/logos/lol-logo.png",
      id: "league-of-legends",
      available: true
    },
    { 
      name: "VALORANT", 
      players: "2.1M", 
      rank: "#2", 
      color: "from-gray-600 to-gray-800",
      logo: "/logos/valorant-logo.png",
      id: "valorant",
      available: false
    },
    { 
      name: "COUNTER-STRIKE 2", 
      players: "1.5M", 
      rank: "#3", 
      color: "from-gray-600 to-gray-900",
      logo: "/logos/cs2-logo.png",
      id: "counter-strike-2",
      available: false
    },
    { 
      name: "OVERWATCH 2", 
      players: "900K", 
      rank: "#4", 
      color: "from-gray-400 to-gray-600",
      logo: "/logos/overwatch-logo.png",
      id: "overwatch-2",
      available: false
    },
    { 
      name: "ROCKET LEAGUE", 
      players: "750K", 
      rank: "#5", 
      color: "from-gray-700 to-gray-900",
      logo: "/logos/rocket-league-logo.png",
      id: "rocket-league",
      available: false
    }
  ]

  useEffect(() => {
    const checkAndCreateUser = async () => {
      if (!user) return

      try {
        
        
        // Check if user exists in Supabase
        const existingUser = await getUserByClerkId(user.id)
        
        if (!existingUser) {
          
          // Create new user in Supabase
          await createUser({
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            username: user.username || user.firstName || 'Unknown'
          })
          setSelectedGames([])
        } else {
          
          // Set existing selected games - handle both array and string formats
          const games = Array.isArray(existingUser.selected_game) 
            ? existingUser.selected_game 
            : (existingUser.selected_game ? [existingUser.selected_game] : [])
          setSelectedGames(games)
        }
        
        setInitialLoading(false)
      } catch (error) {
        console.error('Error checking/creating user:', error)
        // Still allow the user to proceed even if there's a database error
        setSelectedGames([])
        setInitialLoading(false)
      }
    }

    checkAndCreateUser()
  }, [user, router])

  const handleGameToggle = async (gameId: string) => {
    if (!user) return
    
    // Check if the game is available
    const game = games.find(g => g.id === gameId)
    if (!game?.available) return
    
    const isSelected = selectedGames.includes(gameId)
    
    try {
      if (isSelected) {
        // Remove game
        await removeUserGame(user.id, gameId)
        setSelectedGames(prev => prev.filter(id => id !== gameId))
      } else {
        // Add game
        await addUserGame(user.id, gameId)
        setSelectedGames(prev => [...prev, gameId])
      }
    } catch (error) {
      console.error('Error updating user games:', error)
    }
  }

  const handleContinue = () => {
    if (selectedGames.length > 0) {
      router.push('/dashboard')
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-bold">Initializing AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DashboardBackground />

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        {/* Header - Updated for Multi-Selection */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-red-500/30 rounded-2xl animate-spin-slow"></div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center">
                <Crosshair className="w-8 h-8 md:w-10 md:h-10 text-white" />
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs md:text-sm font-bold">{selectedGames.length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
            <span className="relative">
              SELECT YOUR
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-red-500 mb-4 md:mb-6 flex items-center justify-center gap-2 md:gap-3 px-4">
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
            BATTLEGROUNDS
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
          </h2>
          <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
            Choose multiple games to build your gaming empire. Create teams and join competitions across different battlefields.
          </p>
          
          {/* Selection Counter */}
          {selectedGames.length > 0 && (
            <div className="mt-6">
              <Badge className="bg-red-600 text-white font-bold px-4 py-2 text-sm border-2 border-red-500">
                <Check className="mr-2 h-4 w-4" />
                {selectedGames.length} {selectedGames.length === 1 ? 'GAME' : 'GAMES'} SELECTED
              </Badge>
            </div>
          )}
        </div>

        {/* Games Grid - Updated for Multi-Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {games.map((game) => {
            const isSelected = selectedGames.includes(game.id)
            return (
              <div key={game.id} className="group relative">
                {/* Card glow effect */}
                <div className={`absolute -inset-2 md:-inset-4 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-green-600/20 to-red-600/20' 
                    : 'bg-gradient-to-r from-red-600/10 to-red-800/10'
                }`}></div>
                
                <Card 
                  className={`relative bg-gradient-to-br from-gray-900 to-black border-2 transition-all duration-500 h-full group-hover:scale-105 ${
                    !game.available 
                      ? 'cursor-not-allowed opacity-60 border-gray-600/50' 
                      : isSelected
                        ? 'cursor-pointer border-green-500 bg-green-500/10' 
                        : 'cursor-pointer border-red-500/30 hover:border-red-500/80'
                  }`}
                  onClick={() => handleGameToggle(game.id)}
                >
                  <CardHeader className="text-center p-4 md:p-6">
                    {/* Game Logo/Icon - Responsive */}
                    <div className="relative mx-auto mb-4 md:mb-6">
                      <div className={`absolute inset-0 w-12 h-12 md:w-16 md:h-16 border-2 rounded-2xl animate-spin-slow transition-colors duration-500 ${
                        !game.available 
                          ? 'border-gray-600/50' 
                          : isSelected 
                            ? 'border-green-500/80' 
                            : 'border-red-500/30 group-hover:border-red-500/80'
                      }`}></div>
                      <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden ${
                        !game.available ? 'opacity-70' : ''
                      }`}>
                        <Image 
                          src={game.logo} 
                          alt={game.name}
                          width={32}
                          height={32}
                          className={`md:w-10 md:h-10 object-contain filter brightness-0 invert ${
                            !game.available ? 'opacity-50' : ''
                          }`}
                        />
                        <div className={`absolute inset-0 border-2 rounded-2xl animate-ping opacity-0 group-hover:opacity-75 ${
                          !game.available 
                            ? 'border-gray-400/30' 
                            : isSelected 
                              ? 'border-green-400/50' 
                              : 'border-red-400/50'
                        }`}></div>
                      </div>
                    </div>
                    
                    {/* Rank Badge + Selection Status + Coming Soon */}
                    <div className="flex justify-center items-center gap-2 mb-3 md:mb-4 flex-wrap">
                      <Badge className={`font-bold px-2 py-1 md:px-3 md:py-1 text-xs ${
                        game.available ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        <Crown className="mr-1 h-2 w-2 md:h-3 md:w-3" />
                        {game.rank}
                      </Badge>
                      {!game.available && (
                        <Badge className="bg-orange-600 text-white font-bold px-2 py-1 text-xs animate-pulse">
                          <Clock className="mr-1 h-2 w-2 md:h-3 md:w-3" />
                          COMING SOON
                        </Badge>
                      )}
                      {isSelected && game.available && (
                        <Badge className="bg-green-600 text-white font-bold px-2 py-1 text-xs">
                          <Check className="h-2 w-2 md:h-3 md:w-3" />
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className={`text-lg md:text-xl lg:text-2xl font-black mb-2 md:mb-3 transition-colors duration-300 ${
                      !game.available 
                        ? 'text-gray-500' 
                        : isSelected 
                          ? 'text-green-100' 
                          : 'text-white group-hover:text-red-100'
                    }`}>
                      {game.name}
                    </CardTitle>
                    
                    {/* Stats - Responsive */}
                    <div className="flex justify-center items-center gap-2 md:gap-4 mb-3 md:mb-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Users className={`w-3 h-3 md:w-4 md:h-4 ${game.available ? 'text-red-500' : 'text-gray-600'}`} />
                        <span className={`font-bold text-xs md:text-sm ${game.available ? 'text-gray-300' : 'text-gray-600'}`}>{game.players}</span>
                      </div>
                      <div className={`w-1 h-3 md:h-4 ${game.available ? 'bg-red-500/30' : 'bg-gray-600/30'}`}></div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Flame className={`w-3 h-3 md:w-4 md:h-4 ${game.available ? 'text-red-500' : 'text-gray-600'}`} />
                        <span className={`font-bold text-xs md:text-sm ${game.available ? 'text-gray-300' : 'text-gray-600'}`}>
                          {game.available ? 'ACTIVE' : 'SOON'}
                        </span>
                      </div>
                    </div>

                    {/* Selection Button */}
                    {!game.available ? (
                      <SecondaryButton 
                        size="sm"
                        disabled
                        className="w-full text-xs md:text-sm border-gray-600 text-gray-500 cursor-not-allowed"
                      >
                        <Clock className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        COMING SOON
                      </SecondaryButton>
                    ) : isSelected ? (
                      <SecondaryButton 
                        size="sm"
                        className="w-full text-xs md:text-sm border-green-500 text-green-500 hover:bg-green-500"
                      >
                        <Check className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        SELECTED
                      </SecondaryButton>
                    ) : (
                      <AccentButton 
                        size="sm"
                        className="w-full text-xs md:text-sm"
                      >
                        <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        ADD GAME
                      </AccentButton>
                    )}
                  </CardHeader>
                  
                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    !game.available 
                      ? 'via-gray-600' 
                      : isSelected 
                        ? 'via-green-500' 
                        : 'via-red-500'
                  }`}></div>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Continue Button - Updated */}
        <div className="flex justify-center mt-8 md:mt-12 px-4">
          <div className="relative group">
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <PrimaryButton 
              onClick={handleContinue}
              disabled={selectedGames.length === 0 || isLoading}
              size="lg" 
              className="relative px-6 py-3 md:px-12 md:py-6 text-lg md:text-xl border-4 w-full sm:w-auto"
            >
              {selectedGames.length === 0 ? (
                <>
                  <Target className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-lg">SELECT GAMES TO CONTINUE</span>
                </>
              ) : (
                <>
                  <Brain className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                  <span className="text-sm md:text-lg">ENTER THE ARENA</span>
                  <Flame className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
                </>
              )}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
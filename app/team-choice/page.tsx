'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Users, 
  ArrowLeft,
  Brain,
  Target,
  Plus,
  Search,
  Crown,
  Flame,
  Shield,
  Sword,
  UserPlus,
  Settings
} from 'lucide-react'
import { getUserByClerkId } from '@/lib/supabase'

export default function TeamChoicePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [currentGame, setCurrentGame] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return

      try {
        const existingUser = await getUserByClerkId(user.id)
        
        if (!existingUser) {
          // User doesn't exist, redirect to game selection
          router.push('/game-selection')
          return
        }
        
        if (!existingUser.selected_game || (Array.isArray(existingUser.selected_game) ? existingUser.selected_game.length === 0 : !existingUser.selected_game)) {
          // User exists but no game selected, redirect to game selection
          router.push('/game-selection')
          return
        }
        
        // Handle both array and single game formats
        const games = Array.isArray(existingUser.selected_game) 
          ? existingUser.selected_game 
          : [existingUser.selected_game]
        
        setSelectedGames(games)
        setCurrentGame(games[0]) // Set first game as default
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/game-selection')
      }
    }

    checkUser()
  }, [user, router])

  const getGameDisplayName = (gameId: string) => {
    const gameMap: { [key: string]: string } = {
      'valorant': 'VALORANT',
      'league-of-legends': 'LEAGUE OF LEGENDS',
      'counter-strike-2': 'COUNTER-STRIKE 2',
      'overwatch-2': 'OVERWATCH 2',
      'rocket-league': 'ROCKET LEAGUE'
    }
    return gameMap[gameId] || gameId.toUpperCase()
  }

  const getGameLogo = (gameId: string) => {
    const logoMap: { [key: string]: string } = {
      'valorant': '/logos/valorant-logo.png',
      'league-of-legends': '/logos/lol-logo.png',
      'counter-strike-2': '/logos/cs2-logo.png',
      'overwatch-2': '/logos/overwatch-logo.png',
      'rocket-league': '/logos/rocket-league-logo.png'
    }
    return logoMap[gameId] || '/logos/valorant-logo.png'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-bold">Loading Battle Station...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Gaming Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-red-500/20"></div>
          ))}
        </div>
      </div>

      {/* Enhanced Red Glowing Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-48 h-48 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-44 h-44 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating elements */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-ping"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${25 + (i * 10)}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '5s'
            }}
          />
        ))}
      </div>

      {/* Header with User Profile and Logout */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm">{user?.username || user?.firstName || 'Warrior'}</p>
              <p className="text-gray-400 text-xs">{selectedGames.length} {selectedGames.length === 1 ? 'Game' : 'Games'} Selected</p>
            </div>
          </div>
          
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500 rounded-lg px-4 py-2 text-white transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            <span className="hidden md:block font-bold">LOGOUT</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-32">
        {/* Header with Game Logo */}
        <div className="text-center mb-16">
          {/* Enhanced Game Display - Show current game or first selected game */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute -inset-8 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
              
              {/* Main game logo container */}
              <div className="relative">
                {/* Spinning border effects */}
                <div className="absolute inset-0 w-40 h-40 border-4 border-red-500/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-4 w-32 h-32 border-2 border-red-600/50 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
                
                {/* Game logo */}
                <div className="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 rounded-full"></div>
                  <Image 
                    src={getGameLogo(currentGame)} 
                    alt={getGameDisplayName(currentGame)}
                    width={120}
                    height={120}
                    className="relative z-10 object-contain drop-shadow-2xl filter brightness-110 contrast-110"
                    style={{ 
                      filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5)) brightness(1.1) contrast(1.1)' 
                    }}
                  />
                  
                  {/* Status indicators */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center border-4 border-black shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-green-500 rounded-full animate-pulse flex items-center justify-center border-4 border-black shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* Multiple pulse rings */}
                <div className="absolute inset-0 w-40 h-40 border-2 border-red-500/40 rounded-full animate-ping opacity-60"></div>
                <div className="absolute inset-6 w-28 h-28 border border-red-400/30 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
          
          {/* Game Badge - Show current game */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-red-600 text-white font-bold px-8 py-4 text-xl border-2 border-red-500 shadow-xl shadow-red-500/30">
              <Target className="mr-3 h-6 w-6" />
              {getGameDisplayName(currentGame)}
              <Flame className="ml-3 h-6 w-6 animate-pulse" />
            </Badge>
          </div>

          {/* Show all selected games if more than one */}
          {selectedGames.length > 1 && (
            <div className="flex justify-center mb-8">
              <div className="bg-gray-900/60 backdrop-blur-sm border border-red-500/30 rounded-lg px-6 py-3">
                <p className="text-gray-300 text-sm mb-2">Your Selected Games:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedGames.map((gameId) => (
                    <Badge 
                      key={gameId} 
                      className={`text-xs ${gameId === currentGame ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {getGameDisplayName(gameId)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 relative">
            <span className="relative">
              BATTLE MODE
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-red-500 mb-6 flex items-center justify-center gap-3">
            <Shield className="w-6 h-6 animate-pulse" />
            SELECTION
            <Sword className="w-6 h-6 animate-pulse" />
          </h2>
          <p className="text-gray-300 font-medium text-lg max-w-2xl mx-auto">
            Choose your path to glory. Lead a team or join the ranks of elite warriors.
          </p>
        </div>

        {/* Team Choice Cards - Fixed Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Join Team Card - Red Theme to Match App */}
          <div className="group relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute -inset-3 bg-gradient-to-r from-red-600/25 to-red-800/25 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/70 transition-all duration-500 h-full group-hover:scale-105">
              <CardHeader className="text-center p-8">
                {/* Icon */}
                <div className="relative mx-auto mb-6">
                  <div className="absolute inset-0 w-20 h-20 border-4 border-red-500/30 rounded-2xl animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="h-10 w-10 text-white" />
                    <div className="absolute inset-0 border-2 border-red-400/50 rounded-2xl animate-ping opacity-0 group-hover:opacity-75"></div>
                  </div>
                </div>
                
                <CardTitle className="text-white text-2xl md:text-3xl font-black mb-4 group-hover:text-red-100 transition-colors duration-300">
                  JOIN TEAM
                </CardTitle>
                
                <CardDescription className="text-gray-400 text-lg mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  Connect with established teams looking for skilled players. Get AI-matched with teams that fit your playstyle and schedule.
                </CardDescription>
                
                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Search className="w-5 h-5 text-red-500" />
                    <span className="font-medium">AI-Powered Team Matching</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Brain className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="font-medium">Skill & Schedule Analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Trophy className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Performance Tracking</span>
                  </div>
                </div>
                
                <PrimaryButton 
                  className="w-full py-4 text-lg font-bold"
                  onClick={() => router.push('/join-team')}
                >
                  <Search className="mr-3 h-5 w-5" />
                  FIND MY TEAM
                  <Target className="ml-3 h-5 w-5" />
                </PrimaryButton>
              </CardHeader>
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Card>
          </div>

          {/* Create Team Card */}
          <div className="group relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-red-600/15 to-red-800/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute -inset-3 bg-gradient-to-r from-red-600/25 to-red-800/25 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/70 transition-all duration-500 h-full group-hover:scale-105">
              <CardHeader className="text-center p-8">
                {/* Icon */}
                <div className="relative mx-auto mb-6">
                  <div className="absolute inset-0 w-20 h-20 border-4 border-red-500/30 rounded-2xl animate-spin-slow group-hover:border-red-500/80 transition-colors duration-500"></div>
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-10 w-10 text-white" />
                    <div className="absolute inset-0 border-2 border-red-400/50 rounded-2xl animate-ping opacity-0 group-hover:opacity-75"></div>
                  </div>
                </div>
                
                <CardTitle className="text-white text-2xl md:text-3xl font-black mb-4 group-hover:text-red-100 transition-colors duration-300">
                  CREATE TEAM
                </CardTitle>
                
                <CardDescription className="text-gray-400 text-lg mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  Build your own elite squad from scratch. Use AI to recruit the perfect teammates and establish your legacy.
                </CardDescription>
                
                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Crown className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Team Leadership Control</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Brain className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="font-medium">AI Player Recruitment</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Settings className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Custom Team Settings</span>
                  </div>
                </div>
                
                <SecondaryButton 
                  className="w-full py-4 text-lg font-bold"
                  onClick={() => router.push('/create-team')}
                >
                  <Plus className="mr-3 h-5 w-5" />
                  BUILD EMPIRE
                  <Crown className="ml-3 h-5 w-5" />
                </SecondaryButton>
              </CardHeader>
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Card>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4 text-red-500" />
              <span className="font-bold">5,000+ Active Teams</span>
            </div>
            <div className="w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-bold">AI-Enhanced Matching</span>
            </div>
            <div className="w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Trophy className="w-4 h-4 text-red-500" />
              <span className="font-bold">97% Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
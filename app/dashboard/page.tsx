'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { Badge } from '@/components/ui/badge'
import { 
  Crosshair, 
  Trophy, 
  Users, 
  Brain,
  Target,
  Plus,
  Search,
  Crown,
  Flame,
  UserPlus,
  Settings,
  LogOut,
  Gamepad2,
  ChevronRight,
  Star
} from 'lucide-react'
import { getUserByClerkId, getUserTeamsForGame, TeamMembership, Team } from '@/lib/supabase'

export default function DashboardPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [currentGame, setCurrentGame] = useState<string>('')
  const [userTeams, setUserTeams] = useState<(TeamMembership & { teams: Team })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const games = [
    { 
      name: "VALORANT", 
      players: "2.1M", 
      rank: "#1", 
      color: "from-red-600 to-red-800",
      logo: "/logos/valorant-logo.png",
      id: "valorant"
    },
    { 
      name: "LEAGUE OF LEGENDS", 
      players: "1.8M", 
      rank: "#2", 
      color: "from-red-500 to-red-700",
      logo: "/logos/lol-logo.png",
      id: "league-of-legends"
    },
    { 
      name: "COUNTER-STRIKE 2", 
      players: "1.5M", 
      rank: "#3", 
      color: "from-red-600 to-red-900",
      logo: "/logos/cs2-logo.png",
      id: "counter-strike-2"
    },
    { 
      name: "OVERWATCH 2", 
      players: "900K", 
      rank: "#4", 
      color: "from-red-400 to-red-600",
      logo: "/logos/overwatch-logo.png",
      id: "overwatch-2"
    },
    { 
      name: "ROCKET LEAGUE", 
      players: "750K", 
      rank: "#5", 
      color: "from-red-700 to-red-900",
      logo: "/logos/rocket-league-logo.png",
      id: "rocket-league"
    }
  ]

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        const existingUser = await getUserByClerkId(user.id)
        
        if (!existingUser || !existingUser.selected_game || (Array.isArray(existingUser.selected_game) ? existingUser.selected_game.length === 0 : !existingUser.selected_game)) {
          router.push('/game-selection')
          return
        }
        
        const games = Array.isArray(existingUser.selected_game) 
          ? existingUser.selected_game 
          : [existingUser.selected_game]
        setSelectedGames(games)
        setCurrentGame(games[0]) // Set first game as default
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/game-selection')
      }
    }

    loadUserData()
  }, [user, router])

  useEffect(() => {
    const loadTeams = async () => {
      if (!user || !currentGame) return

      try {
        const teams = await getUserTeamsForGame(user.id, currentGame)
        setUserTeams(teams || [])
      } catch (error) {
        console.error('Error loading teams:', error)
        setUserTeams([])
      }
    }

    loadTeams()
  }, [user, currentGame])

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

      {/* Header Navigation */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center">
        <Link 
          href="/game-selection"
          className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="hidden lg:block font-bold text-sm md:text-base">MANAGE GAMES</span>
        </Link>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-2 py-1 md:px-4 md:py-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-xs md:text-sm">{user?.username || user?.firstName || 'Warrior'}</p>
              <p className="text-gray-400 text-xs">{selectedGames.length} Games • {userTeams.length} Teams</p>
            </div>
          </div>
          
          <AccentButton
            onClick={() => signOut()}
            size="sm"
            className="px-2 py-1 md:px-4 md:py-2"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:block ml-2 text-xs md:text-sm font-bold">LOGOUT</span>
          </AccentButton>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center">
                <Crosshair className="w-10 h-10 md:w-12 md:h-12 text-white" />
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
            <span className="relative">
              COMMAND CENTER
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
            Your multi-game empire headquarters. Switch between games and manage your teams across all battlefields.
          </p>
        </div>

        {/* Game Switcher */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            SELECT BATTLEFIELD
          </h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {selectedGames.map((gameId) => (
              <button
                key={gameId}
                onClick={() => setCurrentGame(gameId)}
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

        {/* Current Game Display */}
        {currentGame && (
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
        )}

        {/* Team Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-8">
          {/* Join Team Card */}
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

          {/* Create Team Card */}
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

        {/* Current Teams Display */}
        {userTeams.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              YOUR {getGameDisplayName(currentGame)} TEAMS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {userTeams.map((membership) => (
                <Card key={membership.id} className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-500/30 hover:border-red-500/60 transition-all duration-300">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-white text-lg font-bold">{membership.teams.name}</CardTitle>
                      <Badge className="bg-red-600 text-white text-xs">
                        {membership.role.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400 text-sm mb-3">
                      {membership.teams.description || 'Competitive team looking for glory'}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{membership.teams.current_members}/{membership.teams.max_members} Members</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {membership.teams.rank_requirement || 'Any Rank'}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Gamepad2 className="w-4 h-4 text-red-500" />
              <span className="font-bold">{selectedGames.length} Active Games</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4 text-red-500" />
              <span className="font-bold">{userTeams.length} Teams Joined</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-red-500/30"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Brain className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-bold">AI-Enhanced Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
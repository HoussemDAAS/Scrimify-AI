'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import { getUserByClerkId, getUserTeamsForGame, getUserGameStatistics, TeamMembership, Team } from '@/lib/supabase'
import DashboardContent from '@/components/dashboard/DashboardContent'

interface UserProfile {
  username: string
  avatar_url?: string
  bio?: string
  competitive_level: string
  selected_game: string[]
  riot_account_verified?: boolean
  riot_username?: string
  looking_for_team?: boolean
}

interface GameStats {
  rank?: string
  winRate?: string
  mainRole?: string
  summonerLevel?: number
  profileIcon?: string
}

export default function DashboardPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [currentGame, setCurrentGame] = useState<string>('')
  const [userTeams, setUserTeams] = useState<(TeamMembership & { teams: Team })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Enhanced profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({})

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
        
        // Set enhanced profile data
        setUserProfile({
          username: existingUser.username || user.username || user.firstName || 'Warrior',
          avatar_url: existingUser.avatar_url || user.imageUrl,
          bio: existingUser.bio || '',
          competitive_level: existingUser.competitive_level || 'casual',
          selected_game: games,
          riot_account_verified: existingUser.riot_account_verified || false,
          riot_username: existingUser.riot_username || '',
          looking_for_team: existingUser.looking_for_team !== false
        })
        
        // Load LoL game stats if available
        if (games.includes('league-of-legends')) {
          try {
            const lolStats = await getUserGameStatistics(existingUser.id, 'league-of-legends')
            if (lolStats) {
              setGameStats({
                'league-of-legends': {
                  rank: lolStats.current_rank || 'Unranked',
                  winRate: lolStats.win_rate ? `${lolStats.win_rate}%` : undefined,
                  mainRole: lolStats.main_role || undefined,
                  summonerLevel: lolStats.summoner_level || undefined,
                  profileIcon: lolStats.profile_icon_url || undefined
                }
              })
            }
          } catch (statsError) {
            console.log('No LoL stats found:', statsError)
          }
        }
        
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
    <DashboardContent
      selectedGames={selectedGames}
      currentGame={currentGame}
      userTeams={userTeams}
      games={games}
      onGameSelect={setCurrentGame}
    />
  )
}
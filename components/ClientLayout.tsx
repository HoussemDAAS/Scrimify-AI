'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getUserByClerkId, getUserGameStatistics } from '@/lib/supabase'
import GlobalNavbar from '@/components/GlobalNavbar'

interface UserProfile {
  username: string
  avatar_url?: string
  competitive_level: string
  selected_game: string[]
  riot_account_verified?: boolean
  looking_for_team?: boolean
}

interface GameStats {
  rank?: string
  winRate?: string
  mainRole?: string
  summonerLevel?: number
  profileIcon?: string
}

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user } = useUser()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({})

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        const existingUser = await getUserByClerkId(user.id)
        
        if (existingUser) {
          const games = Array.isArray(existingUser.selected_game) 
            ? existingUser.selected_game 
            : [existingUser.selected_game || 'valorant']
          
          setUserProfile({
            username: existingUser.username || user.username || user.firstName || 'Warrior',
            avatar_url: existingUser.avatar_url || user.imageUrl,
            competitive_level: existingUser.competitive_level || 'casual',
            selected_game: games,
            riot_account_verified: existingUser.riot_account_verified || false,
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
            } catch (error) {
              console.error('Error loading LoL stats:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    loadUserData()
  }, [user])

  return (
    <>
      <GlobalNavbar userProfile={userProfile || undefined} gameStats={gameStats} />
      {children}
    </>
  )
}

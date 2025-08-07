'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { AccentButton } from '@/components/ui/accent-button'
import { Settings, ArrowLeft, Brain, Menu } from 'lucide-react'
import { getUserByClerkId, updateUserProfile, uploadUserAvatar, createUserFromClerk, getUserGameStatistics } from '@/lib/supabase'

// Import profile components
import ProfileSidebar from '@/components/profile/navigation/ProfileSidebar'
import { ProfileSection } from '@/components/profile/navigation/ProfileSidebar'
import { default as ProfileHeaderNew } from '@/components/profile/ProfileHeaderNew'
import { default as GeneralTab } from '@/components/profile/GeneralTab'
import { default as GamingTab } from '@/components/profile/GamingTab'
import { default as RiotTab } from '@/components/profile/RiotTab'
import { default as PreferencesTab } from '@/components/profile/sections/PreferencesTab'

// Enhanced interfaces with better type safety
interface UserProfileData {
  username: string
  bio: string
  location: string
  avatar_url?: string
  discord_username?: string
  riot_username?: string
  riot_tagline?: string
  riot_account_verified: boolean
  riot_puuid?: string
  date_of_birth?: string
  timezone?: string
  competitive_level: string
  looking_for_team: boolean
  selected_game: string | string[]
}

interface PreferencesData {
  notifications_enabled?: boolean
  profile_visibility?: 'public' | 'private' | 'friends-only'
  show_online_status?: boolean
  allow_team_invites?: boolean
}

interface GameStats {
  rank: string
  rr?: string
  lp?: string
  mainAgent?: string
  mainRole?: string
  winRate: string
  gamesPlayed?: number
  wins?: number
  losses?: number
  totalMatches?: number
  lastPlayed: string
  profileIcon?: string
  summonerLevel?: number
  accountLevel?: number
}

export default function ProfilePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  
  // Navigation state
  const [activeSection, setActiveSection] = useState<ProfileSection>('general')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isConnectingRiot, setIsConnectingRiot] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    username: '',
    bio: '',
    location: '',
    discord_username: '',
    riot_username: '',
    riot_tagline: '',
    riot_account_verified: false,
    competitive_level: 'casual',
    looking_for_team: true,
    selected_game: []
  })

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    notifications_enabled: true,
    profile_visibility: 'public',
    show_online_status: true,
    allow_team_invites: true
  })

  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({})

  const competitiveLevels = [
    { value: 'casual', label: 'Casual Player', description: 'Playing for fun and improvement' },
    { value: 'competitive', label: 'Competitive', description: 'Focused on ranking up and winning' },
    { value: 'semi-pro', label: 'Semi-Professional', description: 'Competing in tournaments' },
    { value: 'professional', label: 'Professional', description: 'Full-time competitive gaming' }
  ]

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Stockholm',
    'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Australia/Sydney'
  ]

  const loadGameStats = useCallback(async (riotUsername?: string, riotTagline?: string, puuid?: string, userGames?: string[], region?: string, userData?: { id: string }) => {
    if (!riotUsername || !riotTagline) return

    setIsLoadingStats(true)

    try {
      const games = userGames || []
      const riotGames = games.filter(game => ['league-of-legends'].includes(game))
      
      if (riotGames.length === 0) {
        setIsLoadingStats(false)
        return
      }

      try {
        // Build URL with user ID for persistent storage
        const apiUrl = new URL('/api/riot', window.location.origin)
        if (userData?.id) {
          apiUrl.searchParams.set('userId', userData.id)
        }
        
        const response = await fetch(apiUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            puuid: puuid,
            games: riotGames,
            region: region || 'americas'
          })
        })

        if (response.ok) {
          const data = await response.json()
          setGameStats(prev => ({
            ...prev,
            ...data.stats
          }))
        } else {
          const fallbackStats: Record<string, GameStats> = {}
          
          if (riotGames.includes('league-of-legends')) {
            fallbackStats['league-of-legends'] = {
              rank: 'Account Verified',
              lp: 'API Limited',
              mainRole: 'Unknown',
              winRate: 'N/A',
              lastPlayed: 'Account connected'
            }
          }
          
          setGameStats(prev => ({
            ...prev,
            ...fallbackStats
          }))
        }
      } catch (riotError) {
        console.error('Riot API error:', riotError)
        const errorStats: Record<string, GameStats> = {}
        
        if (riotGames.includes('league-of-legends')) {
          errorStats['league-of-legends'] = {
            rank: 'Data Unavailable',
            lp: 'Check API Key',
            mainRole: 'Unknown',
            winRate: 'N/A',
            lastPlayed: 'Error occurred'
          }
        }
        
        setGameStats(prev => ({
          ...prev,
          ...errorStats
        }))
      }

    } catch (error) {
      console.error('Error loading game stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Load saved game statistics from database
  const loadSavedGameStats = useCallback(async (userData: { id: string }) => {
    try {
      // Load saved LoL stats
      const lolStats = await getUserGameStatistics(userData.id, 'league-of-legends')
      
      if (lolStats) {
        // Convert database stats to the format expected by the UI
        const convertedStats: GameStats = {
          rank: lolStats.current_rank || 'Unranked',
          winRate: lolStats.win_rate ? `${lolStats.win_rate}%` : '0%',
          mainRole: lolStats.main_role || 'Unknown',
          gamesPlayed: lolStats.games_played || 0,
          wins: lolStats.wins || 0,
          losses: lolStats.losses || 0,
          totalMatches: lolStats.total_matches || 0,
          profileIcon: lolStats.profile_icon_url || '',
          summonerLevel: lolStats.summoner_level || 0,
          lastPlayed: lolStats.last_played ? new Date(lolStats.last_played).toLocaleDateString() : 'N/A',
          lp: lolStats.rank_points || ''
        }
        
        setGameStats(prev => ({
          ...prev,
          'league-of-legends': convertedStats
        }))
      }
      
    } catch (error) {
      console.error('❌ Error loading saved game stats:', error)
    }
  }, [])

  const loadUserProfile = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Try to get existing user
      let userData = await getUserByClerkId(user.id)
      
      // If user doesn't exist, create from Clerk data with automatic avatar import
      if (!userData) {
        userData = await createUserFromClerk({
          id: user.id,
          emailAddresses: user.emailAddresses,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl
        })
      }

      const userGames = Array.isArray(userData.selected_game) 
        ? userData.selected_game 
        : userData.selected_game ? [userData.selected_game] : []

      // Set profile data with proper defaults and better fallbacks
      setProfileData({
        username: userData.username || user.username || user.firstName || '',
        bio: userData.bio || '',
        location: userData.location || '',
        avatar_url: userData.avatar_url || user.imageUrl, // Fallback to Clerk avatar
        discord_username: userData.discord_username || '',
        riot_username: userData.riot_username || '',
        riot_tagline: userData.riot_tagline || '',
        riot_account_verified: userData.riot_account_verified || false,
        riot_puuid: userData.riot_puuid || '',
        date_of_birth: userData.date_of_birth || '',
        timezone: userData.timezone || '',
        competitive_level: userData.competitive_level || 'casual',
        looking_for_team: userData.looking_for_team !== false,
        selected_game: userData.selected_game || []
      })

      // Load game stats if Riot account is verified
      if (userData.riot_account_verified && userData.riot_puuid && userData.riot_username && userData.riot_tagline) {
        await loadGameStats(userData.riot_username, userData.riot_tagline, userData.riot_puuid, userGames, undefined, userData)
      }
      
      // Always load saved game statistics from database
      await loadSavedGameStats(userData)

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, loadGameStats, loadSavedGameStats])

  useEffect(() => {
    if (user?.id) {
      loadUserProfile()
    }
  }, [user?.id, loadUserProfile])

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const avatarUrl = await uploadUserAvatar(file, user.id)
      setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleConnectRiot = async () => {
    if (!profileData.riot_username || !profileData.riot_tagline) {
      alert('Please enter your Riot username and tagline')
      return
    }

    setIsConnectingRiot(true)

    try {
      const regionsToTry = ['europe', 'americas', 'asia']
      let accountFound = false
      let accountData = null
      let detectedRegion = 'europe'
      
      for (const region of regionsToTry) {
        try {
          const response = await fetch(`/api/riot?gameName=${encodeURIComponent(profileData.riot_username)}&tagLine=${encodeURIComponent(profileData.riot_tagline)}&region=${region}`)
          
          if (response.ok) {
            accountData = await response.json()
            detectedRegion = region
            accountFound = true
            break
          }
        } catch {
          continue
        }
      }
      
      if (!accountFound || !accountData) {
        alert('Account not found in any region. Please check your username and tagline.')
        return
      }
      
      setProfileData(prev => ({ 
        ...prev, 
        riot_account_verified: true,
        riot_puuid: accountData.puuid,
        riot_username: accountData.gameName,
        riot_tagline: accountData.tagLine,
        riot_region: detectedRegion
      }))
      
      const userGames = Array.isArray(profileData.selected_game) 
        ? profileData.selected_game 
        : profileData.selected_game ? [profileData.selected_game] : []
      
      await loadGameStats(accountData.gameName, accountData.tagLine, accountData.puuid, userGames, detectedRegion, { id: user?.id || '' })
      
      // Removed success popup as requested
    } catch (error) {
      console.error('Error connecting Riot account:', error)
      alert('Failed to connect Riot account. Please try again.')
    } finally {
      setIsConnectingRiot(false)
    }
  }

  const handleRefreshStats = async () => {
    if (profileData.riot_account_verified) {
      const userGames = Array.isArray(profileData.selected_game) 
        ? profileData.selected_game 
        : profileData.selected_game ? [profileData.selected_game] : []
      await loadGameStats(profileData.riot_username, profileData.riot_tagline, profileData.riot_puuid, userGames, undefined, { id: user?.id || '' })
    }
  }

  // Save functions for each section
  const handleSaveProfile = async (updates: Partial<UserProfileData>) => {
    if (!user?.id) return

    try {
      await updateUserProfile(user.id, updates)
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      throw error
    }
  }

  const handleSavePreferences = async (preferences: PreferencesData) => {
    // In a real app, you'd save preferences to your backend
    // For now, just update local state
    setPreferencesData(preferences)
  }

  // Save LoL widget data to database
  const handleSaveLoLStats = async () => {
    if (!user?.id || !gameStats['league-of-legends']) {
      console.error('Missing user ID or LoL stats')
      alert('No LoL stats available to save')
      return
    }

    try {
      // First, get the internal database user ID using Clerk ID
      const userData = await getUserByClerkId(user.id)
      if (!userData) {
        alert('User not found in database. Please try refreshing the page.')
        return
      }

      const lolStats = gameStats['league-of-legends']
      console.log('Raw LoL stats:', lolStats)
      console.log('Using internal user ID:', userData.id)
      
      // Create the most minimal data structure first
      const statsToSave: Record<string, string | number | null> = {
        current_rank: lolStats.rank || 'Unranked'
      }
      
      // Add optional fields only if they exist and are valid
      if (lolStats.profileIcon) {
        statsToSave.profile_icon_url = lolStats.profileIcon
      }
      
      if (lolStats.summonerLevel && typeof lolStats.summonerLevel === 'number') {
        statsToSave.summoner_level = lolStats.summonerLevel
      }
      
      if (lolStats.lp) {
        statsToSave.rank_points = lolStats.lp
      }
      
      if (lolStats.mainRole) {
        statsToSave.main_role = lolStats.mainRole
      }
      
      // Process win rate safely
      if (lolStats.winRate && typeof lolStats.winRate === 'string') {
        const winRateValue = parseFloat(lolStats.winRate.replace('%', ''))
        if (!isNaN(winRateValue) && winRateValue >= 0 && winRateValue <= 100) {
          statsToSave.win_rate = winRateValue
        }
      }
      
      // Add numeric stats if they're valid
      if (typeof lolStats.gamesPlayed === 'number') {
        statsToSave.games_played = lolStats.gamesPlayed
      }
      
      if (typeof lolStats.wins === 'number') {
        statsToSave.wins = lolStats.wins
      }
      
      if (typeof lolStats.losses === 'number') {
        statsToSave.losses = lolStats.losses
      }
      
      if (typeof lolStats.totalMatches === 'number') {
        statsToSave.total_matches = lolStats.totalMatches
      }
      
      if (lolStats.lastPlayed) {
        statsToSave.last_played = lolStats.lastPlayed
      }
      
      console.log('Final processed stats to save:', statsToSave)
      
      // Use the API route to save statistics
      const response = await fetch('/api/save-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          gameId: 'league-of-legends',
          stats: statsToSave
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save statistics')
      }
      
      alert('✅ LoL stats saved successfully to database!')
    } catch (error) {
      console.error('❌ Detailed error saving LoL stats:', error)
      alert(`Failed to save LoL stats: ${error.message || 'Unknown error'}`)
    }
  }

  // Render section content based on active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <GeneralTab
            profileData={profileData}
            setProfileData={setProfileData}
            timezones={timezones}
            competitiveLevels={competitiveLevels}
            onSave={handleSaveProfile}
          />
        )
      case 'gaming':
        return (
          <GamingTab
            profileData={profileData}
            setProfileData={setProfileData}
            competitiveLevels={competitiveLevels}
          />
        )
      case 'riot':
        return (
          <RiotTab
            profileData={profileData}
            setProfileData={setProfileData}
            gameStats={gameStats}
            isConnectingRiot={isConnectingRiot}
            isLoadingStats={isLoadingStats}
            onConnectRiot={handleConnectRiot}
            onRefreshStats={handleRefreshStats}
          />
        )
      case 'preferences':
        return (
          <PreferencesTab
            preferencesData={preferencesData}
            setPreferencesData={setPreferencesData}
            onSave={handleSavePreferences}
          />
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-bold">Loading Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible on Mobile */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        w-64 lg:w-80 
        flex-shrink-0 
        min-h-screen 
        z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
      `}>
        <ProfileSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 h-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-red-500/20"></div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-48 h-48 bg-red-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-44 h-44 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-8 h-8 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center hover:border-red-500 transition-all duration-300 text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span className="hidden lg:block font-bold text-sm md:text-base">BACK TO DASHBOARD</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <AccentButton
              onClick={() => signOut()}
              size="sm"
              className="px-2 py-1 md:px-4 md:py-2"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:block ml-2 text-xs md:text-sm font-bold">LOGOUT</span>
            </AccentButton>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-screen overflow-y-auto px-4 md:px-6 py-16 md:py-20">
          {/* Profile Header Component */}
          <div className="max-w-5xl mx-auto mb-6 lg:mb-8">
            <ProfileHeaderNew
              profileData={profileData}
              gameStats={gameStats}
              onAvatarUpload={handleAvatarUpload}
              isUploadingAvatar={isUploadingAvatar}
              onSaveLoLStats={handleSaveLoLStats}
            />
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
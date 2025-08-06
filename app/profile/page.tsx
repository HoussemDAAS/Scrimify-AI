'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PrimaryButton } from '@/components/ui/primary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { User, Settings, ArrowLeft, Brain, Save, RefreshCw } from 'lucide-react'
import { getUserByClerkId, updateUserProfile, uploadUserAvatar } from '@/lib/supabase'

import ProfileHeader from '@/components/profile/ProfileHeader'
import GeneralTab from '@/components/profile/GeneralTab'
import GamingTab from '@/components/profile/GamingTab'
import RiotTab from '@/components/profile/RiotTab'

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
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  const [gameStats, setGameStats] = useState<Record<string, GameStats>>({})
  const [activeTab, setActiveTab] = useState<'general' | 'gaming' | 'riot'>('general')

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

  const loadGameStats = useCallback(async (riotUsername?: string, riotTagline?: string, puuid?: string, userGames?: string[], region?: string) => {
    if (!riotUsername || !riotTagline) return

    setIsLoadingStats(true)

    try {
      console.log(`🔍 Loading stats via Riot API for ${riotUsername}#${riotTagline}`)
      
      const games = userGames || []
      const riotGames = games.filter(game => ['league-of-legends'].includes(game))
      
      if (riotGames.length === 0) {
        setIsLoadingStats(false)
        return
      }

      try {
        const response = await fetch('/api/riot', {
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
          console.log('✅ Riot API stats loaded successfully:', data.stats)
          setGameStats(prev => ({
            ...prev,
            ...data.stats
          }))
        } else {
          console.log('ℹ️ Riot API unavailable, using fallback data')
          const fallbackStats: Record<string, any> = {}
          
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
        const errorStats: Record<string, any> = {}
        
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

  const loadUserProfile = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userData = await getUserByClerkId(user.id)
      
      if (!userData) {
        router.push('/game-selection')
        return
      }

      const userGames = Array.isArray(userData.selected_game) 
        ? userData.selected_game 
        : userData.selected_game ? [userData.selected_game] : []

      setProfileData({
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        avatar_url: userData.avatar_url,
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

      if (userData.riot_account_verified && userData.riot_puuid) {
        await loadGameStats(userData.riot_username, userData.riot_tagline, userData.riot_puuid, userGames)
      }

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, router, loadGameStats])

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

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
      console.log(`Connecting Riot account: ${profileData.riot_username}#${profileData.riot_tagline}`)
      
      const regionsToTry = ['europe', 'americas', 'asia']
      let accountFound = false
      let accountData = null
      let detectedRegion = 'europe'
      
      for (const region of regionsToTry) {
        try {
          console.log(`🌍 Trying region: ${region}`)
          const response = await fetch(`/api/riot?gameName=${encodeURIComponent(profileData.riot_username)}&tagLine=${encodeURIComponent(profileData.riot_tagline)}&region=${region}`)
          
          if (response.ok) {
            accountData = await response.json()
            detectedRegion = region
            accountFound = true
            console.log(`✅ Account found in region: ${region}`)
            break
          }
        } catch (error) {
          console.log(`❌ Account not found in region: ${region}`)
          continue
        }
      }
      
      if (!accountFound || !accountData) {
        alert('Account not found in any region. Please check your username and tagline.')
        return
      }
      
      console.log('Riot account verified:', accountData)
      
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
      
      await loadGameStats(accountData.gameName, accountData.tagLine, accountData.puuid, userGames, detectedRegion)
      
      alert(`Riot account connected successfully! (Region: ${detectedRegion.toUpperCase()})`)
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
      await loadGameStats(profileData.riot_username, profileData.riot_tagline, profileData.riot_puuid, userGames)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      await updateUserProfile(user.id, {
        ...profileData,
        riot_puuid: profileData.riot_puuid
      })
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
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
    <div className="min-h-screen bg-black relative overflow-hidden">
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
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 group"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="hidden lg:block font-bold text-sm md:text-base">BACK TO DASHBOARD</span>
        </Link>

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

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
        {/* Page Title */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-red-500/30 rounded-3xl animate-spin-slow"></div>
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center">
                <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 md:mb-4 relative px-4">
            <span className="relative">
              WARRIOR PROFILE
              <div className="absolute inset-0 bg-red-500/10 blur-xl animate-pulse"></div>
            </span>
          </h1>
          <p className="text-gray-300 font-medium text-base md:text-lg max-w-2xl mx-auto px-4">
            Customize your gaming profile and connect your accounts for enhanced team matching
          </p>
        </div>

        {/* Profile Header Component */}
        <ProfileHeader
          profileData={profileData}
          user={user}
          competitiveLevels={competitiveLevels}
          isUploadingAvatar={isUploadingAvatar}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900/60 border border-red-500/30 rounded-lg p-1">
              {[
                { id: 'general', label: 'General', icon: User },
                { id: 'gaming', label: 'Gaming', icon: User },
                { id: 'riot', label: 'Riot Games', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'general' | 'gaming' | 'riot')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'general' && (
            <GeneralTab
              profileData={profileData}
              setProfileData={setProfileData}
              timezones={timezones}
            />
          )}

          {activeTab === 'gaming' && (
            <GamingTab
              profileData={profileData}
              setProfileData={setProfileData}
              competitiveLevels={competitiveLevels}
            />
          )}

          {activeTab === 'riot' && (
            <RiotTab
              profileData={profileData}
              setProfileData={setProfileData}
              gameStats={gameStats}
              isConnectingRiot={isConnectingRiot}
              onConnectRiot={handleConnectRiot}
              onRefreshStats={handleRefreshStats}
            />
          )}
        </div>

        {/* Save Button */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <PrimaryButton
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-8 py-3 text-lg font-bold"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
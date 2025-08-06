import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccentButton } from '@/components/ui/accent-button'
import { Sword, RefreshCw, Shield, Target, Calendar, Trophy, BarChart } from 'lucide-react'
import { gameConfigs } from '@/lib/game-configs'

// Updated GameStats interface to include new fields
interface GameStats {
  // Profile information
  profileIcon?: string
  summonerLevel?: number
  accountLevel?: number
  
  // Rank information
  rank: string
  rr?: string
  lp?: string
  
  // Performance stats
  mainAgent?: string
  mainRole?: string
  winRate: string
  lastPlayed: string
  gamesPlayed?: number
  wins?: number
  losses?: number
  totalMatches?: number
  recentForm?: string
  topChampions?: Array<{
    name: string
    level: number
    points: number
  }>
  flexRank?: string
  averageKDA?: string
  error?: string
}

interface UserProfileData {
  riot_username?: string
  riot_tagline?: string
  riot_account_verified: boolean
  selected_game: string | string[]
}

interface RiotTabProps {
  profileData: UserProfileData
  setProfileData: React.Dispatch<React.SetStateAction<UserProfileData>>
  gameStats: Record<string, GameStats>
  isConnectingRiot: boolean
  isLoadingStats?: boolean
  onConnectRiot: () => void
  onRefreshStats: () => void
}

export default function RiotTab({ 
  profileData, 
  setProfileData, 
  gameStats, 
  isConnectingRiot, 
  isLoadingStats = false,
  onConnectRiot, 
  onRefreshStats 
}: RiotTabProps) {
  const getUserSelectedGames = () => {
    const games = Array.isArray(profileData.selected_game) 
      ? profileData.selected_game 
      : profileData.selected_game ? [profileData.selected_game] : []
    return games
  }

  const renderGameCard = (gameId: string, stats: GameStats) => {
    const config = gameConfigs[gameId as keyof typeof gameConfigs]
    if (!config) return null

    return (
      <Card key={gameId} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-red-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src={config.logo}
                  alt={config.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold">{config.name}</h3>
                {stats.profileIcon && (
                  <div className="flex items-center gap-2 mt-1">
                    <Image
                      src={stats.profileIcon}
                      alt="Profile Icon"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-gray-400">
                      Level {stats.summonerLevel || stats.accountLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <AccentButton
              onClick={onRefreshStats}
              size="sm"
              disabled={isLoadingStats}
              className="px-2 py-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </AccentButton>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-gray-400 text-sm font-medium">Current Rank</span>
              </div>
              <p className="text-white font-bold">{stats.rank}</p>
              {stats.lp && <p className="text-gray-400 text-sm">{stats.lp}</p>}
              {stats.rr && <p className="text-gray-400 text-sm">{stats.rr}</p>}
            </div>

            <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-500" />
                <span className="text-gray-400 text-sm font-medium">Main Role</span>
              </div>
              <p className="text-white font-bold">{stats.mainRole || stats.mainAgent || 'Unknown'}</p>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-red-500" />
                <span className="text-gray-400 text-sm font-medium">Win Rate</span>
              </div>
              <p className="text-white font-bold">{stats.winRate}</p>
              {stats.wins !== undefined && stats.losses !== undefined && (
                <p className="text-gray-400 text-sm">{stats.wins}W / {stats.losses}L</p>
              )}
            </div>

            <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="text-gray-400 text-sm font-medium">Last played</span>
              </div>
              <p className="text-white font-bold text-sm">{stats.lastPlayed}</p>
            </div>
          </div>

          {/* Match Analysis Section */}
          {(stats.gamesPlayed !== undefined || stats.totalMatches !== undefined) && (
            <div className="bg-gray-900/60 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-4 h-4 text-red-500" />
                <span className="text-gray-400 text-sm font-medium">Match Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {stats.gamesPlayed !== undefined && (
                  <div>
                    <span className="text-gray-400">Ranked Games:</span>
                    <span className="text-white font-bold ml-2">{stats.gamesPlayed}</span>
                  </div>
                )}
                {stats.totalMatches !== undefined && (
                  <div>
                    <span className="text-gray-400">Total Matches:</span>
                    <span className="text-white font-bold ml-2">{stats.totalMatches}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-500" />
            Riot Games Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="riot_username" className="text-white font-bold mb-2">
                Riot Username
              </Label>
              <Input
                id="riot_username"
                value={profileData.riot_username || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, riot_username: e.target.value }))}
                placeholder="Enter your Riot username"
                className="bg-gray-800/50 border-red-500/30 text-white"
                disabled={profileData.riot_account_verified}
              />
            </div>
            <div>
              <Label htmlFor="riot_tagline" className="text-white font-bold mb-2">
                Tagline
              </Label>
              <Input
                id="riot_tagline"
                value={profileData.riot_tagline || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, riot_tagline: e.target.value }))}
                placeholder="e.g., EUW"
                className="bg-gray-800/50 border-red-500/30 text-white"
                disabled={profileData.riot_account_verified}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                profileData.riot_account_verified ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <span className="text-white font-medium">
                {profileData.riot_account_verified ? 'Account Verified' : 'Account Not Connected'}
              </span>
            </div>
            
            {!profileData.riot_account_verified && (
              <AccentButton
                onClick={onConnectRiot}
                disabled={isConnectingRiot || isLoadingStats}
                className="px-6 py-2"
              >
                {isConnectingRiot ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Account'
                )}
              </AccentButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoadingStats && (
        <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-white font-bold text-lg mb-2">Gathering Data...</p>
              <p className="text-gray-400 text-sm">
                Analyzing your match history and performance statistics
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Stats */}
      {profileData.riot_account_verified && !isLoadingStats && (
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">Game Statistics</h3>
          <div className="grid grid-cols-1 gap-4">
            {/* Only show League of Legends for now - Valorant commented out due to no server data */}
            {getUserSelectedGames().filter(gameId => ['league-of-legends'].includes(gameId)).map((gameId) => {
              const stats = gameStats[gameId]
              return stats ? renderGameCard(gameId, stats) : null
            })}
          </div>
          
          {getUserSelectedGames().some(gameId => ['valorant'].includes(gameId)) && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-yellow-400 font-bold">Valorant Temporarily Unavailable</span>
              </div>
              <p className="text-gray-400 text-sm">
                Valorant statistics are currently unavailable due to server data limitations. 
                This feature will be restored once server connectivity is resolved.
              </p>
            </div>
          )}
          
          {getUserSelectedGames().filter(gameId => ['league-of-legends', 'valorant'].includes(gameId)).length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No Riot Games selected in your gaming preferences.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
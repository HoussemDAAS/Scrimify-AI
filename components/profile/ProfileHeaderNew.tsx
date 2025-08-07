import React from 'react'
import Image from 'next/image'
import { User, Upload, Crown, Shield, Save } from 'lucide-react'

interface UserProfileData {
  username: string
  avatar_url?: string
  bio?: string
  riot_account_verified?: boolean
  riot_username?: string
}

interface GameStats {
  rank?: string
  winRate?: string
  profileIcon?: string
  summonerLevel?: number
  lp?: string
  mainRole?: string
}

interface ProfileHeaderNewProps {
  profileData: UserProfileData
  gameStats?: Record<string, GameStats>
  onAvatarUpload: (file: File) => void
  isUploadingAvatar: boolean
  onSaveLoLStats?: () => void
}

/**
 * Brand New Profile Header - Clean and Working
 * Gaming-themed design with LoL integration
 */
export default function ProfileHeaderNew({ 
  profileData, 
  gameStats,
  onAvatarUpload, 
  isUploadingAvatar,
  onSaveLoLStats
}: ProfileHeaderNewProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAvatarUpload(file)
    }
  }

  const lolStats = gameStats?.['league-of-legends']
  const showLoLWidget = (profileData.riot_account_verified && profileData.riot_username) || lolStats
  
  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-black/95 border border-red-500/20 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-6 flex-wrap lg:flex-nowrap">
        {/* Avatar Section */}
        <div className="relative">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-red-500/20 to-red-600/20">
            {profileData.avatar_url ? (
              <Image
                src={profileData.avatar_url}
                alt="Profile Avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploadingAvatar}
            />
          </label>
          
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{profileData.username}</h1>
            <Crown className="w-5 h-5 text-yellow-500" />
            {profileData.riot_account_verified && (
              <Shield className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          {profileData.bio && (
            <p className="text-gray-300 text-sm mb-4 max-w-md">{profileData.bio}</p>
          )}

          {/* Gaming Status */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Gaming Profile Active</span>
          </div>
        </div>

        {/* League of Legends Widget - Minimalistic Design */}
        {showLoLWidget && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 min-w-[200px] shadow-lg">
            {/* Header with Game Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">LoL</span>
                </div>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">League of Legends</span>
              </div>
              {onSaveLoLStats && (
                <button
                  onClick={onSaveLoLStats}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                  title="Save LoL stats to database"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Main Content */}
            <div className="flex items-center gap-3">
              {/* Profile Icon */}
              <div className="relative">
                {lolStats?.profileIcon ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-red-500/30 bg-gray-700">
                    <Image
                      src={lolStats.profileIcon}
                      alt="Summoner Icon"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-red-400" />
                  </div>
                )}
                {/* Level Badge */}
                {lolStats?.summonerLevel && (
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md border border-red-500">
                    {lolStats.summonerLevel}
                  </div>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate mb-1">
                  {profileData.riot_username || 'LoL Player'}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-400 font-medium">{lolStats?.rank || 'Unranked'}</span>
                  </div>
                  {lolStats?.winRate && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">{lolStats.winRate}</span>
                    </div>
                  )}
                </div>
                {lolStats?.lp && (
                  <p className="text-gray-400 text-xs mt-1">{lolStats.lp} LP</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import Image from 'next/image'
import { User, Upload, Crown, Shield, Trophy } from 'lucide-react'

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
}

interface ProfileHeaderNewProps {
  profileData: UserProfileData
  gameStats?: Record<string, GameStats>
  onAvatarUpload: (file: File) => void
  isUploadingAvatar: boolean
}

/**
 * Brand New Profile Header - Clean and Working
 * Gaming-themed design with LoL integration
 */
export default function ProfileHeaderNew({ 
  profileData, 
  gameStats,
  onAvatarUpload, 
  isUploadingAvatar 
}: ProfileHeaderNewProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAvatarUpload(file)
    }
  }

  const lolStats = gameStats?.['league-of-legends']
  const showLoLWidget = profileData.riot_account_verified && profileData.riot_username
  
  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-black/95 border border-red-500/20 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-6">
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

        {/* League of Legends Widget */}
        {showLoLWidget && (
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/40 rounded-xl p-6 min-w-[240px] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">League of Legends</p>
                <p className="text-white text-lg font-bold">{profileData.riot_username}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Current Rank</span>
                <span className="text-blue-300 font-bold text-sm">{lolStats?.rank || 'Unranked'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Win Rate</span>
                <span className="text-green-400 font-bold text-sm">{lolStats?.winRate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-2 rounded-full w-4/5 animate-pulse"></div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 text-center">Gaming Performance</p>
          </div>
        )}
      </div>
    </div>
  )
}

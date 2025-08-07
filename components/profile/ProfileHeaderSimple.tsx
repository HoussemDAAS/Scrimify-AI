import React from 'react'
import Image from 'next/image'
import { User, Upload, Crown } from 'lucide-react'
import LoLGameWidget from './widgets/LoLGameWidgetSimple'

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

interface ProfileHeaderProps {
  profileData: UserProfileData
  gameStats?: Record<string, GameStats>
  onAvatarUpload: (file: File) => void
  isUploadingAvatar: boolean
}

/**
 * Enhanced Profile Header without LoL widget for testing
 */
function ProfileHeader({ 
  profileData, 
  gameStats,
  onAvatarUpload, 
  isUploadingAvatar 
}: ProfileHeaderProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAvatarUpload(file)
    }
  }

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
        <div className="min-w-0">
          <LoLGameWidget
            summonerName={profileData.riot_username}
            profileIcon={gameStats?.['league-of-legends']?.profileIcon}
            rank={gameStats?.['league-of-legends']?.rank}
            winRate={gameStats?.['league-of-legends']?.winRate}
            isVerified={profileData.riot_account_verified}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader

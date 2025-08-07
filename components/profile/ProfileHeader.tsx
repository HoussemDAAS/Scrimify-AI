import React from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, User, MapPin, Trophy, Shield, RefreshCw } from 'lucide-react'
import { gameConfigs } from '@/lib/game-configs'

// Clean interface definitions
interface UserProfileData {
  username: string
  bio: string
  location: string
  avatar_url?: string
  competitive_level: string
  looking_for_team: boolean
  selected_game: string | string[]
  riot_account_verified: boolean
}

interface ClerkUser {
  username?: string
  firstName?: string
  lastName?: string
}

interface ProfileHeaderProps {
  profileData: UserProfileData
  user: ClerkUser | null
  competitiveLevels: Array<{ value: string; label: string }>
  isUploadingAvatar: boolean
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ProfileHeader({ 
  profileData, 
  user, 
  competitiveLevels, 
  isUploadingAvatar, 
  onAvatarUpload 
}: ProfileHeaderProps) {
  
  // Helper function to get user's selected games as array
  const getUserSelectedGames = (): string[] => {
    const games = Array.isArray(profileData.selected_game) 
      ? profileData.selected_game 
      : profileData.selected_game ? [profileData.selected_game] : []
    return games
  }

  // Helper function to get display name with fallbacks
  const getDisplayName = (): string => {
    if (profileData.username) return profileData.username
    if (user?.username) return user.username
    if (user?.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName
    }
    return 'Gaming Warrior'
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-red-500/50 bg-gray-800">
                {profileData.avatar_url ? (
                  <Image 
                    src={profileData.avatar_url} 
                    alt="Profile Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <div className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center border-2 border-black transition-colors">
                  {isUploadingAvatar ? (
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {getDisplayName()}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {getUserSelectedGames().map((gameId) => (
                  <Badge key={gameId} className="bg-red-600/20 text-red-300 border border-red-500/30">
                    <span className="mr-1">🎮</span>
                    {gameConfigs[gameId]?.name || gameId.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-400 mb-4">
                {profileData.bio || 'No bio added yet'}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-400">
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {competitiveLevels.find(l => l.value === profileData.competitive_level)?.label}
                </div>
                {profileData.riot_account_verified && (
                  <div className="flex items-center gap-1 text-green-400">
                    <Shield className="w-4 h-4" />
                    Riot Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
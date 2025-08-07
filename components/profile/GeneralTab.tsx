import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User } from 'lucide-react'

// Clean interface for user profile data
interface UserProfileData {
  username: string
  bio: string
  location: string
  timezone?: string
  discord_username?: string
}

interface GeneralTabProps {
  profileData: UserProfileData
  setProfileData: React.Dispatch<React.SetStateAction<UserProfileData>>
  timezones: string[]
}

/**
 * GeneralTab Component
 * Handles basic user information like username, bio, location, etc.
 */
export default function GeneralTab({ 
  profileData, 
  setProfileData, 
  timezones 
}: GeneralTabProps) {
  
  // Helper function to update profile data
  const updateField = (field: keyof UserProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-red-500" />
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white font-bold mb-2">Username</Label>
            <Input
              value={profileData.username}
              onChange={(e) => updateField('username', e.target.value)}
              className="bg-gray-800 border-red-500/30 text-white"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <Label className="text-white font-bold mb-2">Location</Label>
            <Input
              value={profileData.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="bg-gray-800 border-red-500/30 text-white"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <Label className="text-white font-bold mb-2">Bio</Label>
          <Textarea
            value={profileData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="bg-gray-800 border-red-500/30 text-white min-h-20"
            placeholder="Tell other players about yourself..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white font-bold mb-2">Timezone</Label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full bg-gray-800 border border-red-500/30 text-white rounded-md px-3 py-2"
            >
              <option value="">Select Timezone</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-white font-bold mb-2">Discord Username</Label>
            <Input
              value={profileData.discord_username}
              onChange={(e) => setProfileData(prev => ({ ...prev, discord_username: e.target.value }))}
              className="bg-gray-800 border-red-500/30 text-white"
              placeholder="username#1234"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
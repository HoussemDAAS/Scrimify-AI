import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PrimaryButton } from '@/components/ui/primary-button'
import { User, Save, Check } from 'lucide-react'

// Clean interface for user profile data
interface UserProfileData {
  username: string
  bio: string
  location: string
  timezone?: string
  discord_username?: string
  date_of_birth?: string
  competitive_level?: string
  looking_for_team?: boolean
}

interface GeneralTabProps {
  profileData: UserProfileData
  setProfileData: React.Dispatch<React.SetStateAction<UserProfileData>>
  timezones: string[]
  competitiveLevels: Array<{ value: string; label: string; description?: string }>
  onSave: (data: Partial<UserProfileData>) => Promise<void>
}

/**
 * GeneralTab Component
 * Handles basic user information with individual save functionality
 */
export default function GeneralTab({ 
  profileData, 
  setProfileData, 
  timezones,
  competitiveLevels,
  onSave 
}: GeneralTabProps) {
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Helper function to update profile data
  const updateField = (field: keyof UserProfileData, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false) // Reset success state when data changes
  }

  // Handle save for this section
  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      await onSave({
        username: profileData.username,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        discord_username: profileData.discord_username,
        date_of_birth: profileData.date_of_birth,
        competitive_level: profileData.competitive_level,
        looking_for_team: profileData.looking_for_team
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Reset success after 3s
    } catch (error) {
      console.error('Error saving general profile:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-red-500" />
          General Information
        </CardTitle>
        
        {/* Save Button */}
        <PrimaryButton
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[100px]"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : saveSuccess ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved!
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </div>
          )}
        </PrimaryButton>
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
              value={profileData.timezone || ''}
              onChange={(e) => updateField('timezone', e.target.value)}
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
              value={profileData.discord_username || ''}
              onChange={(e) => updateField('discord_username', e.target.value)}
              className="bg-gray-800 border-red-500/30 text-white"
              placeholder="username#1234"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-white font-bold mb-2">Date of Birth</Label>
            <Input
              type="date"
              value={profileData.date_of_birth || ''}
              onChange={(e) => updateField('date_of_birth', e.target.value)}
              className="bg-gray-800 border-red-500/30 text-white"
            />
          </div>

          <div>
            <Label className="text-white font-bold mb-2">Competitive Level</Label>
            <select
              value={profileData.competitive_level || 'casual'}
              onChange={(e) => updateField('competitive_level', e.target.value)}
              className="w-full bg-gray-800 border border-red-500/30 text-white rounded-md px-3 py-2"
            >
              {competitiveLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="looking-for-team"
            checked={profileData.looking_for_team || false}
            onChange={(e) => updateField('looking_for_team', e.target.checked)}
            className="w-4 h-4 text-red-500 bg-gray-800 border-red-500/30 rounded focus:ring-red-500"
          />
          <Label htmlFor="looking-for-team" className="text-white font-medium">
            Looking for team
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
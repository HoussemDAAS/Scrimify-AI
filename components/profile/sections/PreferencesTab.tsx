import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Settings, Save, Check, Bell, Shield, Eye } from 'lucide-react'

interface PreferencesData {
  notifications_enabled?: boolean
  profile_visibility?: 'public' | 'private' | 'friends-only'
  show_online_status?: boolean
  allow_team_invites?: boolean
}

interface PreferencesTabProps {
  preferencesData: PreferencesData
  setPreferencesData: React.Dispatch<React.SetStateAction<PreferencesData>>
  onSave: (data: PreferencesData) => Promise<void>
}

/**
 * PreferencesTab Component
 * Handles privacy and notification settings
 */
export default function PreferencesTab({ 
  preferencesData, 
  setPreferencesData, 
  onSave 
}: PreferencesTabProps) {
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const updateField = (field: keyof PreferencesData, value: boolean | string) => {
    setPreferencesData(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      await onSave(preferencesData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" />
          Preferences
        </CardTitle>
        
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
        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-red-500/20">
            <div>
              <Label className="text-white font-medium">Enable Notifications</Label>
              <p className="text-gray-400 text-sm">Receive updates about teams, matches, and friends</p>
            </div>
            <input
              type="checkbox"
              checked={preferencesData.notifications_enabled ?? true}
              onChange={(e) => updateField('notifications_enabled', e.target.checked)}
              className="w-5 h-5 text-red-500 bg-gray-800 border-red-500/30 rounded focus:ring-red-500"
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-red-500/20">
              <Label className="text-white font-medium mb-3 block">Profile Visibility</Label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                  { value: 'friends-only', label: 'Friends Only', desc: 'Only friends can see your profile' },
                  { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={preferencesData.profile_visibility === option.value}
                      onChange={(e) => updateField('profile_visibility', e.target.value as 'public' | 'private' | 'friends-only')}
                      className="w-4 h-4 text-red-500 bg-gray-800 border-red-500/30 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-white text-sm font-medium">{option.label}</span>
                      <p className="text-gray-400 text-xs">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-red-500/20">
              <div>
                <Label className="text-white font-medium">Show Online Status</Label>
                <p className="text-gray-400 text-sm">Let others see when you&apos;re online</p>
              </div>
              <input
                type="checkbox"
                checked={preferencesData.show_online_status ?? true}
                onChange={(e) => updateField('show_online_status', e.target.checked)}
                className="w-5 h-5 text-red-500 bg-gray-800 border-red-500/30 rounded focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Team Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Team Settings</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-red-500/20">
            <div>
              <Label className="text-white font-medium">Allow Team Invites</Label>
              <p className="text-gray-400 text-sm">Let team captains send you invitations</p>
            </div>
            <input
              type="checkbox"
              checked={preferencesData.allow_team_invites ?? true}
              onChange={(e) => updateField('allow_team_invites', e.target.checked)}
              className="w-5 h-5 text-red-500 bg-gray-800 border-red-500/30 rounded focus:ring-red-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Gamepad2 } from 'lucide-react'

interface UserProfileData {
  competitive_level: string
  looking_for_team: boolean
}

interface GamingTabProps {
  profileData: UserProfileData
  setProfileData: React.Dispatch<React.SetStateAction<UserProfileData>>
  competitiveLevels: Array<{ value: string; label: string; description: string }>
}

export default function GamingTab({ profileData, setProfileData, competitiveLevels }: GamingTabProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-2 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-red-500" />
          Gaming Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-white font-bold mb-2">Competitive Level</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {competitiveLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setProfileData(prev => ({ ...prev, competitive_level: level.value }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  profileData.competitive_level === level.value
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-red-500/30 bg-gray-800/50 hover:border-red-500/60'
                }`}
              >
                <h3 className="text-white font-bold mb-1">{level.label}</h3>
                <p className="text-gray-400 text-sm">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
          <div>
            <h3 className="text-white font-bold mb-1">Looking for Team</h3>
            <p className="text-gray-400 text-sm">Show in team discovery searches</p>
          </div>
          <button
            onClick={() => setProfileData(prev => ({ ...prev, looking_for_team: !prev.looking_for_team }))}
            className={`w-12 h-6 rounded-full transition-all ${
              profileData.looking_for_team ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              profileData.looking_for_team ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
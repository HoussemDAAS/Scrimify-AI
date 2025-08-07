'use client'

import { useState } from 'react'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Edit3, Trash2, Save, X, Shield, AlertTriangle } from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  game: string
  region: string
  rank_requirement: string
  max_members: number
  current_members: number
  practice_schedule: string
  logo_url?: string
  created_at: string
}

interface EditFormData {
  name: string
  description: string
  rank_requirement: string
  practice_schedule: string
}

interface SettingsTabProps {
  team: Team
  onUpdateTeam: (formData: EditFormData) => void
  onDeleteTeam: () => void
  actionLoading: string | null
}

export function SettingsTab({ team, onUpdateTeam, onDeleteTeam, actionLoading }: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: team.name,
    description: team.description,
    rank_requirement: team.rank_requirement || '',
    practice_schedule: team.practice_schedule || ''
  })

  const handleSave = () => {
    onUpdateTeam(editFormData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditFormData({
      name: team.name,
      description: team.description,
      rank_requirement: team.rank_requirement || '',
      practice_schedule: team.practice_schedule || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">TEAM CONFIGURATION</h2>
          <p className="text-gray-400 text-sm">Manage team settings and preferences</p>
        </div>
      </div>

      {/* Team Settings Card */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 md:p-8 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">SQUAD DETAILS</h3>
              <p className="text-gray-400 text-sm">Configure your team&apos;s public information</p>
            </div>
            {!isEditing ? (
              <SecondaryButton 
                onClick={() => setIsEditing(true)}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/50"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                EDIT SQUAD
              </SecondaryButton>
            ) : (
              <div className="flex items-center gap-3">
                <SecondaryButton 
                  onClick={handleCancel}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border-gray-500/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  CANCEL
                </SecondaryButton>
                <PrimaryButton 
                  onClick={handleSave}
                  disabled={actionLoading === 'update-team'}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  SAVE CHANGES
                </PrimaryButton>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Squad Name</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your team name"
                className="bg-gradient-to-r from-gray-800/50 to-black/50 border-purple-500/30 focus:border-purple-500/60 text-white placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Squad Description</label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                disabled={!isEditing}
                placeholder="Describe your team's goals, playstyle, and what you're looking for..."
                rows={4}
                className="bg-gradient-to-r from-gray-800/50 to-black/50 border-purple-500/30 focus:border-purple-500/60 text-white placeholder-gray-500 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Minimum Rank</label>
              <Input
                value={editFormData.rank_requirement}
                onChange={(e) => setEditFormData({ ...editFormData, rank_requirement: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Gold 3+, Diamond+, Radiant, etc."
                className="bg-gradient-to-r from-gray-800/50 to-black/50 border-purple-500/30 focus:border-purple-500/60 text-white placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Training Schedule</label>
              <Textarea
                value={editFormData.practice_schedule}
                onChange={(e) => setEditFormData({ ...editFormData, practice_schedule: e.target.value })}
                disabled={!isEditing}
                placeholder="When does your team practice? (e.g., Mon-Fri 7-10 PM EST, Weekends 2-6 PM)"
                rows={3}
                className="bg-gradient-to-r from-gray-800/50 to-black/50 border-purple-500/30 focus:border-purple-500/60 text-white placeholder-gray-500 resize-none"
              />
            </div>
          </div>
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 hover:border-red-500/60 rounded-2xl p-6 md:p-8 transition-all duration-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border-2 border-red-500/40">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                DANGER ZONE
              </h3>
              <p className="text-gray-400 text-sm">
                Destructive actions that will permanently affect your team. These operations cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="font-bold text-white mb-2">DELETE SQUAD</h4>
                <p className="text-gray-400 text-sm">
                  Permanently delete this team and remove all members. This action cannot be reversed.
                </p>
              </div>
              <AccentButton
                onClick={onDeleteTeam}
                disabled={actionLoading === 'delete-team'}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50 hover:scale-105 transition-all duration-300 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                DELETE SQUAD
              </AccentButton>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}

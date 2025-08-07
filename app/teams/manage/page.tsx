'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getUserOwnedTeams, getTeamJoinRequests, acceptJoinRequest, rejectJoinRequest, 
         getTeamMembers, removeTeamMember, updateTeam, deleteTeam } from '@/lib/supabase'

// Components
import { GamingBackground } from '@/components/team-management/GamingBackground'
import { LoadingState, EmptyTeamsState } from '@/components/team-management/LoadingAndEmptyStates'
import { TeamSidebar } from '@/components/team-management/TeamSidebar'
import { OverviewTab } from '@/components/team-management/OverviewTab'
import { MembersTab } from '@/components/team-management/MembersTab'
import { RequestsTab } from '@/components/team-management/RequestsTab'
import { SettingsTab } from '@/components/team-management/SettingsTab'

interface EditFormData {
  name: string
  description: string
  rank_requirement: string
  practice_schedule: string
}

interface TeamMember {
  id: string
  username: string
  avatar_url?: string
  role: string
  joined_at: string
  competitive_level?: string
  riot_account_verified?: boolean
}

interface JoinRequest {
  id: string
  user_id: string
  team_id: string
  message: string
  created_at: string
  users: {
    username: string
    avatar_url?: string
    competitive_level?: string
    riot_account_verified?: boolean
  }
  teams: {
    id: string
    name: string
  }
}

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
  // LoL-specific fields
  playstyle?: string
  primary_goal?: string
  communication_style?: string
  preferred_roles?: string[]
  wins?: number
  losses?: number
  total_matches?: number
  win_rate?: number
}

export default function TeamManagementPage() {
  const { user } = useUser()
  
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const loadTeamDetails = useCallback(async (teamId: string) => {
    if (!user) return
    
    try {
      const [members, requests] = await Promise.all([
        getTeamMembers(teamId),
        getTeamJoinRequests(teamId, user.id)
      ])
      
      setTeamMembers(members)
      setJoinRequests(requests)
    } catch (error) {
      console.error('Error loading team details:', error)
    }
  }, [user])

  useEffect(() => {
    const loadTeamData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setErrorMessage(null)
        const ownedTeams = await getUserOwnedTeams(user.id)
        setTeams(ownedTeams)
        
        if (ownedTeams.length > 0) {
          const firstTeam = ownedTeams[0]
          setSelectedTeam(firstTeam)
          await loadTeamDetails(firstTeam.id)
        }
        
      } catch (error) {
        console.error('Error loading team data:', error)
        setErrorMessage('Failed to load team data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamData()
  }, [user, loadTeamDetails])

  const handleTeamSelect = async (team: Team) => {
    try {
      setSelectedTeam(team)
      setErrorMessage(null)
      await loadTeamDetails(team.id)
    } catch (error) {
      console.error('Error loading team details:', error)
      setErrorMessage('Failed to load team details. Please try again.')
    }
  }

  const handleJoinRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setActionLoading(requestId)
      setErrorMessage(null)
      
      if (action === 'accept') {
        await acceptJoinRequest(requestId)
        setSuccessMessage('Join request accepted successfully!')
      } else {
        await rejectJoinRequest(requestId)
        setSuccessMessage('Join request rejected successfully!')
      }
      
      if (selectedTeam) {
        await loadTeamDetails(selectedTeam.id)
      }
      
    } catch (error) {
      console.error(`Error ${action}ing join request:`, error)
      setErrorMessage(`Failed to ${action} join request. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return
    
    try {
      setActionLoading(memberId)
      setErrorMessage(null)
      await removeTeamMember(selectedTeam.id, memberId)
      await loadTeamDetails(selectedTeam.id)
      setSuccessMessage('Member removed successfully!')
    } catch (error) {
      console.error('Error removing member:', error)
      setErrorMessage('Failed to remove member. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateTeam = async (editFormData: EditFormData) => {
    if (!selectedTeam) return
    
    try {
      setActionLoading('update-team')
      setErrorMessage(null)
      await updateTeam(selectedTeam.id, editFormData)
      
      const updatedTeam = { ...selectedTeam, ...editFormData }
      setSelectedTeam(updatedTeam)
      setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t))
      setSuccessMessage('Team updated successfully!')
      
    } catch (error) {
      console.error('Error updating team:', error)
      setErrorMessage('Failed to update team. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    
    const confirmed = confirm(`Are you sure you want to delete "${selectedTeam.name}"? This action cannot be undone.`)
    if (!confirmed) return
    
    try {
      setActionLoading('delete-team')
      setErrorMessage(null)
      await deleteTeam(selectedTeam.id)
      
      const remainingTeams = teams.filter(t => t.id !== selectedTeam.id)
      setTeams(remainingTeams)
      
      if (remainingTeams.length > 0) {
        handleTeamSelect(remainingTeams[0])
      } else {
        setSelectedTeam(null)
        setTeamMembers([])
        setJoinRequests([])
      }
      
      setSuccessMessage('Team deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting team:', error)
      setErrorMessage('Failed to delete team. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (teams.length === 0) {
    return <EmptyTeamsState />
  }

  return (
    <GamingBackground>
      {/* Notification Messages */}
      {(errorMessage || successMessage) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {errorMessage && (
            <div className="bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-lg border border-red-500/50 rounded-xl p-4 mb-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-lg">⚠</span>
                </div>
                <p className="text-red-200 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="bg-gradient-to-r from-green-900/90 to-green-800/90 backdrop-blur-lg border border-green-500/50 rounded-xl p-4 mb-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-lg">✓</span>
                </div>
                <p className="text-green-200 font-medium">{successMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <TeamSidebar 
            teams={teams}
            selectedTeam={selectedTeam}
            onTeamSelect={handleTeamSelect}
          />

          {selectedTeam && (
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Custom Gaming Tabs */}
                <div className="relative mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-2xl blur-sm"></div>
                  <TabsList className="relative grid w-full grid-cols-4 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30 rounded-xl p-2">
                    <TabsTrigger 
                      value="overview"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
                    >
                      OVERVIEW
                    </TabsTrigger>
                    <TabsTrigger 
                      value="members"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
                    >
                      MEMBERS
                      <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {teamMembers.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="requests"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
                    >
                      REQUESTS
                      {joinRequests.length > 0 && (
                        <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">
                          {joinRequests.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-gray-400 font-bold transition-all duration-300"
                    >
                      SETTINGS
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview">
                  <OverviewTab
                    team={selectedTeam}
                    teamMembersCount={teamMembers.length}
                    joinRequestsCount={joinRequests.length}
                    onTabChange={setActiveTab}
                  />
                </TabsContent>

                <TabsContent value="members">
                  <MembersTab
                    teamMembers={teamMembers}
                    maxMembers={selectedTeam.max_members}
                    onRemoveMember={handleRemoveMember}
                    actionLoading={actionLoading}
                  />
                </TabsContent>

                <TabsContent value="requests">
                  <RequestsTab
                    joinRequests={joinRequests}
                    onAcceptRequest={(id) => handleJoinRequestAction(id, 'accept')}
                    onRejectRequest={(id) => handleJoinRequestAction(id, 'reject')}
                    actionLoading={actionLoading}
                  />
                </TabsContent>

                <TabsContent value="settings">
                  <SettingsTab
                    team={selectedTeam}
                    onUpdateTeam={handleUpdateTeam}
                    onDeleteTeam={handleDeleteTeam}
                    actionLoading={actionLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </GamingBackground>
  )
}

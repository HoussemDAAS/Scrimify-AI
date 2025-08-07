'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { TabsContent } from '@/components/ui/tabs'
import { getUserOwnedTeams, getTeamJoinRequests, acceptJoinRequest, rejectJoinRequest, 
         getTeamMembers, removeTeamMember, updateTeam, deleteTeam } from '@/lib/supabase'

// Components
import { GamingBackground } from '@/components/team-management/GamingBackground'
import { LoadingState, EmptyTeamsState } from '@/components/team-management/LoadingAndEmptyStates'
import { TeamSidebar } from '@/components/team-management/TeamSidebar'
import { TeamTabs } from '@/components/team-management/TeamTabs'
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
        const ownedTeams = await getUserOwnedTeams(user.id)
        setTeams(ownedTeams)
        
        if (ownedTeams.length > 0) {
          const firstTeam = ownedTeams[0]
          setSelectedTeam(firstTeam)
          await loadTeamDetails(firstTeam.id)
        }
        
      } catch (error) {
        console.error('Error loading team data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamData()
  }, [user, loadTeamDetails])

  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team)
    await loadTeamDetails(team.id)
  }

  const handleJoinRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setActionLoading(requestId)
      
      if (action === 'accept') {
        await acceptJoinRequest(requestId)
      } else {
        await rejectJoinRequest(requestId)
      }
      
      if (selectedTeam) {
        await loadTeamDetails(selectedTeam.id)
      }
      
    } catch (error) {
      console.error(`Error ${action}ing join request:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return
    
    try {
      setActionLoading(memberId)
      await removeTeamMember(selectedTeam.id, memberId)
      await loadTeamDetails(selectedTeam.id)
    } catch (error) {
      console.error('Error removing member:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateTeam = async (editFormData: EditFormData) => {
    if (!selectedTeam) return
    
    try {
      setActionLoading('update-team')
      await updateTeam(selectedTeam.id, editFormData)
      
      const updatedTeam = { ...selectedTeam, ...editFormData }
      setSelectedTeam(updatedTeam)
      setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t))
      
    } catch (error) {
      console.error('Error updating team:', error)
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
      
    } catch (error) {
      console.error('Error deleting team:', error)
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
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <TeamSidebar 
            teams={teams}
            selectedTeam={selectedTeam}
            onTeamSelect={handleTeamSelect}
          />

          {selectedTeam && (
            <div className="flex-1">
              <TeamTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                membersCount={teamMembers.length}
                requestsCount={joinRequests.length}
              />

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
            </div>
          )}
        </div>
      </div>
    </GamingBackground>
  )
}

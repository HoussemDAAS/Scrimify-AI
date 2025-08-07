'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, Bell, Shield, Target,
  UserPlus, UserMinus, Check, X, Eye, Edit3, Trash2,
  ChevronRight, Mail, Clock, MapPin
} from 'lucide-react'
import { getUserOwnedTeams, getTeamJoinRequests, acceptJoinRequest, rejectJoinRequest, 
         getTeamMembers, removeTeamMember, updateTeam, deleteTeam } from '@/lib/supabase'

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
  
  // Edit team state
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    rank_requirement: '',
    practice_schedule: ''
  })

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

        // Load owned teams
        const ownedTeams = await getUserOwnedTeams(user.id)
        setTeams(ownedTeams)
        
        if (ownedTeams.length > 0) {
          const firstTeam = ownedTeams[0]
          setSelectedTeam(firstTeam)
          setEditFormData({
            name: firstTeam.name,
            description: firstTeam.description,
            rank_requirement: firstTeam.rank_requirement || '',
            practice_schedule: firstTeam.practice_schedule || ''
          })
          
          // Load team members and join requests
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
    setEditFormData({
      name: team.name,
      description: team.description,
      rank_requirement: team.rank_requirement || '',
      practice_schedule: team.practice_schedule || ''
    })
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
      
      // Reload join requests and team members
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

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return
    
    try {
      setActionLoading('update-team')
      await updateTeam(selectedTeam.id, editFormData)
      
      // Update local state
      const updatedTeam = { ...selectedTeam, ...editFormData }
      setSelectedTeam(updatedTeam)
      setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t))
      setIsEditing(false)
      
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
      
      // Update local state
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

  const getCompetitiveLevelBadge = (level: string) => {
    switch (level) {
      case 'professional':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pro</Badge>
      case 'semi-pro':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Semi-Pro</Badge>
      case 'competitive':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Competitive</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Casual</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading your teams...</p>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">No Teams to Manage</h1>
            <p className="text-gray-400 mb-8">
              You don&apos;t own any teams yet. Create your first team to start building your competitive squad.
            </p>
            <Link href="/create-team">
              <PrimaryButton className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Your First Team
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Team Sidebar */}
          <div className="lg:w-80">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Team Management</h1>
              <p className="text-gray-400">Manage your teams, members, and join requests</p>
            </div>

            <div className="space-y-3">
              {teams.map((team) => (
                <Card 
                  key={team.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTeam?.id === team.id 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url}
                          alt={team.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-red-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{team.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{team.game.toUpperCase()}</span>
                          <span>•</span>
                          <span>{team.current_members}/{team.max_members}</span>
                        </div>
                      </div>
                      {selectedTeam?.id === team.id && (
                        <ChevronRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Link href="/create-team">
                <Card className="border-dashed border-gray-600 hover:border-red-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Create New Team</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          {selectedTeam && (
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">
                    Members
                    <Badge className="ml-2 bg-blue-500/20 text-blue-400 text-xs">
                      {teamMembers.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests
                    {joinRequests.length > 0 && (
                      <Badge className="ml-2 bg-red-500/20 text-red-400 text-xs">
                        {joinRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {selectedTeam.logo_url ? (
                            <Image
                              src={selectedTeam.logo_url}
                              alt={selectedTeam.name}
                              width={64}
                              height={64}
                              className="rounded-xl"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                              <Users className="w-8 h-8 text-red-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-2xl">{selectedTeam.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {selectedTeam.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Owner
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-gray-800/50">
                          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{selectedTeam.current_members}</div>
                          <div className="text-xs text-gray-400">Members</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gray-800/50">
                          <Bell className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold">{joinRequests.length}</div>
                          <div className="text-xs text-gray-400">Requests</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gray-800/50">
                          <Target className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">{selectedTeam.rank_requirement || 'Any'}</div>
                          <div className="text-xs text-gray-400">Min Rank</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gray-800/50">
                          <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <div className="text-lg font-bold">{selectedTeam.region}</div>
                          <div className="text-xs text-gray-400">Region</div>
                        </div>
                      </div>
                      
                      {selectedTeam.practice_schedule && (
                        <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">Practice Schedule</span>
                          </div>
                          <p className="text-sm text-gray-300">{selectedTeam.practice_schedule}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href={`/teams/${selectedTeam.id}`}>
                      <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <h3 className="font-medium mb-1">View Public Profile</h3>
                          <p className="text-xs text-gray-400">See how others view your team</p>
                        </CardContent>
                      </Card>
                    </Link>
                    
                    <Card 
                      className="hover:border-green-500/50 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('members')}
                    >
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Manage Members</h3>
                        <p className="text-xs text-gray-400">Add, remove, and assign roles</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="hover:border-orange-500/50 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('requests')}
                    >
                      <CardContent className="p-4 text-center">
                        <Bell className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Review Requests</h3>
                        <p className="text-xs text-gray-400">Accept or decline join requests</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Team Members</h2>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {teamMembers.length}/{selectedTeam.max_members} Members
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                {member.avatar_url ? (
                                  <Image
                                    src={member.avatar_url}
                                    alt={member.username}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{member.username}</h3>
                                  {member.riot_account_verified && (
                                    <Shield className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.competitive_level && getCompetitiveLevelBadge(member.competitive_level)}
                                  <Badge variant="outline" className="text-xs">
                                    {member.role === 'owner' ? 'Owner' : member.role === 'captain' ? 'Captain' : 'Member'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {member.role !== 'owner' && (
                              <div className="flex items-center gap-2">
                                <AccentButton
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={actionLoading === member.id}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </AccentButton>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Join Requests</h2>
                    {joinRequests.length > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-400">
                        {joinRequests.length} Pending
                      </Badge>
                    )}
                  </div>

                  {joinRequests.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                        <p className="text-gray-400">
                          When players apply to join your team, they&apos;ll appear here for review.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {joinRequests.map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                  {request.users.avatar_url ? (
                                    <Image
                                      src={request.users.avatar_url}
                                      alt={request.users.username}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Users className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{request.users.username}</h3>
                                    {request.users.riot_account_verified && (
                                      <Shield className="w-4 h-4 text-green-400" />
                                    )}
                                    {request.users.competitive_level && 
                                      getCompetitiveLevelBadge(request.users.competitive_level)
                                    }
                                  </div>
                                  <p className="text-sm text-gray-400 mb-2">
                                    Applied {new Date(request.created_at).toLocaleDateString()}
                                  </p>
                                  {request.message && (
                                    <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Mail className="w-3 h-3 text-blue-400" />
                                        <span className="text-blue-400 text-xs font-medium">Message</span>
                                      </div>
                                      <p className="text-gray-300">{request.message}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <SecondaryButton
                                  size="sm"
                                  onClick={() => handleJoinRequestAction(request.id, 'reject')}
                                  disabled={actionLoading === request.id}
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </SecondaryButton>
                                <PrimaryButton
                                  size="sm"
                                  onClick={() => handleJoinRequestAction(request.id, 'accept')}
                                  disabled={actionLoading === request.id}
                                >
                                  <Check className="w-4 h-4" />
                                  Accept
                                </PrimaryButton>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Team Settings</CardTitle>
                          <CardDescription>
                            Manage your team&apos;s information and preferences
                          </CardDescription>
                        </div>
                        {!isEditing ? (
                          <SecondaryButton onClick={() => setIsEditing(true)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Team
                          </SecondaryButton>
                        ) : (
                          <div className="flex items-center gap-2">
                            <SecondaryButton onClick={() => setIsEditing(false)}>
                              Cancel
                            </SecondaryButton>
                            <PrimaryButton 
                              onClick={handleUpdateTeam}
                              disabled={actionLoading === 'update-team'}
                            >
                              Save Changes
                            </PrimaryButton>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Team Name</label>
                        <Input
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter team name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Describe your team and what you're looking for..."
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Rank Requirement</label>
                        <Input
                          value={editFormData.rank_requirement}
                          onChange={(e) => setEditFormData({ ...editFormData, rank_requirement: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Gold 3+, Diamond+, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Practice Schedule</label>
                        <Textarea
                          value={editFormData.practice_schedule}
                          onChange={(e) => setEditFormData({ ...editFormData, practice_schedule: e.target.value })}
                          disabled={!isEditing}
                          placeholder="When does your team practice? (e.g., Mon-Fri 7-10 PM EST)"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-400 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                      </CardTitle>
                      <CardDescription>
                        Irreversible actions that will permanently affect your team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccentButton
                        onClick={handleDeleteTeam}
                        disabled={actionLoading === 'delete-team'}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </AccentButton>
                      <p className="text-xs text-gray-500 mt-2">
                        This will permanently delete the team and remove all members. This action cannot be undone.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

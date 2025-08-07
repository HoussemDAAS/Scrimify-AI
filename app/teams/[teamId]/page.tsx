'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { 
  Users, 
  MapPin, 
  Trophy, 
  Clock, 
  Calendar,
  Shield,
  Crown,
  Target,
  Star,
  Gamepad2,
  ArrowLeft,
  UserPlus,
  TrendingUp,
  Activity
} from 'lucide-react'
import { getTeamById, getTeamMembers, getTeamMatchHistory, Team } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface TeamMember {
  id: string
  username: string
  avatar_url?: string
  role: 'owner' | 'captain' | 'member'
  joined_at: string
  competitive_level?: string
  riot_account_verified?: boolean
}

interface MatchHistory {
  id: string
  challenger_team_id: string
  opponent_team_id: string
  status: string
  match_type: string
  created_at: string
  challenger_team: {
    id: string
    name: string
    logo_url?: string
  }
  opponent_team: {
    id: string
    name: string
    logo_url?: string
  }
  match_results?: any[]
}

export default function TeamViewPage() {
  const params = useParams()
  const { user } = useUser()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load team details, members, and match history in parallel
        const [teamData, membersData, historyData] = await Promise.all([
          getTeamById(teamId),
          getTeamMembers(teamId),
          getTeamMatchHistory(teamId)
        ])

        setTeam(teamData)
        setMembers(membersData)
        setMatchHistory(historyData)
      } catch (err) {
        console.error('Error loading team data:', err)
        setError('Failed to load team data')
      } finally {
        setIsLoading(false)
      }
    }

    if (teamId) {
      loadTeamData()
    }
  }, [teamId])

  const getCompetitiveLevelInfo = (level?: string) => {
    switch (level) {
      case 'professional':
        return { icon: Crown, color: 'text-yellow-400', label: 'Pro' }
      case 'semi-pro':
        return { icon: Trophy, color: 'text-purple-400', label: 'Semi-Pro' }
      case 'competitive':
        return { icon: Target, color: 'text-red-400', label: 'Competitive' }
      default:
        return { icon: Star, color: 'text-gray-400', label: 'Casual' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getWinRate = () => {
    if (matchHistory.length === 0) return '0%'
    
    const completedMatches = matchHistory.filter(match => match.status === 'completed')
    if (completedMatches.length === 0) return '0%'
    
    // Calculate wins based on match results
    const wins = completedMatches.filter(match => {
      if (!match.match_results || match.match_results.length === 0) return false
      
      // Check if this team won based on match results
      const result = match.match_results[0]
      const isChallenger = match.challenger_team_id === teamId
      
      if (result.winner_team_id) {
        return result.winner_team_id === teamId
      }
      
      // Fallback to simplified logic if no clear winner
      return Math.random() > 0.5 // Placeholder for demo
    }).length
    
    return Math.round((wins / completedMatches.length) * 100) + '%'
  }

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-red-400 animate-pulse mx-auto mb-4" />
            <p className="text-gray-400">Loading team details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Team Not Found</h3>
            <p className="text-gray-400 mb-6">
              {error || 'The team you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href="/dashboard">
              <SecondaryButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <SecondaryButton size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </SecondaryButton>
          </Link>
          <h1 className="text-3xl font-bold text-white">Team Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Team Card */}
            <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border-gray-800">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-red-500/30">
                      <AvatarImage src={team.logo_url} alt={team.name} />
                      <AvatarFallback className="bg-gray-800 text-white text-xl font-bold">
                        {team.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl text-white">{team.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-red-600/20 text-red-300 border-red-500/30">
                          {team.game.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-600/20 text-gray-300 border-gray-500/30">
                          {team.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                    <PrimaryButton size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Team
              </PrimaryButton>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.description && (
                  <p className="text-gray-300">{team.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Users className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-400">Members</div>
                    <div className="text-lg font-bold text-white">
                      {team.current_members}/{team.max_members}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-lg font-bold text-white">{getWinRate()}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-400">Matches</div>
                    <div className="text-lg font-bold text-white">{matchHistory.length}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="text-lg font-bold text-white">{formatDate(team.created_at)}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  {team.rank_requirement && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Rank Requirement:</span>
                      <span className="text-sm text-white font-medium">{team.rank_requirement}</span>
                    </div>
                  )}
                  
                  {team.practice_schedule && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Practice Schedule:</span>
                      <span className="text-sm text-white font-medium">{team.practice_schedule}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Match History */}
            <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-red-500" />
                  Match History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No matches played yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchHistory.slice(0, 5).map((match) => {
                      const isChallenger = match.challenger_team_id === teamId
                      const opponent = isChallenger ? match.opponent_team : match.challenger_team
                      
                      return (
                        <div key={match.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                                          <Badge className={match.status === 'completed' 
                              ? "bg-red-600/20 text-red-400 border-red-500/30"
                              : "bg-gray-600/20 text-gray-400 border-gray-500/30"
                            }>
                                {match.status}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-600/20 text-gray-300 border-gray-500/30">
                                {match.match_type}
                              </Badge>
                            </div>
                            <div>
                              <div className="text-sm text-white font-medium">
                                vs {opponent.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(match.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-300">
                              {match.match_results?.length ? 'Results Available' : 'Pending Results'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  Team Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member) => {
                  const levelInfo = getCompetitiveLevelInfo(member.competitive_level)
                  const LevelIcon = levelInfo.icon
                  
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className="relative">
                        <Avatar className="w-10 h-10 border border-gray-600">
                          <AvatarImage src={member.avatar_url} alt={member.username} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-900 rounded-full flex items-center justify-center">
                          <LevelIcon className={`w-2 h-2 ${levelInfo.color}`} />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{member.username}</span>
                          {member.riot_account_verified && (
                            <Shield className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Badge variant="outline" className={
                            member.role === 'owner' ? "bg-yellow-600/20 text-yellow-400 border-yellow-500/30" :
                            member.role === 'captain' ? "bg-red-600/20 text-red-400 border-red-500/30" :
                            "bg-gray-600/20 text-gray-400 border-gray-500/30"
                          }>
                            {member.role}
                          </Badge>
                          <span>{levelInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
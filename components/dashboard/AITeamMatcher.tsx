'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { AccentButton } from '@/components/ui/accent-button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Zap, Target, Users, MapPin, Trophy, ArrowRight, Brain } from 'lucide-react'
import { getUserTeamsForGame } from '@/lib/supabase'

interface AITeamRecommendation {
  team: {
    id: string
    name: string
    game: string
    description?: string
    region: string
    current_members: number
    max_members: number
    rank_requirement?: string
    logo_url?: string
    // LoL-specific fields
    playstyle?: string
    primary_goal?: string
    communication_style?: string
    preferred_roles?: string[]
    wins?: number
    losses?: number
    win_rate?: number
  }
  score: number
  reason: string
  challengeType: 'scrim' | 'practice' | 'challenge' | 'coaching'
  skillGap: 'easier' | 'equal' | 'harder'
  compatibilityFactors: {
    skillMatch: number
    regionMatch: number
    activityMatch: number
    playstyleMatch: number
  }
}

interface AITeamMatcherProps {
  currentGame: string
}

export function AITeamMatcher({ currentGame }: AITeamMatcherProps) {
  const { user } = useUser()
  const [recommendations, setRecommendations] = useState<AITeamRecommendation[]>([])
  const [userTeams, setUserTeams] = useState<{teams: {id: string; name: string}}[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user teams
  const loadUserTeams = useCallback(async () => {
    if (!user) return
    
    try {
      const teams = await getUserTeamsForGame(user.id, currentGame)
      setUserTeams(teams)
      // Auto-select first team
      if (teams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teams[0].teams.id)
      }
    } catch (err) {
      console.error('Error loading user teams:', err)
    }
  }, [user, currentGame, selectedTeamId])

  const fetchRecommendations = useCallback(async () => {
    // Always try to fetch recommendations - the API will handle users with no teams
    // (showing teams they can join instead of teams to play against)

    try {
      setLoading(true)
      setError(null)

      const url = selectedTeamId 
        ? `/api/ai/team-recommendations?game=${currentGame}&selectedTeamId=${selectedTeamId}&limit=5`
        : `/api/ai/team-recommendations?game=${currentGame}&limit=5`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      console.log('AI Recommendations received:', data.recommendations?.length)
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Error fetching AI recommendations:', err)
      setError('Failed to load team recommendations')
    } finally {
      setLoading(false)
    }
  }, [currentGame, selectedTeamId, userTeams.length])

  // Comprehensive debug function
  const debugAIEndpoint = async () => {
    console.log('🔍 COMPREHENSIVE AI DEBUG ANALYSIS')
    console.log('='.repeat(50))
    
    try {
      // Step 1: Check debug endpoint for complete analysis
      console.log('\n1️⃣ Running comprehensive debug analysis...')
      const debugResponse = await fetch('/api/debug-ai')
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json()
        console.log('📊 COMPLETE DEBUG REPORT:')
        console.log(JSON.stringify(debugData, null, 2))
        
        // Analyze the results
        const info = debugData.debug_info
        
        console.log('\n🔍 ANALYSIS SUMMARY:')
        console.log(`• User authenticated: ${info.authentication?.authenticated ? '✅' : '❌'}`)
        console.log(`• User found in DB: ${info.user_lookup?.found ? '✅' : '❌'}`)
        console.log(`• Total teams in DB: ${info.all_teams?.total_count || 0}`)
        console.log(`• LoL teams available: ${info.lol_teams?.count || 0}`)
        console.log(`• User has LoL teams: ${info.user_teams?.count || 0}`)
        console.log(`• Teams after filtering: ${info.filtering?.after_filtering || 0}`)
        console.log(`• OpenAI configured: ${info.openai?.api_key_configured ? '✅' : '❌'}`)
        console.log(`• Database connection: ${info.database?.connection_ok ? '✅' : '❌'}`)
        
        // Identify the specific issue
        console.log('\n🎯 ISSUE IDENTIFICATION:')
        if (!info.authentication?.authenticated) {
          console.log('❌ ISSUE: User not authenticated')
        } else if (!info.user_lookup?.found) {
          console.log('❌ ISSUE: User not found in database')
        } else if ((info.lol_teams?.count || 0) === 0) {
          console.log('❌ ISSUE: No League of Legends teams in database')
        } else if ((info.filtering?.after_filtering || 0) === 0) {
          console.log('❌ ISSUE: All teams filtered out (user owns all teams)')
        } else if (!info.openai?.api_key_configured) {
          console.log('⚠️ ISSUE: OpenAI API key not configured (will use fallback)')
        } else {
          console.log('✅ All checks passed - should work! Testing AI endpoint...')
          
          // Step 2: Test AI endpoint with current settings
          console.log('\n2️⃣ Testing AI endpoint...')
          const aiUrl = `/api/ai/team-recommendations?game=${currentGame}&limit=5`
          const aiResponse = await fetch(aiUrl)
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            console.log('🤖 AI ENDPOINT RESPONSE:', aiData)
            
            if (aiData.recommendations?.length > 0) {
              console.log('🎉 SUCCESS: Found recommendations!')
              aiData.recommendations.forEach((rec: any, i: number) => {
                console.log(`  ${i+1}. ${rec.team.name} (${rec.score}% match)`)
              })
            } else {
              console.log('❌ AI endpoint returned 0 recommendations')
            }
          } else {
            console.log('❌ AI endpoint failed:', await aiResponse.text())
          }
        }
        
      } else {
        console.log('❌ Debug endpoint failed:', await debugResponse.text())
      }
      
    } catch (error) {
      console.error('❌ Debug analysis failed:', error)
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('🔧 Debug analysis complete. Check logs above for issues.')
  }

  useEffect(() => {
    if (user && currentGame) {
      loadUserTeams()
    }
  }, [user, currentGame, loadUserTeams])

  useEffect(() => {
    if (user && currentGame) {
      fetchRecommendations()
    }
  }, [user, currentGame, selectedTeamId, userTeams.length, fetchRecommendations])

  // Render no teams state
  if (userTeams.length === 0 && !loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-white">No Teams Found</CardTitle>
          <CardDescription className="text-gray-400">
            You need to be part of a team to get AI recommendations. Create or join a team to unlock intelligent team matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-3">
            <PrimaryButton 
              onClick={() => window.location.href = '/create-team'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Create a Team
            </PrimaryButton>
            <SecondaryButton 
              onClick={() => window.location.href = '/join-team'}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Target className="mr-2 h-4 w-4" />
              Join a Team
            </SecondaryButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleTeamClick = async (recommendation: AITeamRecommendation) => {
    try {
      // Track the interaction
      await fetch('/api/ai/team-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: recommendation.team.id,
          score: recommendation.score,
          reason: recommendation.reason,
          type: recommendation.challengeType,
          action: 'clicked'
        })
      })

      // Navigate to team page (you can implement this based on your routing)
      window.open(`/teams/${recommendation.team.id}`, '_blank')
    } catch (err) {
      console.error('Error tracking team click:', err)
    }
  }

  const handleChallengeTeam = async (recommendation: AITeamRecommendation) => {
    try {
      // Track the challenge action
      await fetch('/api/ai/team-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: recommendation.team.id,
          score: recommendation.score,
          reason: recommendation.reason,
          type: recommendation.challengeType,
          action: 'challenged'
        })
      })

      // You can implement challenge logic here
      alert(`Challenge sent to ${recommendation.team.name}!`)
    } catch (err) {
      console.error('Error sending challenge:', err)
    }
  }

  const getSkillGapColor = (skillGap: string) => {
    switch (skillGap) {
      case 'easier': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'equal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'harder': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'scrim': return <Target className="w-4 h-4" />
      case 'practice': return <Users className="w-4 h-4" />
      case 'challenge': return <Trophy className="w-4 h-4" />
      case 'coaching': return <Zap className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Opponent Finder</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Finding perfect team matches for you...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Opponent Finder</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <SecondaryButton 
              onClick={fetchRecommendations}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Try Again
            </SecondaryButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0 && userTeams.length > 0 && !loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Opponent Finder</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            {!selectedTeamId 
              ? "Select a team above to find opponents" 
              : "No opponent matches available right now"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {!selectedTeamId 
                ? "Choose one of your teams to analyze and find perfect opponents!" 
                : "No suitable opponents found. Our AI is analyzing teams - try again in a moment!"
              }
            </p>
            {!selectedTeamId && userTeams.length > 1 && (
              <p className="text-sm text-gray-500">
                You have {userTeams.length} teams. Select one above to begin analysis.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white">AI Team Recommendations</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Perfect matches found for your team
        </CardDescription>
        
        {/* Debug Button - Remove this after testing */}
        <div className="mt-2">
          <button 
            onClick={debugAIEndpoint}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
          >
            🐛 Debug AI Endpoint
          </button>
        </div>
        
        {/* Team Selector */}
        {userTeams.length > 1 && (
          <div className="mt-4">
            <label className="text-sm text-gray-300 mb-2 block font-medium">
              Choose team to analyze:
            </label>
            <Select value={selectedTeamId || ''} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white hover:border-purple-500/50 transition-colors">
                <SelectValue placeholder="Select a team to analyze" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {userTeams.map((userTeam) => (
                  <SelectItem 
                    key={userTeam.teams.id} 
                    value={userTeam.teams.id}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {userTeam.teams.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              AI will analyze this team to find compatible opponents
            </p>
          </div>
        )}
        
        {/* Single team info */}
        {userTeams.length === 1 && (
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              Analyzing team: <span className="text-white font-medium">{userTeams[0].teams.name}</span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.team.id}
              className="group bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
              onClick={() => handleTeamClick(recommendation)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-gray-600">
                    <AvatarImage src={recommendation.team.logo_url} alt={recommendation.team.name} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {recommendation.team.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                      {recommendation.team.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {recommendation.team.region}
                      <Users className="w-3 h-3 ml-2" />
                      {recommendation.team.current_members}/{recommendation.team.max_members}
                      {recommendation.team.win_rate !== undefined && (
                        <>
                          <Trophy className="w-3 h-3 ml-2" />
                          {recommendation.team.win_rate}% WR
                        </>
                      )}
                    </div>
                    {/* LoL-specific badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recommendation.team.playstyle && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {recommendation.team.playstyle}
                        </Badge>
                      )}
                      {recommendation.team.primary_goal && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          {recommendation.team.primary_goal}
                        </Badge>
                      )}
                      {recommendation.team.communication_style && (
                        <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                          {recommendation.team.communication_style}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant="outline" 
                    className={getSkillGapColor(recommendation.skillGap)}
                  >
                    {recommendation.skillGap}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                  >
                    {recommendation.score}% match
                  </Badge>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3">
                {recommendation.reason}
              </p>

              {/* Compatibility Factors - AI Analysis Breakdown */}
              <div className="mb-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <h4 className="text-xs font-semibold text-purple-300 mb-2">🧠 AI COMPATIBILITY ANALYSIS</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skill Match:</span>
                    <span className={`font-medium ${recommendation.compatibilityFactors.skillMatch >= 80 ? 'text-green-400' : recommendation.compatibilityFactors.skillMatch >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {recommendation.compatibilityFactors.skillMatch}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region Match:</span>
                    <span className={`font-medium ${recommendation.compatibilityFactors.regionMatch >= 80 ? 'text-green-400' : recommendation.compatibilityFactors.regionMatch >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {recommendation.compatibilityFactors.regionMatch}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Activity Match:</span>
                    <span className={`font-medium ${recommendation.compatibilityFactors.activityMatch >= 80 ? 'text-green-400' : recommendation.compatibilityFactors.activityMatch >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {recommendation.compatibilityFactors.activityMatch}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Playstyle Match:</span>
                    <span className={`font-medium ${recommendation.compatibilityFactors.playstyleMatch >= 80 ? 'text-green-400' : recommendation.compatibilityFactors.playstyleMatch >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {recommendation.compatibilityFactors.playstyleMatch}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    {getChallengeTypeIcon(recommendation.challengeType)}
                    <span className="capitalize">{recommendation.challengeType}</span>
                  </div>
                  {recommendation.team.rank_requirement && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {recommendation.team.rank_requirement}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <SecondaryButton
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChallengeTeam(recommendation)
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Challenge
                  </SecondaryButton>
                  <AccentButton
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTeamClick(recommendation)
                    }}
                  >
                    View Team
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </AccentButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <SecondaryButton
            className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            onClick={fetchRecommendations}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh Recommendations
          </SecondaryButton>
        </div>
      </CardContent>
    </Card>
  )
}

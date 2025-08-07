'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sparkles, Zap, Target, Users, MapPin, Trophy, ArrowRight } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/ai/team-recommendations?game=${currentGame}&limit=3`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Error fetching AI recommendations:', err)
      setError('Failed to load team recommendations')
    } finally {
      setLoading(false)
    }
  }, [currentGame])

  useEffect(() => {
    if (user && currentGame) {
      fetchRecommendations()
    }
  }, [user, currentGame, fetchRecommendations])

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
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Team Recommendations</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Finding perfect team matches for you...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
            <CardTitle className="text-white">AI Team Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={fetchRecommendations}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Team Recommendations</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            No team recommendations available right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Join a team first to get AI-powered recommendations!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white">AI Team Recommendations</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Perfect matches found for your team
        </CardDescription>
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
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                      {recommendation.team.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {recommendation.team.region}
                      <Users className="w-3 h-3 ml-2" />
                      {recommendation.team.current_members}/{recommendation.team.max_members}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChallengeTeam(recommendation)
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Challenge
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTeamClick(recommendation)
                    }}
                  >
                    View Team
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            onClick={fetchRecommendations}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

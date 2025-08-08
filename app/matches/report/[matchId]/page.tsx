'use client'

import React, { useState, useEffect } from 'react'
import DashboardBackground from '@/components/dashboard/DashboardBackground'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Trophy, 
  Users, 
  Clock,
  Star,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function MatchReportPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string

  const [match, setMatch] = useState<any>(null)
  const [existingResult, setExistingResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [winnerTeam, setWinnerTeam] = useState('')
  const [challengerScore, setChallengerScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [matchDuration, setMatchDuration] = useState('')
  const [bestPlayer, setBestPlayer] = useState('')
  const [bestPlayerTeam, setBestPlayerTeam] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (user && matchId) {
      loadMatchData()
    }
  }, [user, matchId])

  const loadMatchData = async () => {
    try {
      setIsLoading(true)
      
      // Load match request
      const matchResponse = await fetch(`/api/match-requests?type=all`)
      const matchData = await matchResponse.json()
      
      if (matchData.success) {
        const foundMatch = matchData.matchRequests.find((m: any) => m.id === matchId)
        if (foundMatch && foundMatch.status === 'completed') {
          setMatch(foundMatch)
          
          // Check if results already exist
          const resultResponse = await fetch(`/api/match-results?matchRequestId=${matchId}`)
          const resultData = await resultResponse.json()
          
          if (resultData.success) {
            setExistingResult(resultData.matchResult)
            // Pre-fill form if user is verifying
            if (!resultData.matchResult.is_verified) {
              setWinnerTeam(resultData.matchResult.winner_team_id)
              setChallengerScore(resultData.matchResult.challenger_score?.toString() || '')
              setOpponentScore(resultData.matchResult.opponent_score?.toString() || '')
              setMatchDuration(resultData.matchResult.match_duration?.toString() || '')
              setBestPlayer(resultData.matchResult.best_player_name || '')
              setBestPlayerTeam(resultData.matchResult.best_player_team_id || '')
            }
          }
        } else {
          alert('Match not found or not completed')
          router.push('/matches')
        }
      }
    } catch (error) {
      console.error('Error loading match data:', error)
      alert('Failed to load match data')
      router.push('/matches')
    } finally {
      setIsLoading(false)
    }
  }

  const submitResults = async () => {
    if (!winnerTeam) {
      alert('Please select the winning team')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/match-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchRequestId: matchId,
          winnerTeamId: winnerTeam,
          challengerScore: parseInt(challengerScore) || 0,
          opponentScore: parseInt(opponentScore) || 0,
          matchDuration: parseInt(matchDuration) || null,
          bestPlayerName: bestPlayer || null,
          bestPlayerTeamId: bestPlayerTeam || null,
          feedback: feedback || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Match results submitted! The other team will be notified for verification.')
        router.push('/matches')
      } else {
        alert('Failed to submit results: ' + data.error)
      }
    } catch (error) {
      console.error('Error submitting results:', error)
      alert('Failed to submit results')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyResults = async (verified: boolean) => {
    if (!existingResult) return

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/match-results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchResultId: existingResult.id,
          verified,
          feedback: feedback || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(verified ? 'Results verified and team stats updated!' : 'Results disputed.')
        router.push('/matches')
      } else {
        alert('Failed to verify results: ' + data.error)
      }
    } catch (error) {
      console.error('Error verifying results:', error)
      alert('Failed to verify results')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div className="p-8 text-center text-gray-400">Please sign in</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <DashboardBackground />
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Loading match data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <DashboardBackground />
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-32">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-12 text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Match Not Found</h3>
                <p className="text-gray-400 mb-6">The match you're looking for doesn't exist or isn't completed.</p>
                <SecondaryButton onClick={() => router.push('/matches')}>
                  Back to Matches
                </SecondaryButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const isReporter = existingResult && existingResult.reporter_user_id === user.id
  const canReport = !existingResult
  const canVerify = existingResult && !existingResult.is_verified && !isReporter
  const isVerified = existingResult && existingResult.is_verified

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DashboardBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-0 py-20 md:py-32">
        {/* Back Button */}
        <div className="mb-6">
          <SecondaryButton onClick={() => router.push('/matches')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Matches
          </SecondaryButton>
        </div>

        {/* Match Header */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {match.challenger_team.name} vs {match.opponent_team.name}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                {match.match_type}
              </Badge>
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                completed
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Results Form */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {canReport && 'Report Match Results'}
              {canVerify && 'Verify Match Results'}
              {isVerified && 'Match Results (Verified)'}
              {isReporter && !isVerified && 'Match Results (Awaiting Verification)'}
            </CardTitle>
            <p className="text-gray-400 text-sm">
              {canReport && 'Submit the match results. The other team will verify them.'}
              {canVerify && 'Review and verify the reported results.'}
              {isVerified && 'These results have been verified and team stats updated.'}
              {isReporter && !isVerified && 'Waiting for the other team to verify your report.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Winner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Winning Team *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!canReport}
                  onClick={() => setWinnerTeam(match.challenger_team_id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    winnerTeam === match.challenger_team_id
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  } ${!canReport ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Trophy className="w-4 h-4 mx-auto mb-1" />
                  {match.challenger_team.name}
                </button>
                <button
                  type="button"
                  disabled={!canReport}
                  onClick={() => setWinnerTeam(match.opponent_team_id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    winnerTeam === match.opponent_team_id
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  } ${!canReport ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Trophy className="w-4 h-4 mx-auto mb-1" />
                  {match.opponent_team.name}
                </button>
              </div>
            </div>

            {/* Score */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {match.challenger_team.name} Score
                </label>
                <Input
                  type="number"
                  value={challengerScore}
                  onChange={(e) => setChallengerScore(e.target.value)}
                  disabled={!canReport}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {match.opponent_team.name} Score
                </label>
                <Input
                  type="number"
                  value={opponentScore}
                  onChange={(e) => setOpponentScore(e.target.value)}
                  disabled={!canReport}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={matchDuration}
                  onChange={(e) => setMatchDuration(e.target.value)}
                  disabled={!canReport}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Best Player Team
                </label>
                <select
                  value={bestPlayerTeam}
                  onChange={(e) => setBestPlayerTeam(e.target.value)}
                  disabled={!canReport}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="">Select team</option>
                  <option value={match.challenger_team_id}>{match.challenger_team.name}</option>
                  <option value={match.opponent_team_id}>{match.opponent_team.name}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Best Player Name
              </label>
              <Input
                value={bestPlayer}
                onChange={(e) => setBestPlayer(e.target.value)}
                disabled={!canReport}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Player name"
              />
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {canReport && 'Feedback about the match'}
                {canVerify && 'Your feedback (optional)'}
                {(isReporter || isVerified) && 'Feedback'}
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isVerified}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Share your thoughts about the match, opponent team, etc."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {canReport && (
                <PrimaryButton
                  onClick={submitResults}
                  disabled={!winnerTeam || isSubmitting}
                  className="flex-1"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Results'}
                </PrimaryButton>
              )}

              {canVerify && (
                <>
                  <PrimaryButton
                    onClick={() => verifyResults(true)}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Verifying...' : 'Verify Results'}
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => verifyResults(false)}
                    disabled={isSubmitting}
                    className="px-6"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Dispute
                  </SecondaryButton>
                </>
              )}

              {(isReporter && !isVerified) && (
                <div className="flex-1 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Awaiting verification from {match.opponent_team.name}</span>
                  </div>
                </div>
              )}

              {isVerified && (
                <div className="flex-1 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Results verified and team stats updated!</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

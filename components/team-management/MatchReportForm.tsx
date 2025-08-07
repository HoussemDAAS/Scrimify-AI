'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Star, MessageSquare, Users, Target, Plus } from 'lucide-react'

interface MatchReportFormProps {
  teamId: string
  availableTeams?: { id: string; name: string }[]
  onReportSubmitted?: () => void
  onClose?: () => void
}

export function MatchReportForm({ teamId, availableTeams = [], onReportSubmitted, onClose }: MatchReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    opponentTeamId: '',
    result: '',
    bestPlayer: '',
    feedback: '',
    playstyleObserved: '',
    opponentRating: 3,
    teamworkRating: 3,
    skillRating: 3,
    sportsmanshipRating: 3
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.opponentTeamId || !formData.result) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Reset form
        setFormData({
          opponentTeamId: '',
          result: '',
          bestPlayer: '',
          feedback: '',
          playstyleObserved: '',
          opponentRating: 3,
          teamworkRating: 3,
          skillRating: 3,
          sportsmanshipRating: 3
        })
        setShowForm(false)
        onReportSubmitted?.()
        onClose?.()
        alert('Match reported successfully! The opponent team will be notified to verify.')
      } else {
        alert('Failed to report match. Please try again.')
      }
    } catch (error) {
      console.error('Error reporting match:', error)
      alert('Failed to report match. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-300 font-medium">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 hover:scale-110 transition-transform ${
              star <= value ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  )

  if (!showForm) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle className="text-white">Report Match Result</CardTitle>
          <CardDescription className="text-gray-400">
            Played a scrim? Report the results to improve AI matching
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <PrimaryButton 
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Report New Match
          </PrimaryButton>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Report Match Result
        </CardTitle>
        <CardDescription className="text-gray-400">
          Help improve AI recommendations by reporting your match results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opponent Team */}
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">Opponent Team</label>
            <Select value={formData.opponentTeamId} onValueChange={(value) => setFormData(prev => ({ ...prev, opponentTeamId: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select opponent team" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {availableTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id} className="text-white hover:bg-gray-700">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Match Result */}
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">Match Result</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, result: 'win' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.result === 'win'
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Trophy className="w-6 h-6 mx-auto mb-1" />
                Victory
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, result: 'loss' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.result === 'loss'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Target className="w-6 h-6 mx-auto mb-1" />
                Defeat
              </button>
            </div>
          </div>

          {/* Best Player */}
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">Best Player (Optional)</label>
            <Input
              placeholder="Who was the MVP of the match?"
              value={formData.bestPlayer}
              onChange={(e) => setFormData(prev => ({ ...prev, bestPlayer: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Opponent Playstyle */}
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">Opponent's Playstyle</label>
            <Select value={formData.playstyleObserved} onValueChange={(value) => setFormData(prev => ({ ...prev, playstyleObserved: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="How did they play?" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="aggressive" className="text-white">Aggressive - Fast-paced, early fights</SelectItem>
                <SelectItem value="defensive" className="text-white">Defensive - Safe plays, late game focus</SelectItem>
                <SelectItem value="balanced" className="text-white">Balanced - Adaptable strategy</SelectItem>
                <SelectItem value="objective-focused" className="text-white">Objective Focused - Dragons/Baron priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 gap-4">
            <StarRating
              value={formData.teamworkRating}
              onChange={(val) => setFormData(prev => ({ ...prev, teamworkRating: val }))}
              label="Teamwork"
            />
            <StarRating
              value={formData.skillRating}
              onChange={(val) => setFormData(prev => ({ ...prev, skillRating: val }))}
              label="Skill Level"
            />
            <StarRating
              value={formData.sportsmanshipRating}
              onChange={(val) => setFormData(prev => ({ ...prev, sportsmanshipRating: val }))}
              label="Sportsmanship"
            />
            <StarRating
              value={formData.opponentRating}
              onChange={(val) => setFormData(prev => ({ ...prev, opponentRating: val }))}
              label="Overall Rating"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">Feedback (Optional)</label>
            <Textarea
              placeholder="Any additional notes about the match or opponent team..."
              value={formData.feedback}
              onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <PrimaryButton
              type="submit"
              disabled={!formData.opponentTeamId || !formData.result || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Reporting...' : 'Submit Report'}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                setShowForm(false)
                onClose?.()
              }}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

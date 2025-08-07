'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { ArrowLeft, Users } from 'lucide-react'

export default function TeamProfilePage() {
  const params = useParams()
  const teamId = params.teamId as string

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Team Profile</h1>
          <p className="text-gray-400 mb-8">
            Team profile page is under construction. This will show the public team profile for team ID: {teamId}
          </p>
          <div className="space-y-4">
            <Link href="/dashboard">
              <SecondaryButton className="w-full">
                Back to Dashboard
              </SecondaryButton>
            </Link>
            <Link href="/teams/manage">
              <PrimaryButton className="w-full">
                Manage Teams
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

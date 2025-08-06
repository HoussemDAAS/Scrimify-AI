/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Plus, X, Zap } from 'lucide-react'

interface MemberInvitationsProps {
  inviteEmails: string[]
  currentGameConfig: any
  onAddInvite: () => void
  onRemoveInvite: (index: number) => void
  onUpdateInvite: (index: number, email: string) => void
}

export default function MemberInvitations({ 
  inviteEmails, 
  currentGameConfig, 
  onAddInvite, 
  onRemoveInvite, 
  onUpdateInvite 
}: MemberInvitationsProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg border-2 border-red-500/30">
      <CardHeader className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-white text-xl md:text-2xl font-black">
            RECRUIT MEMBERS
          </CardTitle>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-sm">
              Invite up to {currentGameConfig.maxMembers - 1} members
            </p>
            <Badge className="bg-red-600 text-white text-xs">
              {inviteEmails.filter(email => email.trim()).length}/{currentGameConfig.maxMembers - 1}
            </Badge>
          </div>

          {inviteEmails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder={`Member ${index + 1} email or username...`}
                  value={email}
                  onChange={(e) => onUpdateInvite(index, e.target.value)}
                  className="bg-gray-800 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>
              {inviteEmails.length > 1 && (
                <button
                  onClick={() => onRemoveInvite(index)}
                  className="w-10 h-10 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500 rounded-lg flex items-center justify-center text-white transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {inviteEmails.length < currentGameConfig.maxMembers - 1 && (
            <button
              onClick={onAddInvite}
              className="w-full py-3 bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-red-500/30 hover:border-red-500/60 rounded-lg flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Another Member
            </button>
          )}

          {/* Role Suggestions */}
          <div className="mt-6">
            <Label className="text-white font-bold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              Suggested Roles
            </Label>
            <div className="flex flex-wrap gap-2">
              {currentGameConfig.roles.map((role: string) => (
                <Badge
                  key={role}
                  className="bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white cursor-pointer transition-colors text-xs"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
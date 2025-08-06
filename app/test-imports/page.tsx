// Test file to verify exports
import { createTeam, createTeamInvitation, getUserByClerkId } from '@/lib/supabase'

console.log('Functions imported successfully:', {
  createTeam: typeof createTeam,
  createTeamInvitation: typeof createTeamInvitation,
  getUserByClerkId: typeof getUserByClerkId
})

export default function TestPage() {
  return <div>Test</div>
}
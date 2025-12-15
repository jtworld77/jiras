'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  getTeam,
  getTeamMembers,
  getTeamInvitations,
  inviteMember,
  updateMemberRole,
  removeMember,
  cancelInvitation,
  getUserRole,
} from '@/lib/queries/teams';
import TeamSelector from '@/components/TeamSelector';
import LogoutButton from '@/components/LogoutButton';
import type { Team, TeamMember, TeamInvitation, TeamRole } from '@/types';

export default function TeamSettingsPage({ params }: { params: { teamId: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.teamId]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    try {
      const [teamData, membersData, invitationsData, role] = await Promise.all([
        getTeam(params.teamId),
        getTeamMembers(params.teamId),
        getTeamInvitations(params.teamId),
        getUserRole(params.teamId),
      ]);

      if (!role) {
        router.push('/teams');
        return;
      }

      setTeam(teamData);
      setMembers(membersData);
      setInvitations(invitationsData);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const invitation = await inviteMember(params.teamId, inviteEmail, inviteRole);
      setInvitations([invitation, ...invitations]);
      setInviteEmail('');
      alert(`Invitation sent to ${inviteEmail}. Share this link:\n${window.location.origin}/invitations/${invitation.token}`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the team?')) return;

    try {
      await removeMember(memberId);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      setInvitations(invitations.filter(i => i.id !== invitationId));
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!team || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <TeamSelector currentTeamId={params.teamId} />
              <Link
                href={`/teams/${params.teamId}/projects`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Projects
              </Link>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Team Settings: {team.name}</h1>

        {/* Invite Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invite Members</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {inviting ? 'Sending...' : 'Invite'}
            </button>
          </form>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-600">Role: {invitation.role}</p>
                  </div>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium">User ID: {member.user_id.substring(0, 8)}...</p>
                  <p className="text-sm text-gray-600">
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Role Permissions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Admin:</strong> Full access - manage team, projects, and members</li>
            <li><strong>Member:</strong> Create and edit projects, issues, and comments</li>
            <li><strong>Viewer:</strong> Read-only access to all projects</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

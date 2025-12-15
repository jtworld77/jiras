import { supabase } from '@/lib/supabase/client';
import type { Team, TeamMember, TeamInvitation, TeamRole } from '@/types';

export async function getUserTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members!inner(role)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Team & { team_members: { role: TeamRole }[] })[];
}

export async function getTeam(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Team;
}

export async function createTeam(name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, description, created_by: user.id })
    .select()
    .single();

  if (teamError) throw teamError;

  // Add creator as admin
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: user.id, role: 'admin' });

  if (memberError) throw memberError;

  return team as Team;
}

export async function updateTeam(id: string, updates: Partial<Pick<Team, 'name' | 'description'>>) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function deleteTeam(id: string) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data as TeamMember[];
}

export async function updateMemberRole(memberId: string, role: TeamRole) {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function removeMember(memberId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function inviteMember(teamId: string, email: string, role: TeamRole) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      team_id: teamId,
      email,
      role,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as TeamInvitation;
}

export async function getTeamInvitations(teamId: string) {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as TeamInvitation[];
}

export async function acceptInvitation(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get invitation
  const { data: invitation, error: invError } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .single();

  if (invError) throw invError;
  if (!invitation) throw new Error('Invitation not found');

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation expired');
  }

  // Add user to team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invitation.team_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    });

  if (memberError) throw memberError;

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('team_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateError) throw updateError;

  return invitation.team_id;
}

export async function cancelInvitation(invitationId: string) {
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
}

export async function getUserRole(teamId: string): Promise<TeamRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data.role as TeamRole;
}

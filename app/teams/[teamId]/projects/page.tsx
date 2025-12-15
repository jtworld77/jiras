'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getProjectsByTeam } from '@/lib/queries/projects';
import { getTeam, getUserRole } from '@/lib/queries/teams';
import TeamSelector from '@/components/TeamSelector';
import ProjectList from '@/components/ProjectList';
import LogoutButton from '@/components/LogoutButton';
import type { Project, Team, TeamRole } from '@/types';

export default function TeamProjectsPage({ params }: { params: { teamId: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(true);

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
      const [teamData, projectsData, role] = await Promise.all([
        getTeam(params.teamId),
        getProjectsByTeam(params.teamId),
        getUserRole(params.teamId),
      ]);

      if (!role) {
        router.push('/teams');
        return;
      }

      setTeam(teamData);
      setProjects(projectsData);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/teams');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const canManage = userRole === 'admin' || userRole === 'member';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <TeamSelector currentTeamId={params.teamId} />
              <Link
                href={`/teams/${params.teamId}/settings`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Team Settings
              </Link>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-600 mt-1">
              You are a <span className="font-medium">{userRole}</span> of {team.name}
            </p>
          </div>
        </div>
        <ProjectList 
          initialProjects={projects} 
          teamId={params.teamId}
          canManage={canManage}
        />
      </main>
    </div>
  );
}

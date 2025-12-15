'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getProject } from '@/lib/queries/projects';
import { getIssuesByProject } from '@/lib/queries/issues';
import { getUserRole } from '@/lib/queries/teams';
import KanbanBoard from '@/components/KanbanBoard';
import TeamSelector from '@/components/TeamSelector';
import LogoutButton from '@/components/LogoutButton';
import type { Project, Issue, TeamRole } from '@/types';

export default function ProjectBoardPage({ 
  params 
}: { 
  params: { teamId: string; projectId: string } 
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.projectId]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    try {
      const [projectData, issuesData, role] = await Promise.all([
        getProject(params.projectId),
        getIssuesByProject(params.projectId),
        getUserRole(params.teamId),
      ]);

      if (!role) {
        router.push('/teams');
        return;
      }

      if (projectData.team_id !== params.teamId) {
        router.push(`/teams/${params.teamId}/projects`);
        return;
      }

      setProject(projectData);
      setIssues(issuesData);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push(`/teams/${params.teamId}/projects`);
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

  if (!project) {
    return null;
  }

  const canEdit = userRole === 'admin' || userRole === 'member';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <TeamSelector currentTeamId={params.teamId} />
              <Link
                href={`/teams/${params.teamId}/projects`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Projects
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              {userRole === 'viewer' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Read-only
                </span>
              )}
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard 
          projectId={params.projectId} 
          initialIssues={issues}
          canEdit={canEdit}
        />
      </main>
    </div>
  );
}

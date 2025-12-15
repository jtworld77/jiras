'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserTeams, createTeam } from '@/lib/queries/teams';
import type { Team, TeamRole } from '@/types';

export default function TeamSelector({ currentTeamId }: { currentTeamId?: string }) {
  const router = useRouter();
  const [teams, setTeams] = useState<(Team & { team_members: { role: TeamRole }[] })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const data = await getUserTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      const team = await createTeam(newTeamName);
      setTeams([...teams, { ...team, team_members: [{ role: 'admin' }] }]);
      setNewTeamName('');
      setIsCreating(false);
      router.push(`/teams/${team.id}/projects`);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const currentTeam = teams.find(t => t.id === currentTeamId);

  if (loading) {
    return <div className="text-gray-600">Loading teams...</div>;
  }

  return (
    <div className="relative">
      <select
        value={currentTeamId || ''}
        onChange={(e) => {
          if (e.target.value === 'new') {
            setIsCreating(true);
          } else if (e.target.value) {
            router.push(`/teams/${e.target.value}/projects`);
          }
        }}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {!currentTeamId && <option value="">Select a team...</option>}
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name} ({team.team_members[0]?.role})
          </option>
        ))}
        <option value="new">+ Create New Team</option>
      </select>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTeamName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

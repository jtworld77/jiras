'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserTeams } from '@/lib/queries/teams';

export default function TeamsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    redirectToFirstTeam();
  }, []);

  async function redirectToFirstTeam() {
    try {
      const teams = await getUserTeams();
      
      if (teams.length > 0) {
        router.push(`/teams/${teams[0].id}/projects`);
      } else {
        // No teams - should create one
        router.push('/teams/new');
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading your teams...</p>
    </div>
  );
}

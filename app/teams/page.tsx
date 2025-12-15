'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserTeams } from '@/lib/queries/teams';

export default function TeamsIndexPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
    } catch (error: any) {
      console.error('Error loading teams:', error);
      // If the teams table doesn't exist (migration not run), show error
      setError('Database migration required. Please run schema-teams.sql in Supabase.');
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-bold text-red-900 mb-2">Migration Required</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <div className="text-sm text-red-700">
            <p className="font-semibold mb-2">Steps to fix:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Run the file: supabase/schema-teams.sql</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading your teams...</p>
    </div>
  );
}

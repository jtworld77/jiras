'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { acceptInvitation } from '@/lib/queries/teams';

export default function AcceptInvitationPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'accepting' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuthAndAccept();
  }, [params.token]);

  async function checkAuthAndAccept() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login with return URL
      router.push(`/?invite=${params.token}`);
      return;
    }

    // User is logged in, accept invitation
    setStatus('accepting');
    try {
      const teamId = await acceptInvitation(params.token);
      setStatus('success');
      setMessage('Invitation accepted! Redirecting...');
      setTimeout(() => {
        router.push(`/teams/${teamId}/projects`);
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to accept invitation');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {status === 'checking' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checking invitation...</h1>
            <p className="text-gray-600">Please wait...</p>
          </>
        )}
        
        {status === 'accepting' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accepting invitation...</h1>
            <p className="text-gray-600">Adding you to the team...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Success!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/teams')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Teams
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from '@/components/LoginForm';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Personal Jira
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your email
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

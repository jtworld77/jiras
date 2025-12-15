import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import KanbanBoard from '@/components/KanbanBoard';
import LogoutButton from '@/components/LogoutButton';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) {
    redirect('/projects');
  }

  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', params.id)
    .order('order_index', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/projects" className="text-indigo-600 hover:text-indigo-800">
                ← Projects
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard projectId={params.id} initialIssues={issues || []} />
      </main>
    </div>
  );
}

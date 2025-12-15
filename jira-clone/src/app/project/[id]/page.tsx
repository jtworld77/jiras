import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { getIssues, createIssue } from '@/lib/actions/issues';
import { KanbanBoard } from '@/components/kanban-board';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const [project, issues] = await Promise.all([
    getProject(id),
    getIssues(id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1 ml-16">{project.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <form action={createIssue} className="flex gap-4">
            <input type="hidden" name="project_id" value={project.id} />
            <input
              name="title"
              type="text"
              required
              placeholder="Issue title"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="description"
              type="text"
              placeholder="Description (optional)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Issue
            </button>
          </form>
        </div>

        <KanbanBoard issues={issues} projectId={project.id} />
      </main>
    </div>
  );
}

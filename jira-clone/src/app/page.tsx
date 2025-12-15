import Link from 'next/link';
import { getProjects, createProject, deleteProject } from '@/lib/actions/projects';
import { signOut } from '@/lib/actions/auth';
import { DeleteButton } from '@/components/delete-button';

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Personal Jira</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Create Project</h2>
          <form action={createProject} className="flex gap-4">
            <input
              name="name"
              type="text"
              required
              placeholder="Project name"
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
              Create
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects yet. Create one above!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/project/${project.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {project.name}
                    </Link>
                    <DeleteButton
                      action={deleteProject.bind(null, project.id)}
                    />
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

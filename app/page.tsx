import Link from 'next/link'
import { getProjects } from '@/lib/db/projects'
import { createProject } from '@/lib/db/projects'
import { redirect } from 'next/navigation'

async function createProjectAction(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  await createProject(name, description || undefined)
  redirect('/')
}

export default async function HomePage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>
        
        <form action={createProjectAction} className="mb-8 p-4 bg-white rounded-lg shadow">
          <div className="flex gap-4">
            <input
              type="text"
              name="name"
              placeholder="Project name"
              required
              className="flex-1 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (optional)"
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              {project.description && (
                <p className="text-gray-600 text-sm">{project.description}</p>
              )}
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-gray-500 text-center py-12">No projects yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}

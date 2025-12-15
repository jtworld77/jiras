import { getProjects } from '@/lib/data'
import { addProject, signOut } from '@/app/actions'
import Link from 'next/link'

export default async function Home() {
  const projects = await getProjects()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <form action={signOut}>
            <button className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">Sign Out</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="block p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-500 text-sm">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form action={addProject} className="flex gap-4">
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            className="flex-1 px-4 py-2 border rounded bg-transparent"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black dark:bg-white dark:text-black text-white rounded hover:bg-gray-800"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  )
}

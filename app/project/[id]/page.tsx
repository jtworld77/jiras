import { getProject } from '@/lib/db/projects'
import { getIssues } from '@/lib/db/issues'
import KanbanBoard from '@/components/KanbanBoard'
import Link from 'next/link'

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await getProject(params.id)
  const issues = await getIssues(params.id)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>

        <KanbanBoard projectId={params.id} initialIssues={issues} />
      </div>
    </div>
  )
}

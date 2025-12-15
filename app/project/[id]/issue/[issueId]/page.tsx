import { getIssue, getComments } from '@/lib/data'
import { addComment } from '@/app/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function IssuePage({ params }: { params: Promise<{ id: string, issueId: string }> }) {
  const { id, issueId } = await params
  const issue = await getIssue(issueId)
  if (!issue) notFound()

  const comments = await getComments(issueId)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={`/project/${id}`} className="text-gray-500 hover:text-black mb-4 block">← Back to Board</Link>
      
      <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-xs rounded uppercase font-bold">{issue.status}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Comments</h2>
        <div className="space-y-4">
            {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 dark:bg-neutral-800 p-4 rounded">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
        </div>
      </div>

      <form action={addComment.bind(null, issueId, id)} className="flex gap-4 items-start">
        <textarea 
            name="content" 
            placeholder="Write a comment..." 
            className="flex-1 p-3 border rounded h-24 bg-transparent"
            required
        />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 dark:bg-white dark:text-black">Comment</button>
      </form>
    </div>
  )
}

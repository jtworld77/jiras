'use client'

type Comment = {
  id: string
  content: string
  created_at: string
}

type Props = {
  comments: Comment[]
}

export default function Comments({ comments }: Props) {
  if (comments.length === 0) {
    return <p className="text-gray-500 text-sm">No comments yet.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Comments from './Comments'

type Issue = {
  id: string
  title: string
  description: string | null
  status: string
}

type Props = {
  issue: Issue
  onClose: () => void
  onUpdate: () => void
}

export default function IssueModal({ issue, onClose, onUpdate }: Props) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [issue.id])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?issueId=${issue.id}`)
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issue.id, content: newComment.trim() }),
      })
      const comment = await response.json()
      setComments([...comments, comment])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{issue.title}</h2>
              <span className="inline-block px-2 py-1 text-xs bg-gray-200 rounded">
                {issue.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {issue.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Comments</h3>
            <Comments comments={comments} />

            <form onSubmit={handleAddComment} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border rounded mb-2"
                rows={3}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

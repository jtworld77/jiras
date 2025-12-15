'use client';

import type { Comment } from '@/types/database';

interface Props {
  comments: Comment[];
  issueId: string;
  projectId: string;
  onDelete: (id: string, issueId: string, projectId: string) => Promise<void>;
}

export function CommentList({ comments, issueId, projectId, onDelete }: Props) {
  if (comments.length === 0) {
    return <p className="text-gray-500 text-sm">No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <button
              onClick={async () => {
                if (confirm('Delete this comment?')) {
                  await onDelete(comment.id, issueId, projectId);
                }
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

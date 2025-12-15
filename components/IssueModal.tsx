'use client';

import { useState, useEffect } from 'react';
import { updateIssue, deleteIssue } from '@/lib/queries/issues';
import { getCommentsByIssue, createComment, deleteComment } from '@/lib/queries/comments';
import type { Issue, Comment } from '@/types';

export default function IssueModal({
  issue,
  onClose,
  onUpdate,
  onDelete,
}: {
  issue: Issue;
  onClose: () => void;
  onUpdate: (issue: Issue) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadComments();
  }, [issue.id]);

  const loadComments = async () => {
    try {
      const data = await getCommentsByIssue(issue.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await updateIssue(issue.id, { title, description: description || null });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this issue?')) return;
    
    try {
      await deleteIssue(issue.id);
      onDelete(issue.id);
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await createComment(issue.id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold w-full mr-4 border-b-2 border-indigo-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Description</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={6}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTitle(issue.title);
                      setDescription(issue.description || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {description || 'No description'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Comments ({comments.length})
            </h3>
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-700 flex-1">{comment.content}</p>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-600 ml-2"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </form>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

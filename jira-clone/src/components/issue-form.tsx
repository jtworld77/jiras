'use client';

import type { Issue, Status } from '@/types/database';

interface Props {
  issue: Issue;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function IssueForm({ issue, onSubmit, onDelete }: Props) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={issue.title}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={issue.description || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={issue.status}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={async () => {
            if (confirm('Are you sure you want to delete this issue?')) {
              await onDelete();
            }
          }}
          className="px-4 py-2 text-red-600 hover:text-red-800"
        >
          Delete Issue
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Created: {new Date(issue.created_at).toLocaleString()} · 
        Updated: {new Date(issue.updated_at).toLocaleString()}
      </p>
    </form>
  );
}

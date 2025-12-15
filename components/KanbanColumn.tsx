'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableIssueCard from './SortableIssueCard';
import { createIssue } from '@/lib/queries/issues';
import type { Issue } from '@/types';

export default function KanbanColumn({
  id,
  title,
  issues,
  projectId,
  onIssueCreated,
  onIssueClick,
}: {
  id: string;
  title: string;
  issues: Issue[];
  projectId: string;
  onIssueCreated: (issue: Issue) => void;
  onIssueClick: (issue: Issue) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');

  const { setNodeRef } = useDroppable({ id });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;

    try {
      const issue = await createIssue(projectId, newIssueTitle, undefined, id as Issue['status']);
      onIssueCreated(issue);
      setNewIssueTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">
          {title} <span className="text-gray-500 text-sm">({issues.length})</span>
        </h3>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-2 min-h-[100px]">
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <SortableIssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue)} />
          ))}
        </SortableContext>

        {isAdding && (
          <form onSubmit={handleCreate} className="bg-white p-3 rounded shadow-sm">
            <input
              type="text"
              value={newIssueTitle}
              onChange={(e) => setNewIssueTitle(e.target.value)}
              placeholder="Issue title"
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              onBlur={() => {
                if (!newIssueTitle.trim()) setIsAdding(false);
              }}
            />
          </form>
        )}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
        >
          + Add issue
        </button>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Issue } from '@/types/database';

interface Props {
  issue: Issue;
  projectId: string;
}

export function IssueCard({ issue, projectId }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <Link
        href={`/project/${projectId}/issue/${issue.id}`}
        className="block"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium text-sm text-gray-900 hover:text-blue-600">
          {issue.title}
        </p>
        {issue.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {issue.description}
          </p>
        )}
      </Link>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(issue.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
}

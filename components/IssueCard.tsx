'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Issue } from '@/lib/types'
import Link from 'next/link'

export function IssueCard({ issue }: { issue: Issue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: issue.id, data: { ...issue } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-neutral-800 p-3 rounded shadow-sm border border-gray-200 dark:border-neutral-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
    >
      <Link 
        href={`/project/${issue.project_id}/issue/${issue.id}`} 
        className="font-medium text-sm block hover:text-blue-500 mb-1"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking link
      >
        {issue.title}
      </Link>
      {issue.description && <p className="text-xs text-gray-500 truncate">{issue.description}</p>}
    </div>
  )
}

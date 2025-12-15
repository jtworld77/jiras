'use client'

import { Droppable, Draggable } from 'react-beautiful-dnd'
import IssueCard from './IssueCard'
import { useState } from 'react'
import type { IssueStatus } from '@/lib/db/issues'

type Issue = {
  id: string
  title: string
  description: string | null
  status: IssueStatus
  position: number
}

type Props = {
  status: IssueStatus
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onCreateIssue?: (title: string, description?: string) => void
}

const statusLabels: Record<IssueStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
}

export default function KanbanColumn({ status, issues, onIssueClick, onCreateIssue }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && onCreateIssue) {
      onCreateIssue(title.trim(), description.trim() || undefined)
      setTitle('')
      setDescription('')
      setShowForm(false)
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{statusLabels[status]}</h2>
        <span className="text-sm text-gray-500">{issues.length}</span>
      </div>

      {status === 'todo' && onCreateIssue && (
        <div className="mb-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              + Add Issue
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-3 rounded border">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className="w-full px-2 py-1 mb-2 border rounded text-sm"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-2 py-1 mb-2 border rounded text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setTitle('')
                    setDescription('')
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {issues.map((issue, index) => (
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${
                      snapshot.isDragging ? 'opacity-50' : ''
                    }`}
                  >
                    <IssueCard issue={issue} onClick={() => onIssueClick(issue)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import KanbanColumn from './KanbanColumn'
import IssueModal from './IssueModal'
import type { IssueStatus } from '@/lib/db/issues'

type Issue = {
  id: string
  title: string
  description: string | null
  status: IssueStatus
  position: number
  project_id: string
}

type Props = {
  projectId: string
  initialIssues: Issue[]
}

export default function KanbanBoard({ projectId, initialIssues }: Props) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues
      .filter((issue) => issue.status === status)
      .sort((a, b) => a.position - b.position)
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, source, destination } = result
    const issueId = draggableId
    const sourceStatus = source.droppableId as IssueStatus
    const destStatus = destination.droppableId as IssueStatus
    const newIndex = destination.index

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Optimistic update
    const issue = issues.find((i) => i.id === issueId)!
    const sourceIssues = getIssuesByStatus(sourceStatus)
    const destIssues = getIssuesByStatus(destStatus)

    sourceIssues.splice(source.index, 1)
    
    if (sourceStatus === destStatus) {
      sourceIssues.splice(newIndex, 0, issue)
    } else {
      destIssues.splice(newIndex, 0, { ...issue, status: destStatus })
    }

    // Recalculate positions
    const updates: Array<{ id: string; position: number; status?: IssueStatus }> = []
    
    if (sourceStatus === destStatus) {
      sourceIssues.forEach((issue, idx) => {
        if (issue.id !== issueId) {
          updates.push({ id: issue.id, position: idx })
        }
      })
      updates.push({ id: issueId, position: newIndex })
    } else {
      sourceIssues.forEach((issue, idx) => {
        updates.push({ id: issue.id, position: idx })
      })
      destIssues.forEach((issue, idx) => {
        updates.push({ id: issue.id, position: idx, status: issue.status })
      })
    }

    // Update local state
    const updatedIssues = issues.map((i) => {
      const update = updates.find((u) => u.id === i.id)
      if (update) {
        return { ...i, position: update.position, status: update.status || i.status }
      }
      return i
    })
    setIssues(updatedIssues.sort((a, b) => {
      if (a.status !== b.status) return 0
      return a.position - b.position
    }))

    // Persist to database
    try {
      await fetch('/api/issues/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
    } catch (error) {
      console.error('Failed to update issue order:', error)
      setIssues(initialIssues)
    }
  }

  const handleCreateIssue = async (title: string, description?: string) => {
    try {
      const response = await fetch('/api/issues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title, description }),
      })
      const newIssue = await response.json()
      setIssues([...issues, newIssue])
    } catch (error) {
      console.error('Failed to create issue:', error)
    }
  }

  const handleIssueUpdate = () => {
    // Comments are handled in modal, no need to refresh
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          <KanbanColumn
            status="todo"
            issues={getIssuesByStatus('todo')}
            onIssueClick={setSelectedIssue}
            onCreateIssue={handleCreateIssue}
          />
          <KanbanColumn
            status="doing"
            issues={getIssuesByStatus('doing')}
            onIssueClick={setSelectedIssue}
          />
          <KanbanColumn
            status="done"
            issues={getIssuesByStatus('done')}
            onIssueClick={setSelectedIssue}
          />
        </div>
      </DragDropContext>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleIssueUpdate}
        />
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Issue, Status } from '@/lib/types'
import { Column } from './Column'
import { IssueCard } from './IssueCard'
import { updateIssueStatus, updateIssueOrder } from '@/app/actions'

const COLUMNS: Status[] = ['todo', 'doing', 'done']

export function KanbanBoard({ projectId, initialIssues }: { projectId: string, initialIssues: Issue[] }) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    setActiveId(active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = issues.find((i) => i.id === activeId)
    const isOverTask = issues.find((i) => i.id === overId)

    if (!isActiveTask) return

    // Dropping over another task
    if (isOverTask) {
        if (isActiveTask.status !== isOverTask.status) {
            setIssues((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId)
                const overIndex = items.findIndex((t) => t.id === overId)
                
                const newItems = [...items]
                newItems[activeIndex] = { ...newItems[activeIndex], status: isOverTask.status }
                
                return arrayMove(newItems, activeIndex, overIndex)
            })
        } else {
             setIssues((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId)
                const overIndex = items.findIndex((t) => t.id === overId)
                return arrayMove(items, activeIndex, overIndex)
            })
        }
    }

    // Dropping over a column (empty space)
    const isOverColumn = COLUMNS.includes(overId as Status)
    if (isOverColumn) {
        const newStatus = overId as Status
        if (isActiveTask.status !== newStatus) {
             setIssues((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId)
                const newItems = [...items]
                newItems[activeIndex] = { ...newItems[activeIndex], status: newStatus }
                return newItems
            })
        }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = active.id as string
    const overId = over?.id

    if (!overId) {
        setActiveId(null)
        return
    }

    const activeIssue = issues.find(i => i.id === activeId)
    
    if (activeIssue) {
        // Persist changes
        // 1. Check if status changed
        const serverIssue = initialIssues.find(i => i.id === activeId)
        if (serverIssue && serverIssue.status !== activeIssue.status) {
             updateIssueStatus(activeId, activeIssue.status, projectId)
        }
        
        // 2. Update order for the column
        // Filter issues in this column
        const columnIssues = issues.filter(i => i.status === activeIssue.status)
        const updates = columnIssues.map((item, index) => ({
            id: item.id,
            position: (index + 1) * 1000
        }))
        
        updateIssueOrder(updates, projectId)
    }

    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column 
            key={col} 
            id={col} 
            title={col.toUpperCase()} 
            issues={issues.filter(i => i.status === col)}
            projectId={projectId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
            <IssueCard issue={issues.find(i => i.id === activeId)!} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue, Status } from '@/types/database';
import { KanbanColumn } from './kanban-column';
import { IssueCard } from './issue-card';
import { batchUpdateIssueOrder } from '@/lib/actions/issues';

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

interface Props {
  issues: Issue[];
  projectId: string;
}

export function KanbanBoard({ issues: initialIssues, projectId }: Props) {
  const [issues, setIssues] = useState(initialIssues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function getIssuesByStatus(status: Status) {
    return issues
      .filter((issue) => issue.status === status)
      .sort((a, b) => a.order - b.order);
  }

  function handleDragStart(event: DragStartEvent) {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) setActiveIssue(issue);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIssue = issues.find((i) => i.id === activeId);
    if (!activeIssue) return;

    // Check if dropping on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      if (activeIssue.status !== overColumn.id) {
        setIssues((prev) => {
          const updated = prev.map((issue) =>
            issue.id === activeId
              ? { ...issue, status: overColumn.id }
              : issue
          );
          return updated;
        });
      }
      return;
    }

    // Dropping on another issue
    const overIssue = issues.find((i) => i.id === overId);
    if (!overIssue) return;

    if (activeIssue.status !== overIssue.status) {
      setIssues((prev) => {
        return prev.map((issue) =>
          issue.id === activeId
            ? { ...issue, status: overIssue.status }
            : issue
        );
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIssue = issues.find((i) => i.id === activeId);
    if (!activeIssue) return;

    // Determine target status
    let targetStatus: Status = activeIssue.status;
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      const overIssue = issues.find((i) => i.id === overId);
      if (overIssue) {
        targetStatus = overIssue.status;
      }
    }

    // Calculate new order
    const columnIssues = issues
      .filter((i) => i.status === targetStatus && i.id !== activeId)
      .sort((a, b) => a.order - b.order);

    let newIndex = columnIssues.length;
    if (!overColumn) {
      const overIssue = issues.find((i) => i.id === overId);
      if (overIssue) {
        const overIndex = columnIssues.findIndex((i) => i.id === overId);
        newIndex = overIndex >= 0 ? overIndex : columnIssues.length;
      }
    }

    // Insert active issue at new position
    columnIssues.splice(newIndex, 0, { ...activeIssue, status: targetStatus });

    // Assign new orders
    const updates: { id: string; status: Status; order: number }[] = [];
    columnIssues.forEach((issue, index) => {
      updates.push({ id: issue.id, status: targetStatus, order: index });
    });

    // Update local state
    setIssues((prev) => {
      const newIssues = prev.filter(
        (i) => i.status !== targetStatus || i.id === activeId
      );
      
      // Add back issues with new orders
      for (const update of updates) {
        const issue = prev.find((i) => i.id === update.id);
        if (issue) {
          newIssues.push({ ...issue, status: update.status, order: update.order });
        }
      }
      
      return newIssues;
    });

    // Persist to database
    await batchUpdateIssueOrder(updates, projectId);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={columnIssues.length}
            >
              <SortableContext
                items={columnIssues.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} projectId={projectId} />
                ))}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeIssue ? (
          <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-blue-500 opacity-90">
            <p className="font-medium text-sm">{activeIssue.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

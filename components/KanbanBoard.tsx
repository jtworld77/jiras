'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import IssueCard from './IssueCard';
import IssueModal from './IssueModal';
import { updateIssueStatus, reorderIssues } from '@/lib/queries/issues';
import type { Issue } from '@/types';

type Status = 'todo' | 'doing' | 'done';

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export default function KanbanBoard({
  projectId,
  initialIssues,
  canEdit = true,
}: {
  projectId: string;
  initialIssues: Issue[];
  canEdit?: boolean;
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIssue = issues.find((i) => i.id === activeId);
    if (!activeIssue) return;

    // Check if dropped on a column or another issue
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    const overIssue = issues.find((i) => i.id === overId);

    const newStatus = targetColumn ? targetColumn.id : overIssue?.status || activeIssue.status;

    // Reorder issues
    const statusIssues = issues
      .filter((i) => i.status === newStatus && i.id !== activeId)
      .sort((a, b) => a.order_index - b.order_index);

    let newOrderIndex: number;
    if (overIssue && overIssue.status === newStatus) {
      const overIndex = statusIssues.findIndex((i) => i.id === overId);
      statusIssues.splice(overIndex, 0, { ...activeIssue, status: newStatus, order_index: 0 });
    } else {
      statusIssues.push({ ...activeIssue, status: newStatus, order_index: 0 });
    }

    // Reassign order indices
    const updates = statusIssues.map((issue, index) => ({
      ...issue,
      order_index: index,
    }));

    // Update local state
    const updatedIssues = issues.map((issue) => {
      if (issue.id === activeId) {
        return updates.find((u) => u.id === activeId)!;
      }
      const update = updates.find((u) => u.id === issue.id);
      return update || issue;
    });

    setIssues(updatedIssues);

    // Update database
    try {
      await updateIssueStatus(activeId, newStatus, updates.find((u) => u.id === activeId)!.order_index);
      
      // Update other affected issues
      const otherUpdates = updates
        .filter((u) => u.id !== activeId)
        .map(({ id, order_index }) => ({ id, order_index }));
      
      if (otherUpdates.length > 0) {
        await reorderIssues(otherUpdates);
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      setIssues(issues); // Revert on error
    }
  };

  const handleIssueCreated = (issue: Issue) => {
    setIssues([...issues, issue]);
  };

  const handleIssueUpdated = (updatedIssue: Issue) => {
    setIssues(issues.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
    setSelectedIssue(null);
  };

  const handleIssueDeleted = (id: string) => {
    setIssues(issues.filter((i) => i.id !== id));
    setSelectedIssue(null);
  };

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnIssues = issues
              .filter((i) => i.status === column.id)
              .sort((a, b) => a.order_index - b.order_index);

            return (
              <SortableContext
                key={column.id}
                id={column.id}
                items={columnIssues.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  issues={columnIssues}
                  projectId={projectId}
                  onIssueCreated={handleIssueCreated}
                  onIssueClick={setSelectedIssue}
                  canEdit={canEdit}
                />
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <div className="opacity-50">
              <IssueCard issue={activeIssue} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleIssueUpdated}
          onDelete={handleIssueDeleted}
        />
      )}
    </>
  );
}

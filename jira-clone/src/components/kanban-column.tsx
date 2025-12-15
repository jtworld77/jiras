'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Status } from '@/types/database';

const COLUMN_COLORS: Record<Status, string> = {
  todo: 'bg-gray-100 border-gray-300',
  doing: 'bg-blue-50 border-blue-300',
  done: 'bg-green-50 border-green-300',
};

const HEADER_COLORS: Record<Status, string> = {
  todo: 'bg-gray-200',
  doing: 'bg-blue-100',
  done: 'bg-green-100',
};

interface Props {
  id: Status;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 ${COLUMN_COLORS[id]} ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className={`px-3 py-2 rounded-t-md ${HEADER_COLORS[id]}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">{title}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="p-2 min-h-[200px] space-y-2">{children}</div>
    </div>
  );
}

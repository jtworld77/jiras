'use client';

import type { Issue } from '@/types';

export default function IssueCard({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <h4 className="text-sm font-medium text-gray-900 mb-1">{issue.title}</h4>
      {issue.description && (
        <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
      )}
    </div>
  );
}

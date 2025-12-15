'use client'

type Issue = {
  id: string
  title: string
  description: string | null
  status: string
}

type Props = {
  issue: Issue
  onClick: () => void
}

export default function IssueCard({ issue, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-3 rounded shadow-sm hover:shadow cursor-pointer transition"
    >
      <h3 className="font-medium text-sm mb-1">{issue.title}</h3>
      {issue.description && (
        <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
      )}
    </div>
  )
}

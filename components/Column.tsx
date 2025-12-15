'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Issue } from '@/lib/types'
import { IssueCard } from './IssueCard'
import { addIssue } from '@/app/actions'
import { useRef } from 'react'

export function Column({ id, title, issues, projectId }: { id: string, title: string, issues: Issue[], projectId: string }) {
  const { setNodeRef } = useDroppable({ id })
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="flex flex-col w-80 bg-gray-100 dark:bg-neutral-900 rounded-lg p-4 h-full shrink-0">
      <h2 className="font-bold mb-4">{title} <span className="text-gray-400 text-sm">({issues.length})</span></h2>
      
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[100px]">
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </SortableContext>
      </div>

      <form 
        ref={formRef}
        action={async (formData) => {
            await addIssue(projectId, formData)
            formRef.current?.reset()
        }} 
        className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800"
      >
          <input 
            name="title" 
            placeholder="+ Add task" 
            className="w-full bg-transparent outline-none text-sm placeholder-gray-500" 
            required 
            autoComplete="off"
          />
          <input type="hidden" name="status" value={id} />
          <input type="hidden" name="description" value="" />
      </form>
    </div>
  )
}

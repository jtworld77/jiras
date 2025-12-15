'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Status } from '@/lib/types'
import { redirect } from 'next/navigation'

export async function addProject(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('projects').insert({ name, user_id: user.id })
  revalidatePath('/')
}

export async function addIssue(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as Status || 'todo'
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Get max position to append
  const { data: existing } = await supabase.from('issues').select('position').eq('project_id', projectId).order('position', { ascending: false }).limit(1).single()
  const position = existing ? existing.position + 1000 : 1000

  await supabase.from('issues').insert({ 
    project_id: projectId, 
    title, 
    description, 
    status,
    position,
    user_id: user.id 
  })
  revalidatePath(`/project/${projectId}`)
}

export async function updateIssueStatus(issueId: string, status: Status, projectId: string) {
  const supabase = await createClient()
  await supabase.from('issues').update({ status }).eq('id', issueId)
  revalidatePath(`/project/${projectId}`)
}

export async function updateIssueOrder(items: { id: string, position: number }[], projectId: string) {
    const supabase = await createClient()
    const updates = items.map(({ id, position }) => 
        supabase.from('issues').update({ position }).eq('id', id)
    )
    await Promise.all(updates)
    revalidatePath(`/project/${projectId}`)
}

export async function deleteIssue(issueId: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('issues').delete().eq('id', issueId)
  revalidatePath(`/project/${projectId}`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function addComment(issueId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('comments').insert({ 
    issue_id: issueId, 
    content, 
    user_id: user.id 
  })
  revalidatePath(`/project/${projectId}/issue/${issueId}`)
}

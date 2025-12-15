import { createClient } from '@/lib/supabase/server'

export type IssueStatus = 'todo' | 'doing' | 'done'

export async function getIssues(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getIssue(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('issues')
    .select('*, comments(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createIssue(
  projectId: string,
  title: string,
  description?: string
) {
  const supabase = await createClient()
  
  // Get max position for the status
  const { data: maxIssue } = await supabase
    .from('issues')
    .select('position')
    .eq('project_id', projectId)
    .eq('status', 'todo')
    .order('position', { ascending: false })
    .limit(1)
    .single()
  
  const position = maxIssue?.position ? maxIssue.position + 1 : 0
  
  const { data, error } = await supabase
    .from('issues')
    .insert({
      project_id: projectId,
      title,
      description,
      status: 'todo',
      position,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateIssueStatus(
  id: string,
  status: IssueStatus,
  position: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('issues')
    .update({ status, position })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateIssuePositions(
  updates: Array<{ id: string; position: number; status?: IssueStatus }>
) {
  const supabase = await createClient()
  
  const promises = updates.map(({ id, position, status }) => {
    const update: { position: number; status?: IssueStatus } = { position }
    if (status) update.status = status
    
    return supabase
      .from('issues')
      .update(update)
      .eq('id', id)
  })
  
  await Promise.all(promises)
}

export async function deleteIssue(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

import { createClient } from '@/lib/supabase/server'

export async function getComments(issueId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createComment(issueId: string, content: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({ issue_id: issueId, content })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

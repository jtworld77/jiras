import { createClient } from '@/utils/supabase/server'
import { Project, Issue, Comment } from './types'

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function getIssues(projectId: string): Promise<Issue[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('issues').select('*').eq('project_id', projectId).order('position', { ascending: true })
  if (error) console.error(error)
  return data || []
}

export async function getIssue(id: string): Promise<Issue | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('issues').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function getComments(issueId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('comments').select('*').eq('issue_id', issueId).order('created_at', { ascending: true })
  if (error) console.error(error)
  return data || []
}

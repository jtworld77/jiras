import { createClient } from '@/lib/supabase/server'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createProject(name: string, description?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

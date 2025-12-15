import { supabase } from '@/lib/supabase/client';
import type { Issue } from '@/types';

export async function getIssuesByProject(projectId: string) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as Issue[];
}

export async function getIssue(id: string) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Issue;
}

export async function createIssue(
  projectId: string,
  title: string,
  description?: string,
  status: Issue['status'] = 'todo'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get max order_index for this status
  const { data: maxIssue } = await supabase
    .from('issues')
    .select('order_index')
    .eq('project_id', projectId)
    .eq('status', status)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (maxIssue?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from('issues')
    .insert({
      project_id: projectId,
      title,
      description,
      status,
      order_index: orderIndex,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Issue;
}

export async function updateIssue(id: string, updates: Partial<Pick<Issue, 'title' | 'description'>>) {
  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Issue;
}

export async function updateIssueStatus(id: string, status: Issue['status'], newOrderIndex: number) {
  const { data, error } = await supabase
    .from('issues')
    .update({ status, order_index: newOrderIndex })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Issue;
}

export async function reorderIssues(issues: { id: string; order_index: number }[]) {
  const updates = issues.map(({ id, order_index }) =>
    supabase
      .from('issues')
      .update({ order_index })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);
  if (errors.length > 0) throw errors[0].error;
}

export async function deleteIssue(id: string) {
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

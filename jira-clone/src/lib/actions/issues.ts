'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Issue, Status } from '@/types/database';

export async function getIssues(projectId: string): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getIssue(id: string): Promise<Issue | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createIssue(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get('project_id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  // Get max order for todo column
  const { data: maxOrder } = await supabase
    .from('issues')
    .select('order')
    .eq('project_id', projectId)
    .eq('status', 'todo')
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from('issues').insert({
    title,
    description: description || null,
    project_id: projectId,
    status: 'todo',
    order: (maxOrder?.order ?? -1) + 1,
  });

  if (error) throw error;
  revalidatePath(`/project/${projectId}`);
}

export async function updateIssue(id: string, updates: Partial<Issue>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('issues')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('project_id')
    .single();

  if (error) throw error;
  if (data) revalidatePath(`/project/${data.project_id}`);
}

export async function deleteIssue(id: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('issues').delete().eq('id', id);

  if (error) throw error;
  revalidatePath(`/project/${projectId}`);
}

export async function updateIssueOrder(
  issueId: string,
  newStatus: Status,
  newOrder: number,
  projectId: string
) {
  const supabase = await createClient();

  // Get current issue
  const { data: currentIssue } = await supabase
    .from('issues')
    .select('status, order')
    .eq('id', issueId)
    .single();

  if (!currentIssue) return;

  const oldStatus = currentIssue.status;
  const oldOrder = currentIssue.order;

  // If moving within same column
  if (oldStatus === newStatus) {
    if (newOrder > oldOrder) {
      // Moving down: shift items between old and new position up
      await supabase.rpc('shift_issues_up', {
        p_project_id: projectId,
        p_status: newStatus,
        p_start: oldOrder + 1,
        p_end: newOrder,
      });
    } else if (newOrder < oldOrder) {
      // Moving up: shift items between new and old position down
      await supabase.rpc('shift_issues_down', {
        p_project_id: projectId,
        p_status: newStatus,
        p_start: newOrder,
        p_end: oldOrder - 1,
      });
    }
  } else {
    // Moving to different column
    // Shift items in old column up
    await supabase.rpc('shift_issues_up_from', {
      p_project_id: projectId,
      p_status: oldStatus,
      p_start: oldOrder + 1,
    });

    // Shift items in new column down
    await supabase.rpc('shift_issues_down_from', {
      p_project_id: projectId,
      p_status: newStatus,
      p_start: newOrder,
    });
  }

  // Update the issue
  await supabase
    .from('issues')
    .update({ status: newStatus, order: newOrder, updated_at: new Date().toISOString() })
    .eq('id', issueId);

  revalidatePath(`/project/${projectId}`);
}

// Simple batch update for drag-drop (client sends final order)
export async function batchUpdateIssueOrder(
  updates: { id: string; status: Status; order: number }[],
  projectId: string
) {
  const supabase = await createClient();

  for (const update of updates) {
    await supabase
      .from('issues')
      .update({ 
        status: update.status, 
        order: update.order,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.id);
  }

  revalidatePath(`/project/${projectId}`);
}

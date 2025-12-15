'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Comment } from '@/types/database';

export async function getComments(issueId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const issueId = formData.get('issue_id') as string;
  const content = formData.get('content') as string;
  const projectId = formData.get('project_id') as string;

  const { error } = await supabase.from('comments').insert({
    content,
    issue_id: issueId,
  });

  if (error) throw error;
  revalidatePath(`/project/${projectId}/issue/${issueId}`);
}

export async function deleteComment(id: string, issueId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', id);

  if (error) throw error;
  revalidatePath(`/project/${projectId}/issue/${issueId}`);
}

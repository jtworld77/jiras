import { supabase } from '@/lib/supabase/client';
import type { Comment } from '@/types';

export async function getCommentsByIssue(issueId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
}

export async function createComment(issueId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      issue_id: issueId,
      content,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
}

export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

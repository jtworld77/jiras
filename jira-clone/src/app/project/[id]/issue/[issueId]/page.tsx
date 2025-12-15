import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { getIssue, updateIssue, deleteIssue } from '@/lib/actions/issues';
import { getComments, createComment, deleteComment } from '@/lib/actions/comments';
import { IssueForm } from '@/components/issue-form';
import { CommentList } from '@/components/comment-list';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string; issueId: string }>;
}

export default async function IssuePage({ params }: Props) {
  const { id: projectId, issueId } = await params;
  
  const [project, issue, comments] = await Promise.all([
    getProject(projectId),
    getIssue(issueId),
    getComments(issueId),
  ]);

  if (!project || !issue) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as 'todo' | 'doing' | 'done';

    await updateIssue(issueId, { title, description, status });
  }

  async function handleDelete() {
    'use server';
    await deleteIssue(issueId, projectId);
    redirect(`/project/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Board
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">{project.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <IssueForm
            issue={issue}
            onSubmit={handleUpdate}
            onDelete={handleDelete}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          
          <form action={createComment} className="mb-6">
            <input type="hidden" name="issue_id" value={issueId} />
            <input type="hidden" name="project_id" value={projectId} />
            <textarea
              name="content"
              required
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Comment
            </button>
          </form>

          <CommentList
            comments={comments}
            issueId={issueId}
            projectId={projectId}
            onDelete={deleteComment}
          />
        </div>
      </main>
    </div>
  );
}

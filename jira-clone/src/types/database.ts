export type Status = 'todo' | 'doing' | 'done';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  order: number;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  issue_id: string;
  created_at: string;
}

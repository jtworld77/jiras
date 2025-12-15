export type Project = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Issue = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done';
  order_index: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  issue_id: string;
  content: string;
  user_id: string;
  created_at: string;
};

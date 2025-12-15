export type Team = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TeamRole = 'admin' | 'member' | 'viewer';

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  invited_by: string | null;
  joined_at: string;
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  team_id: string;
  user_id: string | null;
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

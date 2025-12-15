-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Issues table
create table issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  "order" integer not null default 0,
  project_id uuid references projects(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  issue_id uuid references issues(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index issues_project_id_idx on issues(project_id);
create index issues_status_idx on issues(status);
create index comments_issue_id_idx on comments(issue_id);

-- Row Level Security
alter table projects enable row level security;
alter table issues enable row level security;
alter table comments enable row level security;

-- Policies for projects
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Policies for issues (via project ownership)
create policy "Users can view issues in own projects"
  on issues for select
  using (
    exists (
      select 1 from projects
      where projects.id = issues.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create issues in own projects"
  on issues for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = issues.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update issues in own projects"
  on issues for update
  using (
    exists (
      select 1 from projects
      where projects.id = issues.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete issues in own projects"
  on issues for delete
  using (
    exists (
      select 1 from projects
      where projects.id = issues.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Policies for comments (via issue -> project ownership)
create policy "Users can view comments on own issues"
  on comments for select
  using (
    exists (
      select 1 from issues
      join projects on projects.id = issues.project_id
      where issues.id = comments.issue_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create comments on own issues"
  on comments for insert
  with check (
    exists (
      select 1 from issues
      join projects on projects.id = issues.project_id
      where issues.id = comments.issue_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete comments on own issues"
  on comments for delete
  using (
    exists (
      select 1 from issues
      join projects on projects.id = issues.project_id
      where issues.id = comments.issue_id
      and projects.user_id = auth.uid()
    )
  );

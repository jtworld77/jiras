-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Issues Table
create table issues (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text not null check (status in ('todo', 'doing', 'done')),
  position float not null default 0, -- For drag and drop ordering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments Table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references issues(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table projects enable row level security;
alter table issues enable row level security;
alter table comments enable row level security;

-- Policies (Simple: Users can only see/edit their own data)

-- Projects policies
create policy "Users can view their own projects" on projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on projects
  for delete using (auth.uid() = user_id);

-- Issues policies
create policy "Users can view their own issues" on issues
  for select using (auth.uid() = user_id);

create policy "Users can insert their own issues" on issues
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own issues" on issues
  for update using (auth.uid() = user_id);

create policy "Users can delete their own issues" on issues
  for delete using (auth.uid() = user_id);

-- Comments policies
create policy "Users can view their own comments" on comments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own comments" on comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments" on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments" on comments
  for delete using (auth.uid() = user_id);

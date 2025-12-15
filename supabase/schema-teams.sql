-- Teams/Organizations Migration
-- Run this AFTER the original schema.sql

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members with roles
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Invitations table
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- Add team_id to projects
ALTER TABLE projects ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE projects ALTER COLUMN user_id DROP NOT NULL;

-- Migrate existing projects to personal teams
-- This creates a personal team for each user and assigns their projects to it
DO $$
DECLARE
  user_record RECORD;
  new_team_id UUID;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM projects WHERE user_id IS NOT NULL
  LOOP
    -- Create personal team
    INSERT INTO teams (name, description, created_by)
    VALUES ('Personal Workspace', 'Your personal workspace', user_record.user_id)
    RETURNING id INTO new_team_id;
    
    -- Add user as admin
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (new_team_id, user_record.user_id, 'admin');
    
    -- Assign user's projects to their personal team
    UPDATE projects SET team_id = new_team_id WHERE user_id = user_record.user_id;
  END LOOP;
END $$;

-- Make team_id required now that all projects have one
ALTER TABLE projects ALTER COLUMN team_id SET NOT NULL;

-- Indexes
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_projects_team_id ON projects(team_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view their own issues" ON issues;
DROP POLICY IF EXISTS "Users can insert their own issues" ON issues;
DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
DROP POLICY IF EXISTS "Users can delete their own issues" ON issues;

DROP POLICY IF EXISTS "Users can view their own comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete teams"
  ON teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_members.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Team admins can update members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Team admins and users themselves can remove members"
  ON team_members FOR DELETE
  USING (
    team_members.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Team invitations policies
CREATE POLICY "Users can view invitations for their teams"
  ON team_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Team admins can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Projects policies (team-based)
CREATE POLICY "Users can view projects in their teams"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins and members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Team admins and members can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Team admins can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Issues policies (team-based through projects)
CREATE POLICY "Users can view issues in their team projects"
  ON issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE projects.id = issues.project_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create issues"
  ON issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE projects.id = issues.project_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Team members can update issues"
  ON issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE projects.id = issues.project_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Team members can delete issues"
  ON issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE projects.id = issues.project_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

-- Comments policies (team-based)
CREATE POLICY "Users can view comments in their team issues"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues
      JOIN projects ON projects.id = issues.project_id
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE issues.id = comments.issue_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues
      JOIN projects ON projects.id = issues.project_id
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE issues.id = comments.issue_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (comments.user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or team admins can delete"
  ON comments FOR DELETE
  USING (
    comments.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM issues
      JOIN projects ON projects.id = issues.project_id
      JOIN team_members ON team_members.team_id = projects.team_id
      WHERE issues.id = comments.issue_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Trigger for teams updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check user role in team
CREATE OR REPLACE FUNCTION get_user_team_role(team_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
  SELECT role FROM team_members
  WHERE team_id = team_id_param AND user_id = user_id_param;
$$ LANGUAGE SQL SECURITY DEFINER;

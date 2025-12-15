-- Rollback Teams Migration
-- Run this to remove all teams-related changes

-- Drop policies first
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Team admins can delete teams" ON teams;

DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can add members" ON team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON team_members;
DROP POLICY IF EXISTS "Team admins and users themselves can remove members" ON team_members;

DROP POLICY IF EXISTS "Users can view invitations for their teams" ON team_invitations;
DROP POLICY IF EXISTS "Team admins can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team admins can delete invitations" ON team_invitations;

-- Drop new project policies
DROP POLICY IF EXISTS "Users can view projects in their teams" ON projects;
DROP POLICY IF EXISTS "Team admins and members can create projects" ON projects;
DROP POLICY IF EXISTS "Team admins and members can update projects" ON projects;
DROP POLICY IF EXISTS "Team admins can delete projects" ON projects;

-- Drop new issues policies
DROP POLICY IF EXISTS "Users can view issues in their team projects" ON issues;
DROP POLICY IF EXISTS "Team members can create issues" ON issues;
DROP POLICY IF EXISTS "Team members can update issues" ON issues;
DROP POLICY IF EXISTS "Team members can delete issues" ON issues;

-- Drop new comments policies
DROP POLICY IF EXISTS "Users can view comments in their team issues" ON comments;
DROP POLICY IF EXISTS "Team members can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments or team admins can delete" ON comments;

-- Drop function
DROP FUNCTION IF EXISTS get_user_team_role(UUID, UUID);

-- Drop triggers
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;

-- Remove team_id column from projects (if it exists)
ALTER TABLE projects DROP COLUMN IF EXISTS team_id;

-- Make user_id required again on projects
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;

-- Drop tables
DROP TABLE IF EXISTS team_invitations;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;

-- Recreate original project policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate original issues policies
CREATE POLICY "Users can view their own issues"
  ON issues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own issues"
  ON issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues"
  ON issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own issues"
  ON issues FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate original comments policies
CREATE POLICY "Users can view their own comments"
  ON comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

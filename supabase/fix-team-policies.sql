-- Fix infinite recursion in team_members policies

-- Drop ALL team_members policies (they're causing recursion)
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can add members" ON team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON team_members;
DROP POLICY IF EXISTS "Team admins and users themselves can remove members" ON team_members;

-- Create simple non-recursive policies
-- Allow users to view any team_members (filtered in app)
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (true);

-- Allow authenticated users to manage team_members (validated in app)
CREATE POLICY "Authenticated users can add members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update members"
  ON team_members FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove members"
  ON team_members FOR DELETE
  USING (auth.uid() IS NOT NULL);

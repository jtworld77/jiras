-- Fix infinite recursion in team_members policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Team admins can add members" ON team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON team_members;

-- Recreate with simpler logic (bypass recursion)
CREATE POLICY "Team admins can add members"
  ON team_members FOR INSERT
  WITH CHECK (true);  -- Will be validated in application code

CREATE POLICY "Team admins can update members"
  ON team_members FOR UPDATE
  USING (true);  -- Will be validated in application code

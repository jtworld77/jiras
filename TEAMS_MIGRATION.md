# Teams & Organizations Migration Guide

The app has been upgraded to support **Teams, Organizations, and Role-Based Access Control**!

## What's New

### Teams/Organizations
- Create multiple teams/workspaces
- Each project belongs to a team
- Switch between teams easily

### Role-Based Permissions
- **Admin**: Full access - manage team, invite members, create/delete projects
- **Member**: Create and edit projects, issues, and comments
- **Viewer**: Read-only access to all team projects

### Invitation System
- Invite members via email
- Share invitation links
- Set roles when inviting
- Pending invitations management

## Database Migration

**IMPORTANT: Run this migration on your Supabase database!**

1. Go to Supabase Dashboard → SQL Editor
2. Run the file: `supabase/schema-teams.sql`
3. This will:
   - Create `teams`, `team_members`, and `team_invitations` tables
   - Migrate existing projects to personal teams
   - Update all RLS policies for team-based access

## New Features

### 1. Team Switcher
- Dropdown in nav bar to switch between teams
- Create new teams on the fly

### 2. Team Settings Page
- `/teams/{teamId}/settings`
- Manage team members
- Invite new members
- Change member roles
- Cancel pending invitations

### 3. Invitation Flow
1. Admin invites user via email
2. System generates invitation link
3. Invited user clicks link
4. If not logged in, redirects to login
5. After login, automatically joins team

### 4. Permission Checks
- Viewers can see but not edit
- Members can create/edit projects and issues
- Admins can delete projects and manage team

## URL Structure Changes

**Old:**
```
/projects                    → Projects list
/projects/{projectId}        → Project board
```

**New:**
```
/teams                                      → Redirects to first team
/teams/{teamId}/projects                    → Team's projects list
/teams/{teamId}/projects/{projectId}        → Project board
/teams/{teamId}/settings                    → Team settings (admin only)
/invitations/{token}                        → Accept invitation
```

## Migration for Existing Users

When you log in after the migration:

1. **Automatic Personal Team Created**
   - Your existing projects are automatically assigned to a personal team
   - You're set as admin of your personal team

2. **Create Additional Teams**
   - Click team dropdown → "Create New Team"
   - Or visit `/teams/new`

3. **Invite Team Members**
   - Go to Team Settings
   - Enter email and select role
   - Copy invitation link to share

## Testing the Migration

### 1. Test Database Migration
```sql
-- Check tables exist
SELECT * FROM teams LIMIT 5;
SELECT * FROM team_members LIMIT 5;
SELECT * FROM team_invitations LIMIT 5;

-- Verify your projects have team_id
SELECT id, name, team_id FROM projects;

-- Check you're admin of your team
SELECT t.name, tm.role 
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = auth.uid();
```

### 2. Test UI
1. Login → Should redirect to `/teams` → Then to first team
2. Create a new team
3. Invite someone (use a second email you have access to)
4. Accept invitation in incognito window
5. Verify roles:
   - As viewer: Can't create projects/issues
   - As member: Can create/edit
   - As admin: Can access settings

## API Changes

### Projects Queries
```typescript
// OLD
import { getProjects, createProject } from '@/lib/queries/projects';
const projects = await getProjects();
const project = await createProject('Name', 'Description');

// NEW
import { getProjectsByTeam, createProject } from '@/lib/queries/projects';
const projects = await getProjectsByTeam(teamId);
const project = await createProject(teamId, 'Name', 'Description');
```

### New Teams Queries
```typescript
import {
  getUserTeams,
  createTeam,
  inviteMember,
  getTeamMembers,
  getUserRole,
} from '@/lib/queries/teams';

// Get user's teams
const teams = await getUserTeams();

// Create team
const team = await createTeam('Team Name', 'Description');

// Invite member
const invitation = await inviteMember(teamId, 'user@email.com', 'member');

// Get team members
const members = await getTeamMembers(teamId);

// Check user's role
const role = await getUserRole(teamId);
```

## Rollback Plan

If you need to rollback:

1. **Code**: Checkout the commit before teams migration
2. **Database**: Restore from Supabase backup (make one before migrating!)

## Support

### Common Issues

**"Access denied" errors:**
- Check RLS policies were created correctly
- Verify user is member of team

**Can't see projects:**
- Ensure team_id is set on projects
- Check you're querying correct team

**Invitations not working:**
- Verify invitation hasn't expired (7 days)
- Check email matches Supabase user email

### Database Queries for Debugging

```sql
-- See all your teams
SELECT t.*, tm.role 
FROM teams t
JOIN team_members tm ON tm.team_id = t.id
WHERE tm.user_id = auth.uid();

-- See team members
SELECT tm.*, t.name as team_name
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE t.id = 'team-id-here';

-- See pending invitations
SELECT * FROM team_invitations 
WHERE team_id = 'team-id-here' 
AND accepted_at IS NULL;
```

## What's Next?

Additional features you could add:
- Team avatars/logos
- Activity feed per team
- Team-level settings (notifications, etc.)
- Slack/email notifications for invitations
- Project templates per team
- Team analytics/reporting

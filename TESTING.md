# Testing Guide

## Setup (5 minutes)

### 1. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose organization, name your project (e.g., "personal-jira-test")
4. Set a database password (save it)
5. Choose a region
6. Wait ~2 minutes for project to provision

### 2. Setup Database

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query"
3. Copy entire contents of `/workspace/supabase/schema.sql`
4. Paste into SQL editor
5. Click "Run" (bottom right)
6. Verify: Should see "Success. No rows returned" message

### 3. Get Supabase Credentials

1. Click "Project Settings" (gear icon in left sidebar)
2. Click "API" in settings menu
3. Copy these two values:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys" → "anon public")

### 4. Configure Environment

```bash
# In /workspace directory
cp .env.local.example .env.local
```

Edit `.env.local` and paste your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
```

### 5. Install & Run

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Testing Features

### 1. Authentication (Magic Link)

**Test Login:**
1. Open http://localhost:3000
2. Enter your email address
3. Click "Send magic link"
4. Check your email inbox
5. Click the link in email
6. Should redirect to Projects page

**Note:** For testing, use a real email you have access to. Supabase sends actual emails.

**Alternative (Skip Email for Testing):**
If you want to skip email verification during development:
1. Go to Supabase dashboard
2. Authentication → Providers
3. Enable "Email" provider
4. Turn OFF "Confirm email"
5. Then you can use `signUp` instead of magic link (requires code change)

### 2. Projects

**Create Project:**
1. Click "+ New Project"
2. Enter name (e.g., "My Test Project")
3. Enter description (optional)
4. Click "Create"
5. ✓ Project appears in grid

**Delete Project:**
1. Click "×" on any project card
2. Confirm deletion
3. ✓ Project removed

**Navigate to Board:**
1. Click on project name or "View board →"
2. ✓ Opens Kanban board

### 3. Issues

**Create Issue:**
1. On Kanban board, click "+ Add issue" in any column
2. Type issue title
3. Press Enter or click outside
4. ✓ Issue appears in column

**View/Edit Issue:**
1. Click on any issue card
2. ✓ Modal opens
3. Click "Edit" next to Description
4. Modify title or description
5. Click "Save"
6. ✓ Changes persist

**Delete Issue:**
1. Open issue modal
2. Scroll to bottom
3. Click "Delete Issue"
4. Confirm
5. ✓ Issue removed from board

### 4. Drag & Drop

**Move Issue Within Column (Reorder):**
1. Click and hold an issue card
2. Drag up or down
3. Release
4. ✓ Order persists on refresh

**Move Issue Between Columns:**
1. Click and hold an issue
2. Drag to different column (Todo → Doing → Done)
3. Release
4. ✓ Issue moves and stays there
5. Refresh page
6. ✓ Position persists

**Test Order Persistence:**
1. Create 5 issues in Todo column
2. Drag them into different order
3. Refresh browser (F5)
4. ✓ Order unchanged

### 5. Comments

**Add Comment:**
1. Open any issue
2. Scroll to Comments section
3. Type comment in input
4. Click "Add"
5. ✓ Comment appears with timestamp

**Delete Comment:**
1. Click "×" on any comment
2. ✓ Comment removed

### 6. Logout

1. Click "Logout" in nav bar
2. ✓ Returns to login page
3. Try accessing http://localhost:3000/projects
4. ✓ Redirects to login

## Quick Test Script (5 minutes)

```bash
# 1. Create test data
- Login
- Create project: "Test Project"
- Create 3 issues in Todo: "Task 1", "Task 2", "Task 3"
- Create 2 issues in Doing: "Task 4", "Task 5"
- Create 1 issue in Done: "Task 6"

# 2. Test drag & drop
- Drag "Task 1" to Doing column
- Drag "Task 5" to Done column
- Reorder issues within Todo
- Refresh page → verify positions

# 3. Test issue details
- Click "Task 1"
- Edit description: "This is a test description"
- Add comment: "Test comment 1"
- Add comment: "Test comment 2"
- Delete one comment
- Save changes

# 4. Test persistence
- Refresh browser
- Click "Task 1" again
- ✓ Description and remaining comment still there

# 5. Clean up
- Delete all issues
- Delete project
```

## Troubleshooting

### "Error: Invalid email or password"
- Check your email in inbox/spam
- Make sure email provider is enabled in Supabase (Authentication → Providers)

### "Error: Failed to fetch"
- Check `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL
- Verify Supabase project is running (green status in dashboard)

### Drag & drop not working
- Make sure you dragged at least 8px before releasing
- Check browser console for errors

### Changes not persisting
- Check Supabase dashboard → Table Editor
- Verify RLS policies are active (from schema.sql)
- Check browser console for auth errors

### "Row Level Security" errors
- Verify schema.sql was run completely
- Check you're logged in (not just on page but authenticated)
- Go to Supabase → Authentication → Users to verify user exists

### Page shows "Not Found"
- Check file structure matches exactly
- Restart dev server: Ctrl+C then `npm run dev`

## Testing Database Directly

To verify database setup:

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Should see tables: `projects`, `issues`, `comments`
4. Click on each table to verify columns match schema
5. After creating data in app, refresh Table Editor to see rows

## Development Tools

**View Data:**
```
Supabase Dashboard → Table Editor
```

**Check Auth:**
```
Supabase Dashboard → Authentication → Users
```

**View Logs:**
```
Supabase Dashboard → Logs → Postgres Logs
Browser DevTools → Console
```

**Database Queries:**
```
Supabase Dashboard → SQL Editor
```

Example query to see all your issues:
```sql
SELECT * FROM issues ORDER BY created_at DESC;
```

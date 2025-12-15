# Complete Setup Walkthrough

This guide walks you through every single step to get the app running.

---

## Part 1: Setup Supabase (5 minutes)

### Step 1: Create Supabase Account

1. Open your browser and go to: **https://supabase.com**
2. Click **"Start your project"** or **"Sign In"**
3. Sign up with GitHub, Google, or email
4. You'll land on the Supabase dashboard

### Step 2: Create New Project

1. Click the **"New Project"** button (green button, top right)
2. Fill in the form:
   - **Name**: `personal-jira` (or anything you want)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (default)
3. Click **"Create new project"**
4. Wait 2-3 minutes while it sets up (you'll see a loading screen)

### Step 3: Run the Database Schema

1. Once project is ready, look at the **left sidebar**
2. Click **"SQL Editor"** (icon looks like a database)
3. Click **"New query"** button (top right)
4. You'll see an empty SQL editor

Now copy the database schema:

5. Open the file `/workspace/supabase/schema.sql` (in your code)
6. Select ALL the text (Ctrl+A or Cmd+A)
7. Copy it (Ctrl+C or Cmd+C)
8. Go back to Supabase SQL Editor
9. Paste everything into the editor (Ctrl+V or Cmd+V)
10. Click **"Run"** button (bottom right corner)

You should see: **"Success. No rows returned"** (green message)

If you see errors, try running it again. If still errors, check that you copied the entire file.

### Step 4: Get Your API Keys

1. Click **"Settings"** in the left sidebar (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see a page with your credentials

**Copy these two values** (you'll need them in next section):

- **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
- **anon public key**: Long string starting with `eyJhbGc...`

**Keep this page open** - you'll need to paste these values soon.

---

## Part 2: Setup Your Local App (5 minutes)

### Step 5: Install Dependencies

Open your terminal in the `/workspace` directory and run:

```bash
npm install
```

This will take 1-2 minutes. You'll see lots of text scrolling - that's normal.

Wait until you see something like:
```
added 324 packages in 45s
```

### Step 6: Create Environment File

In the `/workspace` directory:

```bash
cp .env.local.example .env.local
```

This creates a new file called `.env.local`

### Step 7: Add Your Supabase Credentials

1. Open the file `.env.local` (in your code editor)
2. You'll see:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Replace `your_supabase_url` with the **Project URL** from Step 4
4. Replace `your_supabase_anon_key` with the **anon public key** from Step 4

Example of what it should look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1MzY0NTcsImV4cCI6MjAwNTExMjQ1N30.xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important**: No quotes, no spaces around the `=` sign.

5. Save the file (Ctrl+S or Cmd+S)

### Step 8: Start the Development Server

In your terminal, run:

```bash
npm run dev
```

You should see:
```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Ready in 2.5s
```

**Don't close this terminal** - the app needs it running.

### Step 9: Open the App

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see a login page with "Personal Jira" title

**If you see errors**, check:
- Is the terminal still running?
- Did you save the `.env.local` file?
- Are the Supabase credentials correct?

---

## Part 3: Test the App (10 minutes)

### Step 10: Login (First Time)

1. On the login page, enter **your real email address** (one you can access)
2. Click **"Send magic link"**
3. You'll see: **"Check your email for the login link!"**
4. Go to your email inbox
5. Look for email from **noreply@mail.app.supabase.io**
   - Subject: "Confirm Your Signup"
   - Check spam folder if you don't see it
6. Click the **"Confirm your mail"** link in the email
7. Browser will open and redirect you to the Projects page

**You're now logged in!**

### Step 11: Create Your First Project

1. You should see "Projects" page (empty)
2. Click **"+ New Project"** button
3. A form appears:
   - **Project name**: Type `My First Project`
   - **Description**: Type `Testing the app` (optional)
4. Click **"Create"**
5. You'll see a card with your project appear

### Step 12: Open the Kanban Board

1. Click on the project card (anywhere on it)
2. You'll see the Kanban board with 3 columns:
   - **To Do** (left)
   - **Doing** (middle)
   - **Done** (right)

### Step 13: Create Issues

Let's create some tasks:

**In the "To Do" column:**
1. Click **"+ Add issue"** at the bottom
2. Type: `Setup development environment`
3. Press Enter
4. The issue appears!

Create a few more:
- Click "+ Add issue" again
- Type: `Read documentation`
- Press Enter
- One more: `Write first feature`

**In the "Doing" column:**
1. Click "+ Add issue"
2. Type: `Test the drag and drop`
3. Press Enter

**In the "Done" column:**
1. Click "+ Add issue"
2. Type: `Install dependencies`
3. Press Enter

### Step 14: Test Drag & Drop

Now for the fun part:

**Move issue between columns:**
1. Click and HOLD on "Setup development environment" in To Do
2. Drag it to the "Done" column
3. Release the mouse
4. ✅ It moves to Done!

**Reorder within a column:**
1. Drag "Read documentation" above "Write first feature"
2. The order changes!

**Test persistence:**
1. Refresh the page (press F5)
2. ✅ All issues are still in the same place!

### Step 15: Edit an Issue

1. Click on any issue card
2. A modal (popup) opens
3. Click **"Edit"** next to Description
4. Type a description: `This is a test task to verify the app works correctly`
5. Click **"Save"**
6. The description is saved

### Step 16: Add Comments

While the issue modal is still open:

1. Scroll to the **Comments** section
2. Type in the input: `This feature is working great!`
3. Click **"Add"**
4. The comment appears with a timestamp
5. Add another: `Testing comments functionality`
6. You have 2 comments now

**Delete a comment:**
1. Click the **×** next to one comment
2. It disappears

### Step 17: Create Multiple Projects

1. Click **"← Projects"** in the top left (goes back to projects list)
2. Create another project: `Work Tasks`
3. Create another: `Personal Projects`
4. You now have 3 project cards

### Step 18: Test Everything Works

Open "Work Tasks" and create some issues:
- Add 2 issues to To Do
- Add 1 issue to Doing
- Drag one from To Do to Done

Go back, open "Personal Projects":
- Add some issues
- Add comments to an issue

**Verify isolation:**
1. Go back to "My First Project"
2. ✅ Your original issues are still there, unchanged
3. Each project keeps its own issues separate

### Step 19: Test Logout

1. Click **"Logout"** in the top right
2. You're back at the login page
3. Try going to: http://localhost:3000/projects
4. ✅ It redirects you to login (you can't access without auth)

### Step 20: Login Again

1. Enter your email again
2. Check email for new magic link
3. Click link
4. ✅ You're back in, all your data is still there!

---

## Verify It's Working

**Check in Supabase Dashboard:**

1. Go back to Supabase (supabase.com)
2. Open your project
3. Click **"Table Editor"** in left sidebar
4. Click on **"projects"** table
5. ✅ You should see your 3 projects listed!
6. Click on **"issues"** table
7. ✅ You should see all your issues with their status and order_index
8. Click on **"comments"** table
9. ✅ You should see your comments

**This proves data is actually saving to the database!**

---

## Common Issues & Solutions

### "Invalid email" error
- Make sure you're using a real email you can access
- Check spam folder for the magic link email

### "Failed to fetch" error
- Check your `.env.local` file has the correct URL
- Make sure there are no extra spaces
- Restart the dev server: Ctrl+C in terminal, then `npm run dev` again

### Can't see magic link email
- Wait 1-2 minutes (sometimes delayed)
- Check spam/junk folder
- Try a different email (Gmail works well)

### Drag & drop not working
- Make sure you drag at least a little bit before releasing
- Try clicking and holding for 1 second before dragging

### Page shows blank screen
- Check the terminal for errors (red text)
- Open browser console (F12) and look for errors
- Make sure dev server is running

### Changes don't persist after refresh
- Check you're actually logged in (should see Logout button)
- Verify RLS policies ran correctly in Supabase
- Check browser console for errors

---

## What You Built

You now have a working app with:

✅ **Authentication** - Secure email login with Supabase  
✅ **Projects** - Create and organize multiple projects  
✅ **Kanban Board** - Visual task management  
✅ **Issues** - Create, edit, delete tasks  
✅ **Drag & Drop** - Move and reorder with persistence  
✅ **Comments** - Discuss tasks  
✅ **Real Database** - All data persists in Supabase Postgres  

---

## Next Steps

- Create real projects for your actual work
- Try adding more issues and organizing them
- Test on mobile (should work responsively)
- Invite yourself to test from another browser (same email, new magic link)

---

## Stop the App

When you're done testing:

1. Go to the terminal
2. Press **Ctrl+C** (or Cmd+C on Mac)
3. This stops the development server
4. To start again later: `npm run dev`

The data stays in Supabase even when the app is stopped!
